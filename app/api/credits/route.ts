import { NextResponse } from "next/server"
import { getSession } from "@/lib/secure-session"
import { getAuthenticatedUser } from "@/lib/auth"
import { getCredits, AiGatewayError } from "@/lib/ai-gateway"
import { exchangePersonalAccessTokenForGatewayApiKey, shouldRefreshApiKey } from "@/lib/exchange-token"

export interface CreditsResponse {
  balance: string
  totalUsed: string
  buyCreditsUrl: string
}


/**
 * Helper to obtain a fresh API key and save it to session
 * Uses cached teamId when available to avoid extra API calls
 */
async function refreshApiKey(session: any, accessToken: string): Promise<string | null> {
  try {
    // Use cached teamId if available, otherwise fetch it
    let teamId = session.teamId
    if (!teamId) {
      const authUser = await getAuthenticatedUser(accessToken)
      if (!authUser?.teamId) {
        console.error("[credits] No team ID found for user during API key refresh")
        return null
      }
      teamId = authUser.teamId
      // Cache the teamId for future requests
      session.teamId = teamId
    }

    const newApiKey = await exchangePersonalAccessTokenForGatewayApiKey({
      personalAccessToken: accessToken,
      teamId: teamId,
    })

    if (newApiKey) {
      session.apiKey = newApiKey
      session.apiKeyObtainedAt = Date.now()
      await session.save()
      console.log("[credits] Successfully refreshed API key")
      return newApiKey
    }

    console.error("[credits] Failed to exchange token for API key")
    return null
  } catch (error) {
    console.error("[credits] Error refreshing API key:", error)
    return null
  }
}

export async function GET() {
  try {
    const session = await getSession()

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in first.", needsAuth: true },
        { status: 401 }
      )
    }

    // Use cached teamId - it should always be set from the callback at login time.
    // If missing, try to fetch it but re-read session first in case the proxy
    // just refreshed the access_token and saved a new one.
    let teamId = session.teamId
    if (!teamId) {
      // Re-read session to get the latest access_token (proxy may have just refreshed it)
      const freshSession = await getSession()
      const tokenToUse = freshSession?.accessToken || session.accessToken
      
      const authenticatedUser = await getAuthenticatedUser(tokenToUse)
      if (!authenticatedUser?.teamId) {
        console.error("[credits] No team ID found for user, accessToken may be invalid")
        return NextResponse.json(
          { error: "Unable to determine team. Please try refreshing the page." },
          { status: 500 }
        )
      }
      teamId = authenticatedUser.teamId
      // Cache the teamId for future requests so we never hit this path again
      session.teamId = teamId
      await session.save()
    }

    // Determine if we need to get/refresh the API key
    let apiKeyToUse = session.apiKey
    const apiKeyAge = session.apiKeyObtainedAt 
      ? Math.round((Date.now() - session.apiKeyObtainedAt) / 1000 / 60) 
      : null
    
    // Debug log only when refreshing or missing
    const needsRefresh = !apiKeyToUse || shouldRefreshApiKey(session.apiKeyObtainedAt)
    if (needsRefresh) {
      console.log(`[credits] API key needs refresh: exists=${!!apiKeyToUse}, age=${apiKeyAge}min`)
    }

    // Case 1: No API key at all - get one
    if (!apiKeyToUse) {
      apiKeyToUse = await refreshApiKey(session, session.accessToken)
      
      if (!apiKeyToUse) {
        return NextResponse.json(
          {
            error: "Unable to obtain API key. Please try signing out and back in.",
            needsTeamAuth: true,
          },
          { status: 401 }
        )
      }
    }
    // Case 2: API key exists but might be stale - proactively refresh
    else if (needsRefresh) {
      const newKey = await refreshApiKey(session, session.accessToken)
      if (newKey) {
        apiKeyToUse = newKey
      }
      // If refresh fails, continue with existing key
    }

    // Build buy-credits URL using cached team slug (set at login)
    const teamSlug = session.teamSlug || teamId
    
    // Try to get credits
    try {
      const creditsResponse = await getCredits(apiKeyToUse)

      return NextResponse.json<CreditsResponse>({
        balance: creditsResponse.balance,
        totalUsed: creditsResponse.total_used,
        buyCreditsUrl: `https://vercel.com/${teamSlug}/~/ai-gateway`,
      })
    } catch (error) {
      // Reactive refresh: if API key error, try to get new key and retry once
      const isApiKeyIssue =
        error instanceof AiGatewayError && (error.status === 401 || error.status === 403)

      if (isApiKeyIssue) {
        console.log("[credits] API key rejected (401/403), attempting reactive refresh...")
        const newKey = await refreshApiKey(session, session.accessToken)

        if (newKey) {
          // Retry with new key
          try {
            const creditsResponse = await getCredits(newKey)

            return NextResponse.json<CreditsResponse>({
              balance: creditsResponse.balance,
              totalUsed: creditsResponse.total_used,
              buyCreditsUrl: `https://vercel.com/${teamSlug}/~/ai-gateway`,
            })
          } catch (retryError) {
            console.error("[credits] Retry also failed:", retryError)
            // Fall through to error handling below
          }
        }

        // If we get here, both attempts failed
        return NextResponse.json(
          {
            error: "Unable to access AI Gateway. Please try signing out and back in.",
            needsTeamAuth: true,
          },
          { status: 401 }
        )
      }

      // Not an API key error, re-throw
      throw error
    }
  } catch (error) {
    console.error("Error fetching credits:", error)
    
    if (error instanceof Error && error.message.includes("Failed to fetch Vercel API")) {
      // Don't return tokenExpired - this would cause the client to show the user as logged out.
      // The proxy handles token refresh. This is likely a transient error during refresh.
      return NextResponse.json(
        { error: "Temporary error fetching credits. Please try again." },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error while fetching credits" },
      { status: 500 }
    )
  }
}
