'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"
import { Camera, Save } from 'lucide-react'

interface ProfilePageProps {
  user: { id: string; name: string }
  onUpdateUser: (name: string) => void
}

export function ProfilePage({ user, onUpdateUser }: ProfilePageProps) {
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState('')

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSave = () => {
    if (name.trim()) {
      onUpdateUser(name.trim())
      // TODO: Add toast notification for profile update success
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Mi Perfil</h2>
        <p className="text-muted-foreground mt-1">Gestiona tu información personal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Foto de Perfil</CardTitle>
          <CardDescription>Actualiza tu imagen de perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                variant="secondary"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Cambiar foto de perfil</p>
              <p className="text-xs text-muted-foreground">
                Formatos soportados: JPG, PNG. Tamaño máximo: 5MB
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Subir Imagen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos Personales</CardTitle>
          <CardDescription>Actualiza tu información básica</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-id">ID de Usuario</Label>
            <Input
              id="user-id"
              value={user.id}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Este ID es único y no se puede modificar
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre / Alias *</Label>
            <Input
              id="name"
              placeholder="Tu nombre o alias"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleSave}
            className="w-full"
            disabled={!name.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
