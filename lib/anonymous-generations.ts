import type { Generation } from "@/components/image-combiner/types"

const ANON_KEY = "anonymous_generations"
const MAX_ANON_GENERATIONS = 2

export function saveAnonymousGeneration(generation: Generation) {
  try {
    const stored = localStorage.getItem(ANON_KEY)
    const existing: Generation[] = stored ? JSON.parse(stored) : []
    const updated = [generation, ...existing].slice(0, MAX_ANON_GENERATIONS)

    localStorage.setItem(ANON_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("Failed to save anonymous generation:", error)
  }
}

export function getAnonymousGenerations(): Generation[] {
  try {
    const stored = localStorage.getItem(ANON_KEY)
    if (!stored) return []

    return JSON.parse(stored)
  } catch (error) {
    console.error("Failed to get anonymous generations:", error)
    return []
  }
}

export function clearAnonymousGenerations() {
  try {
    localStorage.removeItem(ANON_KEY)
  } catch (error) {
    console.error("Failed to clear anonymous generations:", error)
  }
}

export function deleteAnonymousGeneration(id: string) {
  try {
    const stored = localStorage.getItem(ANON_KEY)

    if (!stored) {
      return
    }

    const existing: Generation[] = JSON.parse(stored)
    const filtered = existing.filter((gen) => gen.id !== id)
    localStorage.setItem(ANON_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Failed to delete anonymous generation:", error)
  }
}

export async function migrateAnonymousGenerations(userEmail: string): Promise<Generation[]> {
  const anonymousGens = getAnonymousGenerations()

  if (anonymousGens.length === 0) {
    return []
  }

  try {
    const response = await fetch("/api/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        generations: anonymousGens,
        email: userEmail,
      }),
    })

    if (!response.ok) {
      throw new Error(`Migration failed with status ${response.status}`)
    }

    clearAnonymousGenerations()

    return anonymousGens
  } catch (error) {
    console.error("Failed to migrate anonymous generations:", error)
    return []
  }
}
