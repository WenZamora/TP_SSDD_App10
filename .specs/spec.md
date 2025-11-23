# App 10: Administrador de Gastos Compartidos - Technical Specification

## 1. Overview

This application allows users to manage shared expenses between groups of people. It implements a layered architecture with clear separation of concerns following Next.js App Router best practices.

**🚨 CRITICAL: ALL APPLICATION CODE MUST LIVE INSIDE `src/app/` DIRECTORY**

Following the reference architecture, **all code** (components, hooks, services, API routes, lib, types, providers) must be inside the `src/app/` directory structure. Only `data/` (JSON database) and `public/` (static assets) remain at project root.

## 2. Architecture Layers

```
┌─────────────────────────────────────────┐
│         UI Layer (Components)           │  ← User Interaction
├─────────────────────────────────────────┤
│      Hooks Layer (TanStack Query)       │  ← State & Server Sync
├─────────────────────────────────────────┤
│     Services Layer (HTTP Clients)       │  ← HTTP API Calls
├─────────────────────────────────────────┤
│       API Layer (Route Handlers)        │  ← Request Validation
├─────────────────────────────────────────┤
│      DB Layer (JSON Persistence)        │  ← Data Persistence
└─────────────────────────────────────────┘
```

### 2.0 Project Structure

**IMPORTANT**: Following the reference architecture, **ALL code must live inside `src/app/`** directory.

```
project-root/
├── src/
│   └── app/
│       ├── api/               # API Route Handlers
│       │   ├── groups/
│       │   ├── contacts/
│       │   └── exchange/
│       ├── groups/            # Group pages
│       │   └── [id]/
│       ├── components/        # React components (UI Layer)
│       │   ├── groups/
│       │   ├── expenses/
│       │   ├── balance/
│       │   ├── contacts/
│       │   ├── statistics/
│       │   └── ui/
│       ├── hooks/             # TanStack Query hooks (NEW - to be created)
│       ├── services/          # HTTP client services (NEW - to be created)
│       ├── providers/         # React providers (NEW - to be created)
│       ├── types/             # TypeScript type definitions (NEW - to be created)
│       ├── lib/               # Database and utility functions
│       ├── layout.tsx         # Root layout
│       ├── page.tsx           # Home page
│       └── globals.css
├── data/                      # JSON database files (outside src/)
├── public/                    # Static assets (outside src/)
├── package.json
└── tsconfig.json
```

**Note**: This matches the reference code architecture where all application code (components, hooks, services, API routes, etc.) lives inside `src/app/`, except for `data/` and `public/` which stay at root.

### 2.1 Layer Responsibilities

- **UI Layer**: React components for user interaction, display logic only
- **Hooks Layer**: Custom hooks using TanStack Query for state management and server synchronization
- **Services Layer**: Encapsulate all HTTP calls to API routes (fetch/axios)
- **API Layer**: Next.js API routes that validate requests and orchestrate business logic
- **DB Layer**: Functions to read/write JSON files atomically

## 3. Data Models

### 3.1 Database Schema (`src/app/data/db.json`)

```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string?",
      "baseCurrency": "string (USD|ARS|EUR|etc)",
      "members": ["contactId1", "contactId2"],
      "expenses": [
        {
          "id": "uuid",
          "description": "string",
          "amount": "number",
          "currency": "string",
          "convertedAmount": "number",
          "payer": "contactId",
          "participants": ["contactId1", "contactId2"],
          "category": "string",
          "date": "timestamp",
          "createdAt": "timestamp"
        }
      ],
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "contacts": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "phone": "string?",
      "avatar": "string?",
      "createdAt": "timestamp"
    }
  ],
  "currentUser": {
    "id": "uuid",
    "contactId": "uuid"
  }
}
```

### 3.2 Computed Data Models (not stored, calculated on-demand)

#### Balance Model
```typescript
interface Balance {
  memberId: string;
  memberName: string;
  totalPaid: number;        // What they paid
  totalShare: number;       // What they should pay
  balance: number;          // totalPaid - totalShare
}

interface Settlement {
  from: string;             // Contact ID who owes
  fromName: string;
  to: string;               // Contact ID who is owed
  toName: string;
  amount: number;           // Amount to transfer
}
```

#### Expense Statistics
```typescript
interface ExpensesByPerson {
  personId: string;
  personName: string;
  totalAmount: number;
}

interface ExpensesByCategory {
  category: string;
  totalAmount: number;
  count: number;
}
```

## 4. DB Layer (`src/app/lib/`)

**Location**: `src/app/lib/` directory (currently at root `lib/` - needs migration)

### 4.1 `src/app/lib/db.js` ✅ (Already implemented - needs migration and minor updates)

**Current Status**: Implemented with atomic writes
**Updates Needed**: 
- Add `contacts` array validation in `validateDBShape()`
- Add `currentUser` object support

```javascript
// Functions:
- ensureDBExists()          // Ensure db.json exists with valid structure
- readDB()                  // Read entire database
- writeDB(dbObj)            // Atomic write to database
- validateDBShape(db)       // Validate database structure
```

