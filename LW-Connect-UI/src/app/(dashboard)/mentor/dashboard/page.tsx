'use client'

import { StatCard } from '@/components/features/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, Star, Users } from 'lucide-react'
import { mockSessions } from '@/lib/mock-data'

export default function MentorDashboard() {
  const upcomingSessions = mockSessions.filter(s => s.status === 'scheduled')
  const completedSessions = mockSessions.filter(s => s.status === 'completed')

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
          value={45}
          change={12}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="This Month"
          value={8}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Rating"
          value="4.8"
          icon={<Star className="h-4 w-4" />}
        />
        <StatCard
          title="Active Learners"
          value={23}
          change={15}
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
            {upcomingSessions.map((session) => (
              <div key={session.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{session.learnerName}</p>
                  <span className="text-sm text-muted-foreground">{session.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{session.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedSessions.filter(s => s.rating).map((session) => (
              <div key={session.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{session.learnerName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{session.rating}</span>
                  </div>
                </div>
                {session.notes && (
                  <p className="text-sm text-muted-foreground">{session.notes}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
