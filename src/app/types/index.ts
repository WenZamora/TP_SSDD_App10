/**
 * Type Definitions for Administrador de Gastos Compartidos
 * All TypeScript interfaces and types for the application
 */

// ============================================================================
// Core Data Models
// ============================================================================

/**
 * Group - Represents a group of people sharing expenses
 */
export interface Group {
  id: string
  name: string
  description?: string
  baseCurrency: string
  members: string[] // Array of contact IDs
  expenses: Expense[]
  createdAt: number
  updatedAt: number
}

/**
 * Expense - Represents a shared expense within a group
 */
export interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  convertedAmount: number // Amount in group's base currency
  payer: string // Contact ID
  participants: string[] // Array of contact IDs
  category: string
  date: number
  createdAt: number
}

/**
 * User - Represents a user in the system with their contacts
 */
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  contacts: string[] // Array of user IDs
  createdAt: number
}

/**
 * Contact - Represents a person who can be part of groups (alias for User for backwards compatibility)
 */
export interface Contact {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: number
}

/**
 * Database - Complete database structure
 */
export interface Database {
  groups: Group[]
  users: User[]
}

// ============================================================================
// Computed Data Models (not stored, calculated on-demand)
// ============================================================================

/**
 * Balance - Represents a member's balance in a group
 */
export interface Balance {
  memberId: string
  memberName: string
  totalPaid: number // What they paid
  totalShare: number // What they should pay
  balance: number // totalPaid - totalShare
}

/**
 * Settlement - Represents a suggested payment to settle debts
 */
export interface Settlement {
  from: string // Contact ID who owes
  fromName: string
  to: string // Contact ID who is owed
  toName: string
  amount: number // Amount to transfer
}

/**
 * Balance Summary - Complete balance information for a group
 */
export interface BalanceSummary {
  balances: Balance[]
  settlements: Settlement[]
}

// ============================================================================
// Statistics Models
// ============================================================================

/**
 * Expenses by Person - Aggregated expenses by payer
 */
export interface ExpensesByPerson {
  personId: string
  personName: string
  totalAmount: number
  count: number
}

/**
 * Expenses by Category - Aggregated expenses by category
 */
export interface ExpensesByCategory {
  category: string
  totalAmount: number
  count: number
  percentage: number
}

/**
 * Expenses by Month - Aggregated expenses by month
 */
export interface ExpensesByMonth {
  month: string // Format: YYYY-MM
  year: number
  monthNumber: number
  monthName: string
  totalAmount: number
  count: number
}

/**
 * Total Group Expenses - Summary statistics for a group
 */
export interface TotalGroupExpenses {
  total: number
  count: number
  average: number
  currency: string
}

/**
 * Group Summary - Complete statistics for a group
 */
export interface GroupSummary {
  total: TotalGroupExpenses
  byPerson: ExpensesByPerson[]
  byCategory: ExpensesByCategory[]
  byMonth: ExpensesByMonth[]
  memberCount: number
  expenseCount: number
}

// ============================================================================
// Exchange Rate Models
// ============================================================================

/**
 * Exchange Rate - Currency exchange rate information
 */
export interface ExchangeRate {
  rate: number
  from: string
  to: string
  timestamp: number
  fallback?: boolean
  error?: boolean
}

// ============================================================================
// DTOs (Data Transfer Objects) - For API requests
// ============================================================================

/**
 * Create Group DTO - Data needed to create a new group
 */
export interface CreateGroupDto {
  name: string
  description?: string
  baseCurrency: string
  members: string[] // Contact IDs
}

/**
 * Update Group DTO - Data that can be updated in a group
 */
export interface UpdateGroupDto {
  name?: string
  description?: string
  baseCurrency?: string
  members?: string[]
}

/**
 * Create Expense DTO - Data needed to create a new expense
 */
export interface CreateExpenseDto {
  description: string
  amount: number
  currency: string
  payer: string // Contact ID
  participants: string[] // Contact IDs
  category?: string
  date?: number
}

/**
 * Update Expense DTO - Data that can be updated in an expense
 */
export interface UpdateExpenseDto {
  description?: string
  amount?: number
  currency?: string
  payer?: string
  participants?: string[]
  category?: string
  date?: number
}

/**
 * Create Contact DTO - Data needed to create a new contact
 */
export interface CreateContactDto {
  name: string
  email: string
  avatar?: string
}

/**
 * Update Contact DTO - Data that can be updated in a contact
 */
export interface UpdateContactDto {
  name?: string
  email?: string
  avatar?: string
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * API Error Response
 */
export interface ApiError {
  error: string
  code?: string
}

/**
 * API Success Response
 */
export interface ApiSuccess {
  success: boolean
  message?: string
}

// ============================================================================
// Common Currency Codes
// ============================================================================

export type CurrencyCode = 'USD' | 'ARS' | 'EUR' | 'BRL' | 'GBP' | 'JPY' | 'MXN' | 'CLP' | 'COP' | 'UYU'

/**
 * Currency Option - For currency select dropdowns
 */
export interface CurrencyOption {
  code: CurrencyCode | string
  name: string
  symbol: string
}

// ============================================================================
// Expense Categories
// ============================================================================

export type ExpenseCategory = 
  | 'Food'
  | 'Transport'
  | 'Accommodation'
  | 'Entertainment'
  | 'Shopping'
  | 'Health'
  | 'Education'
  | 'Utilities'
  | 'Other'
  | 'General'

/**
 * Category Option - For category select dropdowns
 */
export interface CategoryOption {
  value: ExpenseCategory
  label: string
  icon?: string
}

