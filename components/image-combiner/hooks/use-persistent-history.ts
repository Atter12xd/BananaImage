"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/hooks/use-auth"
import { isValidUUID } from "@/lib/utils"
import {
  getAnonymousGenerations,
  saveAnonymousGeneration,
  clearAnonymousGenerations,
  deleteAnonymousGeneration,
} from "@/lib/anonymous-generations"
import type { Generation } from "../types"

const PAGE_SIZE = 20
const HISTORY_CACHE_KEY = "cached_generations"

function getCachedGenerations(): Generation[] {
  try {
    const stored = sessionStorage.getItem(HISTORY_CACHE_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch { return [] }
}

function cacheGenerations(generations: Generation[]) {
  try {
    // Only cache completed generations (not loading ones), limit to PAGE_SIZE
    const toCache = generations
      .filter((g) => g.status === "complete" && g.imageUrl)
      .slice(0, PAGE_SIZE)
    sessionStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(toCache))
  } catch {}
}

export function usePersistentHistory(onToast?: (message: string, type: "success" | "error") => void) {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [offset, setOffset] = useState(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)
  const hasMigratedRef = useRef(false)
  const onToastRef = useRef(onToast)

  // Hydrate from sessionStorage cache on mount (avoids SSR mismatch)
  useEffect(() => {
    const cached = getCachedGenerations()
    if (cached.length > 0) {
      setGenerations(cached)
    }
  }, [])

  useEffect(() => {
    onToastRef.current = onToast
  }, [onToast])

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    // Don't resolve history while auth is still loading — avoids
    // flashing "No generations yet" before the fetch can run.
    if (authLoading) return

    const migrateAndLoad = async () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setIsLoading(true)

      if (isAuthenticated && user?.email) {
        const anonymousGenerations = getAnonymousGenerations()

        if (!hasMigratedRef.current && anonymousGenerations.length > 0) {
          hasMigratedRef.current = true

          try {
            const response = await fetch("/api/generations", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                generations: anonymousGenerations.map((gen) => ({
                  ...gen,
                  userEmail: user.email,
                })),
                email: user.email,
              }),
            })

            if (response.ok) {
              clearAnonymousGenerations()
            } else {
              console.error("[v0] Migration failed:", await response.text())
              hasMigratedRef.current = false
            }
          } catch (error) {
            console.error("[v0] Migration error:", error)
            hasMigratedRef.current = false
          }
        }

        try {
          const response = await fetch(`/api/generations?email=${encodeURIComponent(user.email)}&limit=${PAGE_SIZE}&offset=0`, {
            signal: abortControllerRef.current.signal,
          })

          if (response.ok) {
            const data = await response.json()
            if (isMountedRef.current) {
              const dbGenerations = data.generations || []

              setGenerations((currentGenerations) => {
                const inProgressGenerations = currentGenerations.filter((g) => g.status === "loading")
                const merged = [...inProgressGenerations, ...dbGenerations]
                cacheGenerations(merged)
                return merged
              })

              setHasMore(data.hasMore || false)
              setOffset(PAGE_SIZE)
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("[v0] Failed to fetch generations:", error)
          }
        }
      } else {
        const anonGens = getAnonymousGenerations()
        if (isMountedRef.current) {
          setGenerations(anonGens)
        }
      }

      if (isMountedRef.current) {
        setIsLoading(false)
        setHasInitiallyLoaded(true)
      }
    }

    migrateAndLoad()
  }, [authLoading, isAuthenticated, user?.email])

  const loadMore = async () => {
    if (!isAuthenticated || !user?.email || isLoadingMore || !hasMore) {
      return
    }

    setIsLoadingMore(true)

    try {
      const response = await fetch(
        `/api/generations?email=${encodeURIComponent(user.email)}&limit=${PAGE_SIZE}&offset=${offset}`,
        {
          headers: {
            "Cache-Control": "no-cache",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        if (isMountedRef.current) {
          setGenerations((prev) => [...prev, ...(data.generations || [])])
          setHasMore(data.hasMore === true && (data.generations || []).length > 0)
          setOffset((prev) => prev + PAGE_SIZE)
        }
      }
    } catch (error) {
      console.error("Failed to load more generations:", error)
    } finally {
      if (isMountedRef.current) {
        setIsLoadingMore(false)
      }
    }
  }

  const addGeneration = useCallback(
    async (generation: Generation) => {
      setGenerations((prev) => {
        const existingIndex = prev.findIndex((g) => g.id === generation.id)
        let updated: Generation[]
        if (existingIndex >= 0) {
          // Update existing (e.g. loading → complete)
          updated = prev.map((g) => g.id === generation.id ? generation : g)
        } else {
          updated = [generation, ...prev]
        }
        cacheGenerations(updated)
        return updated
      })

      if (isAuthenticated && user?.email) {
        try {
          const response = await fetch("/api/generations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              generation: {
                ...generation,
                userEmail: user.email,
              },
              email: user.email,
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to save to database")
          }
        } catch (error) {
          console.error("[v0] Failed to save to database:", error)
          onToastRef.current?.("Failed to save generation", "error")
        }
      } else {
        saveAnonymousGeneration(generation)
      }
    },
    [isAuthenticated, user?.email],
  )

  const updateGeneration = useCallback((id: string, updates: Partial<Generation>) => {
    setGenerations((prev) => {
      const updated = prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
      return updated
    })
  }, [])

  const clearHistory = async () => {
    if (isAuthenticated && user?.email) {
      try {
        await fetch(`/api/generations?email=${encodeURIComponent(user.email)}`, {
          method: "DELETE",
        })
      } catch (error) {
        console.error("Failed to clear database history:", error)
      }
    }
    setGenerations([])
    setHasMore(false)
    setOffset(0)
  }

  const deleteGeneration = async (id: string) => {
    if (isAuthenticated && user?.email && !id.startsWith("gen-")) {
      if (!isValidUUID(id)) {
        console.error("Invalid generation ID format:", id)
        throw new Error("Invalid generation ID")
      }
    }

    const deletedItem = generations.find((g) => g.id === id)
    const currentCount = generations.length

    setGenerations((prev) => {
      const updated = prev.filter((g) => g.id !== id)
      cacheGenerations(updated)
      return updated
    })

    if (id.startsWith("gen-")) {
      deleteAnonymousGeneration(id)
      return
    }

    const anonGens = getAnonymousGenerations()
    if (anonGens.some((g) => g.id === id)) {
      deleteAnonymousGeneration(id)
    }

    if (isAuthenticated && user?.email) {
      try {
        const response = await fetch(`/api/generations/${id}?email=${encodeURIComponent(user.email)}`, {
          method: "DELETE",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          cache: "no-store",
        })

        if (!response.ok) {
          if (deletedItem) {
            setGenerations((prev) =>
              [deletedItem, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            )
          }
          const errorText = await response.text()
          console.error("Failed to delete generation:", response.status, errorText)
          throw new Error(`Failed to delete from database: ${response.status}`)
        }

        if (currentCount <= PAGE_SIZE && hasMore) {
          try {
            const moreResponse = await fetch(
              `/api/generations?email=${encodeURIComponent(user.email)}&limit=1&offset=${offset - 1}`,
              {
                headers: {
                  "Cache-Control": "no-cache",
                },
              },
            )

            if (moreResponse.ok) {
              const data = await moreResponse.json()
              if (isMountedRef.current && data.generations?.length > 0) {
                setGenerations((prev) => {
                  const newGens = data.generations.filter(
                    (g: Generation) => !prev.some((existing) => existing.id === g.id),
                  )
                  return [...prev, ...newGens]
                })
                setHasMore(data.hasMore === true)
              } else if (isMountedRef.current && data.generations?.length === 0) {
                setHasMore(false)
              }
            }
          } catch (loadError) {
            console.error("Failed to load replacement generation:", loadError)
          }
        }
      } catch (error) {
        if (deletedItem) {
          setGenerations((prev) =>
            [deletedItem, ...prev].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          )
        }
        console.error("Failed to delete generation:", error)
        throw error
      }
    }
  }

  return {
    generations,
    setGenerations,
    addGeneration,
    clearHistory,
    deleteGeneration,
    isLoading,
    hasInitiallyLoaded,
    hasMore,
    loadMore,
    isLoadingMore,
    updateGeneration,
  }
}
