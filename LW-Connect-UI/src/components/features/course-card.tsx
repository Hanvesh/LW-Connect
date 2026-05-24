'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Clock, Star } from 'lucide-react'
import { Course } from '@/types'

interface CourseCardProps {
  course: Course
  onEnroll?: (course: Course) => void
}

export function CourseCard({ course, onEnroll }: CourseCardProps) {
  const levelColors = {
    beginner: 'success',
    intermediate: 'warning',
    advanced: 'destructive',
  } as const

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{course.title}</CardTitle>
          <Badge variant={levelColors[course.level]}>
            {course.level}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">by {course.instructor}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.enrollments} enrolled</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{course.rating.toFixed(1)}</span>
          </div>
        </div>

        {onEnroll && (
          <Button onClick={() => onEnroll(course)} variant="outline" className="w-full">
            View Course
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
