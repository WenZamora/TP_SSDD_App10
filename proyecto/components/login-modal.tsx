'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { DollarSign } from 'lucide-react'

interface LoginModalProps {
  onLogin: (name: string, email?: string, phone?: string) => void
}

export function LoginModal({ onLogin }: LoginModalProps) {
  const [name, setName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onLogin(name.trim(), isRegistering ? email : undefined, isRegistering ? phone : undefined)
    }
  }

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <DollarSign className="h-9 w-9 text-primary-foreground" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">
              {isRegistering ? 'Registro - Administrador de Gastos' : 'Bienvenido al Administrador de Gastos'}
            </CardTitle>
            <CardDescription className="mt-2">
              {isRegistering 
                ? 'Completa tus datos básicos para crear tu cuenta'
                : 'Ingresa tu nombre para comenzar a gestionar gastos compartidos'
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario / Alias *</Label>
              <Input
                id="username"
                placeholder="Ej: Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="h-11"
              />
            </div>

            {isRegistering && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+54 9 11 1234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11"
                  />
                </div>
              </>
            )}

            <p className="text-xs text-muted-foreground">
              Tu ID será generado automáticamente y guardado localmente
            </p>

            <Button 
              type="submit" 
              className="w-full h-11 text-base"
              disabled={!name.trim()}
            >
              {isRegistering ? 'Crear Cuenta' : 'Ingresar / Crear ID Temporal'}
            </Button>

            <Button 
              type="button"
              variant="outline"
              className="w-full h-11 text-base"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Volver a Ingreso Rápido' : 'Registrarme con Datos Básicos'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
