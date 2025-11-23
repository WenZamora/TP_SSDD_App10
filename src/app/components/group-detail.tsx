'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Badge } from "@/app/components/ui/badge"
import { ArrowRight, Calendar, User, BarChart3, PieChart } from 'lucide-react'
import { cn } from "@/app/lib/utils"

interface GroupDetailProps {
  groupId: string | null
  baseCurrency: string
}

// Mock data
const mockExpenses = [
  { id: '1', description: 'Cena en restaurante', amount: 150.00, currency: 'USD', payer: 'Juan', date: '2025-11-10', participants: 5 },
  { id: '2', description: 'Uber al aeropuerto', amount: 45.00, currency: 'USD', payer: 'María', date: '2025-11-09', participants: 3 },
  { id: '3', description: 'Supermercado', amount: 220.00, currency: 'USD', payer: 'Pedro', date: '2025-11-08', participants: 5 },
  { id: '4', description: 'Hotel - Noche 1', amount: 180.00, currency: 'USD', payer: 'Ana', date: '2025-11-07', participants: 4 },
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

export function GroupDetail({ groupId, baseCurrency }: GroupDetailProps) {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Viaje a Bariloche</h2>
        <p className="text-muted-foreground mt-1">5 miembros • Activo</p>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="balances">Balance</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lista de Gastos</h3>
            <Badge variant="outline">{mockExpenses.length} gastos</Badge>
          </div>
          
          <div className="space-y-3">
            {mockExpenses.map((expense) => (
              <Card key={expense.id} className="hover:shadow-sm transition-shadow">
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
                          <span>Pagó: {expense.payer}</span>
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
      </Tabs>
    </div>
  )
}
