'use client'

/**
 * Contacts Hooks
 * TanStack Query hooks for contacts CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsService } from '@/app/services/contacts.service'
import type { Contact, CreateContactDto, UpdateContactDto } from '@/app/types'

/**
 * Hook to fetch all contacts (all users in the system)
 * @returns Query with contacts data
 */
export function useContacts() {
  return useQuery<Contact[], Error>({
    queryKey: ['contacts'],
    queryFn: contactsService.getAllContacts,
  })
}

/**
 * Hook to fetch contacts for a specific user
 * @param userId - User ID to fetch contacts for
 * @returns Query with user's contacts data
 */
export function useUserContacts(userId: string | null) {
  return useQuery<Contact[], Error>({
    queryKey: ['contacts', 'user', userId],
    queryFn: () => contactsService.getUserContacts(userId!),
    enabled: !!userId, // Only run query if userId is truthy
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
 * Hook to delete a contact (admin operation - deletes user from system)
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

/**
 * Hook to add an existing user as a contact to another user
 * Refetches user's contacts on success
 * @returns Mutation for adding a contact to a user
 */
export function useAddContactToUser() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, { userId: string; contactId: string }>({
    mutationFn: ({ userId, contactId }) => contactsService.addContactToUser(userId, contactId),
    onSuccess: (_, variables) => {
      // Invalidate and refetch user's contacts
      queryClient.invalidateQueries({ queryKey: ['contacts', 'user', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

/**
 * Hook to remove a contact from a user's contact list
 * Uses optimistic updates for instant UI feedback
 * @returns Mutation for removing a contact from a user
 */
export function useRemoveContactFromUser() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, { userId: string; contactId: string }>({
    mutationFn: ({ userId, contactId }) => {
      console.log('[useRemoveContactFromUser] mutationFn called:', { userId, contactId })
      return contactsService.removeContactFromUser(userId, contactId)
    },
    // Optimistic update: immediately update UI before API call completes
    onMutate: async ({ userId, contactId }) => {
      console.log('[useRemoveContactFromUser] onMutate:', { userId, contactId })
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['contacts', 'user', userId] })
      
      // Snapshot the previous value
      const previousContacts = queryClient.getQueryData<Contact[]>(['contacts', 'user', userId])
      console.log('[useRemoveContactFromUser] Previous contacts:', previousContacts?.length || 0)
      
      // Optimistically update to the new value
      if (previousContacts) {
        const newContacts = previousContacts.filter(contact => contact.id !== contactId)
        console.log('[useRemoveContactFromUser] Setting optimistic data:', newContacts.length)
        queryClient.setQueryData<Contact[]>(
          ['contacts', 'user', userId],
          newContacts
        )
      }
      
      // Return context with the snapshot
      return { previousContacts }
    },
    // If mutation fails, use the context to roll back
    onError: (err, variables, context) => {
      console.error('[useRemoveContactFromUser] onError:', err)
      if (context?.previousContacts) {
        console.log('[useRemoveContactFromUser] Rolling back to previous contacts')
        queryClient.setQueryData(
          ['contacts', 'user', variables.userId],
          context.previousContacts
        )
      }
    },
    // Always refetch after error or success
    onSettled: (_, __, variables) => {
      console.log('[useRemoveContactFromUser] onSettled - invalidating queries')
      queryClient.invalidateQueries({ queryKey: ['contacts', 'user', variables.userId] })
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

