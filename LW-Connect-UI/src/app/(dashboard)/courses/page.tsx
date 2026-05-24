'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { CourseCard } from '@/components/features/course-card'
import { Search } from 'lucide-react'
import { mockCourses } from '@/lib/mock-data'

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCourses = mockCourses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Courses</h1>
        <p className="text-muted-foreground">Explore learning opportunities</p>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No courses found matching your search</p>
        </div>
      )}
    </div>
  )
}
