"use client"

import useSWR, { mutate } from "swr"
import { useAuth } from "./use-auth"
import { useEffect, useRef } from "react"
import type { CreditsResponse } from "@/app/api/credits/route"
import type { UsageHistoryResponse } from "@/app/api/usage/history/route"

// Shared key for needsTeamAuth state across all hook instances
const NEEDS_TEAM_AUTH_KEY = "needsTeamAuth"

export function useCredits(limit: number = 20) {
  const { isAuthenticated } = useAuth()
  const creditsAbortRef = useRef<AbortController | null>(null)
  const historyAbortRef = useRef<AbortController | null>(null)
  
  // Use SWR to share needsTeamAuth state across all components
  const { data: needsTeamAuth = false } = useSWR<boolean>(NEEDS_TEAM_AUTH_KEY, null, {
    fallbackData: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const { data, error, isLoading: creditsLoading, mutate: creditsMutate } = useSWR<CreditsResponse, Error>(
    isAuthenticated ? "/api/credits" : null,
    async (): Promise<CreditsResponse> => {
      creditsAbortRef.current = new AbortController()
      const response = await fetch("/api/credits", {
        signal: creditsAbortRef.current.signal
      })
      const data = await response.json()
    
      if (!response.ok) {
        // Check if user needs to grant team permissions
        if (data.needsTeamAuth) {
          mutate(NEEDS_TEAM_AUTH_KEY, true, false)
        }
        throw new Error(data.error || "Failed to fetch credits")
      }
    
      mutate(NEEDS_TEAM_AUTH_KEY, false, false)
      return data
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
    }
  )
  
  const { data: history, isLoading: historyLoading, mutate: historyMutate } = useSWR<UsageHistoryResponse, Error>(
    isAuthenticated ? `/api/usage/history?limit=${limit}` : null,
    async (): Promise<UsageHistoryResponse> => {
      historyAbortRef.current = new AbortController()
      const response = await fetch(`/api/usage/history?limit=${limit}`, {
        signal: historyAbortRef.current.signal
      })
      const responseData = await response.json()
    
      if (!response.ok) {
        throw new Error("Failed to fetch usage history")
      }
    
      return responseData
    }
  )

  useEffect(() => {
    const handleSignOut = () => {
      creditsMutate(undefined, false)
      historyMutate(undefined, false)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:signout', handleSignOut)
      return () => window.removeEventListener('auth:signout', handleSignOut)
    }
  }, [creditsMutate, historyMutate])

  useEffect(() => {
    return () => {
      creditsAbortRef.current?.abort()
      historyAbortRef.current?.abort()
    }
  }, [])

  return {
    credits: data || null,
    history: history?.history || [],
    buyCreditsUrl: data?.buyCreditsUrl || null,
    creditsLoading,
    historyLoading,
    error: error?.message || null,
    needsTeamAuth,
    refresh: () => {
      creditsMutate()
      historyMutate()
    },
    balance: data?.balance || "0",
    totalUsed: data?.totalUsed || "0",
  }
}
