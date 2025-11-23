'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Badge } from "@/app/components/ui/badge"
import { UserPlus, UserMinus, Search, Mail } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"
import { Skeleton } from "@/app/components/ui/skeleton"
import { Alert, AlertDescription } from "@/app/components/ui/alert"
import { toast } from 'sonner'
import { useContacts, useCreateContact, useDeleteContact } from '@/app/hooks/useContacts'
import type { Contact } from '@/app/types'

export function ContactsManagement() {
  // Use hooks instead of manual state/fetch
  const { data: contacts = [], isLoading, error } = useContacts()
  const createContact = useCreateContact()
  const deleteContact = useDeleteContact()
  
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [newContactEmail, setNewContactEmail] = useState<string>("")

  // agregar contacto
  const handleAddContact = async () => {
    if (!newContactEmail.trim()) return

    try {
      await createContact.mutateAsync({
        name: newContactEmail.split("@")[0] || "Contacto nuevo",
        email: newContactEmail
      })
      
      toast.success('Contacto agregado exitosamente')
      setNewContactEmail("")
    } catch (err: any) {
      toast.error(err.message || "No se pudo crear el contacto")
    }
  }

  // eliminar contacto 
  const handleRemoveContact = async (contactId: string) => {
    if (!contactId) return
    if (!confirm('¿Estás seguro de eliminar este contacto?')) return
    
    try {
      await deleteContact.mutateAsync(contactId)
      toast.success('Contacto eliminado')
    } catch (err: any) {
      // Handle 409 error (contact is member of group)
      if (err.message && err.message.includes('member')) {
        toast.error('No se puede eliminar: el contacto es miembro de uno o más grupos')
      } else {
        toast.error(err.message || "No se pudo eliminar el contacto")
      }
    }
  }

  // contactos filtrados por búsqueda
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Loading state
  if (isLoading) {
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
  if (error) {
    return (
      <div className="p-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Contactos</h2>
          <p className="text-muted-foreground mt-1">Gestiona tus amigos y contactos frecuentes</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Error al cargar contactos: {error.message}
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
          <CardTitle>Agregar Nuevo Contacto</CardTitle>
          <CardDescription>Envía una invitación por email o ID de usuario</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Email o ID de usuario"
              value={newContactEmail}
              onChange={(e) => setNewContactEmail(e.target.value)}
              className="flex-1 h-11"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddContact()
              }}
            />
            <Button 
              onClick={handleAddContact}
              className="h-11 px-6"
              disabled={!newContactEmail.trim() || createContact.isPending}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {createContact.isPending ? 'Agregando...' : 'Agregar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mis Contactos</CardTitle>
              <CardDescription>
                {contacts.length} contacto{contacts.length !== 1 ? 's' : ''} en total
              </CardDescription>
            </div>
            <Badge variant="outline">{filteredContacts.length} mostrando</Badge>
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
          <div className="space-y-3">
            {filteredContacts.map((contact) => {
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
                        disabled={deleteContact.isPending}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        {deleteContact.isPending ? 'Eliminando...' : 'Eliminar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
