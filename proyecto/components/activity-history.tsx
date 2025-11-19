'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityHistoryProps {
  onActivitySelect: (activityId: string) => void
  baseCurrency: string
}

const mockFinishedActivities = [
  { id: '5', name: 'Viaje a Mendoza', balance: 320.00, members: 6, dateRange: 'Oct 2025', rating: 5, totalExpenses: 2500.00 },
  { id: '6', name: 'Asado de Cumpleaños', balance: -50.00, members: 10, dateRange: 'Sep 2025', rating: 4, totalExpenses: 800.00 },
  { id: '7', name: 'Escapada a Mar del Plata', balance: 150.00, members: 4, dateRange: 'Ago 2025', rating: 5, totalExpenses: 1800.00 },
  { id: '8', name: 'Cena de Egresados', balance: -75.00, members: 15, dateRange: 'Jul 2025', rating: 3, totalExpenses: 3200.00 },
  { id: '9', name: 'Fin de Semana en Córdoba', balance: 200.00, members: 5, dateRange: 'Jun 2025', rating: 4, totalExpenses: 2100.00 },
]

export function ActivityHistory({ onActivitySelect, baseCurrency }: ActivityHistoryProps) {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Historial de Actividades</h2>
        <p className="text-muted-foreground mt-1">Actividades finalizadas y liquidadas</p>
      </div>

      <div className="space-y-3">
        {mockFinishedActivities.map((activity) => (
          <Card 
            key={activity.id}
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
            onClick={() => onActivitySelect(activity.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{activity.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{activity.dateRange}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{activity.members} participantes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-4 w-4",
                            i < activity.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Total: {activity.totalExpenses.toFixed(2)} {baseCurrency}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={cn(
                    "text-2xl font-bold",
                    activity.balance >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {activity.balance >= 0 ? '+' : ''}{activity.balance.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{baseCurrency}</div>
                  <Badge 
                    variant={activity.balance >= 0 ? "default" : "destructive"}
                  >
                    {activity.balance >= 0 ? 'Te debieron' : 'Debiste'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
