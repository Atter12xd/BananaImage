import { getIronSession, type IronSession, type SessionOptions } from "iron-session"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export interface SessionData {
  email: string
  name?: string
  picture?: string
  accessToken: string
  refreshToken?: string
  apiKey?: string
  apiKeyObtainedAt?: number // Timestamp when the API key was obtained
  teamId?: string // Cached team ID to avoid repeated API calls
  teamSlug?: string // Cached team slug for buy-credits URL
  expiresAt: number
  isLoggedIn: boolean
}

function getSessionOptions(): SessionOptions {
  const sessionSecret = process.env.SESSION_SECRET || "default-secret-for-v0-preview-only-not-secure-32-chars-minimum"

  if (sessionSecret.length < 32) {
    console.warn("SESSION_SECRET is too short, using fallback (not secure for production)")
  }

  return {
    password: sessionSecret,
    cookieName: "vercel_auth_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: "/",
    },
  }
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, getSessionOptions())
}

export async function getSessionFromRequest(request: NextRequest): Promise<IronSession<SessionData>> {
  return getIronSession<SessionData>(request.cookies as any, getSessionOptions())
}

export async function setSession(data: SessionData): Promise<void> {
  const session = await getSession()
  session.email = data.email
  session.name = data.name
  session.picture = data.picture
  session.accessToken = data.accessToken
  session.refreshToken = data.refreshToken
  session.apiKey = data.apiKey
  session.apiKeyObtainedAt = data.apiKeyObtainedAt
  session.teamId = data.teamId
  session.teamSlug = data.teamSlug
  session.expiresAt = data.expiresAt
  session.isLoggedIn = true
  await session.save()
}

export async function clearSession(): Promise<void> {
  const session = await getSession()
  session.destroy()
}

export async function isSessionValid(session: SessionData): Promise<boolean> {
  if (!session.isLoggedIn || !session.accessToken) {
    return false
  }

  const now = Date.now()

  // If token expired but we have a refresh_token, it's still recoverable
  if (session.expiresAt && now >= session.expiresAt) {
    if (session.refreshToken) {
      return true // Session is still valid because we can refresh it
    }
    return false
  }

  return true
}
