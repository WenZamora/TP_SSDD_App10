'use client'

/**
 * Contacts Hooks
 * TanStack Query hooks for contacts CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsService } from '@/app/services/contacts.service'
import type { Contact, CreateContactDto, UpdateContactDto } from '@/app/types'

/**
 * Hook to fetch all contacts
 * @returns Query with contacts data
 */
export function useContacts() {
  return useQuery<Contact[], Error>({
    queryKey: ['contacts'],
    queryFn: contactsService.getAllContacts,
  })
}

/**
 * Hook to fetch a single contact by ID
 * @param id - Contact ID
 * @returns Query with contact data
 */
export function useContact(id: string) {
  return useQuery<Contact, Error>({
    queryKey: ['contacts', id],
    queryFn: () => contactsService.getContactById(id),
    enabled: !!id, // Only run query if id is truthy
  })
}

/**
 * Hook to create a new contact
 * Automatically invalidates contacts list on success
 * @returns Mutation for creating a contact
 */
export function useCreateContact() {
  const queryClient = useQueryClient()
  
  return useMutation<Contact, Error, CreateContactDto>({
    mutationFn: contactsService.createContact,
    onSuccess: () => {
      // Invalidate and refetch contacts list
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

/**
 * Hook to update a contact
 * Automatically invalidates affected queries on success
 * @returns Mutation for updating a contact
 */
export function useUpdateContact() {
  const queryClient = useQueryClient()
  
  return useMutation<Contact, Error, { id: string; data: UpdateContactDto }>({
    mutationFn: ({ id, data }) => contactsService.updateContact(id, data),
    onSuccess: (_, variables) => {
      // Invalidate contacts list and specific contact
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.id] })
      // Also invalidate groups that might have this contact as a member
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

/**
 * Hook to delete a contact
 * Automatically invalidates contacts list on success
 * Note: Will fail if contact is a member of any group
 * @returns Mutation for deleting a contact
 */
export function useDeleteContact() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: contactsService.deleteContact,
    onSuccess: () => {
      // Invalidate contacts list
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