### 4.2 `src/app/lib/groups.js` ✅ (Already implemented - needs migration and updates)

**Current Status**: Basic CRUD implemented
**Updates Needed**:
- Add `updatedAt` timestamp on updates
- Add validation for members (check if contacts exist)
- Add `getGroupExpenses(groupId)` function
- Add `updateExpense(groupId, expenseId, data)` function
- Add `deleteExpense(groupId, expenseId)` function

```javascript
// Functions:
- getAllGroups()
- getGroupById(id)
- addGroup(data)
- updateGroup(id, data)
- deleteGroup(id)
- addExpenseToGroup(groupId, expenseData)
- updateExpense(groupId, expenseId, data)      // NEW
- deleteExpense(groupId, expenseId)             // NEW
- getGroupExpenses(groupId)                     // NEW
```

### 4.3 `src/app/lib/contacts.js` ✅ (Already implemented - needs migration and updates)

**Current Status**: Basic operations implemented
**Updates Needed**:
- Add `getContactById(id)` function
- Add `updateContact(id, data)` function
- Add validation before delete (check if used in groups)

```javascript
// Functions:
- getAllContacts()
- getContactById(id)                            // NEW
- addContact(name, email, phone)
- updateContact(id, data)                       // NEW
- deleteContact(contactId)                      // UPDATE: Add validation
```

### 4.4 `src/app/lib/exchange.js` ❌ (NOT implemented - HIGH PRIORITY)

**Current Status**: Empty file
**Purpose**: Handle currency conversion using exchangerate.host API

```javascript
// Functions to implement:
- getExchangeRate(from, to)
  // GET https://api.exchangerate.host/latest?base={from}&symbols={to}
  // Returns: { rate: number, timestamp: number }
  // Cache result for 1 hour to avoid excessive API calls

- convertAmount(amount, fromCurrency, toCurrency)
  // Uses getExchangeRate internally
  // Returns: number (converted amount)

- convertExpenseToCurrency(expense, targetCurrency)
  // Converts an expense object to target currency
  // Returns: { ...expense, convertedAmount, targetCurrency }
```

**API Documentation**: https://exchangerate.host/#/
- Free tier: No auth required
- Endpoint: `https://api.exchangerate.host/latest?base=USD&symbols=ARS`
- Response: `{ success: true, rates: { ARS: 950.5 } }`

### 4.5 `src/app/lib/balance.js` ❌ (NOT implemented - HIGH PRIORITY)

**Current Status**: Empty file (currently at root `lib/` - needs migration)
**Purpose**: Calculate balances and settlements

```javascript
// Functions to implement:

- calculateBalances(group)
  // Input: group object with expenses
  // Returns: Balance[] (array of balance objects per member)
  // Algorithm:
  //   1. For each member, sum totalPaid (where they are payer)
  //   2. For each expense, divide amount equally among participants
  //   3. Sum each member's share to get totalShare
  //   4. balance = totalPaid - totalShare

- calculateSettlements(balances)
  // Input: Balance[] (from calculateBalances)
  // Returns: Settlement[] (who should pay whom)
  // Algorithm (simplified greedy approach):
  //   1. Separate creditors (balance > 0) and debtors (balance < 0)
  //   2. Sort both by absolute value descending
  //   3. For each debtor, pay to creditors until debt is settled
  //   4. Generate Settlement objects

- getGroupBalanceSummary(groupId)
  // Combines: fetch group → calculate balances → calculate settlements
  // Returns: { balances: Balance[], settlements: Settlement[] }
```

### 4.6 `src/app/lib/statistics.js` ❌ (NEW - To be created)

**Purpose**: Calculate statistics for charts

```javascript
// Functions to implement:

- getExpensesByPerson(group)
  // Returns: ExpensesByPerson[]
  // Sum all converted expenses paid by each person

- getExpensesByCategory(group)
  // Returns: ExpensesByCategory[]
  // Group expenses by category and sum amounts

- getExpensesByMonth(group)
  // Returns: { month: string, total: number }[]
  // Group expenses by month for timeline charts

- getTotalGroupExpenses(group)
  // Returns: number (sum of all converted expenses)
```

## 5. API Layer (`app/api/`)

All API routes should follow RESTful conventions and return proper HTTP status codes.

### 5.1 `app/api/groups/route.ts` ✅ (Partially implemented)

**Current Status**: GET and POST implemented
**Updates Needed**: Add validation, error handling

```typescript
// GET /api/groups
// Returns: Group[]
// Status: 200

// POST /api/groups
// Body: { name: string, baseCurrency: string, members: string[], description?: string }
// Returns: Group
// Status: 201
// Validation: name required, baseCurrency required, members must exist in contacts
```

### 5.2 `app/api/groups/[id]/route.ts` ❌ (To be created)

