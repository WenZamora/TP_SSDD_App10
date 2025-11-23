'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Calendar, Plus, X } from 'lucide-react'

interface CreateActivityModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const mockGroups = [
  { id: '1', name: 'Amigos de la Universidad', members: ['Juan', 'María', 'Pedro', 'Ana'] },
  { id: '2', name: 'Compañeros de Trabajo', members: ['Carlos', 'Laura', 'Miguel'] },
  { id: '3', name: 'Familia', members: ['Mamá', 'Papá', 'Hermano'] },
]

const mockFriends = [
  { id: '1', name: 'Roberto' },
  { id: '2', name: 'Sofia' },
  { id: '3', name: 'Diego' },
  { id: '4', name: 'Valentina' },
]

export function CreateActivityModal({ open, onOpenChange }: CreateActivityModalProps) {
  const [activityName, setActivityName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])
  const [additionalParticipants, setAdditionalParticipants] = useState<string[]>([])
  const [searchFriend, setSearchFriend] = useState('')

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId)
    const group = mockGroups.find(g => g.id === groupId)
    if (group) {
      setSelectedParticipants(group.members)
    }
  }

  const handleParticipantToggle = (participant: string) => {
    setSelectedParticipants(prev =>
      prev.includes(participant)
        ? prev.filter(p => p !== participant)
        : [...prev, participant]
    )
  }

  const handleAddIndividualParticipant = (friendName: string) => {
    if (!additionalParticipants.includes(friendName) && !selectedParticipants.includes(friendName)) {
      setAdditionalParticipants(prev => [...prev, friendName])
      setSearchFriend('')
    }
  }

  const handleRemoveAdditionalParticipant = (friendName: string) => {
    setAdditionalParticipants(prev => prev.filter(p => p !== friendName))
  }

  const handleSubmit = () => {
    // TODO: Implement activity creation logic
    // Data to submit: activityName, description, startDate, endDate,
    // selectedGroup, selectedParticipants, additionalParticipants
    onOpenChange(false)
    // Reset form
    setActivityName('')
    setDescription('')
    setStartDate('')
    setEndDate('')
    setSelectedGroup('')
    setSelectedParticipants([])
    setAdditionalParticipants([])
  }

  const currentGroup = mockGroups.find(g => g.id === selectedGroup)
  const filteredFriends = mockFriends.filter(f => 
    f.name.toLowerCase().includes(searchFriend.toLowerCase()) &&
    !additionalParticipants.includes(f.name) &&
    !selectedParticipants.includes(f.name)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Crear Nueva Actividad/Salida</DialogTitle>
          <DialogDescription>
            Define una nueva actividad o salida donde registrarás gastos compartidos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nombre de la Actividad */}
          <div className="space-y-2">
            <Label htmlFor="activityName">Nombre de la Actividad</Label>
            <Input
              id="activityName"
              placeholder="Ej: Viaje a la playa, Cena de cumpleaños"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe brevemente la actividad"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha de Inicio
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">
                <Calendar className="h-4 w-4 inline mr-1" />
                Fecha de Fin (opcional)
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Seleccionar Grupo Base */}
          <div className="space-y-2">
            <Label htmlFor="group">Seleccionar Grupo Base (opcional)</Label>
            <Select value={selectedGroup} onValueChange={handleGroupChange}>
              <SelectTrigger id="group">
                <SelectValue placeholder="Elige un grupo de amigos existente" />
              </SelectTrigger>
              <SelectContent>
                {mockGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name} ({group.members.length} miembros)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Seleccionar un grupo cargará automáticamente sus miembros como participantes
            </p>
          </div>

          {/* Participantes */}
          {currentGroup && (
            <div className="space-y-3">
              <Label>Participantes del Grupo Base</Label>
              <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-muted/30">
                {currentGroup.members.map((member) => (
                  <div
                    key={member}
                    className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={member}
                      checked={selectedParticipants.includes(member)}
                      onCheckedChange={() => handleParticipantToggle(member)}
                    />
                    <Label
                      htmlFor={member}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {member[0]}
                      </div>
                      <span className="font-medium">{member}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Añadir Participantes Individuales (opcional)</Label>
            <p className="text-xs text-muted-foreground">
              Añade amigos que no pertenezcan al grupo seleccionado
            </p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Buscar amigo..."
                  value={searchFriend}
                  onChange={(e) => setSearchFriend(e.target.value)}
                />
                {searchFriend && filteredFriends.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredFriends.map((friend) => (
                      <button
                        key={friend.id}
                        className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                        onClick={() => handleAddIndividualParticipant(friend.name)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                          {friend.name[0]}
                        </div>
                        <span>{friend.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {additionalParticipants.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
                {additionalParticipants.map((participant) => (
                  <div
                    key={participant}
                    className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    <span>{participant}</span>
                    <button
                      onClick={() => handleRemoveAdditionalParticipant(participant)}
                      className="hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1 bg-secondary text-secondary-foreground"
            disabled={!activityName.trim()}
          >
            Crear Actividad
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
