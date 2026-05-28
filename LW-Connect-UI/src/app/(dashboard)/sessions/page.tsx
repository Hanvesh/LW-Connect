'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Star, User } from 'lucide-react'
import { sessionService } from '@/services/api.service'
import { formatDate, formatTime } from '@/lib/utils'
import { FeedbackModal } from '@/components/features/feedback-modal'
import { Loading } from '@/components/ui/loading'

interface BookingFeedback {
  id: string
  rating: number
  comment?: string
}

interface Booking {
  id: string
  mentor_id: string
  mentor_name?: string
  scheduled_at: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  feedback?: BookingFeedback
}

function getStatusVariant(status: Booking['status']) {
  if (status === 'completed') return 'success'
  if (status === 'cancelled') return 'destructive'
  return 'default'
}

export default function SessionsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null)

  const loadBookings = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await sessionService.getMyBookings()
      setBookings(data)
    } catch {
      setError('Unable to load sessions. Make sure you are logged in as a learner.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Sessions</h1>
        <p className="text-muted-foreground">View and manage your mentorship sessions</p>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      {booking.mentor_name || 'Mentor'}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(booking.scheduled_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(booking.scheduled_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusVariant(booking.status)}>
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {booking.notes && (
                <p className="text-sm text-muted-foreground">{booking.notes}</p>
              )}

              {booking.feedback && (
                <div className="mt-4 p-3 bg-accent rounded-lg">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: booking.feedback.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  {booking.feedback.comment && (
                    <p className="text-sm text-muted-foreground">{booking.feedback.comment}</p>
                  )}
                </div>
              )}

              {booking.status === 'completed' && !booking.feedback && (
                <Button
                  size="sm"
                  className="mt-4"
                  onClick={() => setFeedbackBooking(booking)}
                >
                  Leave Feedback
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {bookings.length === 0 && !error && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No sessions yet</p>
        </div>
      )}

      {feedbackBooking && (
        <FeedbackModal
          bookingId={feedbackBooking.id}
          mentorName={feedbackBooking.mentor_name || 'Mentor'}
          isOpen={!!feedbackBooking}
          onClose={() => setFeedbackBooking(null)}
          onSubmitted={loadBookings}
        />
      )}
    </div>
  )
}
