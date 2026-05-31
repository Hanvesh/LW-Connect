'use client';

import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function PathwaysPage() {
  const { data: pathways, isLoading } = useQuery({
    queryKey: ['pathways'],
    queryFn: () => apiService.get('/pathways')
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Learning Pathways</h1>
        <p className="text-muted-foreground">Structured learning programs to achieve your goals</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pathways?.map((pathway: any) => (
          <Card key={pathway.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{pathway.title}</CardTitle>
                {pathway.difficulty && (
                  <Badge variant={
                    pathway.difficulty === 'beginner' ? 'success' :
                    pathway.difficulty === 'intermediate' ? 'default' : 'secondary'
                  }>
                    {pathway.difficulty}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {pathway.description || 'No description available'}
              </p>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {pathway.duration_weeks && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{pathway.duration_weeks} weeks</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Multiple courses</span>
                </div>
              </div>

              <Link href={`/pathways/${pathway.id}`}>
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Start Learning
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!pathways || pathways.length === 0) && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No learning pathways available yet</p>
        </div>
      )}
    </div>
  );
}
