'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import { Download, FileText, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ReportsPage() {
  const [exporting, setExporting] = useState(false);

  const { data: cohorts } = useQuery({
    queryKey: ['cohorts'],
    queryFn: () => apiService.get('/cohorts')
  });

  const { data: stats } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => apiService.get('/reports/platform/stats')
  });

  const handleExport = async (cohortId: number) => {
    setExporting(true);
    try {
      const response = await apiService.get(
        `/reports/cohort/${cohortId}/export?format=csv`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cohort_${cohortId}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Export data and view platform statistics</p>
      </div>

      {/* Platform Stats */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <BarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_sessions}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Learners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_learners}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Mentors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_mentors}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cohort Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cohorts?.map((cohort: any) => (
              <div
                key={cohort.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{cohort.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cohort.description || 'No description'}
                  </p>
                </div>
                <Button
                  onClick={() => handleExport(cohort.id)}
                  disabled={exporting}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            ))}
            {(!cohorts || cohorts.length === 0) && (
              <p className="text-center text-muted-foreground py-8">
                No cohorts available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
