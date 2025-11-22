'use client'

import { useState, useEffect} from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { UserPlus, UserMinus, Search, Mail, Phone } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export function ContactsManagement() {
  // estado de contactos (viene de /api/contacts)
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newContactEmail, setNewContactEmail] = useState<string>("");

  // cargar contactos
  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    try {
      const res = await fetch("/api/contacts");
      if (!res.ok) throw new Error("No se pudieron cargar los contactos");
      const data: Contact[] = await res.json();
      setContacts(data);
    } catch (err) {
      console.error("fetchContacts error", err);
      setContacts([]); // fallback
    }
  }

  // agregar contacto
  const handleAddContact = async () => {
    if (!newContactEmail.trim()) return;

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newContactEmail.split("@")[0] || "Contacto nuevo",
          email: newContactEmail,
          phone: ""
        })
      });

      if (!res.ok) throw new Error("No se pudo crear el contacto");

      const created = await res.json();
      // actualiza el estado local (append)
      setContacts((prev) => [...prev, created]);
      setNewContactEmail("");
    } catch (err) {
      console.error("handleAddContact error", err);
    }
  };

  // eliminar contacto 
  const handleRemoveContact = async (contactId: string) => {
    if (!contactId) return;
    try {
      const res = await fetch(`/api/contacts/${contactId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar el contacto");
      // actualizar estado local
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
    } catch (err) {
      console.error("handleRemoveContact error", err);
    }
  };

  // contactos filtrados por búsqueda
  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

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
