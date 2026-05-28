'use client'

import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminService, courseService } from '@/services/api.service'
import { getApiErrorMessage } from '@/lib/user-mapper'

interface Course {
  id: string
  title: string
}

interface CohortCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
}

export function CohortCreateModal({ isOpen, onClose, onCreated }: CohortCreateModalProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [name, setName] = useState('')
  const [courseId, setCourseId] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('30')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    courseService.getCourses().then(setCourses).catch(() => setCourses([]))
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId) {
      setError('Please select a course')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      await adminService.createCohort({
        name,
        course_id: courseId,
        description: description || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        max_participants: Number(maxParticipants) || 30,
        is_active: true,
      })
      setName('')
      setCourseId('')
      setDescription('')
      setStartDate('')
      setEndDate('')
      setMaxParticipants('30')
      onCreated()
      onClose()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to create cohort'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Cohort">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Cohort name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Select a course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>

        <Input
          type="number"
          min={1}
          placeholder="Max participants"
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(e.target.value)}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Cohort'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
