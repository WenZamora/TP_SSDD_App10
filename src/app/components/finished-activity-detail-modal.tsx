'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Card, CardContent } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Calendar, Users, Star, TrendingUp, TrendingDown, Receipt, ArrowRight, CheckCircle2 } from 'lucide-react'
import { cn } from "@/app/lib/utils"
import { ExpenseSplitModal } from './expense-split-modal'

interface FinishedActivityDetailModalProps {
  isOpen: boolean
  onClose: () => void
  activityId: string | null
  baseCurrency: string
}

// Mock data - in real app this would come from a database query
const getActivityDetails = (activityId: string) => {
  const activities: Record<string, any> = {
    '5': {
      name: 'Viaje a Mendoza',
      balance: 320.00,
      members: 6,
      dateRange: 'Oct 2025',
      rating: 5,
      totalExpenses: 2500.00,
      participants: [
        { id: '1', name: 'Tú', paid: 800, owed: 416.67, balance: 383.33, settled: true },
        { id: '2', name: 'Juan Pérez', paid: 500, owed: 416.67, balance: 83.33, settled: true },
        { id: '3', name: 'María García', paid: 400, owed: 416.67, balance: -16.67, settled: true },
        { id: '4', name: 'Carlos López', paid: 300, owed: 416.67, balance: -116.67, settled: true },
        { id: '5', name: 'Ana Martínez', paid: 350, owed: 416.67, balance: -66.67, settled: true },
        { id: '6', name: 'Pedro Rodríguez', paid: 150, owed: 416.67, balance: -266.67, settled: true },
      ],
      expenses: [
        { id: '1', description: 'Hotel 3 noches', amount: 1200, payers: ['Tú'], category: 'Alojamiento', date: '15 Oct 2025' },
        { id: '2', description: 'Cena en bodega', amount: 450, payers: ['Juan Pérez'], category: 'Comida', date: '15 Oct 2025' },
        { id: '3', description: 'Alquiler de auto', amount: 380, payers: ['María García'], category: 'Transporte', date: '16 Oct 2025' },
        { id: '4', description: 'Entradas al parque', amount: 270, payers: ['Carlos López'], category: 'Entretenimiento', date: '16 Oct 2025' },
        { id: '5', description: 'Compras supermercado', amount: 200, payers: ['Ana Martínez'], category: 'Comida', date: '17 Oct 2025' },
      ],
      settlements: [
        { from: 'Pedro Rodríguez', to: 'Tú', amount: 266.67, settled: true },
        { from: 'Carlos López', to: 'Tú', amount: 116.67, settled: true },
        { from: 'Ana Martínez', to: 'Juan Pérez', amount: 66.67, settled: true },
        { from: 'María García', to: 'Juan Pérez', amount: 16.67, settled: true },
      ],
      statistics: {
        byPerson: [
          { name: 'Tú', amount: 800 },
          { name: 'Juan Pérez', amount: 500 },
          { name: 'María García', amount: 400 },
          { name: 'Carlos López', amount: 300 },
          { name: 'Ana Martínez', amount: 350 },
          { name: 'Pedro Rodríguez', amount: 150 },
        ],
        byCategory: [
          { category: 'Alojamiento', amount: 1200 },
          { category: 'Comida', amount: 650 },
          { category: 'Transporte', amount: 380 },
          { category: 'Entretenimiento', amount: 270 },
        ]
      }
    }
  }
  return activities[activityId] || null
}

export function FinishedActivityDetailModal({ 
  isOpen, 
  onClose, 
  activityId,
  baseCurrency 
}: FinishedActivityDetailModalProps) {
  const [activeTab, setActiveTab] = useState('expenses')
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [isExpenseSplitModalOpen, setIsExpenseSplitModalOpen] = useState(false)
  
  if (!activityId) return null
  
  const activity = getActivityDetails(activityId)
  if (!activity) return null

  const handleExpenseClick = (expense: any) => {
    const formattedExpense = {
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      currency: baseCurrency,
      payers: expense.payers,
      date: expense.date,
      participants: activity.members
    }
    setSelectedExpense(formattedExpense)
    setIsExpenseSplitModalOpen(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground">{activity.name}</DialogTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{activity.dateRange}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{activity.members} participantes</span>
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Liquidada
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Gastado</div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {activity.totalExpenses.toFixed(2)} {baseCurrency}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Tu Balance Final</div>
              <div className={cn(
                "text-2xl font-bold mt-1",
                activity.balance >= 0 ? "text-success" : "text-destructive"
              )}>
                {activity.balance >= 0 ? '+' : ''}{activity.balance.toFixed(2)} {baseCurrency}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Valoración</div>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-5 w-5",
                      i < activity.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
            <TabsTrigger value="settlements">Liquidación</TabsTrigger>
            <TabsTrigger value="participants">Participantes</TabsTrigger>
            <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-3 mt-4">
            {activity.expenses.map((expense: any) => (
              <Card 
                key={expense.id}
                className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => handleExpenseClick(expense)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-semibold text-foreground">{expense.description}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                        <span>{expense.date}</span>
                        <Badge variant="outline">{expense.category}</Badge>
                        <span>Pagado por: {expense.payers.join(', ')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-foreground">
                        {expense.amount.toFixed(2)} {baseCurrency}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="settlements" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Balance simplificado de liquidación entre participantes
            </p>
            {activity.settlements.map((settlement: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="font-semibold text-foreground">{settlement.from}</div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      <div className="font-semibold text-foreground">{settlement.to}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-foreground">
                        {settlement.amount.toFixed(2)} {baseCurrency}
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success">
                        <CheckCircle2 className="h-3 w-3" />
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="participants" className="space-y-3 mt-4">
            {activity.participants.map((participant: any) => (
              <Card key={participant.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{participant.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <span>Pagó: {participant.paid.toFixed(2)} {baseCurrency}</span>
                        <span>Debía: {participant.owed.toFixed(2)} {baseCurrency}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className={cn(
                          "text-lg font-bold",
                          participant.balance >= 0 ? "text-success" : "text-destructive"
                        )}>
                          {participant.balance >= 0 ? '+' : ''}{participant.balance.toFixed(2)} {baseCurrency}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {participant.balance >= 0 ? 'Le deben' : 'Debe'}
                        </div>
                      </div>
                      {participant.settled && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success">
                          <CheckCircle2 className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6 mt-4">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Gastos por Persona</h3>
              <div className="space-y-2">
                {activity.statistics.byPerson.map((person: any, index: number) => {
                  const percentage = (person.amount / activity.totalExpenses) * 100
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{person.name}</span>
                        <span className="font-semibold text-foreground">
                          {person.amount.toFixed(2)} {baseCurrency} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">Distribución por Categoría</h3>
              <div className="space-y-2">
                {activity.statistics.byCategory.map((category: any, index: number) => {
                  const percentage = (category.amount / activity.totalExpenses) * 100
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground">{category.category}</span>
                        <span className="font-semibold text-foreground">
                          {category.amount.toFixed(2)} {baseCurrency} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-accent rounded-full h-2 transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <ExpenseSplitModal
          isOpen={isExpenseSplitModalOpen}
          onClose={() => setIsExpenseSplitModalOpen(false)}
          expense={selectedExpense}
          baseCurrency={baseCurrency}
        />
      </DialogContent>
    </Dialog>
  )
}
