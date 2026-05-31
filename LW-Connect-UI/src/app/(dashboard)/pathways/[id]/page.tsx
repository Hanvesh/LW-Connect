'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';

export default function PathwayDetailPage() {
  const { id } = useParams();

  const { data: pathway, isLoading } = useQuery({
    queryKey: ['pathway', id],
    queryFn: () => apiService.get(`/pathways/${id}`)
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!pathway) {
    return <div className="p-8">Pathway not found</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{pathway.title}</h1>
          <p className="text-muted-foreground mt-2">{pathway.description}</p>
        </div>
        {pathway.difficulty && (
          <Badge variant="secondary">{pathway.difficulty}</Badge>
        )}
      </div>

      <div className="flex gap-6">
        {pathway.duration_weeks && (
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span>{pathway.duration_weeks} weeks</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-muted-foreground" />
          <span>{pathway.courses?.length || 0} courses</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Courses in this Pathway</h2>
        {pathway.courses?.map((course: any, index: number) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <CardTitle>{course.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {course.description}
                    </p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Button size="lg" className="w-full md:w-auto">
        Enroll in Pathway
      </Button>
    </div>
  );
}
