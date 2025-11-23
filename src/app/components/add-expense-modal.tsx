'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { Checkbox } from "@/app/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group"
import { Plus, X } from 'lucide-react'

interface AddExpenseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  baseCurrency: string
}

const mockMembers = [
  { id: '1', name: 'Juan', initials: 'JU' },
  { id: '2', name: 'María', initials: 'MA' },
  { id: '3', name: 'Pedro', initials: 'PE' },
  { id: '4', name: 'Ana', initials: 'AN' },
  { id: '5', name: 'Carlos', initials: 'CA' },
]

const mockActivities = [
  { id: '1', name: 'Viaje a Bariloche' },
  { id: '2', name: 'Cena de Cumpleaños Ana' },
  { id: '3', name: 'Alquiler Departamento' },
  { id: '4', name: 'Proyecto Final Universidad' },
]

interface Payer {
  id: string
  memberId: string
  amount: string
  currency: string
}

export function AddExpenseModal({ open, onOpenChange, baseCurrency }: AddExpenseModalProps) {
  const [description, setDescription] = useState('')
  const [totalAmount, setTotalAmount] = useState('')
  const [activity, setActivity] = useState('')
  
  const [payers, setPayers] = useState<Payer[]>([
    { id: '1', memberId: '', amount: '', currency: baseCurrency }
  ])
  
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(mockMembers.map(m => m.id))
  
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal')
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({})

  const addPayer = () => {
    setPayers([...payers, { 
      id: Date.now().toString(), 
      memberId: '', 
      amount: '', 
      currency: baseCurrency 
    }])
  }

  const removePayer = (id: string) => {
    if (payers.length > 1) {
      setPayers(payers.filter(p => p.id !== id))
    }
  }

  const updatePayer = (id: string, field: keyof Payer, value: string) => {
    setPayers(payers.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const handleSelectAll = () => {
    if (selectedParticipants.length === mockMembers.length) {
      setSelectedParticipants([])
    } else {
      setSelectedParticipants(mockMembers.map(m => m.id))
    }
  }

  const handleParticipantToggle = (memberId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const calculateSplitAmount = () => {
    if (!totalAmount || selectedParticipants.length === 0) return '0.00'
    return (parseFloat(totalAmount) / selectedParticipants.length).toFixed(2)
  }

  const handleSubmit = () => {
    // TODO: Implement expense submission logic
    // Data available: description, totalAmount, payers, activity,
    // selectedParticipants, splitType, customSplits
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Registrar Nuevo Gasto</DialogTitle>
          <DialogDescription>
            Registra un gasto con uno o varios pagadores y divide entre participantes
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

          {/* Monto Total */}
          <div className="space-y-2">
            <Label htmlFor="totalAmount">Monto Total del Gasto</Label>
            <Input 
              id="totalAmount"
              type="number"
              placeholder="0.00"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
            />
          </div>

          {/* Actividad */}
          <div className="space-y-2">
            <Label htmlFor="activity">Actividad/Salida</Label>
            <Select value={activity} onValueChange={setActivity}>
              <SelectTrigger id="activity">
                <SelectValue placeholder="Selecciona la actividad" />
              </SelectTrigger>
              <SelectContent>
                {mockActivities.map((act) => (
                  <SelectItem key={act.id} value={act.id}>
                    {act.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Pagador(es)</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={addPayer}
              >
                <Plus className="h-4 w-4 mr-1" />
                Añadir Pagador
              </Button>
            </div>
            <div className="space-y-3">
              {payers.map((payer, index) => (
                <div key={payer.id} className="flex gap-3 items-end p-4 border rounded-lg bg-muted/30">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Pagador {index + 1}</Label>
                    <Select 
                      value={payer.memberId} 
                      onValueChange={(val) => updatePayer(payer.id, 'memberId', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona quién pagó" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="text-xs">Monto</Label>
                    <Input 
                      type="number"
                      placeholder="0.00"
                      value={payer.amount}
                      onChange={(e) => updatePayer(payer.id, 'amount', e.target.value)}
                    />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label className="text-xs">Moneda</Label>
                    <Select 
                      value={payer.currency} 
                      onValueChange={(val) => updatePayer(payer.id, 'currency', val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="ARS">ARS</SelectItem>
                        <SelectItem value="BRL">BRL</SelectItem>
                        <SelectItem value="MXN">MXN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {payers.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removePayer(payer.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Participantes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Participantes del Gasto</Label>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedParticipants.length === mockMembers.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {mockMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors">
                  <Checkbox 
                    id={member.id}
                    checked={selectedParticipants.includes(member.id)}
                    onCheckedChange={() => handleParticipantToggle(member.id)}
                  />
                  <Label 
                    htmlFor={member.id}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      {member.initials}
                    </div>
                    <span className="font-medium">{member.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {selectedParticipants.length > 0 && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <Label>Tipo de División</Label>
              <RadioGroup value={splitType} onValueChange={(val) => setSplitType(val as 'equal' | 'custom')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="equal" id="equal" />
                  <Label htmlFor="equal" className="cursor-pointer font-normal">
                    División Equitativa (Partes iguales)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="cursor-pointer font-normal">
                    División Personalizada (Montos individuales)
                  </Label>
                </div>
              </RadioGroup>

              {splitType === 'equal' && totalAmount && (
                <p className="text-sm text-muted-foreground text-center pt-2 border-t">
                  Cada persona pagará: <span className="font-semibold text-foreground">
                    {calculateSplitAmount()} {baseCurrency}
                  </span>
                </p>
              )}

              {splitType === 'custom' && (
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs text-muted-foreground">Ingresa el monto para cada participante:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedParticipants.map((participantId) => {
                      const member = mockMembers.find(m => m.id === participantId)
                      return (
                        <div key={participantId} className="flex items-center gap-2">
                          <Label className="text-sm min-w-[80px]">{member?.name}:</Label>
                          <Input 
                            type="number"
                            placeholder="0.00"
                            value={customSplits[participantId] || ''}
                            onChange={(e) => setCustomSplits({ ...customSplits, [participantId]: e.target.value })}
                            className="h-8"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="flex-1 bg-primary text-primary-foreground">
            Registrar Gasto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
