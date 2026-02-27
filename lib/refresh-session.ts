import { getSession } from "./secure-session"

/**
 * Get the current session.
 * 
 * NOTE: Token refresh is now handled ONLY in the proxy/middleware.
 * This follows Mark Roberts' recommendation to refresh tokens in ONE place only.
 * 
 * Route handlers should NOT refresh tokens - they just use the session as-is.
 * The proxy ensures tokens are refreshed before requests reach route handlers.
 */
export async function checkAndRefreshSession() {
  try {
    const session = await getSession()

    if (!session?.isLoggedIn || !session?.accessToken) {
      return { needsRefresh: false, session }
    }

    // Token refresh is handled by proxy.ts
    // Just return the current session
    return { needsRefresh: false, session }
  } catch (error) {
    console.error("[checkAndRefreshSession] Error:", error)
    return { needsRefresh: false, session: null }
  }
}
