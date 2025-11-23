# Demo Database Setup

**Date**: November 23, 2025  
**Status**: ✅ COMPLETE

---

## 📊 Demo Database Created

A comprehensive demo database has been created in `src/app/data/db.json` with realistic data for testing and demonstration purposes.

---

## 🎯 Database Contents

### 1. Contacts (6 people)

| ID | Name | Email | Phone |
|----|------|-------|-------|
| contact-1 | Juan Pérez | juan.perez@example.com | +54 9 11 1234-5678 |
| contact-2 | María García | maria.garcia@example.com | +54 9 11 2345-6789 |
| contact-3 | Carlos López | carlos.lopez@example.com | +54 9 11 3456-7890 |
| contact-4 | Ana Martínez | ana.martinez@example.com | +54 9 11 4567-8901 |
| contact-5 | Pedro Rodríguez | pedro.rodriguez@example.com | +54 9 11 5678-9012 |
| contact-6 | Laura Fernández | laura.fernandez@example.com | +54 9 11 6789-0123 |

### 2. Groups (4 groups)

#### Group 1: Viaje a Bariloche
- **Members**: Juan, María, Carlos (3 people)
- **Currency**: ARS
- **Expenses**: 5 gastos
  - Alquiler de cabaña: $180,000 (Juan pagó)
  - Supermercado: $45,000 (María pagó)
  - Restaurante Cerro Catedral: $72,000 (Carlos pagó)
  - Nafta para el viaje: $50,000 (Juan pagó)
  - Pase de esquí (3 días): $120,000 (María pagó)
- **Total**: $467,000 ARS

#### Group 2: Cena de Cumpleaños
- **Members**: María, Ana, Pedro, Laura (4 people)
- **Currency**: ARS
- **Expenses**: 3 gastos
  - Restaurante Don Julio: $85,000 (Ana pagó)
  - Torta de cumpleaños: $18,000 (Pedro pagó)
  - Decoración y globos: $12,000 (Laura pagó)
- **Total**: $115,000 ARS

#### Group 3: Proyecto Universidad
- **Members**: Juan, Carlos, Ana (3 people)
- **Currency**: ARS
- **Expenses**: 3 gastos
  - Impresiones y materiales: $15,000 (Juan pagó)
  - Arduino y sensores: $35,000 (Carlos pagó)
  - Cafetería durante reuniones: $9,000 (Ana pagó)
- **Total**: $59,000 ARS

#### Group 4: Compartir Departamento
- **Members**: Juan, María (2 people)
- **Currency**: ARS
- **Expenses**: 4 gastos
  - Alquiler Diciembre: $150,000 (Juan pagó)
  - Servicios (luz, gas, agua): $32,000 (María pagó)
  - Internet y cable: $18,000 (Juan pagó)
  - Limpieza y productos: $8,000 (María pagó)
- **Total**: $208,000 ARS

### 3. Current User

- **User**: Juan Pérez (contact-1)
- This represents the logged-in user for the demo

---

## 📝 Categories Used

- 🏠 **Alojamiento**: Cabañas, alquileres
- 🍔 **Comida**: Restaurantes, supermercado, tortas
- 🚗 **Transporte**: Nafta, viajes
- 🎉 **Entretenimiento**: Pases de esquí, decoración
- 📦 **Materiales**: Impresiones, electrónica
- 💡 **Servicios**: Luz, gas, agua, internet
- 🧹 **Hogar**: Limpieza, productos

---

## 🔧 UI Updates Made

### ✅ Dashboard Component (`dashboard.tsx`)

**Before**: Used `mockActivities` and `mockHistoricalBalances`

**After**: 
- ✅ Uses `useGroups()` hook to fetch real data
- ✅ Loading states with Skeleton components
- ✅ Empty state when no groups
- ✅ Maps groups to activity cards
- ✅ Displays real group data:
  - Group name
  - Description
  - Member count
  - Expense count
  - Date range (created → last updated)
  - Group image (auto-selected based on name)
- ✅ Quick stats cards showing:
  - Total groups
  - Total expenses across all groups
  - Link to balance history

**Image Mapping**:
- "viaje" → `/mountain-landscape-bariloche.jpg`
- "cumpleaños", "cena" → `/birthday-dinner-celebration.jpg`
- "departamento", "alquiler" → `/cozy-apartment-living-room.png`
- "universidad", "proyecto" → `/university-project-workspace.jpg`
- Default → `/placeholder.jpg`

---

## 📊 Sample Balance Calculations

With the demo data, here are example balances:

### Viaje a Bariloche
- Total: $467,000 / 3 people = $155,667 per person
- Juan paid: $230,000, should pay: $155,667 → **+$74,333**
- María paid: $165,000, should pay: $155,667 → **+$9,333**
- Carlos paid: $72,000, should pay: $155,667 → **-$83,667**
- ✅ Settlements: Carlos → Juan $74,333, Carlos → María $9,334

