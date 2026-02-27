"use client"

import { useState, useEffect } from "react"
import { useInit } from "./use-init"

export interface UsageData {
  allowed: boolean
  remaining: number
  resetTime: number
}

export function useUsage() {
  const [optimisticRemaining, setOptimisticRemaining] = useState<number | null>(null)

  // Consume from the shared /api/init endpoint (fetches auth + usage in one call)
  const { data: initData, error: initError, isLoading, mutate } = useInit()
  const data = initData?.usage
  const error = initError

  useEffect(() => {
    if (data?.remaining !== undefined) {
      setOptimisticRemaining(null)
    }
  }, [data?.remaining])

  const displayRemaining = optimisticRemaining !== null ? optimisticRemaining : (data?.remaining ?? 0)

  const decrementOptimistic = () => {
    setOptimisticRemaining(prev => {
      const current = prev !== null ? prev : (data?.remaining ?? 0)
      return Math.max(0, current - 1)
    })
  }

  return {
    usage: data || null,
    loading: isLoading,
    error: error?.message || null,
    refresh: mutate,
    allowed: data?.allowed ?? true,
    remaining: displayRemaining,
    resetTime: data?.resetTime ?? 0,
    decrementOptimistic,
  }
}
