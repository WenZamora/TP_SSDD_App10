/**
 * Groups Service
 * HTTP client for groups and expenses API endpoints
 */

import type {
  Group,
  Expense,
  CreateGroupDto,
  UpdateGroupDto,
  CreateExpenseDto,
  UpdateExpenseDto,
  BalanceSummary,
  ExpensesByPerson,
  ExpensesByCategory,
  ExpensesByMonth,
  TotalGroupExpenses,
  GroupSummary,
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
 * Groups Service
 * Provides methods to interact with groups API
 */
export const groupsService = {
  /**
   * Get all groups, optionally filtered by user membership
   * GET /api/groups?userId=xxx
   * @param userId - Optional user ID to filter groups where user is a member
   */
  getAllGroups: async (userId?: string): Promise<Group[]> => {
    const url = userId ? `/api/groups?userId=${encodeURIComponent(userId)}` : "/api/groups"
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Get a single group by ID
   * GET /api/groups/[id]
   */
  getGroupById: async (id: string): Promise<Group> => {
    const res = await fetch(`/api/groups/${id}`, { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Create a new group
   * POST /api/groups
   */
  createGroup: async (data: CreateGroupDto): Promise<Group> => {
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Update a group
   * PUT /api/groups/[id]
   */
  updateGroup: async (id: string, data: UpdateGroupDto): Promise<Group> => {
    const res = await fetch(`/api/groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Delete a group
   * DELETE /api/groups/[id]
   */
  deleteGroup: async (id: string): Promise<void> => {
    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" })
    if (!res.ok) await handleErrorResponse(res)
  },
  
  // ============================================================================
  // Expenses
  // ============================================================================
  
  /**
   * Get all expenses for a group
   * GET /api/groups/[id]/expenses
   */
  getGroupExpenses: async (groupId: string): Promise<Expense[]> => {
    const res = await fetch(`/api/groups/${groupId}/expenses`, { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Add an expense to a group
   * POST /api/groups/[id]/expenses
   */
  addExpense: async (groupId: string, data: CreateExpenseDto): Promise<Expense> => {
    const res = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Update an expense
   * PUT /api/groups/[id]/expenses/[expenseId]
   */
  updateExpense: async (
    groupId: string,
    expenseId: string,
    data: UpdateExpenseDto
  ): Promise<Expense> => {
    const res = await fetch(`/api/groups/${groupId}/expenses/${expenseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Delete an expense
   * DELETE /api/groups/[id]/expenses/[expenseId]
   */
  deleteExpense: async (groupId: string, expenseId: string): Promise<void> => {
    const res = await fetch(`/api/groups/${groupId}/expenses/${expenseId}`, { 
      method: "DELETE" 
    })
    if (!res.ok) await handleErrorResponse(res)
  },
  
  // ============================================================================
  // Balance
  // ============================================================================
  
  /**
   * Get balance summary for a group
   * GET /api/groups/[id]/balance
   */
  getGroupBalance: async (groupId: string): Promise<BalanceSummary> => {
    const res = await fetch(`/api/groups/${groupId}/balance`, { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  // ============================================================================
  // Statistics
  // ============================================================================
  
  /**
   * Get expenses grouped by person
   * GET /api/groups/[id]/statistics?type=person
   */
  getExpensesByPerson: async (groupId: string): Promise<ExpensesByPerson[]> => {
    const res = await fetch(`/api/groups/${groupId}/statistics?type=person`, { 
      cache: "no-store" 
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Get expenses grouped by category
   * GET /api/groups/[id]/statistics?type=category
   */
  getExpensesByCategory: async (groupId: string): Promise<ExpensesByCategory[]> => {
    const res = await fetch(`/api/groups/${groupId}/statistics?type=category`, { 
      cache: "no-store" 
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Get expenses grouped by month
   * GET /api/groups/[id]/statistics?type=month
   */
  getExpensesByMonth: async (groupId: string): Promise<ExpensesByMonth[]> => {
    const res = await fetch(`/api/groups/${groupId}/statistics?type=month`, { 
      cache: "no-store" 
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Get total expenses for a group
   * GET /api/groups/[id]/statistics?type=total
   */
  getTotalExpenses: async (groupId: string): Promise<TotalGroupExpenses> => {
    const res = await fetch(`/api/groups/${groupId}/statistics?type=total`, { 
      cache: "no-store" 
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  /**
   * Get complete statistics summary for a group
   * GET /api/groups/[id]/statistics?type=summary
   */
  getGroupSummary: async (groupId: string): Promise<GroupSummary> => {
    const res = await fetch(`/api/groups/${groupId}/statistics?type=summary`, { 
      cache: "no-store" 
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
}

