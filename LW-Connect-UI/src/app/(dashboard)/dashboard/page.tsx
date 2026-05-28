'use client'

import { StatCard } from '@/components/features/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, Calendar, TrendingUp, Clock, Star } from 'lucide-react'
import { mockSessions, mockMentors } from '@/lib/mock-data'
import { formatDate, formatTime } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const upcomingSessions = mockSessions.filter(s => s.status === 'scheduled')
  const recommendedMentors = mockMentors.slice(0, 3)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your learning overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sessions"
          value={12}
          change={15}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Completed Courses"
          value={3}
          change={50}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatCard
          title="Learning Hours"
          value="24h"
          change={20}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Rating"
          value="4.8"
          icon={<Star className="h-4 w-4" />}
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
              upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{session.mentorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(session.date)} at {session.time}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming sessions</p>
                <Link href="/mentors">
                  <Button className="mt-4" size="sm">Book a Session</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommended Mentors */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Mentors</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendedMentors.map((mentor) => (
              <div key={mentor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">{mentor.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{mentor.name}</p>
                    <p className="text-sm text-muted-foreground">{mentor.title}</p>
                  </div>
                </div>
                <Link href="/mentors">
                  <Button size="sm">View</Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/mentors">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                Find Mentors
              </Button>
            </Link>
            <Link href="/cohorts">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Users className="h-6 w-6" />
                Browse Cohorts
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <BookOpen className="h-6 w-6" />
                Browse Courses
              </Button>
            </Link>
            <Link href="/ai-assistant">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <TrendingUp className="h-6 w-6" />
                AI Assistant
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
