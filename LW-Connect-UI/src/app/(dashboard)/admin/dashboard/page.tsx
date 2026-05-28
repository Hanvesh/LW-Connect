'use client'

import { useCallback, useEffect, useState } from 'react'
import { StatCard } from '@/components/features/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, TrendingUp, Award, BookOpen } from 'lucide-react'
import { adminService } from '@/services/api.service'
import { Loading } from '@/components/ui/loading'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardMetrics {
  total_learners: number
  total_mentors: number
  total_bookings: number
  completed_bookings: number
  active_cohorts: number
  completion_rate: number
}

interface Cohort {
  id: string
  name: string
  learner_count: number
  completion_rate: number
  is_active: boolean
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [cohorts, setCohorts] = useState<Cohort[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const [metricsData, cohortsData] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getCohorts(),
      ])
      setMetrics(metricsData)
      setCohorts(cohortsData.filter((cohort: Cohort) => cohort.is_active))
    } catch {
      setError('Unable to load admin dashboard. Admin access required.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    )
  }

  const chartData = [
    { name: 'Total', sessions: metrics?.total_bookings ?? 0 },
    { name: 'Completed', sessions: metrics?.completed_bookings ?? 0 },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and analytics</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Learners"
          value={metrics?.total_learners ?? 0}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Total Mentors"
          value={metrics?.total_mentors ?? 0}
          icon={<Award className="h-4 w-4" />}
        />
        <StatCard
          title="Total Sessions"
          value={metrics?.total_bookings ?? 0}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Completion Rate"
          value={`${metrics?.completion_rate ?? 0}%`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Active Cohorts ({metrics?.active_cohorts ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cohorts.map((cohort) => (
              <div key={cohort.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{cohort.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {cohort.learner_count} learners
                  </span>
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
              </div>
            ))}
            {cohorts.length === 0 && (
              <p className="text-sm text-muted-foreground">No active cohorts</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
