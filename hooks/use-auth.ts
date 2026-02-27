"use client"

import { mutate as globalMutate } from "swr"
import { useState, useEffect } from "react"
import { useInit } from "./use-init"

export function useAuth() {
  const [signingIn, setSigningIn] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  // Consume from the shared /api/init endpoint (fetches auth + usage in one call)
  const { data, error, isLoading, mutate } = useInit()
  const user = data?.user ?? null

  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).__isAuthenticated = !!user
      // Persist auth hint so skeleton can match on next page load
      try {
        if (user) localStorage.setItem("nb_authed", "1")
        else localStorage.removeItem("nb_authed")
      } catch {}
    }
  }, [user])

  const signIn = () => {
    setSigningIn(true)

    if (typeof window !== "undefined") {
      sessionStorage.setItem("pre-auth-url", window.location.pathname)
    }
    window.location.href = "/api/auth/signin"
  }

  const signOut = async () => {
    setSigningOut(true)

    try {
      if (typeof window !== "undefined") {
        ;(window as any).__isAuthenticated = false
        window.dispatchEvent(new CustomEvent("auth:signout"))
      }

      // Clear all SWR caches immediately
      mutate(undefined, { revalidate: false })
      await globalMutate(() => true, undefined, { revalidate: false })

      // Clear cached user data so refresh doesn't flash stale content
      try {
        sessionStorage.removeItem("cached_generations")
        localStorage.removeItem("pending_workflow_runs")
        localStorage.removeItem("nb_authed")
      } catch {}

      // Wait for server to clear the session cookie before reloading
      await fetch("/api/auth/signout", {
        method: "POST",
      }).catch((error) => {
        console.error("Sign out API call failed:", error)
      })

      // Force a full page reload (assign + reload ensures it works even on "/")
      window.location.href = "/"
      window.location.reload()
    } catch (error) {
      console.error("Sign out failed:", error)
      setSigningOut(false)
    }
  }

  return {
    user: user ?? null,
    initialLoading: isLoading,
    loading: isLoading || signingIn || signingOut,
    error,
    signIn,
    signOut,
    isAuthenticated: !!user,
    signingIn,
    signingOut,
  }
}
