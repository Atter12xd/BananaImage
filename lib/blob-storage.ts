import { put } from "@vercel/blob"

/**
 * Uploads a base64 image to Vercel Blob storage.
 * Uses public access — the store must be created as Public in Vercel.
 * Returns the public CDN URL of the uploaded image.
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
    access: "public",
    contentType,
    addRandomSuffix: true,
  })

  return uploadedBlob.url
}
