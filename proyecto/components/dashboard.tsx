'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowUpRight, ArrowDownRight, Users, TrendingUp, Calendar, PieChart, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { BalanceHistoryModal } from './balance-history-modal'

interface DashboardProps {
  onActivitySelect: (activityId: string) => void
  baseCurrency: string
}

const mockActivities = [
  { 
    id: '1', 
    name: 'Viaje a Bariloche', 
    balance: -150.00, 
    members: 5, 
    dateRange: '10-15 Nov', 
    description: 'Viaje de fin de semana',
    image: '/mountain-landscape-bariloche.jpg'
  },
  { 
    id: '2', 
    name: 'Cena de Cumpleaños Ana', 
    balance: 250.00, 
    members: 8, 
    dateRange: '8 Nov', 
    description: 'Celebración cumpleaños',
    image: '/birthday-dinner-celebration.jpg'
  },
  { 
    id: '3', 
    name: 'Alquiler Departamento', 
    balance: -45.50, 
    members: 3, 
    dateRange: 'Nov 2025', 
    description: 'Gastos mensuales compartidos',
    image: '/cozy-apartment-living-room.png'
  },
  { 
    id: '4', 
    name: 'Proyecto Final Universidad', 
    balance: 120.00, 
    members: 4, 
    dateRange: '1-30 Nov', 
    description: 'Materiales y recursos',
    image: '/university-project-workspace.jpg'
  },
]

const mockHistoricalBalances = [
  { category: 'Pagaste de más', amount: 1250.00, percentage: 55, color: 'bg-success' },
  { category: 'Pagaste de menos', amount: 750.00, percentage: 33, color: 'bg-destructive' },
  { category: 'Balanceado', amount: 270.00, percentage: 12, color: 'bg-chart-3' },
]

export function Dashboard({ onActivitySelect, baseCurrency }: DashboardProps) {
  const [activityCode, setActivityCode] = useState('')
  const [showBalanceHistory, setShowBalanceHistory] = useState(false)
  const totalBalance = mockActivities.reduce((acc, activity) => acc + activity.balance, 0)

  const handleJoinActivity = () => {
    if (activityCode.trim()) {
      console.log('[v0] Joining activity with code:', activityCode)
      // Logic to join activity by code
      setActivityCode('')
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Inicio</h2>
        <p className="text-muted-foreground mt-1">Resumen de tus actividades y gastos compartidos</p>
      </div>

      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle>Acceso Rápido</CardTitle>
          </div>
          <CardDescription>Únete a una actividad existente usando su código</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="Ej: ACT-12345-XYZ"
              value={activityCode}
              onChange={(e) => setActivityCode(e.target.value)}
              className="flex-1 h-11"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJoinActivity()
              }}
            />
            <Button 
              onClick={handleJoinActivity}
              className="h-11 px-6"
              disabled={!activityCode.trim()}
            >
              Unirse a Actividad
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Balance Total */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardDescription className="text-sm font-medium">Balance Total Personal</CardDescription>
          <CardTitle className="text-4xl font-bold flex items-baseline gap-2">
            <span className={cn(
              totalBalance >= 0 ? "text-success" : "text-destructive"
            )}>
              {totalBalance >= 0 ? '+' : ''}{totalBalance.toFixed(2)}
            </span>
            <span className="text-xl text-muted-foreground font-normal">{baseCurrency}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm">
            {totalBalance >= 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-success font-medium">Te deben dinero</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-4 w-4 text-destructive" />
                <span className="text-destructive font-medium">Debes dinero</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historical Balance */}
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50"
        onClick={() => setShowBalanceHistory(true)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                <CardTitle>Historial de Balances</CardTitle>
              </div>
              <CardDescription className="mt-1">
                Distribución general de tus saldos netos históricos
              </CardDescription>
            </div>
            <Badge variant="outline">Todas las actividades</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {mockHistoricalBalances.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 rounded-full", item.color)} />
                      <span className="font-medium text-foreground">{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {item.amount.toFixed(2)} {baseCurrency}
                      </span>
                      <Badge variant="outline">{item.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all", item.color)}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="20"
                    className="text-success"
                    strokeDasharray={`${mockHistoricalBalances[0].percentage * 2.51} ${251 - mockHistoricalBalances[0].percentage * 2.51}`}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="20"
                    className="text-destructive"
                    strokeDasharray={`${mockHistoricalBalances[1].percentage * 2.51} ${251 - mockHistoricalBalances[1].percentage * 2.51}`}
                    strokeDashoffset={-mockHistoricalBalances[0].percentage * 2.51}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="20"
                    className="text-chart-3"
                    strokeDasharray={`${mockHistoricalBalances[2].percentage * 2.51} ${251 - mockHistoricalBalances[2].percentage * 2.51}`}
                    strokeDashoffset={-(mockHistoricalBalances[0].percentage + mockHistoricalBalances[1].percentage) * 2.51}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {(mockHistoricalBalances[0].amount + mockHistoricalBalances[1].amount + mockHistoricalBalances[2].amount).toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground">{baseCurrency}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Actividades Activas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockActivities.map((activity) => (
            <Card 
              key={activity.id}
              className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 overflow-hidden"
              onClick={() => onActivitySelect(activity.id)}
            >
              <div className="aspect-[2/1] w-full overflow-hidden bg-muted">
                <img 
                  src={activity.image || "/placeholder.svg"} 
                  alt={activity.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{activity.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-1">{activity.description}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground pt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{activity.dateRange}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{activity.members} participantes</span>
                      </div>
                    </div>
                  </div>
                  {activity.balance >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-success" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-destructive" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Tu Balance:</span>
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-xl font-bold",
                      activity.balance >= 0 ? "text-success" : "text-destructive"
                    )}>
                      {activity.balance >= 0 ? '+' : ''}{activity.balance.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">{baseCurrency}</span>
                  </div>
                </div>
                <Badge 
                  variant={activity.balance >= 0 ? "default" : "destructive"}
                  className="mt-3"
                >
                  {activity.balance >= 0 ? 'Te deben' : 'Debes'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Balance History Modal */}
      <BalanceHistoryModal
        open={showBalanceHistory}
        onOpenChange={setShowBalanceHistory}
        baseCurrency={baseCurrency}
      />
    </div>
  )
}
