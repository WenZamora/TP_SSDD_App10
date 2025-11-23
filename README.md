# Administrador de Gastos Compartidos

A modern web application for managing shared expenses between groups of people, built with Next.js 16, TypeScript, and a clean layered architecture.

## Table of Contents

- [Overview](#overview)
- [Technical Stack](#technical-stack)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [API Structure](#api-structure)
- [Key Technical Decisions](#key-technical-decisions)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Development Workflow](#development-workflow)
- [Major Refactorings](#major-refactorings)

## Overview

This application enables users to create groups, track shared expenses, automatically split costs, and view detailed balance settlements. The system uses a simplified expense model where all group expenses are split equally among all members, eliminating complexity while maintaining full functionality for most use cases.

### Key Features

- **User Management**: Registration and authentication with persistent user profiles
- **Personal Contact Lists**: Each user manages their own contacts
- **Group Management**: Create groups with multiple members from contacts
- **Expense Tracking**: Record expenses with automatic equal splitting
- **Balance Calculation**: Real-time balance computation with settlement suggestions
- **Currency Conversion**: Integration with exchangerate.host API (foundation laid for future use)
- **Statistics & Charts**: Visual expense analytics using Recharts
- **Persistent Storage**: JSON-based database with atomic write operations

## Technical Stack

### Core Framework
- **Next.js 16.0.3** - App Router with Server/Client Components
- **React 19.2.0** - Latest React with concurrent features
- **TypeScript 5** - Full type safety across the stack

### State Management & Data Fetching
- **TanStack Query v5.90** - Server state management and caching
- **React Context API** - Global user authentication state

### UI & Styling
- **Tailwind CSS 4.1** - Utility-first styling
- **shadcn/ui** - Radix UI-based component library
- **Lucide React** - Icon system
- **next-themes** - Dark/light mode support

### Forms & Validation
- **React Hook Form 7.60** - Performant form handling
- **Zod 3.25** - Runtime type validation

### Data Visualization
- **Recharts 2.15** - Responsive charts (Bar, Pie, Line)

### Utilities
- **UUID v13** - Unique identifier generation
- **date-fns 4.1** - Date manipulation
- **clsx + tailwind-merge** - Conditional class merging

## Architecture

The application follows a strict **layered architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         UI Layer (Components)           │  ← React components, user interaction
├─────────────────────────────────────────┤
│      Hooks Layer (TanStack Query)       │  ← State management & server sync
├─────────────────────────────────────────┤
│     Services Layer (HTTP Clients)       │  ← HTTP API calls with fetch
├─────────────────────────────────────────┤
│       API Layer (Route Handlers)        │  ← Request validation & orchestration
├─────────────────────────────────────────┤
│      DB Layer (JSON Persistence)        │  ← Data access & atomic writes
└─────────────────────────────────────────┘
```

### Layer Responsibilities

#### 1. UI Layer (`src/app/components/`)
- **Responsibility**: Presentation and user interaction only
- **Rules**: 
  - Must use hooks from Hooks Layer (never call services directly)
  - All components are Client Components (`'use client'`)
  - Handle loading and error states from TanStack Query
  - Use React Hook Form + Zod for forms

#### 2. Hooks Layer (`src/app/hooks/`)
- **Responsibility**: State management and server synchronization
- **Pattern**: TanStack Query hooks (useQuery, useMutation)
- **Features**:
  - Automatic caching and revalidation
  - Optimistic updates
  - Cache invalidation strategies
  - Loading and error state management

#### 3. Services Layer (`src/app/services/`)
- **Responsibility**: Encapsulate all HTTP calls
- **Pattern**: Service objects with async methods
- **Features**:
  - Centralized error handling
  - Type-safe request/response handling
  - No business logic (pure HTTP client)

#### 4. API Layer (`src/app/api/`)
- **Responsibility**: Request validation and business logic orchestration
- **Pattern**: Next.js Route Handlers (GET, POST, PUT, DELETE)
- **Features**:
  - Input validation
  - Business rule enforcement
  - Proper HTTP status codes
  - Structured error responses

#### 5. DB Layer (`src/app/lib/`)
- **Responsibility**: Data persistence and retrieval
- **Pattern**: Functional modules with atomic operations
- **Features**:
  - Atomic file writes (no partial writes)
  - Data validation on read/write
  - Database schema enforcement

## Data Model

### Database Schema

The application uses a JSON-based database (`src/app/data/db.json`) with the following structure:

```typescript
interface Database {
  users: User[]
  groups: Group[]
}

interface User {
  id: string              // UUID v4
  name: string
  email: string          // Unique
  avatar?: string
  contacts: string[]     // Array of user IDs
  createdAt: number      // Unix timestamp
}

interface Group {
  id: string
  name: string
  description?: string
  baseCurrency: string   // e.g., "ARS", "USD", "EUR"
  members: string[]      // Array of user IDs
  expenses: Expense[]
  createdAt: number
  updatedAt: number
}

interface Expense {
  id: string
  amount: number         // Always in group's base currency
  payer: string         // User ID who paid
  category: ExpenseCategory
  date: number
  createdAt: number
  updatedAt: number
}

type ExpenseCategory = 
  | 'Food' | 'Transport' | 'Accommodation' 
  | 'Entertainment' | 'Shopping' | 'Health' 
  | 'Education' | 'Utilities' | 'Other' | 'General'
```

### Computed Models (Not Stored)

```typescript
interface Balance {
  memberId: string
  memberName: string
  totalPaid: number      // Total they paid
  totalShare: number     // Total they should pay (fair share)
  balance: number        // totalPaid - totalShare
}

interface Settlement {
  from: string          // User ID who owes
  fromName: string
  to: string           // User ID who is owed
  toName: string
  amount: number       // Amount to transfer
}
```

### Key Data Model Decisions

1. **User-Centric Design**: Users own contacts (many-to-many relationship)
2. **Simplified Expenses**: No currency conversion per expense, no participant selection
3. **Equal Splitting**: All expenses divided equally among ALL group members
4. **Category Tracking**: Expenses categorized for statistics and filtering
5. **Timestamps**: Full audit trail with createdAt/updatedAt

## API Structure

The API follows **RESTful conventions** with resource-based URLs:

### User Management

```
GET    /api/users
       → Get all users in the system
       → Query: ?email={email} to find by email

POST   /api/users
       → Create new user or login
       → Body: { name: string, email: string }

GET    /api/users/{userId}
       → Get single user by ID

PUT    /api/users/{userId}
       → Update user information
       → Body: Partial<User>

DELETE /api/users/{userId}
       → Delete user (fails if member of any group)
```

### User Contacts (Sub-resource)

```
GET    /api/users/{userId}/contacts
       → Get user's contact list
       → Returns array of Contact objects

POST   /api/users/{userId}/contacts
       → Add existing user as contact
       → Body: { contactId: string }

DELETE /api/users/{userId}/contacts/{contactId}
       → Remove contact from user's list
```

### Groups

```
GET    /api/groups
       → Get all groups
       → Query: ?userId={userId} to filter by membership

POST   /api/groups
       → Create new group
       → Body: { name, description?, baseCurrency, members[], creatorUserId }

GET    /api/groups/{groupId}
       → Get single group with all expenses

PUT    /api/groups/{groupId}
       → Update group
       → Body: { name?, description?, baseCurrency?, members?, updaterUserId? }

DELETE /api/groups/{groupId}
       → Delete group and all expenses
```

### Group Expenses (Sub-resource)

```
GET    /api/groups/{groupId}/expenses
       → Get all expenses for a group

POST   /api/groups/{groupId}/expenses
       → Add expense to group
       → Body: { description, amount, payer, category, date? }

PUT    /api/groups/{groupId}/expenses/{expenseId}
       → Update expense
       → Body: { description?, amount?, payer?, category?, date? }

DELETE /api/groups/{groupId}/expenses/{expenseId}
       → Delete expense from group
```

### Group Analytics (Sub-resources)

```
GET    /api/groups/{groupId}/balance
       → Calculate and return balance information
       → Returns: { balances: Balance[], settlements: Settlement[] }

GET    /api/groups/{groupId}/statistics
       → Get expense statistics for charts
       → Returns aggregated data by person, category, and month
```

### Exchange Rates

```
GET    /api/exchange
       → Get currency exchange rates
       → Query: ?from={currency}&to={currency}
       → Returns: { rate, from, to, timestamp, fallback? }
```

### API Design Principles

1. **RESTful Resource Hierarchy**: URLs reflect data relationships
2. **Proper HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (remove)
3. **Consistent Status Codes**: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 409 Conflict, 500 Server Error
4. **Structured Errors**: `{ error: string, code?: string }`
5. **Validation First**: All inputs validated before processing
6. **Business Rule Enforcement**: 
   - Members must be in creator's contacts
   - Payer must be group member
   - User can't be deleted if in any group

## Key Technical Decisions

### 1. Expense Simplification

**Decision**: Removed currency conversion, participant selection, and descriptions from expenses.

**Rationale**:
- 95% of use cases involve splitting expenses equally among all members
- Complexity of per-expense currency conversion wasn't utilized
- Faster expense entry (2 fields vs 7+ fields)
- Simpler balance calculations
- Reduced validation and error handling

**Trade-offs**:
- Can't track who participated in each expense
- Can't split costs unequally
- All expenses must be in group's base currency

### 2. User Context Provider

**Decision**: Implemented centralized user state management using React Context.

**Rationale**:
- Eliminated duplicate localStorage reads across 5+ components
- Single source of truth for authentication state
- Automatic synchronization between tabs
- Easier to test and debug
- Type-safe access to user data

**Implementation**: `src/app/providers/user-provider.tsx` with `useUser()` hook

### 3. TanStack Query for Server State

**Decision**: Use TanStack Query instead of manual fetch + useState.

**Benefits**:
- Automatic caching and revalidation
- Built-in loading and error states
- Optimistic updates for better UX
- Cache invalidation strategies
- Reduces boilerplate by 70%

**Configuration**:
```typescript
{
  staleTime: 1000 * 60 * 5,  // 5 minutes
  refetchOnWindowFocus: false
}
```

### 4. JSON-Based Database with Atomic Writes

**Decision**: Use JSON files instead of a traditional database.

**Rationale**:
- Course requirement (no DBMS)
- Simple deployment (no database server needed)
- Easy debugging (human-readable data)
- Version control friendly

**Atomic Write Strategy**:
```javascript
// Write to temp file → Verify write → Rename to actual file
await fs.writeFile(tempPath, data)
await fs.rename(tempPath, actualPath)
```

### 5. Layered Architecture Enforcement

**Decision**: Strict layer separation with no shortcuts.

**Rules**:
- Components NEVER call services directly → Must use hooks
- Hooks NEVER access DB directly → Must use services
- Services NEVER contain business logic → Just HTTP calls
- API routes NEVER access DB directly → Must use lib functions

**Benefits**:
- Testable at each layer
- Easy to swap implementations
- Clear responsibility boundaries
- Prevents circular dependencies

### 6. TypeScript with Strict Mode

**Decision**: Full type safety across all layers.

**Configuration**:
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitAny": true
}
```

**Benefits**:
- Catch errors at compile time
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring

### 7. Shadcn/UI Component Library

**Decision**: Use shadcn/ui instead of pre-built component libraries.

**Rationale**:
- Copy components into codebase (full control)
- Built on Radix UI (accessibility built-in)
- Customizable with Tailwind
- No bundle size bloat from unused components
- Production-ready components

## Project Structure

```
TP_SSDD_App10/
├── src/
│   └── app/
│       ├── api/                      # API Route Handlers
│       │   ├── exchange/
│       │   │   └── route.ts         # Currency exchange rates
│       │   ├── groups/
│       │   │   ├── [id]/
│       │   │   │   ├── balance/
│       │   │   │   │   └── route.ts # Group balance calculation
│       │   │   │   ├── expenses/
│       │   │   │   │   ├── [expenseId]/
│       │   │   │   │   │   └── route.ts # Single expense operations
│       │   │   │   │   └── route.ts # Expense collection
│       │   │   │   ├── statistics/
│       │   │   │   │   └── route.ts # Group statistics
│       │   │   │   └── route.ts     # Single group operations
│       │   │   └── route.ts         # Group collection
│       │   └── users/
│       │       ├── [userId]/
│       │       │   ├── contacts/
│       │       │   │   ├── [contactId]/
│       │       │   │   │   └── route.ts # Contact relationship
│       │       │   │   └── route.ts # Contacts collection
│       │       │   └── route.ts     # Single user operations
│       │       └── route.ts         # User collection
│       │
│       ├── components/              # UI Components
│       │   ├── add-expense-modal.tsx
│       │   ├── balance-history-modal.tsx
│       │   ├── contacts-management.tsx
│       │   ├── dashboard.tsx
│       │   ├── expense-split-modal.tsx
│       │   ├── group-detail.tsx
│       │   ├── groups-management.tsx
│       │   ├── header.tsx
│       │   ├── login-modal.tsx
│       │   ├── profile-page.tsx
│       │   ├── settings-modal.tsx
│       │   ├── sidebar.tsx
│       │   ├── theme-provider.tsx
│       │   └── ui/                  # shadcn/ui components
│       │       ├── button.tsx
│       │       ├── card.tsx
│       │       ├── dialog.tsx
│       │       ├── form.tsx
│       │       ├── input.tsx
│       │       ├── select.tsx
│       │       └── [40+ more components]
│       │
│       ├── data/
│       │   └── db.json              # JSON database
│       │
│       ├── groups/                  # Group pages
│       │   └── [id]/
│       │       └── page.tsx         # Group detail page
│       │
│       ├── hooks/                   # TanStack Query Hooks
│       │   ├── use-mobile.ts
│       │   ├── use-toast.ts
│       │   ├── useBalance.ts
│       │   ├── useContacts.ts
│       │   ├── useExpenses.ts
│       │   ├── useGroups.ts
│       │   └── useStatistics.ts
│       │
│       ├── lib/                     # Database & Utilities
│       │   ├── balance.js           # Balance calculation algorithms
│       │   ├── contacts.js          # Contact/user data access
│       │   ├── db.js                # Database I/O with atomic writes
│       │   ├── exchange.js          # Currency conversion
│       │   ├── groups.js            # Group & expense data access
│       │   ├── statistics.js        # Statistics calculations
│       │   └── utils.ts             # Utility functions (clsx, etc.)
│       │
│       ├── providers/               # React Context Providers
│       │   ├── query-provider.tsx   # TanStack Query setup
│       │   └── user-provider.tsx    # User authentication context
│       │
│       ├── services/                # HTTP Client Services
│       │   ├── contacts.service.ts  # Contact API calls
│       │   ├── exchange.service.ts  # Exchange API calls
│       │   ├── groups.service.ts    # Group API calls
│       │   └── users.service.ts     # User API calls
│       │
│       ├── types/                   # TypeScript Type Definitions
│       │   └── index.ts             # All interfaces and types
│       │
│       ├── globals.css              # Global styles
│       ├── layout.tsx               # Root layout with providers
│       └── page.tsx                 # Home page
│
├── public/                          # Static assets
│   ├── apple-icon.png
│   ├── icon.svg
│   └── [images]
│
├── .specs/                          # Documentation
│   ├── API_ENDPOINTS_SUMMARY.md
│   ├── EXPENSE_SIMPLIFICATION_REFACTORING.md
│   ├── REFACTORING_SUMMARY.md
│   ├── SPEC.md
│   └── [12+ more docs]
│
├── components.json                  # shadcn/ui config
├── next.config.mjs                 # Next.js configuration
├── package.json                    # Dependencies
├── postcss.config.mjs              # PostCSS configuration
├── tailwind.config.ts              # Tailwind configuration
└── tsconfig.json                   # TypeScript configuration
```

## Setup & Installation

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher

### Installation Steps

```bash
# 1. Clone the repository
git clone [repository-url]
cd TP_SSDD_App10

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:3000
```

### Available Scripts

```bash
npm run dev      # Start development server (hot reload)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Initial Setup

On first run:
1. Database file (`src/app/data/db.json`) will be created automatically
2. Login with any name and email to create your user
3. Add contacts from the Contacts page
4. Create groups and start tracking expenses

## Development Workflow

### 1. Adding a New Feature

Follow the layers top-to-bottom:

```
1. Define Types (src/app/types/index.ts)
   ↓
2. Create DB Functions (src/app/lib/*.js)
   ↓
3. Create API Routes (src/app/api/*/route.ts)
   ↓
4. Create Service Methods (src/app/services/*.service.ts)
   ↓
5. Create Hooks (src/app/hooks/use*.ts)
   ↓
6. Create/Update Components (src/app/components/*.tsx)
```

### 2. Example: Adding Expense Notes

**Step 1: Update Types**
```typescript
// src/app/types/index.ts
interface Expense {
  // ... existing fields
  notes?: string  // Add optional notes field
}
```

**Step 2: Update DB Layer**
```javascript
// src/app/lib/groups.js
export async function addExpenseToGroup(groupId, expenseData) {
  // ... existing code
  const newExpense = {
    // ... existing fields
    notes: expenseData.notes || "",
  }
  // ...
}
```

**Step 3: Update API Route**
```typescript
// src/app/api/groups/[id]/expenses/route.ts
export async function POST(req: Request) {
  const body = await req.json()
  
  // Add notes to expense data
  const expenseData = {
    // ... existing fields
    notes: body.notes,
  }
  // ...
}
```

**Step 4: Update Service** (minimal changes needed)

**Step 5: Update Hook** (minimal changes needed)

**Step 6: Update Component**
```typescript
// src/app/components/add-expense-modal.tsx
const [notes, setNotes] = useState('')

// Add textarea in form
<Textarea 
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  placeholder="Notas opcionales"
/>

// Include in mutation
await addExpenseMutation.mutateAsync({
  // ... existing fields
  notes: notes.trim(),
})
```

### 3. Testing Changes

```bash
# 1. Check TypeScript types
npx tsc --noEmit

# 2. Check linting
npm run lint

# 3. Test in browser
npm run dev

# 4. Test API endpoints (optional)
# Use Postman, Thunder Client, or curl
curl http://localhost:3000/api/groups
```

### 4. Code Style Guidelines

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: kebab-case (`use-groups.ts`, `groups.service.ts`)
- **Functions**: camelCase (`calculateBalance`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_GROUP_SIZE`)
- **Interfaces**: PascalCase with 'I' prefix optional (`User` or `IUser`)

## Major Refactorings

### 1. User-Centric Database Model

**Date**: Phase 5  
**Scope**: Complete database restructuring

**Changes**:
- Migrated from flat `contacts` array to user-centric model
- Each user now has personal contact list (`user.contacts[]`)
- Separated system users from contact relationships
- Created nested API structure (`/api/users/{id}/contacts`)

**Impact**:
- Better reflects real-world relationships
- Enables per-user contact management
- Scalable for future features (groups, permissions)
- Breaking change: Required data migration

**Files Modified**: 15 files across all layers

### 2. Expense Model Simplification

**Date**: Phase 6  
**Scope**: Removed complexity from expense tracking

**Removed Fields**:
- `description` - Expense notes
- `currency` - Always use group currency
- `convertedAmount` - No per-expense conversion
- `participants` - All members participate

**Added Fields**:
- `updatedAt` - Modification tracking
- `category` - Expense categorization (re-added in Phase 7)

**Benefits**:
- 70% faster expense entry
- Simpler balance calculations
- Reduced validation complexity
- Clearer user experience

**Trade-offs**:
- Less granular tracking
- No custom split amounts
- All-or-nothing participation

### 3. User Context Implementation

**Date**: Phase 6  
**Scope**: Centralized authentication state

**Before**:
```typescript
// In every component:
const [user, setUser] = useState(null)
useEffect(() => {
  const stored = localStorage.getItem('user')
  if (stored) setUser(JSON.parse(stored))
}, [])
```

**After**:
```typescript
// Anywhere in the app:
const { currentUser, setCurrentUser } = useUser()
```

**Benefits**:
- Single source of truth
- No duplicate localStorage reads
- Automatic cross-tab synchronization
- Type-safe user access
- Easier testing

**Files Modified**: 7 files

### 4. Category System Addition

**Date**: Recent (Phase 7)  
**Scope**: Re-added expense categorization

**Categories**:
- Food 🍽️
- Transport 🚗
- Accommodation 🏨
- Entertainment 🎉
- Shopping 🛍️
- Health 💊
- Education 📚
- Utilities 💡
- Other 📦
- General 📋

**Implementation**:
- Added to Expense interface
- Validation in API routes
- Category selector in UI
- Statistics by category (future-ready)

**Files Modified**: 6 files across all layers

## Balance Calculation Algorithm

The app uses a **simplified greedy algorithm** for balance settlement:

```javascript
// 1. Calculate each member's balance
members.forEach(member => {
  const totalPaid = expenses
    .filter(e => e.payer === member.id)
    .reduce((sum, e) => sum + e.amount, 0)
  
  const fairShare = totalExpenses / memberCount
  const balance = totalPaid - fairShare
})

// 2. Separate creditors (balance > 0) and debtors (balance < 0)
const creditors = balances.filter(b => b.balance > 0)
const debtors = balances.filter(b => b.balance < 0)

// 3. Match debtors to creditors (greedy approach)
debtors.forEach(debtor => {
  let remaining = Math.abs(debtor.balance)
  
  creditors.forEach(creditor => {
    if (remaining > 0 && creditor.balance > 0) {
      const payment = Math.min(remaining, creditor.balance)
      
      settlements.push({
        from: debtor.memberId,
        to: creditor.memberId,
        amount: payment
      })
      
      remaining -= payment
      creditor.balance -= payment
    }
  })
})
```

**Note**: This is not optimized for minimum transactions, but provides clear, understandable settlements.

## Contributing

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes

### Commit Convention
```
type(scope): description

- feat: New feature
- fix: Bug fix
- docs: Documentation
- refactor: Code restructuring
- test: Add tests
- chore: Maintenance
```

## License

This project is part of a university course assignment (Sistemas Distribuidos).

---

**Built with ❤️ using Next.js, TypeScript, and modern React patterns**

