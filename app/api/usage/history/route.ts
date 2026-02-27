import { NextResponse } from "next/server"
import { getSession } from "@/lib/secure-session"
import { getUserUsageHistory } from "@/lib/db/queries"


export interface UsageHistoryItem {
  id: string
  userEmail: string | null
  cost: string
  tokens: number
  action: string
  metadata: string | null
  createdAt: Date
}

export interface UsageHistoryResponse {
  email: string
  history: UsageHistoryItem[]
  total: number
}

export async function GET(request: Request) {
  try {
    const session = await getSession()

    if (!session?.isLoggedIn || !session?.email) {
      return NextResponse.json({ error: "Not authenticated. Please sign in first.", needsAuth: true }, { status: 401 })
    }

    // Use the email from the session directly - no need to call Vercel API.
    // The session cookie is encrypted and tamper-proof (iron-session).
    const email = session.email

    // Get limit from query params if provided, default to 50
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    const usageHistory = await getUserUsageHistory(email, limit)

    return NextResponse.json({
      email,
      history: usageHistory,
      total: usageHistory.length,
    })
  } catch (error) {
    console.error("Error fetching usage history:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch usage history",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
