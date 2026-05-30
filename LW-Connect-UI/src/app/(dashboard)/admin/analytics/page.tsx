'use client'

import { useCallback, useEffect, useState } from 'react'
import { MaterialIcon } from '@/components/ui/material-icon'
import { adminService } from '@/services/api.service'
import { Loading } from '@/components/ui/loading'

interface Metrics {
  total_learners: number
  total_mentors: number
  total_bookings: number
  completed_bookings: number
  pending_bookings: number
  cancelled_bookings: number
  active_cohorts: number
  total_cohorts: number
  total_enrollments: number
  active_enrollments: number
  completed_enrollments: number
  available_mentors: number
  completion_rate: number
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadMetrics = useCallback(async () => {
    try {
      const data = await adminService.getDashboardMetrics()
      setMetrics(data)
    } catch {
      setError('Unable to load analytics. Admin access required.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-margin-mobile md:p-margin-desktop">
        <div className="bg-error-container text-on-error-container p-lg rounded-xl text-label-md">
          {error}
        </div>
      </div>
    )
  }

  const bookingRate = metrics && metrics.total_bookings > 0
    ? Math.round((metrics.completed_bookings / metrics.total_bookings) * 100)
    : 0

  const mentorUtilization = metrics && metrics.total_mentors > 0
    ? Math.round((metrics.available_mentors / metrics.total_mentors) * 100)
    : 0

  return (
    <div className="p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto space-y-gutter pb-32 md:pb-8">
      <div>
        <h1 className="text-headline-lg text-primary">Analytics</h1>
        <p className="text-body-md text-on-surface-variant">Platform performance and engagement metrics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
        <MetricCard icon="people" label="Total Learners" value={metrics?.total_learners ?? 0} />
        <MetricCard icon="school" label="Total Mentors" value={metrics?.total_mentors ?? 0} />
        <MetricCard icon="event" label="Total Sessions" value={metrics?.total_bookings ?? 0} />
        <MetricCard icon="trending_up" label="Completion Rate" value={`${metrics?.completion_rate ?? 0}%`} />
      </div>

      {/* Session Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="text-title-lg mb-lg">Session Breakdown</h3>
          <div className="space-y-md">
            <ProgressRow label="Completed" value={metrics?.completed_bookings ?? 0} total={metrics?.total_bookings ?? 1} color="bg-tertiary-fixed" />
            <ProgressRow label="Pending" value={metrics?.pending_bookings ?? 0} total={metrics?.total_bookings ?? 1} color="bg-secondary" />
            <ProgressRow label="Cancelled" value={metrics?.cancelled_bookings ?? 0} total={metrics?.total_bookings ?? 1} color="bg-error" />
          </div>
          <div className="mt-lg pt-lg border-t border-outline-variant">
            <div className="flex items-center justify-between">
              <span className="text-label-md text-on-surface-variant">Session Success Rate</span>
              <span className="text-title-lg font-bold text-secondary">{bookingRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
          <h3 className="text-title-lg mb-lg">Platform Health</h3>
          <div className="space-y-md">
            <ProgressRow label="Mentor Availability" value={metrics?.available_mentors ?? 0} total={metrics?.total_mentors ?? 1} color="bg-secondary" />
            <ProgressRow label="Active Cohorts" value={metrics?.active_cohorts ?? 0} total={metrics?.total_cohorts ?? 1} color="bg-tertiary-fixed" />
            <ProgressRow label="Active Enrollments" value={metrics?.active_enrollments ?? 0} total={metrics?.total_enrollments ?? 1} color="bg-secondary-fixed-dim" />
          </div>
          <div className="mt-lg pt-lg border-t border-outline-variant">
            <div className="flex items-center justify-between">
              <span className="text-label-md text-on-surface-variant">Mentor Utilization</span>
              <span className="text-title-lg font-bold text-secondary">{mentorUtilization}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Stats */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
        <h3 className="text-title-lg mb-lg">Enrollment Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          <div className="text-center p-lg bg-surface-container-low rounded-xl">
            <span className="text-display-lg block text-secondary">{metrics?.total_enrollments ?? 0}</span>
            <span className="text-label-md text-on-surface-variant">Total Enrollments</span>
          </div>
          <div className="text-center p-lg bg-surface-container-low rounded-xl">
            <span className="text-display-lg block text-on-tertiary-container">{metrics?.active_enrollments ?? 0}</span>
            <span className="text-label-md text-on-surface-variant">Active</span>
          </div>
          <div className="text-center p-lg bg-surface-container-low rounded-xl">
            <span className="text-display-lg block text-tertiary-fixed-dim">{metrics?.completed_enrollments ?? 0}</span>
            <span className="text-label-md text-on-surface-variant">Completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value }: { icon: string; label: string; value: number | string }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col items-center justify-center text-center shadow-sm">
      <MaterialIcon name={icon} className="text-secondary mb-sm text-2xl" />
      <span className="text-headline-md block leading-none mb-xs">{value}</span>
      <span className="text-label-sm text-on-surface-variant">{label}</span>
    </div>
  )
}

function ProgressRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex items-center justify-between mb-xs">
        <span className="text-label-md text-on-surface-variant">{label}</span>
        <span className="text-label-md font-bold">{value}</span>
      </div>
      <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
