import { NextResponse } from "next/server"
import { getSession } from "@/lib/secure-session"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { amount } = body as { amount?: number }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    const session = await getSession()

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in first." },
        { status: 401 },
      )
    }

    const teamId = session.teamId
    if (!teamId) {
      return NextResponse.json(
        { error: "No team found. Please sign out and back in." },
        { status: 400 },
      )
    }

    // Call Vercel billing API to create a checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "https://v0nanobanana.vercel.app"
    const res = await fetch(`https://api.vercel.com/v1/billing/buy?teamId=${teamId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item: { type: "credits", creditType: "gateway", amount },
        browserCheckout: { returnUrl: appUrl },
      }),
    })

    const rawText = await res.text()
    let responseBody: any = null
    try {
      responseBody = JSON.parse(rawText)
    } catch {}

    if (!res.ok) {
      const errorMessage = responseBody?.error?.message ?? responseBody?.error ?? res.statusText
      console.error("[buy-credits] Billing API error:", {
        status: res.status,
        error: errorMessage,
        teamId,
        body: rawText.slice(0, 500),
      })
      return NextResponse.json(
        { error: `Purchase failed: ${errorMessage}` },
        { status: res.status },
      )
    }

    return NextResponse.json({
      success: true,
      checkoutSessionUrl: responseBody?.checkoutSessionUrl ?? null,
    })
  } catch (error) {
    console.error("[buy-credits] Unexpected error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
