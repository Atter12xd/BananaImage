import { type NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"

/**
 * Serves private Vercel Blob images so they can be displayed in the app.
 * Private blob URLs are not directly accessible; this route fetches with the token and streams.
 */
export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname")

  if (!pathname) {
    return NextResponse.json({ error: "Missing pathname" }, { status: 400 })
  }

  try {
    const result = await get(pathname, { access: "private" })

    if (!result || (result as { statusCode?: number }).statusCode !== 200) {
      return new NextResponse("Not found", { status: 404 })
    }

    const res = result as { stream: ReadableStream; blob: { contentType?: string } }

    return new NextResponse(res.stream, {
      headers: {
        "Content-Type": res.blob?.contentType || "image/png",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
