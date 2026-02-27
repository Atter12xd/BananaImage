import type React from "react"

export type ModelType = "nb2" | "pro" | "classic"
export type ThinkingLevel = "minimal" | "high"
export type Resolution = "1K" | "2K" | "4K"

export interface GeneratedImage {
  url: string
  prompt: string
  description?: string
}

export type GenerationPhase = "sending" | "generating" | "processing" | "loading"

export interface Generation {
  id: string
  status: "loading" | "complete" | "error"
  progress: number
  phase?: GenerationPhase
  imageUrl: string | null
  prompt: string
  error?: string
  timestamp: number
  abortController?: AbortController
  model?: ModelType
  thinkingLevel?: ThinkingLevel
  resolution?: Resolution
  useGrounding?: boolean
}

export type AspectRatioOption = {
  value: string
  label: string
  ratio: number
  icon: React.ReactNode
}
