'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/app/components/ui/alert-dialog"
import { Users, Trash2, Plus, UserPlus, Search, ArrowLeft } from 'lucide-react'
import { Badge } from "@/app/components/ui/badge"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"
import { Skeleton } from "@/app/components/ui/skeleton"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { toast } from 'sonner'
import { useUser } from '@/app/providers/user-provider'
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup } from '@/app/hooks/useGroups'
import { useContacts, useUserContacts } from '@/app/hooks/useContacts'
import { useState } from "react"
import type { Group } from '@/app/types'
import { GroupDetail } from './group-detail'

export function GroupsManagement() {
  // Get current user from context
  const { currentUser, isLoading: isLoadingUser } = useUser()
  
  // Use hooks instead of manual state/fetch
  const { data: groups = [], isLoading: isLoadingGroups, error: groupsError } = useGroups()
  
  // Get user's contacts (for adding members)
  const { data: myContacts = [] } = useUserContacts(currentUser?.id || null)
  
  // Get all users (for displaying member names in groups)
  const { data: allUsers = [] } = useContacts()
  const createGroup = useCreateGroup()
  const updateGroup = useUpdateGroup()
  const deleteGroup = useDeleteGroup()

  const [newGroupName, setNewGroupName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [viewingGroupId, setViewingGroupId] = useState<string | null>(null)
  const [isAddingMembers, setIsAddingMembers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null)

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !currentUser) return
    
    try {
      // Add current user as the first member of the group
      await createGroup.mutateAsync({
        name: newGroupName,
        baseCurrency: "ARS",
        members: [currentUser.id],
        creatorUserId: currentUser.id
      })
      
      toast.success('Grupo creado exitosamente')
      setNewGroupName("")
      setIsCreating(false)
    } catch (error: any) {
      toast.error(error.message || 'No se pudo crear el grupo')
    }
  }


  const handleDeleteGroup = (groupId: string) => {
    setGroupToDelete(groupId)
  }

  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return
    
    try {
      await deleteGroup.mutateAsync(groupToDelete)
      toast.success('Grupo eliminado')
      setGroupToDelete(null)
    } catch (error: any) {
      toast.error(error.message || 'No se pudo eliminar el grupo')
      setGroupToDelete(null)
    }
  }

  const handleOpenAddMembers = (groupId: string) => {
    setSelectedGroupId(groupId)
    setIsAddingMembers(true)
    setSearchQuery('')
    setSelectedMembers([])
  }

  const toggleMemberSelection = (contactId: string) => {
    setSelectedMembers(prev =>
      prev.includes(contactId)
        ? prev.filter(m => m !== contactId)
        : [...prev, contactId]
    )
  }

  const handleConfirmAddMembers = async () => {
    if (!selectedGroupId || selectedMembers.length === 0) return

    const group = groups.find(g => g.id === selectedGroupId)
    if (!group) return

    const updatedMembers = [...new Set([...group.members, ...selectedMembers])]

    try {
      await updateGroup.mutateAsync({
        id: selectedGroupId,
        data: { 
          members: updatedMembers,
          updaterUserId: currentUser.id
        }
      })
      
      toast.success('Miembros añadidos exitosamente')
      setIsAddingMembers(false)
      setSelectedGroupId(null)
      setSelectedMembers([])
    } catch (error: any) {
      toast.error(error.message || 'No se pudieron añadir los miembros')
    }
  }
  
  const getFilteredContacts = () => {
    const currentGroup = groups.find(g => g.id === selectedGroupId)
    const existingMembers = currentGroup?.members || []
    
    // Only show user's contacts that aren't already in the group
    return myContacts.filter(contact =>
      !existingMembers.includes(contact.id) &&
      (contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }

  // Helper function to get user name from ID (uses all users for display)
  const getUserName = (userId: string) => {
    const user = allUsers.find(u => u.id === userId)
    return user ? user.name : null
  }
  
  // Get visible members (only those we can find in allUsers)
  const getVisibleMembers = (memberIds: string[]) => {
    return memberIds
      .map(id => ({ id, name: getUserName(id) }))
      .filter(member => member.name !== null) as Array<{ id: string; name: string }>
  }

  // Get contact name by ID
  const getContactName = (contactId: string) => {
    const contact = myContacts.find(c => c.id === contactId)
    return contact?.name || 'Desconocido'
  }

  // If viewing a specific group, show its detail view
  if (viewingGroupId) {
    const group = groups.find(g => g.id === viewingGroupId)
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => setViewingGroupId(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Grupos
        </Button>
        <GroupDetail 
          groupId={viewingGroupId} 
          baseCurrency={group?.baseCurrency || 'USD'} 
        />
      </div>
    )
  }

  // Loading state
  if (isLoadingGroups || isLoadingUser || !currentUser) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (groupsError) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Grupos</h2>
          <p className="text-muted-foreground mt-1">Organiza a tus amigos en grupos para facilitar la creación de actividades</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar grupos: {groupsError.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Grupos</h2>
          <p className="text-muted-foreground mt-1">Organiza a tus amigos en grupos para facilitar la creación de actividades</p>
        </div>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Crear Nuevo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Grupo</DialogTitle>
              <DialogDescription>
                Ingresa un nombre para tu nuevo grupo de amigos
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Nombre del Grupo</Label>
                <Input 
                  id="groupName"
                  placeholder="Ej: Amigos del gimnasio"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsCreating(false)} 
                className="flex-1"
                disabled={createGroup.isPending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateGroup} 
                className="flex-1"
                disabled={createGroup.isPending || !newGroupName.trim()}
              >
                {createGroup.isPending ? 'Creando...' : 'Crear Grupo'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card 
            key={group.id ?? `${group.name}-${Math.random()}`} 
            className="hover:shadow-md transition-all cursor-pointer"
            onClick={() => setViewingGroupId(group.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {group.name}
                  </CardTitle>
                  <CardDescription>
                    {group.members?.length ?? 0} miembros
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteGroup(group.id)
                  }}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >         
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const visibleMembers = getVisibleMembers(group.members || [])
                return visibleMembers.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {visibleMembers.map((member) => (
                      <Badge key={member.id} variant="secondary">
                        {member.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    No hay miembros en este grupo
                  </p>
                )
              })()}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenAddMembers(group.id)
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Añadir Miembros
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isAddingMembers} onOpenChange={setIsAddingMembers}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Añadir Miembros al Grupo</DialogTitle>
            <DialogDescription>
              Selecciona los contactos que deseas agregar a este grupo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contactos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {getFilteredContacts().length > 0 ? (
                getFilteredContacts().map((contact) => {
                  const initials = contact.name
                    .split(' ')
                    .map((n : string) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                  const isSelected = selectedMembers.includes(contact.id)

                  return (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/5 border-primary'
                          : 'bg-card hover:bg-accent'
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMemberSelection(contact.id)}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No se encontraron contactos' : 'No hay contactos disponibles'}
                </div>
              )}
            </div>

            {selectedMembers.length > 0 && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Seleccionados ({selectedMembers.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedMembers.map((memberId, idx) => (
                    <Badge key={idx} variant="secondary">
                      {getContactName(memberId)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsAddingMembers(false)} 
              className="flex-1"
              disabled={updateGroup.isPending}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmAddMembers} 
              className="flex-1"
              disabled={selectedMembers.length === 0 || updateGroup.isPending}
            >
              {updateGroup.isPending ? 'Añadiendo...' : `Añadir ${selectedMembers.length > 0 ? `(${selectedMembers.length})` : ''}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!groupToDelete} onOpenChange={(open) => !open && setGroupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar este grupo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El grupo y todos sus datos asociados serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setGroupToDelete(null)}>
              No
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteGroup}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
