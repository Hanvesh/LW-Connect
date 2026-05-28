'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, GraduationCap, Users } from 'lucide-react'
import { cohortService } from '@/services/api.service'
import { formatDate } from '@/lib/utils'
import { Loading } from '@/components/ui/loading'
import { getApiErrorMessage } from '@/lib/user-mapper'

interface Cohort {
  id: string
  name: string
  description?: string
  course_name?: string
  start_date?: string
  end_date?: string
  max_participants: number
  learner_count: number
  spots_remaining?: number
  is_enrolled?: boolean
  completion_rate: number
}

interface Enrollment {
  id: string
  progress_percentage: number
  cohort: Cohort
}

export default function LearnerCohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrollingId, setEnrollingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const [availableCohorts, myEnrollments] = await Promise.all([
        cohortService.getAvailableCohorts(),
        cohortService.getMyEnrollments(),
      ])
      setCohorts(availableCohorts)
      setEnrollments(myEnrollments)
    } catch {
      setError('Unable to load cohorts. Please sign in as a learner.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleEnroll = async (cohortId: string) => {
    setEnrollingId(cohortId)
    setError('')
    try {
      await cohortService.enrollInCohort(cohortId)
      await loadData()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to enroll in cohort'))
    } finally {
      setEnrollingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Cohorts</h1>
        <p className="text-muted-foreground">Browse and join learning cohorts</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {enrollments.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">My Cohorts</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{enrollment.cohort.name}</CardTitle>
                    <Badge variant="success">Enrolled</Badge>
                  </div>
                  {enrollment.cohort.course_name && (
                    <p className="text-sm text-muted-foreground">{enrollment.cohort.course_name}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{enrollment.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Available Cohorts</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {cohorts.map((cohort) => (
            <Card key={cohort.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{cohort.name}</CardTitle>
                    {cohort.course_name && (
                      <p className="text-sm text-muted-foreground mt-1">{cohort.course_name}</p>
                    )}
                  </div>
                  {cohort.is_enrolled && <Badge variant="success">Enrolled</Badge>}
                </div>
                {cohort.start_date && cohort.end_date && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(cohort.start_date)} - {formatDate(cohort.end_date)}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {cohort.description && (
                  <p className="text-sm text-muted-foreground">{cohort.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {cohort.learner_count}/{cohort.max_participants} enrolled
                  </span>
                  {cohort.spots_remaining !== undefined && (
                    <span>{cohort.spots_remaining} spots left</span>
                  )}
                </div>

                {!cohort.is_enrolled && (
                  <Button
                    className="w-full"
                    disabled={enrollingId === cohort.id || cohort.spots_remaining === 0}
                    onClick={() => handleEnroll(cohort.id)}
                  >
                    {enrollingId === cohort.id
                      ? 'Enrolling...'
                      : cohort.spots_remaining === 0
                      ? 'Cohort Full'
                      : 'Join Cohort'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {cohorts.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No active cohorts available right now</p>
          </div>
        )}
      </section>
    </div>
  )
}
