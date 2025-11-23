'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog"
import { Button } from "@/app/components/ui/button"
import { Textarea } from "@/app/components/ui/textarea"
import { Label } from "@/app/components/ui/label"
import { Star } from 'lucide-react'
import { cn } from "@/app/lib/utils"

interface RatingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activityName: string
}

export function RatingModal({ open, onOpenChange, activityName }: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')

  const handleSubmit = () => {
    // TODO: Implement rating submission logic
    // Data available: rating, comment
    onOpenChange(false)
    setRating(0)
    setComment('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Valorar Actividad</DialogTitle>
          <DialogDescription>
            Comparte tu experiencia de "{activityName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-center block">¿Cómo fue la experiencia?</Label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1"
                >
                  <Star
                    className={cn(
                      "h-10 w-10 transition-colors",
                      (hoveredRating || rating) >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {rating === 1 && "Muy mala"}
                {rating === 2 && "Mala"}
                {rating === 3 && "Regular"}
                {rating === 4 && "Buena"}
                {rating === 5 && "Excelente"}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Cuéntanos más sobre tu experiencia..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="flex-1"
          >
            Omitir
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="flex-1"
            disabled={rating === 0}
          >
            Enviar Valoración
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