```typescript
// GET /api/groups/[id]
// Returns: Group
// Status: 200 | 404

// PUT /api/groups/[id]
// Body: Partial<Group>
// Returns: Group
// Status: 200 | 404
// Note: Update updatedAt timestamp

// DELETE /api/groups/[id]
// Returns: { success: boolean }
// Status: 200 | 404
```

### 5.3 `app/api/groups/[id]/expenses/route.ts` ✅ (Exists but needs implementation)

```typescript
// GET /api/groups/[id]/expenses
// Returns: Expense[]
// Status: 200 | 404

// POST /api/groups/[id]/expenses
// Body: { description, amount, currency, payer, participants, category? }
// Returns: Expense
// Status: 201 | 404
// Logic:
//   1. Validate group exists
//   2. Validate payer and participants exist in group.members
//   3. Convert amount to group's base currency using exchange.js
//   4. Add expense to group
//   5. Return created expense
```

### 5.4 `app/api/groups/[id]/expenses/[expenseId]/route.ts` ❌ (NEW)

```typescript
// PUT /api/groups/[id]/expenses/[expenseId]
// Body: Partial<Expense>
// Returns: Expense
// Status: 200 | 404
// Note: Recalculate conversion if currency or amount changed

// DELETE /api/groups/[id]/expenses/[expenseId]
// Returns: { success: boolean }
// Status: 200 | 404
```

### 5.5 `app/api/groups/[id]/balance/route.ts` ❌ (NEW - HIGH PRIORITY)

```typescript
// GET /api/groups/[id]/balance
// Returns: { balances: Balance[], settlements: Settlement[] }
// Status: 200 | 404
// Logic: Use balance.js functions
```

### 5.6 `app/api/groups/[id]/statistics/route.ts` ❌ (NEW)

```typescript
// GET /api/groups/[id]/statistics
// Query params: type=person|category|month|total
// Returns: Depends on type parameter
// Status: 200 | 404
// Logic: Use statistics.js functions
```

### 5.7 `app/api/contacts/route.ts` ✅ (Implemented - needs updates)

**Current Status**: GET and POST implemented
**Updates Needed**: Better validation

```typescript
// GET /api/contacts
// Returns: Contact[]
// Status: 200

// POST /api/contacts
// Body: { name: string, email: string, phone?: string }
// Returns: Contact
// Status: 201 | 400
// Validation: email format, unique email
```

### 5.8 `app/api/contacts/[id]/route.ts` ❌ (NEW)

```typescript
// GET /api/contacts/[id]
// Returns: Contact
// Status: 200 | 404

// PUT /api/contacts/[id]
// Body: Partial<Contact>
// Returns: Contact
// Status: 200 | 404 | 400

// DELETE /api/contacts/[id]
// Returns: { success: boolean }
// Status: 200 | 404 | 409 (if used in groups)
// Logic: Check if contact is member of any group before deleting
```

### 5.9 `app/api/exchange/route.ts` ❌ (NEW)

```typescript
// GET /api/exchange?from=USD&to=ARS
// Returns: { rate: number, from: string, to: string, timestamp: number }
// Status: 200 | 400
// Logic: Use exchange.js functions
```

## 6. Services Layer (`src/app/services/`)

**Current Status**: Does NOT exist - MUST be created

This layer encapsulates all HTTP calls to the API. Components and hooks should NEVER use fetch directly.

**Location**: Create `src/app/services/` directory

### 6.1 `src/app/services/groups.service.ts` ❌ (To be created)

