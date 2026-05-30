'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MaterialIcon } from '@/components/ui/material-icon'
import { mentorService, sessionService } from '@/services/api.service'
import { Loading } from '@/components/ui/loading'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isAfter } from 'date-fns'

const timeSlots = ['09:00', '10:30', '13:00', '14:45', '16:15']

interface MentorProfile {
  id: string
  name: string
  title: string
  bio: string
}

export default function BookSessionPage() {
  const params = useParams()
  const router = useRouter()
  const mentorId = params.id as string

  const [mentor, setMentor] = useState<MentorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    mentorService.getMentor(mentorId).then((data: any) => {
      setMentor({
        id: data.id,
        name: data.name || data.full_name || 'Mentor',
        title: data.title || data.specialization || '',
        bio: data.bio || '',
      })
    }).catch(() => {
      setMentor(null)
    }).finally(() => setIsLoading(false))
  }, [mentorId])

  const today = new Date()
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = getDay(monthStart)

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) return
    setIsSubmitting(true)
    setError('')
    try {
      const scheduledAt = `${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`
      await sessionService.bookSession(mentorId, scheduledAt)
      setIsConfirmed(true)
    } catch {
      setError('Failed to book session. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loading />
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className="p-margin-mobile md:p-margin-desktop text-center py-20">
        <p className="text-on-surface-variant">Mentor not found.</p>
        <Link href="/mentors" className="text-secondary mt-4 inline-block">Back to Mentors</Link>
      </div>
    )
  }

  // Success / Confirmation State
  if (isConfirmed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-margin-mobile md:px-margin-desktop py-xl">
        <div className="max-w-[600px] w-full">
          <div className="text-center mb-xl">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-tertiary-fixed/20 mb-lg">
              <MaterialIcon name="check_circle" filled className="text-on-tertiary-container !text-[48px]" />
            </div>
            <h1 className="text-headline-lg text-primary mb-sm">Session Successfully Booked!</h1>
            <p className="text-body-lg text-on-surface-variant">Your session has been added to your upcoming tasks.</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-lg md:p-xl space-y-lg">
              {/* Mentor Info */}
              <div className="flex items-center gap-md p-md bg-surface-container-low rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-2xl font-bold">
                  {mentor.name.charAt(0)}
                </div>
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase tracking-wider">Mentor</p>
                  <h3 className="text-title-lg text-primary">{mentor.name}</h3>
                  <p className="text-label-md text-secondary">{mentor.title}</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div className="flex items-start gap-md">
                  <MaterialIcon name="calendar_today" className="text-primary-container mt-1" />
                  <div>
                    <p className="text-label-sm text-on-surface-variant">Date</p>
                    <p className="text-body-md font-semibold text-on-surface">
                      {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-md">
                  <MaterialIcon name="schedule" className="text-primary-container mt-1" />
                  <div>
                    <p className="text-label-sm text-on-surface-variant">Time</p>
                    <p className="text-body-md font-semibold text-on-surface">{selectedTime}</p>
                    <p className="text-label-md text-on-surface-variant">45 min duration</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-lg border-t border-outline-variant space-y-md">
                <Link
                  href="/sessions"
                  className="w-full bg-primary-container text-on-primary text-title-lg py-md rounded-lg flex items-center justify-center gap-sm hover:opacity-90 transition-all"
                >
                  <MaterialIcon name="event_available" filled />
                  View My Sessions
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-xl flex items-center justify-center gap-md">
            <Link href="/dashboard" className="text-label-md text-primary-container px-lg py-sm rounded-full hover:bg-primary-fixed transition-colors">
              Go to Dashboard
            </Link>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <Link href="/mentors" className="text-label-md text-primary-container px-lg py-sm rounded-full hover:bg-primary-fixed transition-colors">
              Browse More Mentors
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Booking Flow
  return (
    <div className="p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto pb-32 md:pb-8">
      {/* Header */}
      <div className="mb-lg">
        <nav className="flex items-center gap-sm text-on-surface-variant text-label-md mb-xs">
          <Link href="/mentors" className="hover:text-primary">Mentors</Link>
          <MaterialIcon name="chevron_right" className="text-[16px]" />
          <span className="text-primary font-semibold">Book a Session</span>
        </nav>
        <h1 className="text-headline-lg text-primary">Schedule your session</h1>
      </div>

      {/* Booking Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left: Mentor Profile Summary */}
        <div className="lg:col-span-4 space-y-gutter">
          <div className="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl shadow-sm">
            <div className="relative w-24 h-24 mx-auto mb-lg">
              <div className="w-full h-full rounded-2xl bg-primary-container flex items-center justify-center text-on-primary text-3xl font-bold">
                {mentor.name.charAt(0)}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-tertiary-fixed text-on-tertiary-fixed p-1 rounded-full border-4 border-surface-container-lowest shadow-sm">
                <MaterialIcon name="verified" filled className="text-[20px]" />
              </div>
            </div>
            <div className="text-center mb-lg">
              <h2 className="text-title-lg text-on-surface">{mentor.name}</h2>
              <p className="text-on-surface-variant text-label-md">{mentor.title}</p>
            </div>
            <div className="space-y-md">
              <div className="flex items-center gap-md p-md bg-surface-container-low rounded-lg">
                <MaterialIcon name="event_note" className="text-secondary" />
                <div>
                  <p className="text-label-sm text-on-surface-variant uppercase">Session Type</p>
                  <p className="text-label-md font-semibold">45-min Mentorship</p>
                </div>
              </div>
            </div>
            {mentor.bio && (
              <div className="mt-lg pt-lg border-t border-outline-variant">
                <h3 className="text-label-sm text-on-surface-variant uppercase mb-md">About</h3>
                <p className="text-body-md text-on-surface-variant">{mentor.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Calendar & Slot Picker */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row h-full">
            {/* Calendar */}
            <div className="flex-1 p-lg md:border-r border-outline-variant">
              <div className="flex items-center justify-between mb-lg">
                <h3 className="text-title-lg">Select Date</h3>
                <div className="flex items-center gap-xs">
                  <button
                    className="p-xs hover:bg-surface-variant rounded-md transition-colors"
                    onClick={() => setCurrentMonth(addDays(monthStart, -1))}
                  >
                    <MaterialIcon name="chevron_left" />
                  </button>
                  <span className="text-label-md font-bold px-md">{format(currentMonth, 'MMMM yyyy')}</span>
                  <button
                    className="p-xs hover:bg-surface-variant rounded-md transition-colors"
                    onClick={() => setCurrentMonth(addDays(monthEnd, 1))}
                  >
                    <MaterialIcon name="chevron_right" />
                  </button>
                </div>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 text-center text-label-sm text-on-surface-variant font-bold mb-sm">
                <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-y-xs">
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-md" />
                ))}
                {daysInMonth.map((day) => {
                  const isPast = !isAfter(day, today) && !isSameDay(day, today)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  return (
                    <button
                      key={day.toISOString()}
                      disabled={isPast}
                      onClick={() => { setSelectedDate(day); setSelectedTime('') }}
                      className={`p-md rounded-lg text-label-md transition-colors ${
                        isSelected
                          ? 'bg-secondary text-on-secondary font-bold shadow-md'
                          : isPast
                            ? 'text-outline opacity-30 cursor-not-allowed'
                            : 'hover:bg-surface-variant'
                      }`}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>

              <div className="mt-lg pt-lg border-t border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-md">
                  <div className="flex items-center gap-xs text-label-sm">
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-xs text-label-sm">
                    <div className="w-3 h-3 rounded-full border border-outline-variant" />
                    <span>Available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="w-full md:w-80 p-lg bg-surface-container-low">
              <h3 className="text-title-lg mb-lg">Available Slots</h3>
              {selectedDate ? (
                <div className="space-y-sm max-h-[400px] overflow-y-auto">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`w-full py-md px-lg border rounded-xl text-label-md font-bold text-center transition-all ${
                        selectedTime === time
                          ? 'bg-secondary text-on-secondary border-secondary shadow-md'
                          : 'bg-surface-container-lowest border-outline-variant hover:border-secondary hover:text-secondary'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-body-md text-on-surface-variant text-center py-8">Select a date to see available slots</p>
              )}

              {/* Confirmation zone */}
              {selectedDate && selectedTime && (
                <div className="mt-lg pt-lg border-t border-outline-variant">
                  <div className="bg-surface-container p-md rounded-lg mb-lg border border-outline-variant">
                    <p className="text-label-sm text-on-surface-variant uppercase">Your Selection</p>
                    <p className="text-label-md font-bold">
                      {format(selectedDate, 'MMM d')} • {selectedTime}
                    </p>
                  </div>
                  {error && <p className="text-sm text-error mb-md">{error}</p>}
                  <button
                    onClick={handleConfirmBooking}
                    disabled={isSubmitting}
                    className="w-full bg-primary text-on-primary py-lg rounded-xl font-bold text-label-md hover:bg-on-primary-fixed-variant transition-colors shadow-lg active:scale-95 duration-150 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
