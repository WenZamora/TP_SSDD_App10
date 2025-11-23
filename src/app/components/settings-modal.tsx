'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Label } from "@/app/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { UserCircle, Users, Key, Search, Trash2, UserPlus } from 'lucide-react'
import { useToast } from "@/app/hooks/use-toast"
import { useContacts, useCreateContact, useDeleteContact } from '@/app/hooks/useContacts'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { id: string; name: string }
  onUpdateUser: (name: string) => void
}

export function SettingsModal({ open, onOpenChange, user, onUpdateUser }: SettingsModalProps) {
  const [newName, setNewName] = useState(user.name)
  const [newFriendName, setNewFriendName] = useState('')
  const [newFriendEmail, setNewFriendEmail] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [groupCode, setGroupCode] = useState('')
  const { toast } = useToast()
  
  const { data: contacts = [], isLoading } = useContacts()
  const createContact = useCreateContact()
  const deleteContact = useDeleteContact()
  
  useEffect(() => {
    setNewName(user.name)
  }, [user.name])

  const handleSaveName = () => {
    if (newName.trim()) {
      onUpdateUser(newName.trim())
      toast({
        title: 'Nombre actualizado',
        description: 'Tu nombre ha sido actualizado correctamente',
      })
    }
  }

  const handleAddFriend = async () => {
    if (newFriendName.trim() && newFriendEmail.trim()) {
      try {
        await createContact.mutateAsync({
          name: newFriendName.trim(),
          email: newFriendEmail.trim()
        })
        setNewFriendName('')
        setNewFriendEmail('')
        toast({
          title: 'Contacto añadido',
          description: `${newFriendName} ha sido añadido a tus contactos`,
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'No se pudo añadir el contacto',
          variant: 'destructive'
        })
      }
    }
  }

  const handleRemoveFriend = async (id: string, name: string) => {
    try {
      await deleteContact.mutateAsync(id)
      toast({
        title: 'Contacto eliminado',
        description: `${name} ha sido eliminado de tus contactos`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el contacto. Puede estar en uso en algún grupo.',
        variant: 'destructive'
      })
    }
  }

  const handleJoinGroup = () => {
    if (groupCode.trim()) {
      toast({
        title: 'Uniéndose al grupo',
        description: `Procesando código: ${groupCode}`,
      })
      setGroupCode('')
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Configuración de Usuario</DialogTitle>
          <DialogDescription>
            Gestiona tu perfil, contactos y grupos
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="personal" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal" className="gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
            <TabsTrigger value="friends" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Amigos</span>
            </TabsTrigger>
            <TabsTrigger value="join" className="gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">Unirse</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Datos Personales</CardTitle>
                <CardDescription>
                  Actualiza tu información personal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ID de Usuario (Temporal)</Label>
                  <Input value={user.id} disabled className="bg-muted" />
                  <p className="text-xs text-muted-foreground">
                    Este ID es único y se genera automáticamente
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-name">Nombre de Usuario / Alias</Label>
                  <Input
                    id="new-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>

                <Button onClick={handleSaveName} className="w-full">
                  Guardar Cambios
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="friends" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Mis Amigos / Contactos</CardTitle>
                <CardDescription>
                  Gestiona tu lista de contactos para compartir gastos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar Amigo</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Buscar por nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Cargando...
                    </p>
                  ) : filteredContacts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No se encontraron contactos
                    </p>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-xs text-muted-foreground">{contact.email}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFriend(contact.id, contact.name)}
                          className="text-destructive hover:text-destructive"
                          disabled={deleteContact.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Label htmlFor="new-friend">Añadir Nuevo Contacto</Label>
                  <div className="space-y-2">
                    <Input
                      id="new-friend"
                      placeholder="Nombre del contacto"
                      value={newFriendName}
                      onChange={(e) => setNewFriendName(e.target.value)}
                    />
                    <Input
                      id="new-friend-email"
                      type="email"
                      placeholder="Email del contacto"
                      value={newFriendEmail}
                      onChange={(e) => setNewFriendEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
                    />
                    <Button 
                      onClick={handleAddFriend} 
                      className="w-full gap-2"
                      disabled={!newFriendName.trim() || !newFriendEmail.trim() || createContact.isPending}
                    >
                      <UserPlus className="h-4 w-4" />
                      Añadir Contacto
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Unirse a un Grupo por Código</CardTitle>
                <CardDescription>
                  Ingresa el código del grupo para unirte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-code">Código de Grupo</Label>
                  <Input
                    id="group-code"
                    placeholder="Ej: ABC123XYZ"
                    value={groupCode}
                    onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono tracking-wider"
                  />
                  <p className="text-sm text-muted-foreground">
                    Pide al creador del grupo que comparta el código de invitación
                  </p>
                </div>

                <Button 
                  onClick={handleJoinGroup} 
                  className="w-full"
                  disabled={!groupCode.trim()}
                >
                  Unirse al Grupo
                </Button>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">¿Cómo funciona?</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Solicita el código al administrador del grupo</li>
                    <li>Ingresa el código en el campo superior</li>
                    <li>Haz clic en "Unirse al Grupo" para confirmar</li>
                    <li>Aparecerás automáticamente en el grupo</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
