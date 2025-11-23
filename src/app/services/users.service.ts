/**
 * Users Service
 * HTTP client for users API endpoints
 */

import type { User } from '@/app/types'

/**
 * Handles error responses from API
 * Extracts error message from response or uses default
 */
async function handleErrorResponse(response: Response): Promise<never> {
  let message = "Error al procesar la solicitud"
  
  try {
    const error = await response.json()
    if (typeof error?.error === "string" && error.error.trim() !== "") {
      message = error.error
    }
  } catch (_) {
    // Ignore JSON parsing errors, use default message
  }
  
  throw new Error(message)
}

/**
 * Users Service
 * Provides methods to interact with users API
 */
export const usersService = {
  /**
   * Get all users
   * GET /api/users
   */
  getAllUsers: async (): Promise<User[]> => {
    const res = await fetch("/api/users", { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Get user by email
   * GET /api/users?email=xxx
   */
  getUserByEmail: async (email: string): Promise<User | null> => {
    const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`, { cache: "no-store" })
    if (res.status === 404) return null
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Login or create user
   * POST /api/users
   * If user with email exists, returns existing user
   * If user doesn't exist, creates new one
   */
  loginOrCreateUser: async (name: string, email: string): Promise<User> => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
}

