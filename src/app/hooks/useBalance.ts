'use client'

/**
 * Balance Hooks
 * TanStack Query hooks for balance calculations
 */

import { useQuery } from '@tanstack/react-query'
import { groupsService } from '@/app/services/groups.service'
import type { BalanceSummary } from '@/app/types'

/**
 * Hook to fetch balance summary for a group
 * Returns both balances and settlement suggestions
 * @param groupId - Group ID
 * @returns Query with balance summary data
 */
export function useGroupBalance(groupId: string) {
  return useQuery<BalanceSummary, Error>({
    queryKey: ['groups', groupId, 'balance'],
    queryFn: () => groupsService.getGroupBalance(groupId),
    enabled: !!groupId, // Only run query if groupId is truthy
  })
}

