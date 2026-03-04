import { put } from "@vercel/blob"

/**
 * Uploads a base64 image to Vercel Blob storage.
 * Uses private access so it works with private Blob stores.
 * Returns a URL to our /api/serve-blob route so the image can be displayed.
 */
export async function uploadImageToBlob(base64Image: string, filename: string): Promise<string> {
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "")
  const contentTypeMatch = base64Image.match(/^data:(image\/\w+);base64,/)
  const contentType = contentTypeMatch ? contentTypeMatch[1] : "image/png"

  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const blob = new Blob([bytes], { type: contentType })

  const uploadedBlob = await put(filename, blob, {
    access: "private",
    contentType,
    addRandomSuffix: true,
  })

  const pathname =
    "pathname" in uploadedBlob && typeof uploadedBlob.pathname === "string"
      ? uploadedBlob.pathname
      : new URL(uploadedBlob.url).pathname.slice(1)
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "")

  return `${baseUrl}/api/serve-blob?pathname=${encodeURIComponent(pathname)}`
}
