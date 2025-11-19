'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Users, Calendar, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExpenseSplitModalProps {
  isOpen: boolean
  onClose: () => void
  expense: {
    id: string
    description: string
    amount: number
    currency: string
    payers: string[]
    date: string
    participants: number
  } | null
  baseCurrency: string
}

// Mock participants - in real app this would come from the activity's participant list
const mockParticipants = [
  { id: '1', name: 'Juan' },
  { id: '2', name: 'María' },
  { id: '3', name: 'Pedro' },
  { id: '4', name: 'Ana' },
  { id: '5', name: 'Carlos' },
]

export function ExpenseSplitModal({ isOpen, onClose, expense, baseCurrency }: ExpenseSplitModalProps) {
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal')
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({})
  const [hasCustomAmount, setHasCustomAmount] = useState<Record<string, boolean>>({})

  if (!expense) return null

  const handleCustomAmountChange = (participantId: string, value: string) => {
    setCustomAmounts(prev => ({ ...prev, [participantId]: value }))
  }

  const handleToggleCustom = (participantId: string, checked: boolean) => {
    setHasCustomAmount(prev => ({ ...prev, [participantId]: checked }))
    if (!checked) {
      // Clear custom amount when switching to equal
      setCustomAmounts(prev => {
        const newAmounts = { ...prev }
        delete newAmounts[participantId]
        return newAmounts
      })
    }
  }

  const calculateEqualSplit = () => {
    return (expense.amount / expense.participants).toFixed(2)
  }

  const calculateTotalCustom = () => {
    const participants = mockParticipants.slice(0, expense.participants)
    let totalCustom = 0
    
    participants.forEach(p => {
      if (hasCustomAmount[p.id]) {
        totalCustom += parseFloat(customAmounts[p.id] || '0')
      }
    })
    
    return totalCustom
  }

  const calculateDynamicEqualSplit = () => {
    const participants = mockParticipants.slice(0, expense.participants)
    const customParticipantsCount = Object.values(hasCustomAmount).filter(Boolean).length
    const equalParticipantsCount = participants.length - customParticipantsCount
    
    if (equalParticipantsCount === 0) return 0
    
    const totalCustomAmount = calculateTotalCustom()
    const remainingAmount = expense.amount - totalCustomAmount
    
    return remainingAmount / equalParticipantsCount
  }

  const isValidSplit = () => {
    if (splitType === 'equal') return true
    
    const participants = mockParticipants.slice(0, expense.participants)
    let total = 0
    
    participants.forEach(p => {
      if (hasCustomAmount[p.id]) {
        total += parseFloat(customAmounts[p.id] || '0')
      } else {
        total += calculateDynamicEqualSplit()
      }
    })
    
    return Math.abs(total - expense.amount) < 0.01
  }

  const handleSave = () => {
    // Here you would save the split configuration
    console.log('[v0] Saving expense split:', { 
      expenseId: expense.id, 
      splitType, 
      customAmounts: splitType === 'custom' ? customAmounts : null,
      hasCustomAmount: splitType === 'custom' ? hasCustomAmount : null
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">División de Gasto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Expense Summary */}
          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-foreground">{expense.description}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(expense.date).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{expense.participants} participantes</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">Pagó:</span>
                    {expense.payers.map((payer, index) => (
                      <Badge key={index} variant="secondary">{payer}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-foreground">
                    {expense.amount.toFixed(2)}
                  </div>
                  <Badge variant="outline" className="mt-1">{expense.currency}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Split Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Tipo de División</Label>
            <RadioGroup value={splitType} onValueChange={(value: 'equal' | 'custom') => setSplitType(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="equal" id="equal" />
                <Label htmlFor="equal" className="flex-1 cursor-pointer">
                  <div className="font-medium text-foreground">División Equitativa</div>
                  <div className="text-sm text-muted-foreground">
                    Cada participante paga {calculateEqualSplit()} {expense.currency}
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="flex-1 cursor-pointer">
                  <div className="font-medium text-foreground">División Personalizada</div>
                  <div className="text-sm text-muted-foreground">
                    Define manualmente cuánto paga cada persona
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Participants List */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-foreground">Participantes</Label>
            {splitType === 'custom' && (
              <p className="text-sm text-muted-foreground">
                Selecciona qué participantes tendrán un monto personalizado. Los demás se dividirán equitativamente.
              </p>
            )}
            <div className="space-y-2">
              {mockParticipants.slice(0, expense.participants).map((participant) => {
                const equalAmount = calculateEqualSplit()
                const dynamicEqualAmount = calculateDynamicEqualSplit()
                const customAmount = customAmounts[participant.id] || ''
                const isCustom = hasCustomAmount[participant.id]
                
                return (
                  <Card key={participant.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          {splitType === 'custom' && (
                            <Checkbox
                              id={`custom-${participant.id}`}
                              checked={isCustom}
                              onCheckedChange={(checked) => handleToggleCustom(participant.id, checked as boolean)}
                            />
                          )}
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold">
                            {participant.name[0]}
                          </div>
                          <div>
                            <span className="font-medium text-foreground">{participant.name}</span>
                            {splitType === 'custom' && (
                              <div className="text-xs text-muted-foreground">
                                {isCustom ? 'Monto personalizado' : 'División equitativa'}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {splitType === 'equal' ? (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-lg font-bold text-foreground">
                              {equalAmount}
                            </span>
                            <span className="text-sm text-muted-foreground">{expense.currency}</span>
                          </div>
                        ) : isCustom ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={customAmount}
                              onChange={(e) => handleCustomAmountChange(participant.id, e.target.value)}
                              className="w-32 text-right"
                            />
                            <span className="text-sm text-muted-foreground w-12">{expense.currency}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="text-lg font-bold text-foreground">
                              {dynamicEqualAmount > 0 ? dynamicEqualAmount.toFixed(2) : '0.00'}
                            </span>
                            <span className="text-sm text-muted-foreground">{expense.currency}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Custom Split Summary */}
          {splitType === 'custom' && (
            <Card className={cn(
              "border-2",
              isValidSplit() 
                ? "border-success bg-success/5" 
                : "border-destructive bg-destructive/5"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-foreground">Validación de División</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {isValidSplit() 
                        ? 'La división está equilibrada correctamente' 
                        : 'Los montos no coinciden con el total del gasto'
                      }
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-2xl font-bold",
                      isValidSplit() ? "text-success" : "text-destructive"
                    )}>
                      {isValidSplit() ? '✓' : '✗'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {Object.values(hasCustomAmount).filter(Boolean).length} personalizados<br />
                      {expense.participants - Object.values(hasCustomAmount).filter(Boolean).length} equitativos
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={splitType === 'custom' && !isValidSplit()}
          >
            Guardar División
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
