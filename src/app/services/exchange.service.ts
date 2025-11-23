/**
 * Exchange Service
 * HTTP client for currency exchange API endpoints
 */

import type { ExchangeRate } from '@/app/types'

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
 * Exchange Service
 * Provides methods to interact with exchange rate API
 */
export const exchangeService = {
  /**
   * Get exchange rate between two currencies
   * GET /api/exchange?from=USD&to=ARS
   */
  getExchangeRate: async (from: string, to: string): Promise<ExchangeRate> => {
    const res = await fetch(`/api/exchange?from=${from}&to=${to}`, { 
      cache: "no-store" 
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
}