```typescript
import type { Group, Expense, CreateGroupDto, UpdateGroupDto, CreateExpenseDto, UpdateExpenseDto } from '@/app/types'

async function handleErrorResponse(response: Response): Promise<never> {
  let message = "Error al procesar la solicitud"
  
  try {
    const error = await response.json()
    if (typeof error?.error === "string" && error.error.trim() !== "") {
      message = error.error
    }
  } catch (_) {
    // Ignore parsing errors
  }
  
  throw new Error(message)
}

export const groupsService = {
  // Groups CRUD
  getAllGroups: async (): Promise<Group[]> => {
    const res = await fetch("/api/groups", { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  getGroupById: async (id: string): Promise<Group> => {
    const res = await fetch(`/api/groups/${id}`, { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  createGroup: async (data: CreateGroupDto): Promise<Group> => {
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  updateGroup: async (id: string, data: UpdateGroupDto): Promise<Group> => {
    const res = await fetch(`/api/groups/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  deleteGroup: async (id: string): Promise<void> => {
    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" })
    if (!res.ok) await handleErrorResponse(res)
  },
  
  // Expenses
  getGroupExpenses: async (groupId: string): Promise<Expense[]> => {
    const res = await fetch(`/api/groups/${groupId}/expenses`, { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  addExpense: async (groupId: string, data: CreateExpenseDto): Promise<Expense> => {
    const res = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  updateExpense: async (groupId: string, expenseId: string, data: UpdateExpenseDto): Promise<Expense> => {
    const res = await fetch(`/api/groups/${groupId}/expenses/${expenseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  deleteExpense: async (groupId: string, expenseId: string): Promise<void> => {
    const res = await fetch(`/api/groups/${groupId}/expenses/${expenseId}`, { 
      method: "DELETE" 
    })
    if (!res.ok) await handleErrorResponse(res)
  },
  
  // Balance
  getGroupBalance: async (groupId: string): Promise<{ balances: Balance[], settlements: Settlement[] }> => {
    const res = await fetch(`/api/groups/${groupId}/balance`, { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  // Statistics
  getGroupStatistics: async (groupId: string, type: string): Promise<any> => {
    const res = await fetch(`/api/groups/${groupId}/statistics?type=${type}`, { 
      cache: "no-store" 
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
}
```

### 6.2 `src/app/services/contacts.service.ts` ❌ (To be created)

```typescript
import type { Contact, CreateContactDto, UpdateContactDto } from '@/app/types'

async function handleErrorResponse(response: Response): Promise<never> {
  let message = "Error al procesar la solicitud"
  
  try {
    const error = await response.json()
    if (typeof error?.error === "string" && error.error.trim() !== "") {
      message = error.error
    }
  } catch (_) {
    // Ignore parsing errors
  }
  
  throw new Error(message)
}

export const contactsService = {
  getAllContacts: async (): Promise<Contact[]> => {
    const res = await fetch("/api/contacts", { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  getContactById: async (id: string): Promise<Contact> => {
    const res = await fetch(`/api/contacts/${id}`, { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  createContact: async (data: CreateContactDto): Promise<Contact> => {
    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  updateContact: async (id: string, data: UpdateContactDto): Promise<Contact> => {
    const res = await fetch(`/api/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  
  deleteContact: async (id: string): Promise<void> => {
    const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" })
    if (!res.ok) await handleErrorResponse(res)
  },
}
```

### 6.3 `src/app/services/exchange.service.ts` ❌ (To be created)

```typescript
interface ExchangeRate {
  rate: number
  from: string
  to: string
  timestamp: number
}

async function handleErrorResponse(response: Response): Promise<never> {
  let message = "Error al procesar la solicitud"
  
  try {
    const error = await response.json()
    if (typeof error?.error === "string" && error.error.trim() !== "") {
      message = error.error
    }
  } catch (_) {
    // Ignore parsing errors
  }
  
  throw new Error(message)
}

export const exchangeService = {
  getExchangeRate: async (from: string, to: string): Promise<ExchangeRate> => {
    const res = await fetch(`/api/exchange?from=${from}&to=${to}`, { 
      cache: "no-store" 
    })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
}
```

## 7. Hooks Layer (`src/app/hooks/`)

**Current Status**: Does NOT exist in `src/app/` - MUST be created (current hooks are at root level and need migration)

**Location**: Create `src/app/hooks/` directory

### 7.1 Setup Required

Install TanStack Query:
```bash
npm install @tanstack/react-query
```

Create Query Provider in `src/app/providers/query-provider.tsx`:
```typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

**Location**: Create `src/app/providers/` directory

Update `src/app/layout.tsx` to include QueryProvider:
```tsx
import QueryProvider from "@/app/providers/query-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          {/* existing layout content */}
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
```

### 7.2 `src/app/hooks/useGroups.ts` ❌ (To be created - HIGH PRIORITY)

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsService } from '@/app/services/groups.service'
import type { Group, CreateGroupDto, UpdateGroupDto } from '@/app/types'

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: groupsService.getAllGroups,
  })
}

export function useGroup(id: string) {
  return useQuery({
    queryKey: ['groups', id],
    queryFn: () => groupsService.getGroupById(id),
    enabled: !!id,
  })
}

export function useCreateGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: groupsService.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useUpdateGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupDto }) =>
      groupsService.updateGroup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['groups', variables.id] })
    },
  })
}

export function useDeleteGroup() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: groupsService.deleteGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
```

### 7.3 `src/app/hooks/useExpenses.ts` ❌ (To be created - HIGH PRIORITY)

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsService } from '@/app/services/groups.service'
import type { Expense, CreateExpenseDto, UpdateExpenseDto } from '@/app/types'

export function useGroupExpenses(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId, 'expenses'],
    queryFn: () => groupsService.getGroupExpenses(groupId),
    enabled: !!groupId,
  })
}

export function useAddExpense(groupId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateExpenseDto) => 
      groupsService.addExpense(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'expenses'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'statistics'] })
    },
  })
}

export function useUpdateExpense(groupId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ expenseId, data }: { expenseId: string; data: UpdateExpenseDto }) =>
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

export function useDeleteExpense(groupId: string) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (expenseId: string) =>
      groupsService.deleteExpense(groupId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups', groupId] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'expenses'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'balance'] })
      queryClient.invalidateQueries({ queryKey: ['groups', groupId, 'statistics'] })
    },
  })
}
```

