'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar } from 'lucide-react'
import { adminService } from '@/services/api.service'
import { formatDate } from '@/lib/utils'
import { CohortCreateModal } from '@/components/features/cohort-create-modal'
import { Loading } from '@/components/ui/loading'

interface Cohort {
  id: string
  name: string
  description?: string
  course_name?: string
  start_date?: string
  end_date?: string
  max_participants: number
  is_active: boolean
  learner_count: number
  completion_rate: number
}

export default function CohortsPage() {
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const loadCohorts = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await adminService.getCohorts()
      setCohorts(data)
    } catch {
      setError('Unable to load cohorts. Admin access required.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCohorts()
  }, [loadCohorts])

  const toggleCohortStatus = async (cohort: Cohort) => {
    try {
      await adminService.updateCohort(cohort.id, { is_active: !cohort.is_active })
      loadCohorts()
    } catch {
      setError('Failed to update cohort status')
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
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cohort Management</h1>
          <p className="text-muted-foreground">Manage learning cohorts and track progress</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Create Cohort</Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

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
                <Badge variant={cohort.is_active ? 'success' : 'secondary'}>
                  {cohort.is_active ? 'Active' : 'Inactive'}
                </Badge>
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

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{cohort.learner_count}</p>
                  <p className="text-xs text-muted-foreground">
                    Learners (max {cohort.max_participants})
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-medium">{cohort.completion_rate}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${cohort.completion_rate}%` }}
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => toggleCohortStatus(cohort)}
              >
                {cohort.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {cohorts.length === 0 && !error && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No cohorts yet. Create your first cohort.</p>
        </div>
      )}

      <CohortCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={loadCohorts}
      />
    </div>
  )
}
