'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Users, Trash2, Plus, UserPlus, Search } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface GroupsManagementProps {
  baseCurrency: string
}

// Mock data for friend groups
const mockGroups = [
  { id: '1', name: 'Amigos de la Universidad', members: ['Juan', 'María', 'Pedro', 'Ana'] },
  { id: '2', name: 'Compañeros de Trabajo', members: ['Carlos', 'Laura', 'Miguel'] },
  { id: '3', name: 'Familia', members: ['Mamá', 'Papá', 'Hermano'] },
]

const mockAvailableContacts = [
  { id: '1', name: 'María González', email: 'maria@email.com' },
  { id: '2', name: 'Carlos Rodríguez', email: 'carlos@email.com' },
  { id: '3', name: 'Ana Martínez', email: 'ana@email.com' },
  { id: '4', name: 'Pedro Fernández', email: 'pedro@email.com' },
  { id: '5', name: 'Laura Sánchez', email: 'laura@email.com' },
  { id: '6', name: 'Miguel Torres', email: 'miguel@email.com' },
  { id: '7', name: 'Juan Pérez', email: 'juan@email.com' },
]

export function GroupsManagement({ baseCurrency }: GroupsManagementProps) {
  const [groups, setGroups] = useState(mockGroups)
  const [newGroupName, setNewGroupName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [isAddingMembers, setIsAddingMembers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      setGroups([...groups, {
        id: Date.now().toString(),
        name: newGroupName,
        members: []
      }])
      setNewGroupName('')
      setIsCreating(false)
    }
  }

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId))
  }

  const handleOpenAddMembers = (groupId: string) => {
    setSelectedGroupId(groupId)
    setIsAddingMembers(true)
    setSearchQuery('')
    setSelectedMembers([])
  }

  const toggleMemberSelection = (memberName: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberName)
        ? prev.filter(m => m !== memberName)
        : [...prev, memberName]
    )
  }

  const handleConfirmAddMembers = () => {
    if (selectedGroupId && selectedMembers.length > 0) {
      setGroups(groups.map(group => {
        if (group.id === selectedGroupId) {
          const newMembers = [...new Set([...group.members, ...selectedMembers])]
          return { ...group, members: newMembers }
        }
        return group
      }))
      setIsAddingMembers(false)
      setSelectedGroupId(null)
      setSelectedMembers([])
    }
  }

  const getFilteredContacts = () => {
    const currentGroup = groups.find(g => g.id === selectedGroupId)
    const existingMembers = currentGroup?.members || []
    
    return mockAvailableContacts.filter(contact =>
      !existingMembers.includes(contact.name) &&
      (contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
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
              <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleCreateGroup} className="flex-1">
                Crear Grupo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {group.name}
                  </CardTitle>
                  <CardDescription>
                    {group.members.length} miembros
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteGroup(group.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.members.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {group.members.map((member, idx) => (
                    <Badge key={idx} variant="secondary">
                      {member}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No hay miembros en este grupo
                </p>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={() => handleOpenAddMembers(group.id)}
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
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                  const isSelected = selectedMembers.includes(contact.name)

                  return (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary/5 border-primary'
                          : 'bg-card hover:bg-accent'
                      }`}
                      onClick={() => toggleMemberSelection(contact.name)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleMemberSelection(contact.name)}
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
                  {selectedMembers.map((member, idx) => (
                    <Badge key={idx} variant="secondary">
                      {member}
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
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmAddMembers} 
              className="flex-1"
              disabled={selectedMembers.length === 0}
            >
              Añadir {selectedMembers.length > 0 ? `(${selectedMembers.length})` : ''}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