### 7.4 `src/app/hooks/useBalance.ts` ❌ (To be created - HIGH PRIORITY)

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { groupsService } from '@/app/services/groups.service'
import type { Balance, Settlement } from '@/app/types'

export function useGroupBalance(groupId: string) {
  return useQuery({
    queryKey: ['groups', groupId, 'balance'],
    queryFn: () => groupsService.getGroupBalance(groupId),
    enabled: !!groupId,
  })
}
```

### 7.5 `src/app/hooks/useStatistics.ts` ❌ (To be created)

```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { groupsService } from '@/app/services/groups.service'

export function useGroupStatistics(groupId: string, type: 'person' | 'category' | 'month') {
  return useQuery({
    queryKey: ['groups', groupId, 'statistics', type],
    queryFn: () => groupsService.getGroupStatistics(groupId, type),
    enabled: !!groupId,
  })
}
```

### 7.6 `src/app/hooks/useContacts.ts` ❌ (To be created)

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsService } from '@/app/services/contacts.service'
import type { Contact, CreateContactDto, UpdateContactDto } from '@/app/types'

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: contactsService.getAllContacts,
  })
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsService.getContactById(id),
    enabled: !!id,
  })
}

export function useCreateContact() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: contactsService.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}

export function useUpdateContact() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactDto }) =>
      contactsService.updateContact(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.id] })
    },
  })
}

export function useDeleteContact() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: contactsService.deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })
}
```

## 8. UI Layer (Components)

### 8.1 Component Organization

**Location**: `src/app/components/` directory

Components should be organized by feature and responsibility:

```
src/app/components/
├─ groups/
│  ├─ GroupList.tsx              # Display list of groups
│  ├─ GroupCard.tsx              # Individual group card
│  ├─ CreateGroupModal.tsx       # Form to create group
│  ├─ GroupDetail.tsx            # Group detail page
│  └─ EditGroupModal.tsx         # Form to edit group
├─ expenses/
│  ├─ ExpenseList.tsx            # Display list of expenses
│  ├─ ExpenseCard.tsx            # Individual expense card
│  ├─ AddExpenseModal.tsx        # Form to add expense
│  ├─ EditExpenseModal.tsx       # Form to edit expense
│  └─ ExpenseSplitDisplay.tsx   # Show how expense is split
├─ balance/
│  ├─ BalanceDisplay.tsx         # Show member balances
│  ├─ SettlementList.tsx         # Show settlement suggestions
│  └─ BalanceCard.tsx            # Individual balance card
├─ statistics/
│  ├─ ExpensesByPersonChart.tsx  # Chart: expenses by person
│  ├─ ExpensesByCategoryChart.tsx # Chart: expenses by category
│  └─ ExpensesTimelineChart.tsx  # Chart: expenses over time
├─ contacts/
│  ├─ ContactList.tsx            # Display list of contacts
│  ├─ ContactCard.tsx            # Individual contact card
│  ├─ CreateContactModal.tsx     # Form to create contact
│  └─ EditContactModal.tsx       # Form to edit contact
└─ ui/
   └─ [existing shadcn components]
```

**Component Type**: All components should be **Client Components** (use `'use client'` directive) since they use hooks and interactivity.

### 8.2 Component Implementation Guidelines

**DO:**
- Use hooks from `hooks/` layer ONLY (never call services directly)
- Handle loading and error states from TanStack Query
- Use TypeScript for type safety
- Use shadcn/ui components for consistency
- Keep components focused on presentation
- Use **React Hook Form + Zod** for forms (already installed in package.json)

**DON'T:**
- Don't call fetch directly in components
- Don't call service functions directly
- Don't put business logic in components
- Don't duplicate API calls (use TanStack Query cache)

### 8.3 Example Component Pattern

#### Example 1: List Component with TanStack Query

```typescript
// src/app/components/groups/GroupList.tsx
'use client'

import { useGroups } from '@/app/hooks/useGroups'
import { GroupCard } from './GroupCard'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Alert } from '@/app/components/ui/alert'

export function GroupList() {
  const { data: groups, isLoading, error } = useGroups()

  if (isLoading) {
    return <Skeleton className="h-32" />
  }

  if (error) {
    return <Alert variant="destructive">Error loading groups</Alert>
  }

  return (
    <div className="grid gap-4">
      {groups?.map(group => (
        <GroupCard key={group.id} group={group} />
      ))}
    </div>
  )
}
```

#### Example 2: Form Component with React Hook Form + Zod

```typescript
// src/app/components/groups/CreateGroupModal.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCreateGroup } from '@/app/hooks/useGroups'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/app/components/ui/form'

const groupSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  baseCurrency: z.string().min(3, 'Seleccione una moneda'),
  members: z.array(z.string()).min(1, 'Debe agregar al menos un miembro'),
})

type GroupFormValues = z.infer<typeof groupSchema>

export function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const createGroup = useCreateGroup()
  
  const form = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      description: '',
      baseCurrency: 'ARS',
      members: [],
    },
  })

  const onSubmit = async (data: GroupFormValues) => {
    try {
      await createGroup.mutateAsync(data)
      onClose()
    } catch (error) {
      console.error('Error creating group:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del grupo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Additional form fields... */}
        <Button type="submit" disabled={createGroup.isPending}>
          {createGroup.isPending ? 'Creando...' : 'Crear Grupo'}
        </Button>
      </form>
    </Form>
  )
}
```

