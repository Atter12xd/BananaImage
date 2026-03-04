import { type NextRequest, NextResponse } from "next/server"

/**
 * Serves private Vercel Blob images by fetching with the token and streaming.
 * Works with any @vercel/blob version (no SDK get() required).
 * See: https://vercel.com/docs/storage/vercel-blob/private-storage#accessing-without-the-sdk
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!url || !token) {
    return NextResponse.json({ error: "Missing url or token" }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok || !res.body) {
      return new NextResponse("Not found", { status: 404 })
    }

    const contentType = res.headers.get("content-type") || "image/png"

    return new NextResponse(res.body, {
      headers: {
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-cache",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
