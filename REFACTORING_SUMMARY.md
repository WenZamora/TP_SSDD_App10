# Database Refactoring Summary

## Overview
Refactored the application from a flat contacts model to a user-centric model where each user has their own contact list.

## Key Changes

### 1. Database Schema (`src/app/data/db.json`)
**Before:**
```json
{
  "contacts": [...],
  "groups": [...]
}
```

**After:**
```json
{
  "users": [
    {
      "id": "...",
      "name": "...",
      "email": "...",
      "avatar": "...",
      "contacts": ["userId1", "userId2"],
      "createdAt": 123456
    }
  ],
  "groups": [...]
}
```

### 2. Type Definitions (`src/app/types/index.ts`)
- Added `User` interface with `contacts` array field
- Updated `Database` interface to use `users` instead of `contacts`
- Kept `Contact` interface for backwards compatibility

### 3. Database Layer (`src/app/lib/db.js`)
- Updated validation to expect `users` array instead of `contacts`
- Updated initialization to create empty `users` array

### 4. Business Logic (`src/app/lib/contacts.js`)
Added new functions:
- `getAllUsers()` - Get all users in the system
- `getUserContacts(userId)` - Get contacts for a specific user
- `addUser()` - Create a new user
- `addContactToUser(userId, contactId)` - Add a contact to user's list
- `removeContactFromUser(userId, contactId)` - Remove contact from user's list
- `updateUser()` - Update user data
- `deleteUser()` - Delete user from system

Maintained backwards compatibility with existing functions.

### 5. API Layer

#### New Endpoints (`src/app/api/users/route.ts`)
- `GET /api/users?email=xxx` - Get user by email or all users
- `POST /api/users` - Login or create user (auto-creates if doesn't exist)

#### Updated Endpoints (`src/app/api/contacts/`)
- `GET /api/contacts?userId=xxx` - Get user's contacts or all users
- `POST /api/contacts` - Create new user OR add existing user as contact
  - Body: `{name, email}` - creates new user
  - Body: `{userId, contactId}` - adds contact to user
- `DELETE /api/contacts/[id]?userId=xxx` - Remove contact from user's list OR delete user

### 6. Services Layer

#### New Service (`src/app/services/users.service.ts`)
- `getAllUsers()` - Get all users
- `getUserByEmail(email)` - Find user by email
- `loginOrCreateUser(name, email)` - Login or register user

#### Updated Service (`src/app/services/contacts.service.ts`)
- `getUserContacts(userId)` - Get contacts for specific user
- `addContactToUser(userId, contactId)` - Add contact to user
- `removeContactFromUser(userId, contactId)` - Remove contact from user

### 7. Hooks Layer (`src/app/hooks/useContacts.ts`)
Added new hooks:
- `useUserContacts(userId)` - Fetch user's contacts
- `useAddContactToUser()` - Add contact to user mutation
- `useRemoveContactFromUser()` - Remove contact from user mutation

### 8. Authentication Flow (`src/app/page.tsx` & `src/app/components/login-modal.tsx`)
- Updated to use database authentication
- Login now requires both name and email
- Automatically creates user if doesn't exist
- Verifies user exists in database on app load
- Stores full User object (including ID, email) in localStorage

### 9. UI Components

#### ContactsManagement (`src/app/components/contacts-management.tsx`)
Complete rewrite to support:
- Display only current user's contacts
- Add existing users as contacts (with search dialog)
- Create new users and add them as contacts
- Remove contacts from user's list (doesn't delete user)
- Separate "my contacts" from "all users"

## User Experience Changes

### Before
- Users had a random generated ID (`user_${Date.now()}`)
- All contacts were shared globally
- No concept of personal contact lists

### After
- Users have persistent IDs stored in database
- Each user has their own contact list
- Users can add other users as contacts
- Users see only their contacts when viewing contacts page
- When creating groups/expenses, all users in the system are available (not just contacts)
- User authentication persists across sessions

## Migration Notes

**Old localStorage format:**
```json
{
  "id": "user_1234567890",
  "name": "Juan Pérez"
}
```

**New localStorage format:**
```json
{
  "id": "uuid-v4",
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "avatar": "",
  "contacts": ["userId1", "userId2"],
  "createdAt": 1700000000000
}
```

The app automatically handles migration by clearing old format users and requiring re-login.

## Backwards Compatibility

The following functions/endpoints remain for backwards compatibility:
- `getAllContacts()` - Now returns all users (for group/expense member selection)
- `getContactById(id)` - Works with user IDs
- `addContact()` - Creates a new user
- `updateContact()` - Updates user data
- `deleteContact()` - Deletes user from system
- `GET /api/contacts` - Returns all users when no userId param provided

## Database Constraints

1. A user cannot add themselves as a contact
2. A user cannot be deleted if they're a member of any group
3. When a user is deleted, they're automatically removed from all other users' contact lists
4. Email addresses must be unique (enforced by checking before creation)

## Testing Recommendations

1. Test user creation with new email
2. Test login with existing email
3. Test adding existing users as contacts
4. Test creating new users from contacts page
5. Test removing contacts from list
6. Test that groups still show all users for member selection
7. Test that deleting a user in a group fails appropriately
8. Test localStorage persistence across page refreshes