## 9. Key Features Implementation

### 9.1 Create Group

**Flow:**
1. User clicks "New Group" → Opens `CreateGroupModal`
2. User fills form: name, description, base currency, members (select from contacts)
3. Form validates with Zod schema
4. User submits → Calls `useCreateGroup()` mutation
5. Mutation calls `groupsService.createGroup()`
6. Service makes POST to `/api/groups`
7. API validates, calls `addGroup()` from `lib/groups.js`
8. DB layer writes to `db.json`
9. TanStack Query invalidates cache, refetches groups
10. UI updates automatically with new group

### 9.2 Add Expense

**Flow:**
1. User in group detail → Clicks "Add Expense"
2. Opens `AddExpenseModal` with form:
   - Description (text)
   - Amount (number)
   - Currency (select: USD, ARS, EUR, etc.)
   - Category (select: Food, Transport, Accommodation, etc.)
   - Payer (select from group members)
   - Participants (multi-select from group members)
3. User submits → Calls `useAddExpense(groupId)` mutation
4. Service makes POST to `/api/groups/[id]/expenses`
5. API route:
   - Validates data
   - Calls `exchange.convertAmount()` to convert to group's base currency
   - Calls `addExpenseToGroup()` with converted amount
6. TanStack Query invalidates expenses, balance, and statistics
7. UI updates: expense list, balance, charts all refresh

### 9.3 Calculate and Display Balance

**Flow:**
1. User navigates to group detail
2. Component calls `useGroupBalance(groupId)`
3. Hook fetches from `/api/groups/[id]/balance`
4. API route:
   - Fetches group with all expenses
   - Calls `balance.calculateBalances(group)`
   - Calls `balance.calculateSettlements(balances)`
   - Returns both arrays
5. Component receives data:
   - `BalanceDisplay` shows each member's balance (positive/negative)
   - `SettlementList` shows "X should pay Y amount to Z"
6. Data updates automatically when expenses change (TanStack Query cache invalidation)

### 9.4 Display Statistics Charts

**Flow:**
1. User navigates to group statistics section
2. Components call:
   - `useGroupStatistics(groupId, 'person')` for person chart
   - `useGroupStatistics(groupId, 'category')` for category chart
3. Each hook fetches from `/api/groups/[id]/statistics?type=X`
4. API calculates using `statistics.js` functions
5. Components render charts using Recharts:
   - `<BarChart>` for expenses by person
   - `<PieChart>` for expenses by category
   - `<LineChart>` for expenses timeline

## 10. Implementation Checklist

### Phase 0: Project Restructuring (CRITICAL - DO THIS FIRST)
- [ ] Create `src/app/` directory structure
- [ ] Move existing `lib/` to `src/app/lib/`
- [ ] Move existing `components/` to `src/app/components/`
- [ ] Move existing `app/` routes to `src/app/` (merge with new structure)
- [ ] Update all imports to use `@/app/` prefix
- [ ] Verify tsconfig.json has correct path mapping: `"@/*": ["./src/*"]`
- [ ] Keep `data/` and `public/` at project root (outside `src/`)

### Phase 1: Foundation (HIGH PRIORITY)
- [ ] Install TanStack Query: `npm install @tanstack/react-query`
- [ ] Create `src/app/providers/query-provider.tsx`
- [ ] Update `src/app/layout.tsx` to include QueryProvider
- [ ] Create `src/app/services/` directory structure
- [ ] Create `src/app/hooks/` directory structure
- [ ] Create `src/app/types/` directory structure
- [ ] Implement `src/app/services/groups.service.ts`
- [ ] Implement `src/app/services/contacts.service.ts`
- [ ] Implement `src/app/lib/exchange.js` (currency conversion)
- [ ] Implement `src/app/lib/balance.js` (balance calculations)
- [ ] Create `src/app/lib/statistics.js` (statistics calculations)

### Phase 2: API Layer Updates
- [ ] Update `src/app/lib/db.js` validation
- [ ] Update `src/app/lib/groups.js` with missing functions
- [ ] Update `src/app/lib/contacts.js` with missing functions
- [ ] Update `src/app/api/groups/route.ts` with validation
- [ ] Create `src/app/api/groups/[id]/route.ts`
- [ ] Update `src/app/api/groups/[id]/expenses/route.ts` with conversion logic
- [ ] Create `src/app/api/groups/[id]/expenses/[expenseId]/route.ts`
- [ ] Create `src/app/api/groups/[id]/balance/route.ts`
- [ ] Create `src/app/api/groups/[id]/statistics/route.ts`
- [ ] Update `src/app/api/contacts/route.ts` with validation
- [ ] Create `src/app/api/contacts/[id]/route.ts`
- [ ] Create `src/app/api/exchange/route.ts`