### Cena de Cumpleaños
- Total: $115,000 / 4 people = $28,750 per person
- María paid: $0, should pay: $28,750 → **-$28,750**
- Ana paid: $85,000, should pay: $28,750 → **+$56,250**
- Pedro paid: $18,000, should pay: $28,750 → **-$10,750**
- Laura paid: $12,000, should pay: $28,750 → **-$16,750**
- ✅ Settlements: María → Ana $28,750, Pedro → Ana $10,750, Laura → Ana $16,750

### Compartir Departamento
- Total: $208,000 / 2 people = $104,000 per person
- Juan paid: $168,000, should pay: $104,000 → **+$64,000**
- María paid: $40,000, should pay: $104,000 → **-$64,000**
- ✅ Settlements: María → Juan $64,000

---

## 🧪 Testing the Demo Data

### 1. View Groups
```bash
curl http://localhost:3000/api/groups | jq
```

### 2. View Contacts
```bash
curl http://localhost:3000/api/contacts | jq
```

### 3. View Group Details
```bash
curl http://localhost:3000/api/groups/group-1 | jq
```

### 4. View Group Balance
```bash
curl http://localhost:3000/api/groups/group-1/balance | jq
```

### 5. View Statistics
```bash
# By person
curl "http://localhost:3000/api/groups/group-1/statistics?type=person" | jq

# By category
curl "http://localhost:3000/api/groups/group-1/statistics?type=category" | jq

# By month
curl "http://localhost:3000/api/groups/group-1/statistics?type=month" | jq
```

---

## 📱 UI Components Status

| Component | Mock Data Removed | Uses Real Data | Status |
|-----------|-------------------|----------------|--------|
| `dashboard.tsx` | ✅ | ✅ | Complete |
| `contacts-management.tsx` | ✅ (Phase 6) | ✅ | Complete |
| `groups-management.tsx` | ✅ (Phase 6) | ✅ | Complete |
| `add-expense-modal.tsx` | ⏳ | ⏳ | Needs props |
| `balance-history-modal.tsx` | ⏳ | ⏳ | Needs props |

**Note**: Modals like `add-expense-modal` and `balance-history-modal` need to receive data as props from their parent components (e.g., group detail page). They currently have mock data for standalone preview purposes.

---

## 🎨 Visual Improvements

### Dashboard Now Shows:

1. **Real Groups Grid**:
   - Actual group names from database
   - Real member counts
   - Actual expense counts
   - Dynamic images based on group type
   - Date ranges from actual timestamps

2. **Quick Stats**:
   - Total groups count
   - Total expenses across all groups
   - Link to detailed history

3. **Loading States**:
   - Skeleton placeholders while data loads
   - Smooth transitions

4. **Empty States**:
   - Friendly message when no groups exist
   - Call-to-action to create first group

---

## 🔮 Future Enhancements

### Short Term
- [ ] Calculate real balances in dashboard (use `useGroupBalance` hook)
- [ ] Update `add-expense-modal` to receive group members as props
- [ ] Update `balance-history-modal` to use real balance data
- [ ] Add expense detail modal using real data
- [ ] Create group detail page using real data

### Long Term
- [ ] Add currency conversion display in UI
- [ ] Show settlement suggestions in dashboard
- [ ] Add charts for expense statistics
- [ ] Implement filtering and search
- [ ] Add date range selectors

---

## 📊 Data Model Consistency

The demo database follows the exact schema defined in the specification:

✅ **Contacts**:
```typescript
{
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  createdAt: number
}
```

✅ **Groups**:
```typescript
{
  id: string
  name: string
  description?: string
  baseCurrency: CurrencyCode
  members: string[]  // Contact IDs
  expenses: Expense[]
  createdAt: number
  updatedAt: number
}
```

✅ **Expenses**:
```typescript
{
  id: string
  description: string
  amount: number
  currency: CurrencyCode
  convertedAmount: number
  category?: string
  payer: string  // Contact ID
  participants: string[]  // Contact IDs
  date: number
  createdAt: number
  updatedAt: number
}
```

---

## ✨ Summary

**Created**:
- ✅ 6 realistic contacts
- ✅ 4 diverse groups (travel, birthday, university, apartment)
- ✅ 15 expenses with various categories
- ✅ Total of $849,000 ARS in expenses
- ✅ Timestamps for realistic date ordering

**Updated**:
- ✅ Dashboard component to use real data
- ✅ Removed all mock data from dashboard
- ✅ Added loading and empty states
- ✅ Dynamic image selection based on group names
- ✅ Real member and expense counts

**Result**:
- 🎯 Fully functional dashboard with demo data
- 🚀 Ready for testing and demonstration
- 📱 Professional-looking UI with real content
- ✅ Type-safe throughout

---

**Demo Database Status**: ✅ **READY FOR USE**

Start the dev server and visit `http://localhost:3000` to see the demo data in action! 🎉

