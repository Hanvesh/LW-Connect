'use client';

import { useQuery } from '@tanstack/react-query';
import { aiService } from '@/services/ai.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';

interface AIRecommendationsProps {
  userId: string;
  skills?: string[];
  type: 'mentors' | 'courses';
}

export function AIRecommendations({ userId, skills = [], type }: AIRecommendationsProps) {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['ai-recommendations', type, userId],
    queryFn: () => 
      type === 'mentors' 
        ? aiService.getMentorRecommendations(userId, skills, 3)
        : aiService.getCourseRecommendations(userId, skills, 3),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            AI Recommended {type === 'mentors' ? 'Mentors' : 'Courses'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const items = Array.isArray(recommendations)
    ? recommendations
    : recommendations?.recommendations || recommendations?.data || [];

  if (items.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          AI Recommended {type === 'mentors' ? 'Mentors' : 'Courses'}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Personalized recommendations based on your profile
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((rec: any) => (
          <div
            key={rec.id || rec.mentor_id || rec.course_id}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {rec.name || rec.mentor?.name || rec.course?.title || 'Recommended'}
                </h3>
                <p className="text-sm text-gray-600">
                  {rec.title || rec.mentor?.title || rec.course?.description || ''}
                </p>
              </div>
              <Badge variant="secondary" className="ml-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                {Math.round((rec.match_score || rec.score || 0.85) * 100)}% match
              </Badge>
            </div>
            
            {rec.explanation && (
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Why: </span>
                {rec.explanation}
              </p>
            )}

            {rec.reason && (
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Reason: </span>
                {rec.reason}
              </p>
            )}

            <Link 
              href={type === 'mentors' ? `/mentors/${rec.mentor_id || rec.id}` : `/courses/${rec.course_id || rec.id}`}
            >
              <Button size="sm" variant="outline" className="w-full">
                View {type === 'mentors' ? 'Profile' : 'Details'}
              </Button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
