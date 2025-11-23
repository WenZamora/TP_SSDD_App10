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
   * Get all contacts (all users in the system)
   * GET /api/contacts
   */
  getAllContacts: async (): Promise<Contact[]> => {
    const res = await fetch("/api/contacts", { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Get contacts for a specific user
   * GET /api/contacts?userId=xxx
   */
  getUserContacts: async (userId: string): Promise<Contact[]> => {
    const res = await fetch(`/api/contacts?userId=${userId}`, { cache: "no-store" })
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
   * Create a new contact (new user in the system)
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
   * Add an existing user as a contact to another user
   * POST /api/contacts
   */
  addContactToUser: async (userId: string, contactId: string): Promise<void> => {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, contactId }),
    })
    if (!res.ok) await handleErrorResponse(res)
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
   * Delete a contact (delete user from system - admin operation)
   * DELETE /api/contacts/[id]
   * Note: Will fail with 409 if contact is a member of any group
   */
  deleteContact: async (id: string): Promise<void> => {
    const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" })
    if (!res.ok) await handleErrorResponse(res)
  },
  
  /**
   * Remove a contact from a user's contact list
   * DELETE /api/contacts/[id]?userId=xxx
   */
  removeContactFromUser: async (userId: string, contactId: string): Promise<void> => {
    const res = await fetch(`/api/contacts/${contactId}?userId=${userId}`, { method: "DELETE" })
    if (!res.ok) await handleErrorResponse(res)
  },
}

