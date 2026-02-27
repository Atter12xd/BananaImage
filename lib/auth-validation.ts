import type { NextRequest } from "next/server"
import { getSession } from "./secure-session"

export interface AuthValidationResult {
  isValid: boolean
  email?: string
  error?: string
}

/**
 * Validates user authentication using the iron-session cookie only.
 * 
 * The session cookie is encrypted and signed (AES-256-GCM via iron-session),
 * so it cannot be forged or tampered with. If a valid session exists with
 * isLoggedIn=true and an email, the user is authenticated.
 * 
 * Token refresh is handled exclusively by the proxy/middleware layer.
 * We do NOT call the Vercel API here to re-validate the access_token because:
 * 1. It creates race conditions when the proxy is mid-refresh
 * 2. It's redundant - the session cookie is tamper-proof
 * 3. It adds latency to every authenticated request
 */
export async function validateUserAuthentication(request: NextRequest): Promise<AuthValidationResult> {
  try {
    const session = await getSession()

    if (!session.isLoggedIn || !session.accessToken || !session.email) {
      return { isValid: false, error: "Not authenticated" }
    }

    return { isValid: true, email: session.email }
  } catch (error) {
    console.error("[auth-validation] Validation error:", error instanceof Error ? error.message : error)
    return { isValid: false, error: "Authentication failed" }
  }
}

export async function validateUserOwnership(request: NextRequest, email: string): Promise<boolean> {
  const validation = await validateUserAuthentication(request)

  if (!validation.isValid) {
    return false
  }

  return validation.email === email
}

export async function getAuthenticatedUserEmail(request: NextRequest): Promise<string | null> {
  try {
    const validation = await validateUserAuthentication(request)
    return validation.isValid ? validation.email! : null
  } catch (error) {
    console.error("[v0] Auth validation error:", error)
    return null
  }
}
