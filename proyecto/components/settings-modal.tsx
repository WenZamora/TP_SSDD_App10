'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircle, Users, Key, Search, Trash2, UserPlus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { id: string; name: string }
  onUpdateUser: (name: string) => void
}

// Mock friends data
const mockFriends = [
  { id: '1', name: 'María García' },
  { id: '2', name: 'Carlos López' },
  { id: '3', name: 'Ana Martínez' },
]

export function SettingsModal({ open, onOpenChange, user, onUpdateUser }: SettingsModalProps) {
  const [newName, setNewName] = useState(user.name)
  const [friends, setFriends] = useState(mockFriends)
  const [newFriendName, setNewFriendName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [groupCode, setGroupCode] = useState('')
  const { toast } = useToast()

  const handleSaveName = () => {
    if (newName.trim()) {
      onUpdateUser(newName.trim())
      toast({
        title: 'Nombre actualizado',
        description: 'Tu nombre ha sido actualizado correctamente',
      })
    }
  }

  const handleAddFriend = () => {
    if (newFriendName.trim()) {
      const newFriend = {
        id: `friend_${Date.now()}`,
        name: newFriendName.trim()
      }
      setFriends([...friends, newFriend])
      setNewFriendName('')
      toast({
        title: 'Amigo añadido',
        description: `${newFriend.name} ha sido añadido a tus contactos`,
      })
    }
  }

  const handleRemoveFriend = (id: string) => {
    setFriends(friends.filter(f => f.id !== id))
    toast({
      title: 'Amigo eliminado',
      description: 'El contacto ha sido eliminado',
    })
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

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                  {filteredFriends.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No se encontraron amigos
                    </p>
                  ) : (
                    filteredFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                      >
                        <span className="font-medium">{friend.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFriend(friend.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-4 border-t space-y-3">
                  <Label htmlFor="new-friend">Añadir Nuevo Amigo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-friend"
                      placeholder="Nombre del amigo"
                      value={newFriendName}
                      onChange={(e) => setNewFriendName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
                    />
                    <Button onClick={handleAddFriend} className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Añadir
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    El ID del amigo será generado automáticamente
                  </p>
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
