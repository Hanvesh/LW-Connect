'use client'

import { StatCard } from '@/components/features/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, TrendingUp, Award } from 'lucide-react'
import { mockDashboardStats, mockCohorts } from '@/lib/mock-data'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const chartData = [
  { name: 'Jan', sessions: 45 },
  { name: 'Feb', sessions: 52 },
  { name: 'Mar', sessions: 61 },
  { name: 'Apr', sessions: 58 },
  { name: 'May', sessions: 67 },
]

export default function AdminDashboard() {
  const stats = mockDashboardStats

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Learners"
          value={stats.totalLearners}
          change={12}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="Total Mentors"
          value={stats.totalMentors}
          change={8}
          icon={<Award className="h-4 w-4" />}
        />
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions}
          change={15}
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatCard
          title="Avg Engagement"
          value={`${stats.avgEngagement}%`}
          change={5}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sessions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sessions</CardTitle>
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

        {/* Active Cohorts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Cohorts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCohorts.map((cohort) => (
              <div key={cohort.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{cohort.name}</h3>
                  <span className="text-sm text-muted-foreground">
                    {cohort.learners} learners
                  </span>
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
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
