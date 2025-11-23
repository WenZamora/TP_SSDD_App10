'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { ArrowRight, Calendar, User, BarChart3, PieChart, Plus, Edit, CheckCircle2, XCircle, Copy, Check } from 'lucide-react'
import { cn } from "@/app/lib/utils"
import { ExpenseSplitModal } from './expense-split-modal'

interface ActivityDetailProps {
  activityId: string | null
  baseCurrency: string
  onAddExpense: () => void
  onFinishActivity: () => void
}

// Mock data
const mockExpenses = [
  { id: '1', description: 'Cena en restaurante', amount: 150.00, currency: 'USD', payers: ['Juan'], date: '2025-11-10', participants: 5 },
  { id: '2', description: 'Uber al aeropuerto', amount: 45.00, currency: 'USD', payers: ['María'], date: '2025-11-09', participants: 3 },
  { id: '3', description: 'Supermercado', amount: 220.00, currency: 'USD', payers: ['Pedro', 'Ana'], date: '2025-11-08', participants: 5 },
  { id: '4', description: 'Hotel - Noche 1', amount: 180.00, currency: 'USD', payers: ['Ana'], date: '2025-11-07', participants: 4 },
]

const mockBalances = [
  { from: 'Juan', to: 'María', amount: 75.00 },
  { from: 'Pedro', to: 'María', amount: 120.50 },
  { from: 'Ana', to: 'Juan', amount: 45.00 },
]

const mockStats = {
  totalByPerson: [
    { name: 'Juan', amount: 320.00 },
    { name: 'María', amount: 245.00 },
    { name: 'Pedro', amount: 380.00 },
    { name: 'Ana', amount: 210.00 },
  ],
  byCategory: [
    { category: 'Comida', amount: 450.00, percentage: 38 },
    { category: 'Transporte', amount: 280.00, percentage: 24 },
    { category: 'Alojamiento', amount: 350.00, percentage: 30 },
    { category: 'Otros', amount: 95.00, percentage: 8 },
  ]
}

const mockParticipants = [
  { id: '1', name: 'Juan', balance: -75.00, settled: false },
  { id: '2', name: 'María', balance: 195.50, settled: true },
  { id: '3', name: 'Pedro', balance: -120.50, settled: false },
  { id: '4', name: 'Ana', balance: 45.00, settled: false },
  { id: '5', name: 'Carlos', balance: -45.00, settled: true },
]

export function ActivityDetail({ activityId, baseCurrency, onAddExpense, onFinishActivity }: ActivityDetailProps) {
  const [copied, setCopied] = useState(false)
  const shareCode = 'BARI-2025'
  const [selectedExpense, setSelectedExpense] = useState<typeof mockExpenses[0] | null>(null)
  const [isExpenseSplitModalOpen, setIsExpenseSplitModalOpen] = useState(false)

  const handleCopyShareCode = () => {
    navigator.clipboard.writeText(shareCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExpenseClick = (expense: typeof mockExpenses[0]) => {
    setSelectedExpense(expense)
    setIsExpenseSplitModalOpen(true)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Viaje a Bariloche</h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
            <span>10-15 Noviembre 2025</span>
            <span>•</span>
            <span>5 participantes</span>
            <span>•</span>
            <Badge variant="outline">Activa</Badge>
          </div>
          <p className="text-muted-foreground mt-2">Viaje de fin de semana con amigos</p>
          
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Código para unirse:</span>
              <code className="text-lg font-bold text-primary">{shareCode}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyShareCode}
                className="h-8 w-8 p-0 hover:bg-primary/10"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onAddExpense}>
            <Plus className="h-4 w-4 mr-1" />
            Añadir Gasto
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={onFinishActivity}>
            Terminar Actividad
          </Button>
        </div>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="balances">Balance</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          <TabsTrigger value="participants">Participantes</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lista de Gastos</h3>
            <Badge variant="outline">{mockExpenses.length} gastos</Badge>
          </div>
          
          <div className="space-y-3">
            {mockExpenses.map((expense) => (
              <Card 
                key={expense.id} 
                className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => handleExpenseClick(expense)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-foreground">{expense.description}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {expense.currency}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          <span>Pagó: {expense.payers.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(expense.date).toLocaleDateString('es-ES')}</span>
                        </div>
                        <span>{expense.participants} participantes</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-foreground">
                        {expense.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(expense.amount / expense.participants).toFixed(2)} c/u
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">¿Quién Paga a Quién?</h3>
            <p className="text-sm text-muted-foreground">Balance simplificado para liquidar deudas</p>
          </div>
          
          <div className="space-y-3">
            {mockBalances.map((balance, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold">
                        {balance.from[0]}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">{balance.from}</span>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium text-foreground">{balance.to}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {balance.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">{baseCurrency}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Gastos Totales por Persona</CardTitle>
              </div>
              <CardDescription>Total gastado por cada miembro del grupo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockStats.totalByPerson.map((person) => {
                const maxAmount = Math.max(...mockStats.totalByPerson.map(p => p.amount))
                const percentage = (person.amount / maxAmount) * 100
                
                return (
                  <div key={person.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{person.name}</span>
                      <span className="text-muted-foreground">
                        {person.amount.toFixed(2)} {baseCurrency}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-secondary" />
                <CardTitle>Gastos por Categoría</CardTitle>
              </div>
              <CardDescription>Distribución de gastos según categoría</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockStats.byCategory.map((cat, index) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className={cn(
                          "h-3 w-3 rounded-full",
                          index === 0 && "bg-chart-1",
                          index === 1 && "bg-chart-2",
                          index === 2 && "bg-chart-3",
                          index === 3 && "bg-chart-4"
                        )}
                      />
                      <span className="font-medium text-foreground">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {cat.amount.toFixed(2)} {baseCurrency}
                      </span>
                      <Badge variant="outline">{cat.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all",
                        index === 0 && "bg-chart-1",
                        index === 1 && "bg-chart-2",
                        index === 2 && "bg-chart-3",
                        index === 3 && "bg-chart-4"
                      )}
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-4 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Participantes de la Actividad</h3>
            <p className="text-sm text-muted-foreground">Estado de cuentas y liquidaciones</p>
          </div>
          
          <div className="space-y-3">
            {mockParticipants.map((participant) => (
              <Card key={participant.id}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary font-semibold text-lg">
                        {participant.name[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{participant.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {participant.settled ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 text-success" />
                              <span className="text-sm text-success">Liquidado</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Pendiente</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-2xl font-bold",
                        participant.balance >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {participant.balance >= 0 ? '+' : ''}{participant.balance.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">{baseCurrency}</div>
                      <Badge 
                        variant={participant.balance >= 0 ? "default" : "destructive"}
                        className="mt-2"
                      >
                        {participant.balance >= 0 ? 'Le deben' : 'Debe'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <ExpenseSplitModal
        isOpen={isExpenseSplitModalOpen}
        onClose={() => setIsExpenseSplitModalOpen(false)}
        expense={selectedExpense}
        baseCurrency={baseCurrency}
      />
    </div>
  )
}