### Phase 3: Hooks Layer
- [ ] Create `src/app/hooks/useGroups.ts`
- [ ] Create `src/app/hooks/useExpenses.ts`
- [ ] Create `src/app/hooks/useBalance.ts`
- [ ] Create `src/app/hooks/useStatistics.ts`
- [ ] Create `src/app/hooks/useContacts.ts`

### Phase 4: UI Components
- [ ] Refactor existing components to use hooks
- [ ] Create missing components (refer to 8.1)
- [ ] Implement forms with React Hook Form + Zod
- [ ] Add loading and error states
- [ ] Implement charts with Recharts

### Phase 5: Testing & Polish
- [ ] Test all CRUD operations
- [ ] Test currency conversion
- [ ] Test balance calculations
- [ ] Verify chart data accuracy
- [ ] Handle edge cases (empty states, errors)
- [ ] Add proper error messages
- [ ] Optimize performance

## 11. Error Handling Strategy

### API Level
- Always return proper HTTP status codes
- Return structured error responses:
```json
{ "error": "Message", "code": "ERROR_CODE" }
```

### Services Level
- Catch fetch errors
- Transform to app-specific errors
- Throw or return Result type

### Hooks Level
- TanStack Query handles errors automatically
- Components can access `error` property
- Provide retry mechanisms

### UI Level
- Display user-friendly error messages
- Use toast notifications for mutations
- Provide retry buttons for queries

## 12. Performance Considerations

- **Caching**: TanStack Query caches for 1 minute (configurable)
- **Exchange Rate**: Cache conversion rates for 1 hour to reduce API calls
- **Debouncing**: Debounce search/filter inputs
- **Optimistic Updates**: For better UX on mutations
- **Pagination**: If groups/contacts lists grow large

## 13. TypeScript Types

**Location**: Create `src/app/types/` directory

Create `src/app/types/index.ts` with all type definitions:

```typescript
// src/app/types/index.ts
export interface Group {
  id: string
  name: string
  description?: string
  baseCurrency: string
  members: string[]
  expenses: Expense[]
  createdAt: number
  updatedAt: number
}

export interface Expense {
  id: string
  description: string
  amount: number
  currency: string
  convertedAmount: number
  payer: string
  participants: string[]
  category: string
  date: number
  createdAt: number
}

export interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  createdAt: number
}

export interface Balance {
  memberId: string
  memberName: string
  totalPaid: number
  totalShare: number
  balance: number
}

export interface Settlement {
  from: string
  fromName: string
  to: string
  toName: string
  amount: number
}

// DTOs
export interface CreateGroupDto {
  name: string
  description?: string
  baseCurrency: string
  members: string[]
}

export interface UpdateGroupDto {
  name?: string
  description?: string
  baseCurrency?: string
  members?: string[]
}

export interface CreateExpenseDto {
  description: string
  amount: number
  currency: string
  payer: string
  participants: string[]
  category?: string
}

export interface UpdateExpenseDto {
  description?: string
  amount?: number
  currency?: string
  payer?: string
  participants?: string[]
  category?: string
}

export interface CreateContactDto {
  name: string
  email: string
  phone?: string
}

export interface UpdateContactDto {
  name?: string
  email?: string
  phone?: string
}
```

## 14. Current vs Target Architecture

### Current Issues
1. ❌ No Services layer - Components/API routes may call fetch directly
2. ❌ No Hooks layer - No TanStack Query integration
3. ❌ No QueryProvider setup
4. ❌ No Providers directory
5. ❌ No Types directory
6. ❌ `exchange.js` and `balance.js` are empty
7. ❌ `statistics.js` doesn't exist
8. ❌ Missing API routes for individual resources (single group, single contact, balance, statistics)
9. ❌ No proper validation in API routes
10. ❌ Components may be making direct API calls instead of using hooks

### What Already Exists (✅)
1. ✅ Basic DB layer (`lib/db.js` - needs migration to `src/app/lib/`)
2. ✅ Basic CRUD for groups and contacts in DB layer
3. ✅ Some API routes (`app/api/groups`, `app/api/contacts` - need migration to `src/app/api/`)
4. ✅ Some components (need migration to `src/app/components/`)
5. ✅ React Hook Form + Zod installed (for forms)
6. ✅ Recharts installed (for charts)
7. ✅ shadcn/ui components installed

### Target Architecture (Following Reference Code Pattern)
```
User Interaction
    ↓
Component (src/app/components/ - Client Component with 'use client')
    ↓
Hook (src/app/hooks/ - TanStack Query - useQuery/useMutation)
    ↓
Service (src/app/services/ - HTTP client function with fetch)
    ↓
API Route Handler (src/app/api/ - Next.js route.ts)
    ↓
DB Layer Function (src/app/lib/)
    ↓
JSON File (src/app/data/db.json - stays at root)
    ↑
    └──── TanStack Query Cache Invalidation ────┘
```

