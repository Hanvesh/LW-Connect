'use client'

import { useCallback, useEffect, useState } from 'react'
import { StatCard } from '@/components/features/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Star, Users } from 'lucide-react'
import { sessionService } from '@/services/api.service'
import { Loading } from '@/components/ui/loading'
import { formatDate, formatTime } from '@/lib/utils'

interface MentorBooking {
  id: string
  learner_id: string
  scheduled_at: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  feedback?: { id: string; rating: number; comment?: string }
}

export default function MentorDashboard() {
  const [bookings, setBookings] = useState<MentorBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadBookings = useCallback(async () => {
    try {
      const data = await sessionService.getMentorBookings()
      setBookings(data || [])
    } catch {
      setBookings([])
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

  const upcomingSessions = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed')
  const completedSessions = bookings.filter(b => b.status === 'completed')
  const feedbackSessions = completedSessions.filter(b => b.feedback)
  const avgRating = feedbackSessions.length > 0
    ? (feedbackSessions.reduce((sum, b) => sum + (b.feedback?.rating || 0), 0) / feedbackSessions.length).toFixed(1)
    : '—'

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mentor Dashboard</h1>
        <p className="text-muted-foreground">Manage your mentorship activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sessions"
          value={bookings.length}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Upcoming"
          value={upcomingSessions.length}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Rating"
          value={avgRating}
          icon={<Star className="h-4 w-4" />}
        />
        <StatCard
          title="Completed"
          value={completedSessions.length}
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Learner Session</p>
                    <span className="text-sm text-muted-foreground">{formatTime(session.scheduled_at)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(session.scheduled_at)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming sessions</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedbackSessions.length > 0 ? (
              feedbackSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">{formatDate(session.scheduled_at)}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{session.feedback?.rating}</span>
                    </div>
                  </div>
                  {session.feedback?.comment && (
                    <p className="text-sm text-muted-foreground">{session.feedback.comment}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No feedback yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
