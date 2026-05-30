'use client'

import { useEffect, useState } from 'react'
import { MaterialIcon } from '@/components/ui/material-icon'
import { mentorService } from '@/services/api.service'
import { useAuthStore } from '@/store/auth.store'
import { Loading } from '@/components/ui/loading'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

interface AvailabilitySchedule {
  [day: string]: string[]
}

export default function MentorAvailabilityPage() {
  const user = useAuthStore((state) => state.user)
  const [schedule, setSchedule] = useState<AvailabilitySchedule>({})
  const [isAvailable, setIsAvailable] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [mentorId, setMentorId] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    mentorService.getMentors().then((mentors: any[]) => {
      const myProfile = mentors.find((m: any) => m.user_id === user.id)
      if (myProfile) {
        setMentorId(myProfile.id)
        setSchedule(myProfile.availability_schedule || {})
        setIsAvailable(myProfile.is_available ?? true)
      }
    }).catch(() => {
      setError('Failed to load profile.')
    }).finally(() => setIsLoading(false))
  }, [user])

  const toggleSlot = (day: string, time: string) => {
    setSchedule((prev) => {
      const daySlots = prev[day] || []
      const updated = daySlots.includes(time)
        ? daySlots.filter((t) => t !== time)
        : [...daySlots, time].sort()
      return { ...prev, [day]: updated }
    })
  }

  const handleSave = async () => {
    if (!mentorId) return
    setIsSaving(true)
    setError('')
    setSuccess('')
    try {
      await mentorService.updateProfile(mentorId, {
        availability_schedule: schedule,
        is_available: isAvailable,
      })
      setSuccess('Availability updated successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to save availability.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loading />
      </div>
    )
  }

  return (
    <div className="p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto space-y-gutter pb-32 md:pb-8">
      <div>
        <h1 className="text-headline-lg text-primary">Availability</h1>
        <p className="text-body-md text-on-surface-variant">Set your weekly schedule for mentorship sessions</p>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-md rounded-lg text-label-md">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-tertiary-fixed/20 text-on-tertiary-container p-md rounded-lg text-label-md">
          {success}
        </div>
      )}

      {/* Availability Toggle */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-md">
            <MaterialIcon name="event_available" className="text-secondary text-2xl" />
            <div>
              <h3 className="text-title-lg">Accepting Sessions</h3>
              <p className="text-label-md text-on-surface-variant">
                {isAvailable ? 'You are visible to learners and can receive bookings' : 'You are hidden from learners'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              isAvailable ? 'bg-secondary' : 'bg-outline-variant'
            }`}
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
              isAvailable ? 'translate-x-7' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
        <h3 className="text-title-lg mb-lg">Weekly Schedule</h3>
        <p className="text-label-md text-on-surface-variant mb-lg">Click time slots to toggle availability</p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-label-sm text-on-surface-variant text-left p-sm w-20">Time</th>
                {DAYS.map((day) => (
                  <th key={day} className="text-label-sm text-on-surface-variant text-center p-sm">
                    {day.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time}>
                  <td className="text-label-md font-bold p-sm text-on-surface-variant">{time}</td>
                  {DAYS.map((day) => {
                    const isSelected = (schedule[day] || []).includes(time)
                    return (
                      <td key={`${day}-${time}`} className="p-xs text-center">
                        <button
                          onClick={() => toggleSlot(day, time)}
                          className={`w-full py-sm rounded-lg text-label-sm font-bold transition-all ${
                            isSelected
                              ? 'bg-secondary text-on-secondary shadow-sm'
                              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container border border-outline-variant'
                          }`}
                        >
                          {isSelected ? '✓' : '—'}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-on-primary px-xl py-md rounded-xl font-bold text-label-md hover:opacity-90 transition-opacity active:scale-95 duration-150 disabled:opacity-50 flex items-center gap-sm"
        >
          <MaterialIcon name="save" />
          {isSaving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  )
}
