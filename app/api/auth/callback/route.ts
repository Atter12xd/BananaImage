import { type NextRequest, NextResponse } from "next/server"
import { decodeJWT, type TokenResponse, getAuthenticatedUser, getUserTeam } from "@/lib/auth"
import { exchangePersonalAccessTokenForGatewayApiKey } from "@/lib/exchange-token"
import { getOrCreateUser } from "@/lib/db/queries"
import { setSession } from "@/lib/secure-session"


export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  if (error) {
    console.error("OAuth error:", error, errorDescription)
    const errorUrl = new URL("/auth-error", request.nextUrl.origin)
    errorUrl.searchParams.set("error", error)
    if (errorDescription) {
      errorUrl.searchParams.set("description", errorDescription)
    }
    return NextResponse.redirect(errorUrl)
  }

  if (!code || !state) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  const storedState = request.cookies.get("oauth_state")?.value
  const codeVerifier = request.cookies.get("code_verifier")?.value

  if (!storedState || state !== storedState) {
    return NextResponse.json({ error: "Invalid state parameter" }, { status: 400 })
  }

  if (!codeVerifier) {
    return NextResponse.json({ error: "Missing code verifier" }, { status: 400 })
  }

  const clientId = process.env.VERCEL_OAUTH_CLIENT_ID
  const clientSecret = process.env.VERCEL_OAUTH_CLIENT_SECRET

  if (!clientId) {
    return NextResponse.json({ error: "OAuth client not configured" }, { status: 500 })
  }

  const redirectUri = `${request.nextUrl.origin}/api/auth/callback`

  try {
    const tokenResponse = await fetch("https://api.vercel.com/login/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        ...(clientSecret && { client_secret: clientSecret }),
        code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error("Token exchange failed:", errorData)
      return NextResponse.json({ error: "Token exchange failed" }, { status: 500 })
    }

    const tokens: TokenResponse = await tokenResponse.json()

    const user = decodeJWT(tokens.id_token)

    if (!user) {
      return NextResponse.json({ error: "Invalid ID token" }, { status: 500 })
    }

    try {
      const [_, authenticatedUser] = await Promise.all([
        getOrCreateUser({
          email: user.email,
          name: user.name || user.preferred_username || null,
          avatar_url: user.picture || null,
        }),
        getAuthenticatedUser(tokens.access_token).then(async (authUser) => {
          // Also fetch team slug for cached buy-credits URL
          if (authUser?.teamId) {
            try {
              const team = await getUserTeam(tokens.access_token, authUser.teamId)
              return { ...authUser, teamSlug: team?.slug }
            } catch {
              return authUser
            }
          }
          return authUser
        }),
      ])

      let aiGatewayApiKey: string | undefined = undefined
      let apiKeyObtainedAt: number | undefined = undefined

      if (authenticatedUser?.teamId) {
        try {
          const exchangedKey = await exchangePersonalAccessTokenForGatewayApiKey({
            personalAccessToken: tokens.access_token,
            teamId: authenticatedUser.teamId,
          })
          if (exchangedKey) {
            aiGatewayApiKey = exchangedKey
            apiKeyObtainedAt = Date.now()
            console.log(`[auth/callback] Login successful for ${user.email}, API key obtained`)
          } else {
            console.warn(`[auth/callback] Login for ${user.email} - no API key returned (may need team permissions)`)
          }
        } catch (error) {
          console.error(`[auth/callback] Failed to get API key for ${user.email}:`, error)
        }
      } else {
        console.warn(`[auth/callback] Login for ${user.email} - no teamId found`)
      }

      await setSession({
        email: user.email,
        name: user.name || user.preferred_username,
        picture: user.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        apiKey: aiGatewayApiKey,
        apiKeyObtainedAt: apiKeyObtainedAt,
        teamId: authenticatedUser?.teamId,
        teamSlug: authenticatedUser?.teamSlug,
        expiresAt: Date.now() + tokens.expires_in * 1000,
        isLoggedIn: true,
      })

      const response = NextResponse.redirect(new URL("/", request.nextUrl.origin))

      response.cookies.set(
        "user",
        JSON.stringify({
          email: user.email,
          name: user.name || user.preferred_username,
          picture: user.picture,
        }),
        {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        },
      )

      response.cookies.delete("code_verifier")
      response.cookies.delete("oauth_state")
      response.cookies.delete("oauth_nonce")

      return response
    } catch (error) {
      console.error("Authentication failed:", error)
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
    }
  } catch (error) {
    console.error("Authentication failed:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
