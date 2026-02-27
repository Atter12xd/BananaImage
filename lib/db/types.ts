/**
 * Type definitions for database tables
 */

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  created_at: string
}

export interface NewUser {
  email: string
  name?: string | null
  avatar_url?: string | null
}

export interface Usage {
  id: string
  user_email: string | null
  credit_cost: string
  tokens: number
  action: string
  metadata: string | null
  created_at: string
}

export interface NewUsage {
  user_email?: string | null
  credit_cost: string
  tokens: number
  action: string
  metadata?: string | null
}

export interface RateLimit {
  id: string
  ip: string
  date: string
  count: number
  reset_time: string
  created_at: string
  updated_at: string
}

export interface NewRateLimit {
  ip: string
  date: string
  count?: number
  reset_time: Date
}
