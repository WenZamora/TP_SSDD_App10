/**
 * Contacts Service
 * HTTP client for contacts API endpoints
 */

import type {
  Contact,
  CreateContactDto,
  UpdateContactDto,
} from '@/app/types'

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
 * Contacts Service
 * Provides methods to interact with contacts API
 */
export const contactsService = {
  /**
   * Get all contacts
   * GET /api/contacts
   */
  getAllContacts: async (): Promise<Contact[]> => {
    const res = await fetch("/api/contacts", { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Get a single contact by ID
   * GET /api/contacts/[id]
   */
  getContactById: async (id: string): Promise<Contact> => {
    const res = await fetch(`/api/contacts/${id}`, { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Create a new contact
   * POST /api/contacts
   */
  createContact: async (data: CreateContactDto): Promise<Contact> => {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Update a contact
   * PUT /api/contacts/[id]
   */
  updateContact: async (id: string, data: UpdateContactDto): Promise<Contact> => {
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Delete a contact
   * DELETE /api/contacts/[id]
   * Note: Will fail with 409 if contact is a member of any group
   */
  deleteContact: async (id: string): Promise<void> => {
    const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" })
    if (!res.ok) await handleErrorResponse(res)
  },
}

