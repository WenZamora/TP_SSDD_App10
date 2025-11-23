'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Badge } from "@/app/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { PieChart, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react'
import { cn } from "@/app/lib/utils"
import { useState, useMemo } from 'react'
import { useGroups } from '@/app/hooks/useGroups'
import { useContacts } from '@/app/hooks/useContacts'
import { useGroupBalance } from '@/app/hooks/useBalance'

interface BalanceHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  baseCurrency: string
}

export function BalanceHistoryModal({ open, onOpenChange, baseCurrency }: BalanceHistoryModalProps) {
  const [selectedGroup, setSelectedGroup] = useState('all')
  const { data: groups = [] } = useGroups()
  const { data: allContacts = [] } = useContacts()
  
  // Get current user ID (this should come from a user context/hook in real app)
  const currentUserId = useMemo(() => {
    // For now, get from localStorage
    const storedUser = localStorage.getItem('splitwise_user')
    if (storedUser) {
      return JSON.parse(storedUser).id
    }
    return null
  }, [])

  // Calculate group breakdowns
  const detailedBreakdown = useMemo(() => {
    const filteredGroups = selectedGroup === 'all' ? groups : groups.filter(g => g.id === selectedGroup)
    
    return filteredGroups.map(group => {
      const contact = allContacts.find(c => c.id === currentUserId)
      if (!contact) return null
      
      // Calculate total paid by current user
      const totalPaid = group.expenses
        .filter(e => e.payer === currentUserId)
        .reduce((sum, e) => sum + e.convertedAmount, 0)
      
      // Calculate total share (what current user should pay)
      const totalShare = group.expenses
        .filter(e => e.participants.includes(currentUserId))
        .reduce((sum, e) => sum + (e.convertedAmount / e.participants.length), 0)
      
      const balance = totalPaid - totalShare
      
      const date = new Date(group.updatedAt)
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      
      return {
        group: group.name,
        date: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
        totalPaid,
        shouldPay: totalShare,
        balance,
        participants: group.members.length
      }
    }).filter(Boolean)
  }, [groups, selectedGroup, allContacts, currentUserId])
  
  // Calculate historical balances summary
  const historicalBalances = useMemo(() => {
    const positive = detailedBreakdown.filter(g => g!.balance > 0).reduce((sum, g) => sum + g!.balance, 0)
    const negative = Math.abs(detailedBreakdown.filter(g => g!.balance < 0).reduce((sum, g) => sum + g!.balance, 0))
    const balanced = detailedBreakdown.filter(g => Math.abs(g!.balance) < 0.01).reduce((sum, g) => sum + Math.abs(g!.balance), 0)
    
    const total = positive + negative + balanced
    
    return [
      { category: 'Pagaste de más', amount: positive, percentage: total > 0 ? Math.round((positive / total) * 100) : 0, color: 'bg-success', textColor: 'text-success' },
      { category: 'Pagaste de menos', amount: negative, percentage: total > 0 ? Math.round((negative / total) * 100) : 0, color: 'bg-destructive', textColor: 'text-destructive' },
      { category: 'Balanceado', amount: balanced, percentage: total > 0 ? Math.round((balanced / total) * 100) : 0, color: 'bg-chart-3', textColor: 'text-chart-3' },
    ]
  }, [detailedBreakdown])
  
  const totalAmount = historicalBalances.reduce((acc, item) => acc + item.amount, 0)
  const netBalance = detailedBreakdown.reduce((acc, item) => acc + (item?.balance || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <PieChart className="h-6 w-6 text-primary" />
            <DialogTitle className="text-2xl">Historial de Balances</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">Filtrar por:</span>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los grupos</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Enlarged Chart */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Distribución de Balances</CardTitle>
              <CardDescription>Resumen general de tus pagos históricos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Chart */}
                <div className="flex items-center justify-center">
                  <div className="relative w-72 h-72">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                      strokeWidth="20"
                      className="text-success"
                      strokeDasharray={`${historicalBalances[0].percentage * 2.51} ${251 - historicalBalances[0].percentage * 2.51}`}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="20"
                      className="text-destructive"
                      strokeDasharray={`${historicalBalances[1].percentage * 2.51} ${251 - historicalBalances[1].percentage * 2.51}`}
                      strokeDashoffset={-historicalBalances[0].percentage * 2.51}
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="20"
                      className="text-chart-3"
                      strokeDasharray={`${historicalBalances[2].percentage * 2.51} ${251 - historicalBalances[2].percentage * 2.51}`}
                      strokeDashoffset={-(historicalBalances[0].percentage + historicalBalances[1].percentage) * 2.51}
                    />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-foreground">
                          {totalAmount.toFixed(0)}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{baseCurrency}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-6">
                  {historicalBalances.map((item) => (
                    <div key={item.category} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-4 w-4 rounded-full", item.color)} />
                          <span className="font-semibold text-foreground">{item.category}</span>
                        </div>
                        <Badge variant="outline" className="text-base">
                          {item.percentage}%
                        </Badge>
                      </div>
                      <div className="flex items-baseline gap-2 ml-7">
                        <span className={cn("text-2xl font-bold", item.textColor)}>
                          {item.amount.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">{baseCurrency}</span>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden ml-7">
                        <div 
                          className={cn("h-full transition-all", item.color)}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs">Balance Neto Total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "text-3xl font-bold",
                    netBalance >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {netBalance >= 0 ? '+' : ''}{netBalance.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">{baseCurrency}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs">Total de Grupos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {detailedBreakdown.length}
                  </span>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs">Volumen Total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    {totalAmount.toFixed(0)}
                  </span>
                  <span className="text-sm text-muted-foreground">{baseCurrency}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Desglose por Grupo</CardTitle>
              <CardDescription>Detalle de pagos y balances por cada grupo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {detailedBreakdown.map((item, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="font-semibold text-foreground">{item!.group}</div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {item!.date}
                        </span>
                        <span>{item!.participants} participantes</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Pagaste</div>
                        <div className="font-semibold text-foreground">
                          {item!.totalPaid.toFixed(2)} {baseCurrency}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Debías</div>
                        <div className="font-semibold text-foreground">
                          {item!.shouldPay.toFixed(2)} {baseCurrency}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1">Balance</div>
                        <div className="flex items-center justify-end gap-1">
                          {item!.balance >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-destructive" />
                          )}
                          <span className={cn(
                            "font-bold text-base",
                            item!.balance >= 0 ? "text-success" : "text-destructive"
                          )}>
                            {item!.balance >= 0 ? '+' : ''}{item!.balance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
