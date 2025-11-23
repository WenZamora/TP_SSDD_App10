'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Label } from "@/app/components/ui/label"
import { DollarSign } from 'lucide-react'

interface LoginModalProps {
  onLogin: (name: string, email: string) => void
}

export function LoginModal({ onLogin }: LoginModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }
    
    if (!email.trim()) {
      setError('El email es requerido')
      return
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un email válido')
      return
    }
    
    setIsLoading(true)
    try {
      await onLogin(name.trim(), email.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
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
              Bienvenido a App10
            </CardTitle>
            <CardDescription className="mt-2">
              Ingresa tus datos para comenzar a gestionar gastos compartidos
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre Completo *</Label>
              <Input
                id="username"
                placeholder="Ej: Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                disabled={isLoading}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              Si tu email ya está registrado, iniciarás sesión. Si no, se creará tu cuenta automáticamente.
            </p>

            <Button 
              type="submit" 
              className="w-full h-11 text-base"
              disabled={!name.trim() || !email.trim() || isLoading}
            >
              {isLoading ? 'Procesando...' : 'Ingresar / Registrarme'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
