'use client'

/**
 * Groups Hooks
 * TanStack Query hooks for groups CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsService } from '@/app/services/groups.service'
import type { Group, CreateGroupDto, UpdateGroupDto } from '@/app/types'

/**
 * Hook to fetch all groups
 * @returns Query with groups data
 */
export function useGroups() {
  return useQuery<Group[], Error>({
    queryKey: ['groups'],
    queryFn: groupsService.getAllGroups,
  })
}

/**
 * Hook to fetch a single group by ID
 * @param id - Group ID
 * @returns Query with group data
 */
export function useGroup(id: string) {
  return useQuery<Group, Error>({
    queryKey: ['groups', id],
    queryFn: () => groupsService.getGroupById(id),
    enabled: !!id, // Only run query if id is truthy
  })
}

/**
 * Hook to create a new group
 * Automatically invalidates groups list on success
 * @returns Mutation for creating a group
 */
export function useCreateGroup() {
  const queryClient = useQueryClient()
  
  return useMutation<Group, Error, CreateGroupDto>({
    mutationFn: groupsService.createGroup,
    onSuccess: () => {
      // Invalidate and refetch groups list
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

/**
 * Hook to update a group
 * Automatically invalidates affected queries on success
 * @returns Mutation for updating a group
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient()
  
  return useMutation<Group, Error, { id: string; data: UpdateGroupDto }>({
    mutationFn: ({ id, data }) => groupsService.updateGroup(id, data),
    onSuccess: (_, variables) => {
      // Invalidate groups list and specific group
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['groups', variables.id] })
      // Also invalidate related data
      queryClient.invalidateQueries({ queryKey: ['groups', variables.id, 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['groups', variables.id, 'statistics'] })
    },
  })
}

/**
 * Hook to delete a group
 * Automatically invalidates groups list on success
 * @returns Mutation for deleting a group
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: groupsService.deleteGroup,
    onSuccess: () => {
      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

