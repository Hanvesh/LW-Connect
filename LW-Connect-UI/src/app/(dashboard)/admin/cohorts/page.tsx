'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, TrendingUp, Calendar } from 'lucide-react'
import { mockCohorts } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'

export default function CohortsPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cohort Management</h1>
          <p className="text-muted-foreground">Manage learning cohorts and track progress</p>
        </div>
        <Button>Create Cohort</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {mockCohorts.map((cohort) => (
          <Card key={cohort.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{cohort.name}</CardTitle>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(cohort.startDate)} - {formatDate(cohort.endDate)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{cohort.learners}</p>
                    <p className="text-xs text-muted-foreground">Learners</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-2xl font-bold">{cohort.mentors}</p>
                    <p className="text-xs text-muted-foreground">Mentors</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-medium">{cohort.completionRate}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${cohort.completionRate}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Engagement Score</span>
                  <span className="font-medium">{cohort.engagementScore}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${cohort.engagementScore}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
