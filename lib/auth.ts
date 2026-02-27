// Utility functions for Sign in with Vercel OAuth flow

export interface VercelUser {
  sub: string
  name?: string
  preferred_username?: string
  email: string
  picture?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  id_token: string
  expires_in: number
  scope: string
  refresh_token?: string
}

export interface TeamResponse {
  connect: Record<string, any>
  creatorId: string
  updatedAt: number
  emailDomain: string
  saml: Record<string, any>
  inviteCode: string
  description: string
  stagingPrefix: string
  resourceConfig: Record<string, any>
  previewDeploymentSuffix: string
  platform: boolean
  disableHardAutoBlocks: number
  remoteCaching: Record<string, any>
  defaultDeploymentProtection: Record<string, any>
  defaultExpirationSettings: Record<string, any>
  enablePreviewFeedback: string
  enableProductionFeedback: string
  sensitiveEnvironmentVariablePolicy: string
  hideIpAddresses: boolean
  hideIpAddressesInLogDrains: boolean
  ipBuckets: any[]
  id: string
  slug: string
  name: string
  avatar: string
  membership: Record<string, any>
  createdAt: number
}

// Generate PKCE code verifier and challenge
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64URLEncode(array)
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return base64URLEncode(new Uint8Array(hash))
}

function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer))
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// Generate random state for CSRF protection
export function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return base64URLEncode(array)
}

// Decode JWT without verification (verification should be done server-side)
export function decodeJWT(token: string): VercelUser | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

// Build authorization URL
export function getAuthorizationUrl(params: {
  clientId: string
  redirectUri: string
  scope: string
  state: string
  codeChallenge: string
  nonce?: string
  forceConsent?: boolean
}): string {
  const url = new URL("https://vercel.com/oauth/authorize")
  url.searchParams.set("client_id", params.clientId)
  url.searchParams.set("redirect_uri", params.redirectUri)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("scope", params.scope)
  url.searchParams.set("state", params.state)
  url.searchParams.set("code_challenge", params.codeChallenge)
  url.searchParams.set("code_challenge_method", "S256")

  if (params.nonce) {
    url.searchParams.set("nonce", params.nonce)
  }

  // Force consent screen to re-appear (useful when user needs to grant team permissions)
  if (params.forceConsent) {
    url.searchParams.set("prompt", "consent")
  }

  return url.toString()
}

export async function getVercelUser(accessToken: string) {
  try {
    const response = await fetch("https://api.vercel.com/v2/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Error fetching Vercel user:", error)
    return null
  }
}

export async function getAuthenticatedUser(accessToken: string) {
  try {
    const data = await fetchVercelApi("/v2/user", accessToken)

    return {
      user: data.user,
      teamId: data.user?.defaultTeamId || data.user?.id,
    }
  } catch (error) {
    console.error("Error fetching authenticated user:", error)
    return null
  }
}

export async function getUserTeam(accessToken: string, teamId: string) {
  try {
    const data = await fetchVercelApi<TeamResponse>(`/v2/teams/${teamId}`, accessToken)
    return data
  } catch (error) {
    console.error("Error fetching user team:", error)
    return null
  }
}

async function fetchVercelApi<T = any>(endpoint: string, accessToken: string): Promise<T> {
  const response = await fetch(`https://api.vercel.com${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch Vercel API: ${response.statusText}`)
  }

  return response.json() as T
}

// REMOVED: refreshAccessToken(), ensureValidToken(), refreshAccessTokenServerSide()
// Token refresh now happens ONLY in proxy.ts (middleware) following Mark Roberts' recommendation.
// See: https://github.com/vercel/ai-studio for the reference implementation.
