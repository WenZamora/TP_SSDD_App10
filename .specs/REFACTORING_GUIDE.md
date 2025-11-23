# Component Refactoring Guide

**Purpose**: Guide for refactoring existing components to use TanStack Query hooks  
**Target Components**: 2 components with direct fetch calls identified  
**Status**: Ready for implementation

## 📋 Audit Summary

### Components Analyzed: 18
- **With direct fetch calls**: 2 ✅
  - `groups-management.tsx` (328 lines) - 3 fetch calls
  - `contacts-management.tsx` (198 lines) - 3 fetch calls
  
- **Without fetch calls**: 16 ✅
  - Already compatible or don't need refactoring

### Fetch Patterns Found

1. **Initial data loading** (useEffect + useState)
2. **Create operations** (POST requests)
3. **Update operations** (PUT requests)
4. **Delete operations** (DELETE requests)

## 🎯 Refactoring Strategy

### Pattern 1: Replace useEffect + useState with useQuery

**❌ BEFORE** (Old Pattern):
```typescript
const [data, setData] = useState([])

useEffect(() => {
  async function load() {
    const res = await fetch("/api/endpoint")
    const data = await res.json()
    setData(data)
  }
  load()
}, [])
```

**✅ AFTER** (With Hook):
```typescript
import { useGroups } from '@/app/hooks/useGroups'

const { data, isLoading, error } = useGroups()

// Add loading state:
if (isLoading) return <Skeleton />
if (error) return <Alert>Error: {error.message}</Alert>
```

### Pattern 2: Replace Manual POST with useMutation

**❌ BEFORE** (Manual fetch):
```typescript
const handleCreate = async () => {
  const res = await fetch('/api/endpoint', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  const created = await res.json()
  setItems([...items, created]) // Manual state update
}
```

**✅ AFTER** (With Mutation Hook):
```typescript
import { useCreateGroup } from '@/app/hooks/useGroups'

const createGroup = useCreateGroup()

const handleCreate = async () => {
  try {
    await createGroup.mutateAsync(data)
    toast.success('Creado exitosamente') // Better UX
  } catch (error) {
    toast.error(error.message) // Automatic error handling
  }
}

// Button with loading state:
<Button disabled={createGroup.isPending}>
  {createGroup.isPending ? 'Creando...' : 'Crear'}
</Button>
```

### Pattern 3: Replace Manual DELETE with useMutation

**❌ BEFORE**:
```typescript
const handleDelete = (id: string) => {
  setItems(items.filter(item => item.id !== id)) // No API call!
}
```

**✅ AFTER**:
```typescript
const deleteGroup = useDeleteGroup()

const handleDelete = async (id: string) => {
  if (confirm('¿Estás seguro?')) {
    try {
      await deleteGroup.mutateAsync(id)
      toast.success('Eliminado')
    } catch (error) {
      toast.error(error.message)
    }
  }
}
```

## 📁 Component-Specific Refactoring

### 1. groups-management.tsx

**Current Issues**:
- 3 manual fetch calls
- No loading states
- No error handling
- Manual state updates
- Delete doesn't call API

**Refactoring Steps**:

1. **Import hooks**:
```typescript
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/app/hooks/useGroups'
import { useContacts } from '@/app/hooks/useContacts'
import { toast } from 'sonner'
```

2. **Replace state with hooks**:
```typescript
// REMOVE:
const [groups, setGroups] = useState<Group[]>([])
const [contacts, setContacts] = useState<any[]>([])
useEffect(() => { /* fetch logic */ }, [])

// ADD:
const { data: groups = [], isLoading } = useGroups()
const { data: contacts = [] } = useContacts()
```

3. **Add loading states**:
```typescript
if (isLoading) {
  return (
    <div className="p-8 space-y-6">
      <Skeleton className="h-12 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    </div>
  )
}
```

