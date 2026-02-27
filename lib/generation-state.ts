import type { ModelType, ThinkingLevel, Resolution } from "@/components/image-combiner/types"

export interface PendingGenerationState {
  prompt: string
  aspectRatio: string
  image1Url?: string
  image2Url?: string
  image1Preview?: string
  image2Preview?: string
  useUrls: boolean
  useProModel: boolean // kept for backwards compat with in-flight pending states
  selectedModel: ModelType
  thinkingLevel: ThinkingLevel
  resolution: Resolution
  useGrounding: boolean
  timestamp: number
}

const PENDING_GENERATION_KEY = "pending_generation_state"
const EXPIRATION_TIME = 30 * 60 * 1000 // 30 minutes

export function savePendingGeneration(state: PendingGenerationState): void {
  try {
    const dataToSave = JSON.stringify(state)
    localStorage.setItem(PENDING_GENERATION_KEY, dataToSave)
  } catch (error) {
    console.error("Error saving pending generation:", error)
  }
}

export function getPendingGeneration(): PendingGenerationState | null {
  try {
    const stored = localStorage.getItem(PENDING_GENERATION_KEY)

    if (!stored) {
      return null
    }

    const state = JSON.parse(stored) as PendingGenerationState

    // Only return if it's less than expiration time
    if (Date.now() - state.timestamp > EXPIRATION_TIME) {
      clearPendingGeneration()
      return null
    }

    return state
  } catch (error) {
    console.error("Error retrieving pending generation:", error)
    return null
  }
}

export function clearPendingGeneration(): void {
  try {
    localStorage.removeItem(PENDING_GENERATION_KEY)
  } catch (error) {
    console.error("Error clearing pending generation:", error)
  }
}
