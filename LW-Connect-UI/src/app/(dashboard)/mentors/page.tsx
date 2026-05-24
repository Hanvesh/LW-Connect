'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MentorCard } from '@/components/features/mentor-card'
import { BookingModal } from '@/components/features/booking-modal'
import { Search, Filter } from 'lucide-react'
import { mockMentors } from '@/lib/mock-data'
import { Mentor } from '@/types'

export default function MentorsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const filteredMentors = mockMentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.expertise.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleBook = (mentor: Mentor) => {
    setSelectedMentor(mentor)
    setIsBookingOpen(true)
  }

  const handleConfirmBooking = (date: string, time: string) => {
    console.log('Booking confirmed:', { mentor: selectedMentor, date, time })
    // In production, call API here
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Mentors</h1>
        <p className="text-muted-foreground">Connect with experienced professionals</p>
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
          <MentorCard key={mentor.id} mentor={mentor} onBook={handleBook} />
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No mentors found matching your search</p>
        </div>
      )}

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        mentor={selectedMentor}
        onConfirm={handleConfirmBooking}
      />
    </div>
  )
}
