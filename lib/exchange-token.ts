import { fetchVercelApi } from "./vercel-api"

/**
 * Check if an error indicates an expired or invalid API key.
 * IMPORTANT: Must be narrow to avoid false positives that trigger unnecessary retries.
 * e.g. "invalid prompt" or "invalid image" from Gemini should NOT trigger API key refresh.
 */
export function isApiKeyError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    // Only match clear authentication/authorization errors
    const isAuthStatus = message.includes("401") || message.includes("403")
    const isAuthMessage = message.includes("unauthorized") || message.includes("unauthenticated")
    const isApiKeySpecific = message.includes("api key") || message.includes("api_key") || message.includes("apikey")
    const isTokenExpired = message.includes("token expired") || message.includes("token is expired")
    
    return isAuthStatus || isAuthMessage || isApiKeySpecific || isTokenExpired
  }
  return false
}

/**
 * Check if we should proactively refresh the API key based on when it was obtained
 * Refresh if older than 4 hours - AI Gateway keys typically last longer but we refresh proactively
 */
export function shouldRefreshApiKey(obtainedAt: number | undefined): boolean {
  if (!obtainedAt) return true // No timestamp, refresh to be safe
  
  const FOUR_HOURS = 4 * 60 * 60 * 1000
  const age = Date.now() - obtainedAt
  return age > FOUR_HOURS
}

export async function exchangePersonalAccessTokenForGatewayApiKey({
  personalAccessToken,
  teamId,
}: {
  personalAccessToken: string
  teamId: string
}): Promise<string | null> {
  try {
    const data = await fetchVercelApi(`/api-keys?teamId=${teamId}`, personalAccessToken, {
      method: "POST",
      body: JSON.stringify({
        purpose: "ai-gateway",
        name: "AI Gateway Nano Banana Pro Key",
        exchange: true,
      }),
    })

    return data.apiKeyString || null
  } catch (error) {
    // Log with context - detect common error types
    const errorMsg = error instanceof Error ? error.message : String(error)
    const isTeamScope = errorMsg.includes("scope") || errorMsg.includes("re-authenticate")
    const isForbidden = errorMsg.includes("403") || errorMsg.includes("forbidden")
    
    console.error("[exchange-token] Failed to exchange PAT:", {
      error: errorMsg.substring(0, 200), // Truncate for readability
      isTeamScopeError: isTeamScope,
      isForbidden,
      teamId,
    })
    return null
  }
}
