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

/**
 * Hook to fetch and aggregate balances for multiple groups
 * @param groups - Array of groups
 * @param currentUserId - Current user ID
 * @returns Aggregated balances by currency
 */
export function useAggregatedBalances(groups: any[], currentUserId: string | undefined) {
  // Fetch balances for all groups in parallel
  const balanceQueries = useQuery({
    queryKey: ['aggregated-balances', groups.map(g => g.id).join(','), currentUserId],
    queryFn: async () => {
      if (!currentUserId || groups.length === 0) return {}
      
      // Fetch all balances in parallel
      const balancePromises = groups.map(group => 
        groupsService.getGroupBalance(group.id)
          .then(data => ({
            groupId: group.id,
            currency: group.baseCurrency,
            data
          }))
          .catch(() => null)
      )
      
      const results = await Promise.all(balancePromises)
      
      // Aggregate by currency
      const currencyBalances: Record<string, number> = {}
      
      results.forEach(result => {
        if (result && result.data?.balances) {
          const userBalance = result.data.balances.find(b => b.memberId === currentUserId)
          if (userBalance) {
            if (!currencyBalances[result.currency]) {
              currencyBalances[result.currency] = 0
            }
            currencyBalances[result.currency] += userBalance.balance
          }
        }
      })
      
      return currencyBalances
    },
    enabled: !!currentUserId && groups.length > 0,
  })
  
  return {
    balancesByCurrency: balanceQueries.data || {},
    isLoading: balanceQueries.isLoading
  }
}

