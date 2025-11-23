'use client'

/**
 * Statistics Hooks
 * TanStack Query hooks for group statistics and analytics
 */

import { useQuery } from '@tanstack/react-query'
import { groupsService } from '@/app/services/groups.service'
import type {
  ExpensesByPerson,
  ExpensesByCategory,
  ExpensesByMonth,
  TotalGroupExpenses,
  GroupSummary,
} from '@/app/types'

/**
 * Hook to fetch expenses grouped by person
 * @param groupId - Group ID
 * @returns Query with expenses by person data
 */
export function useExpensesByPerson(groupId: string) {
  return useQuery<ExpensesByPerson[], Error>({
    queryKey: ['groups', groupId, 'statistics', 'person'],
    queryFn: () => groupsService.getExpensesByPerson(groupId),
    enabled: !!groupId,
  })
}

/**
 * Hook to fetch expenses grouped by category
 * @param groupId - Group ID
 * @returns Query with expenses by category data
 */
export function useExpensesByCategory(groupId: string) {
  return useQuery<ExpensesByCategory[], Error>({
    queryKey: ['groups', groupId, 'statistics', 'category'],
    queryFn: () => groupsService.getExpensesByCategory(groupId),
    enabled: !!groupId,
  })
}

/**
 * Hook to fetch expenses grouped by month
 * @param groupId - Group ID
 * @returns Query with expenses by month data
 */
export function useExpensesByMonth(groupId: string) {
  return useQuery<ExpensesByMonth[], Error>({
    queryKey: ['groups', groupId, 'statistics', 'month'],
    queryFn: () => groupsService.getExpensesByMonth(groupId),
    enabled: !!groupId,
  })
}

/**
 * Hook to fetch total expenses for a group
 * @param groupId - Group ID
 * @returns Query with total expenses data
 */
export function useTotalExpenses(groupId: string) {
  return useQuery<TotalGroupExpenses, Error>({
    queryKey: ['groups', groupId, 'statistics', 'total'],
    queryFn: () => groupsService.getTotalExpenses(groupId),
    enabled: !!groupId,
  })
}

/**
 * Hook to fetch complete statistics summary for a group
 * Includes all statistics types in one request
 * @param groupId - Group ID
 * @returns Query with complete group summary data
 */
export function useGroupSummary(groupId: string) {
  return useQuery<GroupSummary, Error>({
    queryKey: ['groups', groupId, 'statistics', 'summary'],
    queryFn: () => groupsService.getGroupSummary(groupId),
    enabled: !!groupId,
  })
}

