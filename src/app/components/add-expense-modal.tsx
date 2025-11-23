'use client'

import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { useGroup } from '@/app/hooks/useGroups'
import { useContacts } from '@/app/hooks/useContacts'
import { useAddExpense } from '@/app/hooks/useExpenses'
import { useToast } from '@/app/hooks/use-toast'

interface AddExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string | null
  baseCurrency: string
}

export function AddExpenseModal({ open, onOpenChange, groupId, baseCurrency }: AddExpenseModalProps) {
  const { data: group } = useGroup(groupId || '')
  const { data: allContacts = [] } = useContacts()
  const addExpenseMutation = useAddExpense(groupId || '')
  const { toast } = useToast()
  
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [payerId, setPayerId] = useState('')
  const [category, setCategory] = useState<string>('Other')
  
  // Get members from the group
  const members = useMemo(() => {
    if (!group || !allContacts.length) return []
    return group.members.map(memberId => {
      const contact = allContacts.find(c => c.id === memberId)
      return contact ? {
        id: contact.id,
        name: contact.name,
        initials: contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      } : null
    }).filter(Boolean) as Array<{ id: string; name: string; initials: string }>
  }, [group, allContacts])
  
  // Category options
  const categoryOptions = [
    { value: 'Food', label: 'Comida', icon: '🍽️' },
    { value: 'Transport', label: 'Transporte', icon: '🚗' },
    { value: 'Accommodation', label: 'Alojamiento', icon: '🏨' },
    { value: 'Entertainment', label: 'Entretenimiento', icon: '🎉' },
    { value: 'Shopping', label: 'Compras', icon: '🛍️' },
    { value: 'Health', label: 'Salud', icon: '💊' },
    { value: 'Education', label: 'Educación', icon: '📚' },
    { value: 'Utilities', label: 'Servicios', icon: '💡' },
    { value: 'Other', label: 'Otro', icon: '📦' },
    { value: 'General', label: 'General', icon: '📋' },
  ]
  
  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setDescription('')
      setAmount('')
      setPayerId('')
      setCategory('Other')
    }
  }, [open])

  const handleSubmit = async () => {
    // Validation
    if (!description.trim()) {
      toast({
        title: "Error",
        description: "La descripción es requerida",
        variant: "destructive",
      })
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "El monto debe ser mayor a 0",
        variant: "destructive",
      })
      return
    }

    if (!payerId) {
      toast({
        title: "Error",
        description: "Debe seleccionar quién pagó el gasto",
        variant: "destructive",
      })
      return
    }

    if (!category) {
      toast({
        title: "Error",
        description: "Debe seleccionar una categoría",
        variant: "destructive",
      })
      return
    }

    try {
      await addExpenseMutation.mutateAsync({
        description: description.trim(),
        amount: parseFloat(amount),
        payer: payerId,
        category: category,
        date: Date.now(),
      })

      toast({
        title: "Éxito",
        description: "Gasto registrado correctamente",
      })

      // Reset form
      setDescription('')
      setAmount('')
      setPayerId('')
      setCategory('Other')
      
      onOpenChange(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el gasto",
        variant: "destructive",
      })
    }
  }
  
  if (!group) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Registrar Nuevo Gasto</DialogTitle>
          <DialogDescription>
            Registra un gasto para el grupo {group.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Input 
              id="description"
              placeholder="Ej: Cena en restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="amount">Monto ({baseCurrency})</Label>
            <Input 
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>

          {/* Pagador */}
          <div className="space-y-2">
            <Label htmlFor="payer">¿Quién pagó?</Label>
            <Select value={payerId} onValueChange={setPayerId}>
              <SelectTrigger id="payer">
                <SelectValue placeholder="Selecciona quién pagó" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1" 
            disabled={addExpenseMutation.isPending}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1 bg-primary text-primary-foreground" 
            disabled={addExpenseMutation.isPending}
          >
            {addExpenseMutation.isPending ? 'Guardando...' : 'Registrar Gasto'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