### Data Flow Example
```
1. User clicks "Create Group" button
2. CreateGroupModal component opens (uses React Hook Form)
3. User fills form and submits
4. Form calls useCreateGroup() hook
5. Hook triggers mutation with groupsService.createGroup(data)
6. Service makes POST /api/groups with fetch
7. API route validates data and calls lib/groups.addGroup()
8. DB function writes to src/app/data/db.json
9. API returns new group
10. TanStack Query invalidates ['groups'] cache
11. All components using useGroups() automatically re-fetch
12. UI updates with new group
```

## 15. Development Workflow

1. **Start with DB Layer**: Ensure all functions exist
2. **Build API Layer**: Create/update all route handlers
3. **Create Services Layer**: Wrap all API calls
4. **Setup Hooks Layer**: Create TanStack Query hooks
5. **Update UI Components**: Use hooks, remove direct API calls
6. **Test Integration**: Verify entire flow works
7. **Add Polish**: Error handling, loading states, validations

---

## 16. Key Architectural Patterns (From Reference Code)

### Pattern 1: Service Layer Structure
```typescript
// src/app/services/[feature].service.ts
import type { Type } from '@/app/types'

// Shared error handler
async function handleErrorResponse(response: Response): Promise<never> {
  let message = "Error al procesar la solicitud"
  try {
    const error = await response.json()
    if (typeof error?.error === "string" && error.error.trim() !== "") {
      message = error.error
    }
  } catch (_) { }
  throw new Error(message)
}

// Service object with async functions
export const featureService = {
  getAll: async (): Promise<Type[]> => {
    const res = await fetch("/api/feature", { cache: "no-store" })
    if (!res.ok) await handleErrorResponse(res)
    return res.json()
  },
  // ... more methods
}
```

### Pattern 2: Hook Layer Structure
```typescript
// src/app/hooks/useFeature.ts
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { featureService } from '@/app/services/feature.service'
import type { Feature, CreateFeatureDto } from '@/app/types'

export function useFeatures() {
  return useQuery<Feature[], Error>({
    queryKey: ['features'],
    queryFn: featureService.getAll,
  })
}

export function useCreateFeature() {
  const queryClient = useQueryClient()
  
  return useMutation<Feature, Error, CreateFeatureDto>({
    mutationFn: featureService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] })
    },
  })
}
```

### Pattern 3: API Route Structure
```typescript
// src/app/api/feature/route.ts
import { NextResponse } from "next/server"
import { db } from "@/app/lib/database"

export async function GET() {
  try {
    const data = await db.getAll()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Error retrieving data", error)
    return NextResponse.json(
      { error: "Error message" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validation
    if (!body.field) {
      return NextResponse.json(
        { error: "Validation error message" },
        { status: 400 }
      )
    }
    
    const result = await db.add(body)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === "CUSTOM_ERROR") {
      return NextResponse.json(
        { error: "User-friendly message" },
        { status: 409 }
      )
    }
    
    console.error("Error creating data", error)
    return NextResponse.json(
      { error: "Error message" },
      { status: 500 }
    )
  }
}
```

### Pattern 4: Component Structure
```typescript
// src/app/components/feature/FeatureList.tsx
'use client'

import { useFeatures, useDeleteFeature } from '@/app/hooks/useFeatures'

export function FeatureList() {
  const { data: features, isLoading, error } = useFeatures()
  const deleteFeature = useDeleteFeature()

  const handleDelete = (id: number) => {
    if (!deleteFeature.isPending) {
      deleteFeature.mutate(id)
    }
  }

  if (isLoading) return <Skeleton />
  if (error) return <Alert>Error: {error.message}</Alert>

  return (
    <div>
      {features?.map((feature) => (
        <FeatureCard 
          key={feature.id} 
          feature={feature}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
```

### Pattern 5: Form with React Hook Form + Zod
```typescript
// src/app/components/feature/CreateFeatureForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCreateFeature } from '@/app/hooks/useFeatures'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/app/components/ui/form'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
})

type FormValues = z.infer<typeof schema>

export function CreateFeatureForm() {
  const createFeature = useCreateFeature()
  
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  })

  const onSubmit = async (data: FormValues) => {
    await createFeature.mutateAsync(data)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

### Pattern 6: Directory Import Aliases
Use TypeScript path aliases for clean imports:
```typescript
// tsconfig.json should be configured with "@/*": ["./src/*"]

// Import examples (all from src/app/):
import { Group } from '@/app/types'
import { groupsService } from '@/app/services/groups.service'
import { useGroups } from '@/app/hooks/useGroups'
import { db } from '@/app/lib/db'
import { Button } from '@/app/components/ui/button'
```

---

**Note**: This spec provides a complete roadmap following the proven architecture pattern from the reference code. Follow the checklist in order, test each layer independently before moving to the next. The architecture ensures maintainability, testability, and follows Next.js and React best practices.

