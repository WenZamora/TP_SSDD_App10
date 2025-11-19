'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { UserPlus, UserMinus, Search, Mail, Phone } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const mockContacts = [
  { id: '1', name: 'María González', email: 'maria@email.com', phone: '+54 11 1234-5678' },
  { id: '2', name: 'Carlos Rodríguez', email: 'carlos@email.com', phone: '+54 11 8765-4321' },
  { id: '3', name: 'Ana Martínez', email: 'ana@email.com', phone: '+54 11 5555-6666' },
  { id: '4', name: 'Pedro Fernández', email: 'pedro@email.com', phone: '+54 11 9999-1111' },
]

export function ContactsManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [newContactEmail, setNewContactEmail] = useState('')

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddContact = () => {
    if (newContactEmail.trim()) {
      console.log('[v0] Adding contact:', newContactEmail)
      setNewContactEmail('')
    }
  }

  const handleRemoveContact = (contactId: string) => {
    console.log('[v0] Removing contact:', contactId)
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
              disabled={!newContactEmail.trim()}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar
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
                {mockContacts.length} contacto{mockContacts.length !== 1 ? 's' : ''} en total
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
                          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{contact.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{contact.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveContact(contact.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Eliminar
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
