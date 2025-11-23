'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { UserPlus, UserMinus, Search, Mail, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"
import { Skeleton } from "@/app/components/ui/skeleton"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/app/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { toast } from 'sonner'
import { useUser } from '@/app/providers/user-provider'
import { useContacts, useUserContacts, useCreateContact, useAddContactToUser, useRemoveContactFromUser } from '@/app/hooks/useContacts'
import type { Contact } from '@/app/types'

export function ContactsManagement() {
  const { currentUser, isLoading: isLoadingUser } = useUser()
  
  // Get current user's contacts
  const { data: myContacts = [], isLoading: isLoadingMyContacts, error: myContactsError } = useUserContacts(currentUser?.id || null)
  
  // Get all users (for adding new contacts)
  const { data: allUsers = [], isLoading: isLoadingAllUsers } = useContacts()
  
  const createContact = useCreateContact()
  const addContactToUser = useAddContactToUser()
  const removeContactFromUser = useRemoveContactFromUser()
  
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchQueryAdd, setSearchQueryAdd] = useState<string>("")
  const [newContactEmail, setNewContactEmail] = useState<string>("")
  const [contactToRemove, setContactToRemove] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  // Create new user in the system
  const handleCreateNewUser = async () => {
    if (!newContactEmail.trim()) return
    if (!currentUser) return

    try {
      const newUser = await createContact.mutateAsync({
        name: newContactEmail.split("@")[0] || "Contacto nuevo",
        email: newContactEmail
      })
      
      // Automatically add to current user's contacts
      await addContactToUser.mutateAsync({
        userId: currentUser.id,
        contactId: newUser.id
      })
      
      toast.success('Usuario creado y agregado a tus contactos')
      setNewContactEmail("")
      setIsAddDialogOpen(false)
    } catch (err: any) {
      toast.error(err.message || "No se pudo crear el usuario")
    }
  }

  // Add existing user as contact
  const handleAddExistingContact = async (contactId: string) => {
    if (!currentUser) return

    try {
      await addContactToUser.mutateAsync({
        userId: currentUser.id,
        contactId
      })
      
      toast.success('Contacto agregado exitosamente')
    } catch (err: any) {
      toast.error(err.message || "No se pudo agregar el contacto")
    }
  }

  // Remove contact from user's list
  const handleRemoveContact = (contactId: string) => {
    if (!contactId) return
    setContactToRemove(contactId)
  }

  const confirmRemoveContact = async () => {
    if (!contactToRemove || !currentUser) return
    
    console.log('[ContactsManagement] Removing contact:', { userId: currentUser.id, contactId: contactToRemove })
    
    try {
      await removeContactFromUser.mutateAsync({
        userId: currentUser.id,
        contactId: contactToRemove
      })
      console.log('[ContactsManagement] Contact removed successfully')
      toast.success('Contacto eliminado de tu lista')
      setContactToRemove(null)
    } catch (err: any) {
      console.error('[ContactsManagement] Error removing contact:', err)
      toast.error(err.message || "No se pudo eliminar el contacto")
      setContactToRemove(null)
    }
  }

  // Contactos filtrados por búsqueda
  const filteredMyContacts = myContacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Available users to add (not already in contacts and not self)
  const availableUsers = allUsers.filter((user) => 
    user.id !== currentUser?.id && 
    !myContacts.some(c => c.id === user.id) &&
    (user.name.toLowerCase().includes(searchQueryAdd.toLowerCase()) ||
     user.email.toLowerCase().includes(searchQueryAdd.toLowerCase()))
  )

  // Loading state
  if (isLoadingMyContacts || isLoadingUser || !currentUser) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Error state
  if (myContactsError) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Contactos</h2>
          <p className="text-muted-foreground mt-1">Gestiona tus amigos y contactos frecuentes</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar contactos: {myContactsError.message}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Contactos</h2>
        <p className="text-muted-foreground mt-1">Gestiona tus amigos y contactos frecuentes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agregar Contacto</CardTitle>
          <CardDescription>Agrega usuarios existentes o crea uno nuevo</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="w-full h-11"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Buscar o Crear Contacto
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mis Contactos</CardTitle>
              <CardDescription>
                {myContacts.length} contacto{myContacts.length !== 1 ? 's' : ''} en total
              </CardDescription>
            </div>
            <Badge variant="outline">{filteredMyContacts.length} mostrando</Badge>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contactos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMyContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No tienes contactos aún</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comienza agregando contactos para compartir gastos
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Contacto
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMyContacts.map((contact) => {
              const initials = contact.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)

              return (
                <Card key={contact.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-foreground">{contact.name}</h4>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            <span>{contact.email}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveContact(contact.id)}
                        disabled={removeContactFromUser.isPending}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        {removeContactFromUser.isPending ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para agregar contactos */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[600px]">
          <DialogHeader>
            <DialogTitle>Agregar Contacto</DialogTitle>
            <DialogDescription>
              Selecciona un usuario existente o crea uno nuevo
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Crear nuevo usuario */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Crear Nuevo Usuario</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Email del nuevo usuario"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateNewUser()
                    }}
                  />
                  <Button 
                    onClick={handleCreateNewUser}
                    disabled={!newContactEmail.trim() || createContact.isPending}
                  >
                    {createContact.isPending ? 'Creando...' : 'Crear'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Buscar usuarios existentes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Usuarios Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuarios..."
                    value={searchQueryAdd}
                    onChange={(e) => setSearchQueryAdd(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {isLoadingAllUsers ? (
                    <div className="text-center py-4 text-muted-foreground">
                      Cargando usuarios...
                    </div>
                  ) : availableUsers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No hay usuarios disponibles para agregar
                    </div>
                  ) : (
                    availableUsers.map((user) => {
                      const initials = user.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)

                      return (
                        <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddExistingContact(user.id)}
                            disabled={addContactToUser.isPending}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Agregar
                          </Button>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm remove dialog */}
      <AlertDialog open={!!contactToRemove} onOpenChange={(open) => !open && setContactToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              El contacto será eliminado de tu lista, pero el usuario seguirá existiendo en el sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContactToRemove(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveContact}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
