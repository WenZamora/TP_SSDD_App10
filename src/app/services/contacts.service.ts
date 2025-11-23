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
   * Get all users in the system (for adding new contacts)
   * GET /api/users
   */
  getAllContacts: async (): Promise<Contact[]> => {
    const res = await fetch("/api/users", { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Get contacts for a specific user
   * GET /api/users/{userId}/contacts
   */
  getUserContacts: async (userId: string): Promise<Contact[]> => {
    const res = await fetch(`/api/users/${userId}/contacts`, { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Get a single user by ID
   * GET /api/users/[id]
   */
  getContactById: async (id: string): Promise<Contact> => {
    const res = await fetch(`/api/users/${id}`, { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Create a new user in the system
   * POST /api/users
   */
  createContact: async (data: CreateContactDto): Promise<Contact> => {
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Add an existing user as a contact to another user
   * POST /api/users/{userId}/contacts
   */
  addContactToUser: async (userId: string, contactId: string): Promise<void> => {
    const res = await fetch(`/api/users/${userId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contactId }),
    })
    if (!res.ok) await handleErrorResponse(res)
  },
  
  /**
   * Update a user
   * PUT /api/users/[id]
   */
  updateContact: async (id: string, data: UpdateContactDto): Promise<Contact> => {
    const res = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Delete a user from system (admin operation)
   * DELETE /api/users/[id]
   * Note: Will fail with 409 if user is a member of any group
   */
  deleteContact: async (id: string): Promise<void> => {
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
    if (!res.ok) await handleErrorResponse(res)
  },
  
  /**
   * Remove a contact from a user's contact list
   * DELETE /api/users/{userId}/contacts/{contactId}
   */
  removeContactFromUser: async (userId: string, contactId: string): Promise<void> => {
    console.log('[contactsService] Removing contact:', { userId, contactId })
    const res = await fetch(`/api/users/${userId}/contacts/${contactId}`, { 
      method: "DELETE",
      cache: "no-store"
    })
    console.log('[contactsService] Response status:', res.status)
    if (!res.ok) await handleErrorResponse(res)
    console.log('[contactsService] Contact removed successfully')
  },
}