4. **Replace handleCreateGroup**:
```typescript
// REMOVE manual fetch

// ADD:
const createGroup = useCreateGroup()

const handleCreateGroup = async () => {
  if (!newGroupName.trim()) return
  
  try {
    await createGroup.mutateAsync({
      name: newGroupName,
      baseCurrency: "ARS",
      members: []
    })
    
    toast.success('Grupo creado exitosamente')
    setNewGroupName("")
    setIsCreating(false)
  } catch (error) {
    toast.error(error.message)
  }
}
```

5. **Replace handleDeleteGroup**:
```typescript
const deleteGroup = useDeleteGroup()

const handleDeleteGroup = async (groupId: string) => {
  if (!confirm('¿Eliminar este grupo?')) return
  
  try {
    await deleteGroup.mutateAsync(groupId)
    toast.success('Grupo eliminado')
  } catch (error) {
    toast.error(error.message)
  }
}
```

6. **Replace handleConfirmAddMembers**:
```typescript
const updateGroup = useUpdateGroup()

const handleConfirmAddMembers = async () => {
  if (!selectedGroupId || selectedMembers.length === 0) return

  const group = groups.find(g => g.id === selectedGroupId)
  if (!group) return

  const updatedMembers = [...new Set([...group.members, ...selectedMembers])]

  try {
    await updateGroup.mutateAsync({
      id: selectedGroupId,
      data: { members: updatedMembers }
    })
    
    toast.success('Miembros añadidos exitosamente')
    setIsAddingMembers(false)
    setSelectedGroupId(null)
    setSelectedMembers([])
  } catch (error) {
    toast.error(error.message)
  }
}
```

### 2. contacts-management.tsx

**Current Issues**:
- 3 manual fetch calls
- No loading states
- Basic error handling (console.error only)
- Manual state updates

**Refactoring Steps**:

1. **Import hooks**:
```typescript
import { useContacts, useCreateContact, useDeleteContact } from '@/app/hooks/useContacts'
import { Skeleton } from '@/app/components/ui/skeleton'
import { Alert, AlertDescription } from '@/app/components/ui/alert'
import { toast } from 'sonner'
```

2. **Replace state with hooks**:
```typescript
// REMOVE:
const [contacts, setContacts] = useState<Contact[]>([])
useEffect(() => { fetchContacts() }, [])

// ADD:
const { data: contacts = [], isLoading, error } = useContacts()
```

3. **Add loading/error states**:
```typescript
if (isLoading) {
  return (
    <div className="p-8 space-y-8">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

if (error) {
  return (
    <div className="p-8">
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
}
```

4. **Replace handleAddContact**:
```typescript
const createContact = useCreateContact()

const handleAddContact = async () => {
  if (!newContactEmail.trim()) return

  try {
    await createContact.mutateAsync({
      name: newContactEmail.split("@")[0] || "Contacto nuevo",
      email: newContactEmail,
      phone: ""
    })
    
    toast.success('Contacto agregado exitosamente')
    setNewContactEmail("")
  } catch (error) {
    toast.error(error.message)
  }
}
```

5. **Replace handleRemoveContact**:
```typescript
const deleteContact = useDeleteContact()

const handleRemoveContact = async (contactId: string) => {
  if (!contactId) return
  if (!confirm('¿Eliminar este contacto?')) return
  
  try {
    await deleteContact.mutateAsync(contactId)
    toast.success('Contacto eliminado')
  } catch (error) {
    // Handle 409 error (contact is member of group)
    if (error.message.includes('member')) {
      toast.error('No se puede eliminar: el contacto es miembro de uno o más grupos')
    } else {
      toast.error(error.message)
    }
  }
}
```

6. **Update button states**:
```typescript
<Button 
  onClick={handleAddContact}
  disabled={!newContactEmail.trim() || createContact.isPending}
>
  <UserPlus className="h-4 w-4 mr-2" />
  {createContact.isPending ? 'Agregando...' : 'Agregar'}
</Button>
```

## 🎨 UI Improvements to Add

### 1. Loading Skeletons

```typescript
import { Skeleton } from '@/app/components/ui/skeleton'

if (isLoading) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-48 w-full" />
      ))}
    </div>
  )
}
```

