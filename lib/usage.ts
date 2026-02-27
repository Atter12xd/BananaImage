import { getRateLimitForIP, upsertAndIncrementRateLimit } from "./db/queries"

export interface UsageLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
}

export const MAX_REQUESTS_PER_DAY = 1 // Changed from 2 to 1 generation per day

export function getTodayDateString() {
  return new Date().toISOString().split("T")[0]
}

export const usageResponse = (count: number, resetTime: number): UsageLimitResult => {
  return {
    allowed: count < MAX_REQUESTS_PER_DAY,
    remaining: Math.max(0, MAX_REQUESTS_PER_DAY - count),
    resetTime,
  }
}

export async function checkUsageLimit(ip: string): Promise<UsageLimitResult> {
  const today = getTodayDateString()

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)
  const resetTime = endOfDay.getTime()

  try {
    // Check current count first without incrementing
    const existingRecord = await getRateLimitForIP(ip, today)
    const currentCount = existingRecord?.count || 0

    // If already at limit, return early without incrementing
    if (currentCount >= MAX_REQUESTS_PER_DAY) {
      return usageResponse(currentCount, resetTime)
    }

    // Atomically upsert and increment in a single operation
    const updated = await upsertAndIncrementRateLimit(ip, today)

    return usageResponse(updated.count, resetTime)
  } catch (error) {
    console.error("Database error in checkUsageLimit:", error)
    // On error, allow the request but return 0 remaining
    return usageResponse(MAX_REQUESTS_PER_DAY, resetTime)
  }
}

export async function getUsage(ip: string): Promise<UsageLimitResult> {
  const today = getTodayDateString()

  const endOfDay = new Date()
  endOfDay.setHours(23, 59, 59, 999)
  const resetTime = endOfDay.getTime()

  try {
    const record = await getRateLimitForIP(ip, today)
    return usageResponse(record?.count || 0, resetTime)
  } catch (error) {
    console.error("Database error in getUsage:", error)
    return usageResponse(0, resetTime)
  }
}

export function getRateLimitHeaders(usage: UsageLimitResult) {
  return {
    "X-RateLimit-Limit": MAX_REQUESTS_PER_DAY.toString(),
    "X-RateLimit-Remaining": usage.remaining.toString(),
    "X-RateLimit-Reset": usage.resetTime.toString(),
  }
}
