'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MentorCard } from '@/components/features/mentor-card'
import { Search, Filter } from 'lucide-react'
import { mentorService } from '@/services/api.service'
import { Mentor } from '@/types'
import { Loading } from '@/components/ui/loading'

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    mentorService.getMentors().then((data) => {
      const mapped: Mentor[] = (data || []).map((m: any) => ({
        id: m.id,
        name: m.name || m.full_name || '',
        title: m.title || m.job_title || m.specialization || '',
        expertise: m.expertise || m.skills || [],
        bio: m.bio || '',
        rating: m.rating ?? 0,
        totalSessions: m.total_sessions ?? 0,
        availability: m.availability || '',
        isAvailable: m.is_available ?? true,
      }))
      setMentors(mapped)
    }).catch(() => {
      setMentors([])
    }).finally(() => setIsLoading(false))
  }, [])

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loading />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mentors</h1>
        <p className="text-muted-foreground">Browse available mentors in the program</p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, title, or expertise..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Mentors Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMentors.map((mentor) => (
          <MentorCard key={mentor.id} mentor={mentor} />
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No mentors found matching your search</p>
        </div>
      )}
    </div>
  )
}
