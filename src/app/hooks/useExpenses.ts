'use client'

/**
 * Expenses Hooks
 * TanStack Query hooks for expenses CRUD operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsService } from '@/app/services/groups.service'
import type { Expense, CreateExpenseDto, UpdateExpenseDto } from '@/app/types'

/**
 * Hook to fetch all expenses for a group
 * @param groupId - Group ID
 * @returns Query with expenses data
 */
export function useGroupExpenses(groupId: string) {
  return useQuery<Expense[], Error>({
    queryKey: ['groups', groupId, 'expenses'],
    queryFn: () => groupsService.getGroupExpenses(groupId),
    enabled: !!groupId, // Only run query if groupId is truthy
  })
}

/**
 * Hook to add an expense to a group
 * Automatically invalidates related queries on success
 * @param groupId - Group ID
 * @returns Mutation for adding an expense
 */
export function useAddExpense(groupId: string) {
  const queryClient = useQueryClient()
  
  return useMutation<Expense, Error, CreateExpenseDto>({
    mutationFn: (data) => groupsService.addExpense(groupId, data),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'expenses'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'statistics'] })
    },
  })
}

/**
 * Hook to update an expense
 * Automatically invalidates related queries on success
 * @param groupId - Group ID
 * @returns Mutation for updating an expense
 */
export function useUpdateExpense(groupId: string) {
  const queryClient = useQueryClient()
  
  return useMutation<Expense, Error, { expenseId: string; data: UpdateExpenseDto }>({
    mutationFn: ({ expenseId, data }) => 
      groupsService.updateExpense(groupId, expenseId, data),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'expenses'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'statistics'] })
    },
  })
}

/**
 * Hook to delete an expense
 * Automatically invalidates related queries on success
 * @param groupId - Group ID
 * @returns Mutation for deleting an expense
 */
export function useDeleteExpense(groupId: string) {
  const queryClient = useQueryClient()
  
  return useMutation<void, Error, string>({
    mutationFn: (expenseId) => groupsService.deleteExpense(groupId, expenseId),
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'expenses'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'statistics'] })
    },
  })
}

