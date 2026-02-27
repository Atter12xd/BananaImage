const API_TIMEOUT_MS = 15_000 // 15s timeout for Vercel API calls

export async function fetchVercelApi(endpoint: string, accessToken: string, options?: RequestInit) {
  const url = `https://api.vercel.com${endpoint}`

  const response = await fetch(url, {
    ...options,
    signal: options?.signal ?? AbortSignal.timeout(API_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Vercel API error: ${response.status} - ${error}`)
  }

  return response.json()
}
