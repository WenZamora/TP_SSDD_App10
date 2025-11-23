'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Badge } from "@/app/components/ui/badge"
import { Button } from "@/app/components/ui/button"
import { Skeleton } from "@/app/components/ui/skeleton"
import { ArrowRight, Calendar, User, BarChart3, PieChart, Plus } from 'lucide-react'
import { cn } from "@/app/lib/utils"
import { useGroup } from '@/app/hooks/useGroups'
import { useContacts } from '@/app/hooks/useContacts'
import { useGroupBalance } from '@/app/hooks/useBalance'
import { useExpensesByPerson, useExpensesByCategory } from '@/app/hooks/useStatistics'
import { AddExpenseModal } from './add-expense-modal'

interface GroupDetailProps {
  groupId: string | null
  baseCurrency: string
}

export function GroupDetail({ groupId, baseCurrency }: GroupDetailProps) {
  const { data: group, isLoading: groupLoading } = useGroup(groupId || '')
  const { data: allContacts = [] } = useContacts()
  const { data: balanceData } = useGroupBalance(groupId || '')
  const { data: expensesByPerson = [] } = useExpensesByPerson(groupId || '')
  const { data: expensesByCategory = [] } = useExpensesByCategory(groupId || '')
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false)
  
  // Get contact name by ID
  const getContactName = (contactId: string) => {
    const contact = allContacts.find(c => c.id === contactId)
    return contact?.name || 'Desconocido'
  }
  
  if (groupLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }
  
  if (!group) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Grupo no encontrado</p>
      </div>
    )
  }
  
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">{group.name}</h2>
          <p className="text-muted-foreground mt-1">{group.members.length} miembros • {group.description || 'Sin descripción'}</p>
        </div>
        <Button onClick={() => setIsAddExpenseOpen(true)} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Gasto
        </Button>
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
            <Badge variant="outline">{group.expenses.length} gastos</Badge>
          </div>
          
          <div className="space-y-3">
            {group.expenses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No hay gastos registrados todavía</p>
                </CardContent>
              </Card>
            ) : (
              group.expenses.map((expense) => (
                <Card key={expense.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <h4 className="font-semibold text-foreground">{expense.description}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>Pagó: {getContactName(expense.payer)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(expense.date).toLocaleDateString('es-ES')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        {expense.currency && expense.currency !== group.baseCurrency ? (
                          <div>
                            <div className="text-sm text-muted-foreground line-through">
                              {expense.amount.toFixed(2)} {expense.currency}
                            </div>
                            <div className="text-2xl font-bold text-foreground">
                              {(expense.convertedAmount || expense.amount).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {group.baseCurrency} (convertido)
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-2xl font-bold text-foreground">
                              {expense.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {group.baseCurrency}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4 mt-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">¿Quién Paga a Quién?</h3>
            <p className="text-sm text-muted-foreground">Balance simplificado para liquidar deudas</p>
          </div>
          
          <div className="space-y-3">
            {!balanceData || balanceData.settlements.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No hay pagos pendientes. ¡Todo está equilibrado!</p>
                </CardContent>
              </Card>
            ) : (
              balanceData.settlements.map((settlement, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold">
                          {settlement.fromName[0]}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-foreground">{settlement.fromName}</span>
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium text-foreground">{settlement.toName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {settlement.amount.toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">{group.baseCurrency}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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
              {expensesByPerson.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay datos disponibles</p>
              ) : (
                expensesByPerson.map((person) => {
                  const maxAmount = Math.max(...expensesByPerson.map(p => p.totalAmount))
                  const percentage = maxAmount > 0 ? (person.totalAmount / maxAmount) * 100 : 0
                  
                  return (
                    <div key={person.personId} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{person.personName}</span>
                        <span className="text-muted-foreground">
                          {person.totalAmount.toFixed(2)} {group.baseCurrency}
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
                })
              )}
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
              {expensesByCategory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay datos disponibles</p>
              ) : (
                expensesByCategory.map((cat, index) => (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className={cn(
                            "h-3 w-3 rounded-full",
                            index % 4 === 0 && "bg-chart-1",
                            index % 4 === 1 && "bg-chart-2",
                            index % 4 === 2 && "bg-chart-3",
                            index % 4 === 3 && "bg-chart-4"
                          )}
                        />
                        <span className="font-medium text-foreground">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {cat.totalAmount.toFixed(2)} {group.baseCurrency}
                        </span>
                        <Badge variant="outline">{cat.percentage.toFixed(0)}%</Badge>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all",
                          index % 4 === 0 && "bg-chart-1",
                          index % 4 === 1 && "bg-chart-2",
                          index % 4 === 2 && "bg-chart-3",
                          index % 4 === 3 && "bg-chart-4"
                        )}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddExpenseModal 
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        groupId={groupId}
        baseCurrency={group.baseCurrency}
      />
    </div>
  )
}
