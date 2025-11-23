'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Badge } from "@/app/components/ui/badge"
import { Skeleton } from "@/app/components/ui/skeleton"
import { ArrowUpRight, ArrowDownRight, Users, TrendingUp, Calendar, PieChart } from 'lucide-react'
import { cn } from "@/app/lib/utils"
import { useState, useMemo } from 'react'
import { BalanceHistoryModal } from './balance-history-modal'
import { useGroups } from '@/app/hooks/useGroups'

interface DashboardProps {
  baseCurrency: string
}

const groupImages: Record<string, string> = {
  'viaje': '/mountain-landscape-bariloche.jpg',
  'cumpleaños': '/birthday-dinner-celebration.jpg',
  'cena': '/birthday-dinner-celebration.jpg',
  'departamento': '/cozy-apartment-living-room.png',
  'alquiler': '/cozy-apartment-living-room.png',
  'universidad': '/university-project-workspace.jpg',
  'proyecto': '/university-project-workspace.jpg',
  'default': '/placeholder.jpg'
}

function getGroupImage(name: string): string {
  const lowerName = name.toLowerCase()
  for (const [key, image] of Object.entries(groupImages)) {
    if (lowerName.includes(key)) return image
  }
  return groupImages.default
}

function formatDateRange(createdAt: number, updatedAt: number): string {
  const start = new Date(createdAt)
  const end = new Date(updatedAt)
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    if (start.getDate() === end.getDate()) {
      return `${start.getDate()} ${monthNames[start.getMonth()]}`
    }
    return `${start.getDate()}-${end.getDate()} ${monthNames[start.getMonth()]}`
  }
  return `${monthNames[start.getMonth()]} ${start.getFullYear()}`
}

export function Dashboard({ baseCurrency }: DashboardProps) {
  const [showBalanceHistory, setShowBalanceHistory] = useState(false)
  const { data: groups = [], isLoading } = useGroups()
  
  // Calculate total balance (this should ideally come from the balance API)
  const totalBalance = useMemo(() => {
    // For now, we'll show 0. In a real implementation, this would aggregate
    // all balances from all groups for the current user
    return 0
  }, [groups])

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Inicio</h2>
        <p className="text-muted-foreground mt-1">Resumen de tus grupos y gastos compartidos</p>
      </div>

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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium">Total Grupos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{groups.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Grupos activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium">Total Gastos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {groups.reduce((acc, g) => acc + g.expenses.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Registrados en todos los grupos</p>
          </CardContent>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-md transition-all"
          onClick={() => setShowBalanceHistory(true)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              <CardDescription className="text-sm font-medium">Ver Detalles</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-primary">Historial</div>
            <p className="text-xs text-muted-foreground mt-1">Click para ver más</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-foreground">Grupos Activos</h3>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[2/1] w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No hay grupos todavía</h3>
            <p className="text-muted-foreground mb-4">
              Crea tu primer grupo para comenzar a gestionar gastos compartidos
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => {
              const image = getGroupImage(group.name)
              const dateRange = formatDateRange(group.createdAt, group.updatedAt)
              // Balance would come from useGroupBalance hook in real implementation
              const balance = 0 // Placeholder
              
              return (
                <Card 
                  key={group.id}
                  className="overflow-hidden"
                >
                  <div className="aspect-[2/1] w-full overflow-hidden bg-muted">
                    <img 
                      src={image} 
                      alt={group.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {group.description || 'Sin descripción'}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground pt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{dateRange}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{group.members.length} miembros</span>
                          </div>
                        </div>
                      </div>
                      {balance >= 0 ? (
                        <ArrowUpRight className="h-5 w-5 text-success" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm text-muted-foreground">Gastos totales:</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-foreground">
                          {group.expenses.length}
                        </span>
                        <span className="text-sm text-muted-foreground">registrados</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="mt-3">
                      {group.baseCurrency}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
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
