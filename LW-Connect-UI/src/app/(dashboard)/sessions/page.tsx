'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User } from 'lucide-react'
import { mockSessions } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'

export default function SessionsPage() {
  const sessions = mockSessions

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Sessions</h1>
        <p className="text-muted-foreground">View and manage your mentorship sessions</p>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{session.mentorName}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(session.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.time}
                      </span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    session.status === 'completed'
                      ? 'success'
                      : session.status === 'scheduled'
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {session.status}
                </Badge>
              </div>
            </CardHeader>
            {session.notes && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{session.notes}</p>
                {session.status === 'completed' && !session.feedback && (
                  <Button size="sm" className="mt-4">
                    Leave Feedback
                  </Button>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No sessions yet</p>
        </div>
      )}
    </div>
  )
}
