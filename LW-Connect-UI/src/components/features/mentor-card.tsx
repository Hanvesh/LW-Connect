'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Calendar, Clock } from 'lucide-react'
import { Mentor } from '@/types'

interface MentorCardProps {
  mentor: Mentor
  onBook?: (mentor: Mentor) => void
}

export function MentorCard({ mentor, onBook }: MentorCardProps) {
  return (
    <Link href={`/mentors/${mentor.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary">
                  {mentor.name.charAt(0)}
                </span>
              </div>
              <div>
                <CardTitle className="text-lg">{mentor.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{mentor.title}</p>
              </div>
            </div>
            {mentor.isAvailable && (
              <Badge variant="success">Available</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>
          
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{mentor.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{mentor.totalSessions} sessions</span>
            </div>
          </div>

          {onBook && (
            <Button 
              onClick={(e) => {
                e.preventDefault();
                onBook(mentor);
              }} 
              className="w-full"
            >
              Book Session
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