### 2. Error Alerts

```typescript
import { Alert, AlertDescription } from '@/app/components/ui/alert'

if (error) {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Error: {error.message}
      </AlertDescription>
    </Alert>
  )
}
```

### 3. Toast Notifications

```typescript
import { toast } from 'sonner'

// Success
toast.success('Operación exitosa')

// Error
toast.error('Ocurrió un error')

// With description
toast.success('Grupo creado', {
  description: `El grupo "${name}" fue creado exitosamente`
})
```

### 4. Button Loading States

```typescript
<Button disabled={mutation.isPending}>
  {mutation.isPending && <Spinner className="mr-2" />}
  {mutation.isPending ? 'Procesando...' : 'Confirmar'}
</Button>
```

### 5. Empty States

```typescript
{groups.length === 0 ? (
  <div className="text-center py-12">
    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">No hay grupos</h3>
    <p className="text-muted-foreground mb-4">
      Crea tu primer grupo para comenzar
    </p>
    <Button onClick={() => setIsCreating(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Crear Grupo
    </Button>
  </div>
) : (
  // Grid of groups
)}
```

## 📦 Benefits of Refactoring

### 1. Automatic Caching ✅
- No duplicate requests
- Instant data for cached queries
- Background refetching

### 2. Auto Cache Invalidation ✅
- Create/update/delete automatically refresh lists
- Related data updates automatically
- No manual state synchronization needed

### 3. Better UX ✅
- Loading indicators
- Error messages
- Success confirmations
- Disabled buttons during operations

### 4. Less Code ✅
- Remove manual fetch logic
- Remove manual state updates
- Remove useEffect boilerplate

### 5. Better Error Handling ✅
- Automatic error capture
- User-friendly error messages
- Retry logic built-in

### 6. Type Safety ✅
- Full TypeScript support
- Compile-time error checking
- IntelliSense everywhere

## 🔧 Required Imports for Refactored Components

```typescript
// Hooks
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/app/hooks/useGroups'
import { useContacts, useCreateContact, useDeleteContact } from '@/app/hooks/useContacts'

// UI Components
import { Skeleton } from '@/app/components/ui/skeleton'
import { Alert, AlertDescription } from '@/app/components/ui/alert'

// Toast Notifications
import { toast } from 'sonner'

// Types (if needed)
import type { Group, Contact } from '@/app/types'
```

## 📝 Checklist for Each Component

- [ ] Replace `useState` + `useEffect` with `useQuery` hooks
- [ ] Replace manual fetch POST with `useMutation` hooks
- [ ] Replace manual fetch PUT with `useMutation` hooks
- [ ] Replace manual fetch DELETE with `useMutation` hooks
- [ ] Remove manual state updates (`setData([...data, newItem])`)
- [ ] Add loading states with `isLoading`
- [ ] Add error states with `error`
- [ ] Add loading indicators to buttons (`isPending`)
- [ ] Add toast notifications for success/error
- [ ] Add confirmation dialogs for destructive actions
- [ ] Test that automatic cache invalidation works
- [ ] Remove unnecessary `useEffect` dependencies

## 🎯 Summary

### Components to Refactor: 2
1. ✅ `groups-management.tsx` - 328 lines, 3 fetch calls
2. ✅ `contacts-management.tsx` - 198 lines, 3 fetch calls

### Estimated Impact
- **Lines removed**: ~100 lines of boilerplate
- **Lines added**: ~50 lines of hook calls + UI improvements
- **Net savings**: ~50 lines of code
- **Benefits**: Better UX, automatic caching, type safety, less bugs

### Implementation Order
1. Start with `contacts-management.tsx` (simpler)
2. Then `groups-management.tsx` (more complex)
3. Test each refactoring thoroughly
4. Verify automatic cache invalidation works

---

**Note**: This guide provides the complete refactoring strategy. The actual implementation should be done carefully, testing each change to ensure the application continues to work correctly.

