# Testing Guide - Administrador de Gastos Compartidos

**Last Updated**: November 23, 2025  
**Purpose**: Manual testing guide for all application features

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Test Data Setup](#test-data-setup)
3. [Feature Testing](#feature-testing)
   - [Contacts Management](#1-contacts-management)
   - [Groups Management](#2-groups-management)
   - [Expenses Management](#3-expenses-management)
   - [Balance Calculation](#4-balance-calculation)
   - [Currency Conversion](#5-currency-conversion)
   - [Statistics & Charts](#6-statistics--charts)
4. [Edge Cases & Error Handling](#edge-cases--error-handling)
5. [Performance Testing](#performance-testing)
6. [API Testing](#api-testing)

---

## Prerequisites

### 1. Start the Development Server

```bash
cd /Users/juancruz/Documents/ingenieria/sistemas-distribuidos/admin-gastos/TP_SSDD_App10
npm run dev
```

Server should start on `http://localhost:3000`

### 2. Reset Database (Optional)

If you need a fresh start:

```bash
# Backup current database
cp src/app/data/db.json src/app/data/db.json.backup

# Reset to initial state
echo '{"groups":[],"contacts":[],"currentUser":null}' > src/app/data/db.json
```

### 3. Open Browser DevTools

- Open Chrome/Firefox DevTools (F12)
- Go to Network tab to see API calls
- Go to Console tab to see any errors

---

## Test Data Setup

### Create Test Contacts

Create at least 5 contacts for testing:

1. **Juan Pérez** - `juan@example.com` - `+54 9 11 1234-5678`
2. **María García** - `maria@example.com` - `+54 9 11 2345-6789`
3. **Carlos López** - `carlos@example.com` - `+54 9 11 3456-7890`
4. **Ana Martínez** - `ana@example.com` - `+54 9 11 4567-8901`
5. **Pedro Rodríguez** - `pedro@example.com` - `+54 9 11 5678-9012`

### Create Test Groups

Create 2-3 test groups:

1. **Viaje a Bariloche**
   - Members: Juan, María, Carlos
   - Base Currency: ARS

2. **Cena de Cumpleaños**
   - Members: María, Ana, Pedro
   - Base Currency: USD

3. **Proyecto Universidad**
   - Members: Juan, Carlos, Ana
   - Base Currency: ARS

---

## Feature Testing

## 1. Contacts Management

### Test 1.1: Create Contact ✅

**Steps**:
1. Navigate to Contacts page
2. Enter email: `test@example.com`
3. Click "Agregar" button

**Expected Results**:
- ✅ Loading indicator shows on button ("Agregando...")
- ✅ Contact appears in the list immediately
- ✅ Toast notification: "Contacto agregado exitosamente"
- ✅ Input field clears after adding

**Edge Cases**:
- Try adding duplicate email → should show error
- Try adding empty email → button should be disabled
- Try adding invalid email format → should show validation error

### Test 1.2: Delete Contact ✅

**Steps**:
1. Click "Eliminar" on a contact not in any group
2. Confirm deletion in dialog

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Loading indicator on button ("Eliminando...")
- ✅ Contact removed from list
- ✅ Toast notification: "Contacto eliminado"

**Edge Cases**:
- Try deleting contact that's in a group → should show error:
  "No se puede eliminar: el contacto es miembro de uno o más grupos"

### Test 1.3: Search Contacts ✅

**Steps**:
1. Type in search box
2. Verify filtering works

**Expected Results**:
- ✅ List filters by name or email
- ✅ Count updates in badge
- ✅ "No se encontraron contactos" shows when no matches

### Test 1.4: Loading States ✅

**Steps**:
1. Refresh page
2. Observe loading state

**Expected Results**:
- ✅ Skeleton placeholders show while loading
- ✅ Real data replaces skeletons when loaded

---

## 2. Groups Management

### Test 2.1: Create Group ✅

**Steps**:
1. Click "Crear Nuevo Grupo"
2. Enter name: "Test Group"
3. Click "Crear Grupo"

**Expected Results**:
- ✅ Modal opens
- ✅ Loading indicator on button ("Creando...")
- ✅ New group appears in grid
- ✅ Toast notification: "Grupo creado exitosamente"
- ✅ Modal closes
- ✅ Group shows "0 miembros"

**Edge Cases**:
- Empty name → button should be disabled
- Cancel → modal closes without creating

### Test 2.2: Add Members to Group ✅

**Steps**:
1. Click "Añadir Miembros" on a group
2. Search for a contact
3. Check 2-3 contacts
4. Click "Añadir (X)"

**Expected Results**:
- ✅ Modal opens with contact list
- ✅ Search filters contacts
- ✅ Selected count shows in footer
- ✅ Loading indicator ("Añadiendo...")
- ✅ Members appear as badges in group card
- ✅ Toast notification: "Miembros añadidos exitosamente"
- ✅ Modal closes

**Edge Cases**:
- Contacts already in group don't appear in list
- Cancel → modal closes without adding
- Button disabled when no selection

### Test 2.3: Delete Group ✅

**Steps**:
1. Click trash icon on a group
2. Confirm deletion

**Expected Results**:
- ✅ Confirmation dialog appears
- ✅ Group removed from list
- ✅ Toast notification: "Grupo eliminado"

**Edge Cases**:
- Cancel deletion → group stays
- Delete group with expenses → should work (cascade delete)

### Test 2.4: Loading States ✅

**Steps**:
1. Refresh page
2. Observe loading

**Expected Results**:
- ✅ 6 skeleton cards show in grid
- ✅ Real groups replace skeletons

---

## 3. Expenses Management

### Test 3.1: Add Expense

**API Endpoint**: `POST /api/groups/{groupId}/expenses`

**Test Data**:
```json
{
  "description": "Cena en restaurante",
  "amount": 15000,
  "currency": "ARS",
  "category": "Comida",
  "payer": "{contactId}",
  "participants": ["{contactId1}", "{contactId2}"],
  "date": 1700000000000
}
```

**Expected Results**:
- ✅ Expense created with `convertedAmount` in group's base currency
- ✅ Expense has unique ID
- ✅ Group's `updatedAt` timestamp updated
- ✅ Balance recalculated automatically

**Test Cases**:
- Same currency as group → `convertedAmount === amount`
- Different currency → `convertedAmount` is converted
- Invalid payer ID → 400 error
- Empty participants → 400 error
- Invalid currency → 500 error (API call fails)

### Test 3.2: Update Expense

**API Endpoint**: `PUT /api/groups/{groupId}/expenses/{expenseId}`

**Test Data**:
```json
{
  "amount": 20000,
  "description": "Cena en restaurante (actualizado)"
}
```

**Expected Results**:
- ✅ Expense updated
- ✅ `convertedAmount` recalculated if amount/currency changed
- ✅ `updatedAt` timestamp updated
- ✅ Balance recalculated

### Test 3.3: Delete Expense

**API Endpoint**: `DELETE /api/groups/{groupId}/expenses/{expenseId}`

**Expected Results**:
- ✅ Expense removed
- ✅ Balance recalculated
- ✅ 200 status returned

**Edge Cases**:
- Invalid expense ID → 404 error
- Invalid group ID → 404 error

### Test 3.4: Get Group Expenses

**API Endpoint**: `GET /api/groups/{groupId}/expenses`

**Expected Results**:
- ✅ Returns array of all expenses for the group
- ✅ Empty array if no expenses
- ✅ 404 if group doesn't exist

---

## 4. Balance Calculation

### Test 4.1: Simple Equal Split

**Scenario**:
- Group: Juan, María, Carlos
- Expense 1: Juan paid $3000, participants: Juan, María, Carlos
- Expected shares: $1000 each

**Expected Balance**:
- Juan: `+$2000` (paid 3000, owes 1000)
- María: `-$1000` (paid 0, owes 1000)
- Carlos: `-$1000` (paid 0, owes 1000)

**Test**:
```bash
# Create expense via API
curl -X POST http://localhost:3000/api/groups/{groupId}/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test",
    "amount": 3000,
    "currency": "ARS",
    "payer": "{juanId}",
    "participants": ["{juanId}", "{mariaId}", "{carlosId}"],
    "date": 1700000000000
  }'

# Check balance
curl http://localhost:3000/api/groups/{groupId}/balance
```

**Verify**:
- ✅ Balances sum to 0
- ✅ Settlement suggests: María → Juan $1000, Carlos → Juan $1000

### Test 4.2: Multiple Expenses

**Scenario**:
- Expense 1: Juan paid $3000 (all 3 participate)
- Expense 2: María paid $2100 (all 3 participate)
- Total: $5100, share: $1700 each

**Expected Balance**:
- Juan: `+$1300` (paid 3000, owes 1700)
- María: `+$400` (paid 2100, owes 1700)
- Carlos: `-$1700` (paid 0, owes 1700)

**Verify**:
- ✅ Balances sum to 0
- ✅ Settlement suggests optimal path (Carlos → Juan $1300, Carlos → María $400)

### Test 4.3: Partial Participation

**Scenario**:
- Expense 1: Juan paid $2000, participants: Juan, María
- Expense 2: Carlos paid $3000, participants: María, Carlos

**Expected Balance**:
- Juan: `+$1000` (paid 2000, owes 1000)
- María: `-$2500` (paid 0, owes 2500)
- Carlos: `+$1500` (paid 3000, owes 1500)

**Verify**:
- ✅ Each member only pays for expenses they participated in
- ✅ Settlements minimize transactions

### Test 4.4: Currency Conversion in Balance

**Scenario**:
- Group base currency: ARS
- Expense 1: $100 USD (converted to ARS at current rate)
- Expense 2: $1000 ARS

**Verify**:
- ✅ Both expenses converted to ARS for balance calculation
- ✅ Balances shown in ARS
- ✅ Conversion rate used is from exchange API

---

## 5. Currency Conversion

### Test 5.1: Get Exchange Rate

**API Endpoint**: `GET /api/exchange?from=USD&to=ARS`

**Expected Results**:
- ✅ Returns rate, from, to, timestamp
- ✅ Rate is cached for 1 hour
- ✅ Subsequent requests use cached rate

**Test**:
```bash
# First request (fetches from API)
curl "http://localhost:3000/api/exchange?from=USD&to=ARS"

# Second request within 1 hour (uses cache)
curl "http://localhost:3000/api/exchange?from=USD&to=ARS"
```

### Test 5.2: Expense Currency Conversion

**Scenario**: Add expense in USD to group with ARS base currency

**Test**:
```bash
curl -X POST http://localhost:3000/api/groups/{groupId}/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Hotel booking",
    "amount": 100,
    "currency": "USD",
    "payer": "{juanId}",
    "participants": ["{juanId}"],
    "date": 1700000000000
  }'
```

**Verify**:
- ✅ `amount` = 100
- ✅ `currency` = "USD"
- ✅ `convertedAmount` = (100 * exchange_rate)
- ✅ Group's `baseCurrency` = "ARS"

### Test 5.3: API Failure Fallback

**Scenario**: Exchange API is down or rate limit exceeded

**Expected Behavior**:
- ✅ Check for fallback rate in database
- ✅ Log warning to console
- ✅ Return fallback rate
- ✅ If no fallback, return 500 error with message

---

## 6. Statistics & Charts

### Test 6.1: Expenses by Person

**API Endpoint**: `GET /api/groups/{groupId}/statistics?type=person`

**Expected Results**:
```json
[
  {
    "personId": "123",
    "personName": "Juan Pérez",
    "totalAmount": 5000,
    "count": 3
  },
  ...
]
```

**Verify**:
- ✅ Sorted by `totalAmount` (descending)
- ✅ All amounts in group's base currency
- ✅ `count` matches number of expenses paid by person

### Test 6.2: Expenses by Category

**API Endpoint**: `GET /api/groups/{groupId}/statistics?type=category`

**Expected Results**:
```json
[
  {
    "category": "Comida",
    "totalAmount": 8000,
    "count": 5,
    "percentage": 45.5
  },
  ...
]
```

**Verify**:
- ✅ Sorted by `totalAmount` (descending)
- ✅ Percentages sum to ~100%
- ✅ "Uncategorized" used for expenses without category

### Test 6.3: Expenses by Month

**API Endpoint**: `GET /api/groups/{groupId}/statistics?type=month`

**Expected Results**:
```json
[
  {
    "month": "2024-11",
    "year": 2024,
    "totalAmount": 12000,
    "count": 8
  },
  ...
]
```

**Verify**:
- ✅ Sorted by date (oldest first)
- ✅ Months formatted as "YYYY-MM"
- ✅ Includes months with 0 expenses (if between first and last)

### Test 6.4: Total Expenses

**API Endpoint**: `GET /api/groups/{groupId}/statistics?type=total`

**Expected Results**:
```json
{
  "total": 25000,
  "count": 15,
  "average": 1666.67,
  "currency": "ARS"
}
```

**Verify**:
- ✅ Total in group's base currency
- ✅ Average calculated correctly
- ✅ Count matches number of expenses

---

## Edge Cases & Error Handling

### 1. Empty States

| Screen | Scenario | Expected Behavior |
|--------|----------|-------------------|
| Contacts | No contacts | Show empty state message |
| Groups | No groups | Show empty state with "Create Group" CTA |
| Group Detail | No expenses | Show empty expenses list |
| Balance | No expenses | All balances = 0 |
| Statistics | No expenses | Empty arrays / 0 totals |

### 2. Network Errors

**Test**: Disconnect network and try operations

**Expected Behavior**:
- ✅ Loading states show
- ✅ Error toast appears after timeout
- ✅ TanStack Query retries (3 times by default)
- ✅ Error message shown in UI

### 3. Invalid Data

| Test | Input | Expected Result |
|------|-------|-----------------|
| Create Group | Empty name | Button disabled |
| Add Contact | Invalid email | Validation error |
| Add Expense | Negative amount | 400 error |
| Add Expense | Invalid payer ID | 400 error |
| Add Expense | Empty participants | 400 error |
| Update Group | Non-existent member ID | 400 error |

### 4. Concurrent Updates

**Test**: Open app in 2 tabs, create contact in tab 1

**Expected Behavior**:
- ✅ Tab 2 refetches on focus (stale-while-revalidate)
- ✅ Both tabs show updated data

### 5. Large Datasets

**Test**: Create group with 20+ members and 100+ expenses

**Expected Behavior**:
- ✅ Page loads in < 2 seconds
- ✅ Balance calculation completes quickly
- ✅ Statistics render without lag
- ✅ No memory leaks

### 6. Currency API Failures

**Test**: Modify `exchange.js` to throw error

**Expected Behavior**:
- ✅ Falls back to database rate if available
- ✅ Shows warning in console
- ✅ If no fallback, returns clear error message

---

## Performance Testing

### 1. Initial Page Load

**Target**: < 2 seconds

**Measure**:
1. Open DevTools → Network tab
2. Hard refresh (Cmd+Shift+R)
3. Check "Load" time

**Verify**:
- ✅ JavaScript bundles < 500KB
- ✅ First Contentful Paint < 1s
- ✅ Time to Interactive < 2s

### 2. API Response Times

**Target**: < 200ms for most operations

**Test**:
```bash
# Test GET operations
time curl http://localhost:3000/api/groups
time curl http://localhost:3000/api/contacts
time curl http://localhost:3000/api/groups/{id}/balance

# Test POST operations
time curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","baseCurrency":"ARS","members":[]}'
```

**Verify**:
- ✅ GET operations < 50ms
- ✅ POST/PUT operations < 100ms
- ✅ Balance calculation < 200ms (even with 100 expenses)

### 3. Memory Usage

**Test**:
1. Open DevTools → Memory tab
2. Take heap snapshot
3. Navigate through app
4. Take another snapshot
5. Compare

**Verify**:
- ✅ No significant memory leaks
- ✅ Heap size reasonable (< 50MB)

---

## API Testing

### Quick Test Script

Create a file `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "=== Testing Contacts API ==="

# Create contact
echo "Creating contact..."
CONTACT=$(curl -s -X POST "$BASE_URL/contacts" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"123456"}')
CONTACT_ID=$(echo $CONTACT | jq -r '.id')
echo "Created contact: $CONTACT_ID"

# Get all contacts
echo "Getting all contacts..."
curl -s "$BASE_URL/contacts" | jq '.'

echo -e "\n=== Testing Groups API ==="

# Create group
echo "Creating group..."
GROUP=$(curl -s -X POST "$BASE_URL/groups" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Group\",\"baseCurrency\":\"ARS\",\"members\":[\"$CONTACT_ID\"]}")
GROUP_ID=$(echo $GROUP | jq -r '.id')
echo "Created group: $GROUP_ID"

# Get group
echo "Getting group..."
curl -s "$BASE_URL/groups/$GROUP_ID" | jq '.'

echo -e "\n=== Testing Expenses API ==="

# Add expense
echo "Adding expense..."
curl -s -X POST "$BASE_URL/groups/$GROUP_ID/expenses" \
  -H "Content-Type: application/json" \
  -d "{
    \"description\":\"Test Expense\",
    \"amount\":1000,
    \"currency\":\"ARS\",
    \"category\":\"Test\",
    \"payer\":\"$CONTACT_ID\",
    \"participants\":[\"$CONTACT_ID\"],
    \"date\":$(date +%s)000
  }" | jq '.'

echo -e "\n=== Testing Balance API ==="

# Get balance
echo "Getting balance..."
curl -s "$BASE_URL/groups/$GROUP_ID/balance" | jq '.'

echo -e "\n=== Testing Statistics API ==="

# Get statistics
echo "Getting statistics by person..."
curl -s "$BASE_URL/groups/$GROUP_ID/statistics?type=person" | jq '.'

echo -e "\n=== Cleanup ==="

# Delete group
echo "Deleting group..."
curl -s -X DELETE "$BASE_URL/groups/$GROUP_ID"

# Delete contact
echo "Deleting contact..."
curl -s -X DELETE "$BASE_URL/contacts/$CONTACT_ID"

echo -e "\nDone!"
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh
```

---

## Testing Checklist

### Before Release

- [ ] All contacts CRUD operations work
- [ ] All groups CRUD operations work
- [ ] All expenses CRUD operations work
- [ ] Balance calculation is accurate
- [ ] Currency conversion works
- [ ] Statistics are calculated correctly
- [ ] Loading states show properly
- [ ] Error states show properly
- [ ] Toast notifications work
- [ ] Confirmation dialogs work
- [ ] Empty states show properly
- [ ] Search/filter works
- [ ] No console errors
- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] Mobile responsive (test on small screens)
- [ ] Works in Chrome, Firefox, Safari
- [ ] API endpoints return correct status codes
- [ ] Database writes are atomic (no corruption)
- [ ] Large datasets don't cause performance issues

---

## Reporting Issues

When reporting bugs, include:

1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior**
4. **Screenshots** (if applicable)
5. **Browser** and version
6. **Console errors** (if any)
7. **Network tab** (for API errors)

---

## Next Steps

After manual testing is complete:
1. Fix any bugs found
2. Add automated tests (Jest, React Testing Library)
3. Add E2E tests (Playwright, Cypress)
4. Set up CI/CD pipeline
5. Add test coverage reporting

---

**Happy Testing! 🧪**

