import { cacheLife, cacheTag } from "next/cache"
import { getUserGenerations, getRecentGenerationDurations } from "./queries"

export async function getCachedUserGenerations(userEmail: string, limit = 20, offset = 0) {
  "use cache"
  cacheTag(`generations-${userEmail}`)
  cacheLife("minutes")

  return getUserGenerations(userEmail, limit, offset)
}

export async function getCachedGenerationStats() {
  "use cache"
  cacheTag("generation-stats")
  cacheLife("minutes")

  const durations = await getRecentGenerationDurations()

  if (durations.length === 0) {
    return { medianDurationMs: null, sampleCount: 0 }
  }

  const sorted = [...durations].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const medianDurationMs =
    sorted.length % 2 === 0
      ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
      : sorted[mid]

  return { medianDurationMs, sampleCount: durations.length }
}
