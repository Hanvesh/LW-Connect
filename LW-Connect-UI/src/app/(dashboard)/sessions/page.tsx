'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { MaterialIcon } from '@/components/ui/material-icon'
import { sessionService } from '@/services/api.service'
import { Loading } from '@/components/ui/loading'
import { FeedbackModal } from '@/components/features/feedback-modal'

interface BookingFeedback {
  id: string
  rating: number
  comment?: string
}

interface Booking {
  id: string
  mentor_id: string
  mentor_name?: string
  scheduled_at: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  meeting_url?: string
  notes?: string
  feedback?: BookingFeedback
}

function isSessionExpired(scheduledAt: string, durationMinutes: number): boolean {
  const endTime = new Date(scheduledAt).getTime() + durationMinutes * 60 * 1000
  return Date.now() > endTime
}

function isSessionJoinable(scheduledAt: string, durationMinutes: number): boolean {
  const start = new Date(scheduledAt).getTime()
  const end = start + durationMinutes * 60 * 1000
  const now = Date.now()
  // Joinable 10 minutes before start until end
  return now >= start - 10 * 60 * 1000 && now <= end
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatEndTime(dateStr: string, durationMinutes: number) {
  const end = new Date(new Date(dateStr).getTime() + durationMinutes * 60 * 1000)
  return end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function generateGoogleCalendarUrl(booking: Booking) {
  const start = new Date(booking.scheduled_at)
  const end = new Date(start.getTime() + booking.duration_minutes * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Mentorship Session with ${booking.mentor_name || 'Mentor'}`,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: booking.meeting_url ? `Join: ${booking.meeting_url}` : 'Mentorship session via LW-Connect',
    ...(booking.meeting_url && { location: booking.meeting_url }),
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function generateICSFile(booking: Booking) {
  const start = new Date(booking.scheduled_at)
  const end = new Date(start.getTime() + booking.duration_minutes * 60 * 1000)
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Mentorship Session with ${booking.mentor_name || 'Mentor'}`,
    `DESCRIPTION:${booking.meeting_url ? `Join: ${booking.meeting_url}` : 'LW-Connect Session'}`,
    booking.meeting_url ? `LOCATION:${booking.meeting_url}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'session.ics'
  a.click()
  URL.revokeObjectURL(url)
}

export default function SessionsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedbackBooking, setFeedbackBooking] = useState<Booking | null>(null)

  const loadBookings = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await sessionService.getMyBookings()
      setBookings(data || [])
    } catch {
      setError('Unable to load sessions. Make sure you are logged in as a learner.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loading />
      </div>
    )
  }

  // Sort: active/upcoming first, then expired/completed/cancelled
  const sortedBookings = [...bookings].sort((a, b) => {
    const aExpired = isSessionExpired(a.scheduled_at, a.duration_minutes) || a.status === 'cancelled' || a.status === 'completed'
    const bExpired = isSessionExpired(b.scheduled_at, b.duration_minutes) || b.status === 'cancelled' || b.status === 'completed'
    if (aExpired !== bExpired) return aExpired ? 1 : -1
    return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  })

  return (
    <div className="p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto space-y-gutter pb-32 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-primary">My Sessions</h1>
          <p className="text-body-md text-on-surface-variant">View and manage your mentorship sessions</p>
        </div>
        <Link
          href="/mentors"
          className="bg-secondary text-on-secondary px-lg py-sm rounded-lg text-label-md font-bold hover:opacity-90 transition-opacity active:scale-95 duration-150 flex items-center gap-sm"
        >
          <MaterialIcon name="add" />
          Book Session
        </Link>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-md rounded-lg text-label-md">
          {error}
        </div>
      )}

      {/* Session Cards */}
      <div className="space-y-md">
        {sortedBookings.map((booking) => {
          const expired = isSessionExpired(booking.scheduled_at, booking.duration_minutes)
          const joinable = isSessionJoinable(booking.scheduled_at, booking.duration_minutes)
          const isCancelled = booking.status === 'cancelled'
          const isCompleted = booking.status === 'completed'
          const isGreyed = expired || isCancelled || isCompleted

          return (
            <div
              key={booking.id}
              className={`bg-surface-container-lowest border rounded-xl overflow-hidden shadow-sm transition-all ${
                isGreyed
                  ? 'border-outline-variant opacity-60'
                  : 'border-outline-variant hover:shadow-md'
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Left: Date badge */}
                <div className={`flex flex-row md:flex-col items-center justify-center p-lg md:min-w-[100px] gap-md md:gap-xs ${
                  isGreyed ? 'bg-surface-container-low' : 'bg-secondary/10'
                }`}>
                  <span className={`text-label-sm uppercase font-bold ${isGreyed ? 'text-outline' : 'text-secondary'}`}>
                    {new Date(booking.scheduled_at).toLocaleString('en-US', { month: 'short' })}
                  </span>
                  <span className={`text-headline-md leading-none ${isGreyed ? 'text-outline' : 'text-on-surface'}`}>
                    {new Date(booking.scheduled_at).getDate()}
                  </span>
                </div>

                {/* Middle: Session details */}
                <div className="flex-1 p-lg space-y-sm">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-title-lg ${isGreyed ? 'text-outline' : 'text-on-surface'}`}>
                      {booking.mentor_name || 'Mentor'}
                    </h3>
                    <span className={`px-sm py-xs rounded-full text-label-sm font-bold uppercase ${
                      isCancelled ? 'bg-error-container text-on-error-container'
                        : isCompleted ? 'bg-tertiary-fixed/20 text-on-tertiary-fixed-variant'
                        : expired ? 'bg-surface-container text-outline'
                        : booking.status === 'confirmed' ? 'bg-tertiary-fixed/20 text-on-tertiary-container'
                        : 'bg-secondary-fixed text-on-secondary-fixed'
                    }`}>
                      {isCancelled ? 'Cancelled' : isCompleted ? 'Completed' : expired ? 'Expired' : booking.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-lg text-label-md text-on-surface-variant">
                    <span className="flex items-center gap-xs">
                      <MaterialIcon name="schedule" className="text-[16px]" />
                      {formatTime(booking.scheduled_at)} – {formatEndTime(booking.scheduled_at, booking.duration_minutes)}
                    </span>
                    <span className="flex items-center gap-xs">
                      <MaterialIcon name="calendar_today" className="text-[16px]" />
                      {formatDate(booking.scheduled_at)}
                    </span>
                    <span className="flex items-center gap-xs">
                      <MaterialIcon name="timer" className="text-[16px]" />
                      {booking.duration_minutes} min
                    </span>
                  </div>

                  {booking.notes && (
                    <p className="text-body-md text-on-surface-variant">{booking.notes}</p>
                  )}

                  {/* Meeting link indicator */}
                  {booking.meeting_url && !isGreyed && (
                    <div className="flex items-center gap-xs text-label-sm text-secondary">
                      <MaterialIcon name="videocam" filled className="text-[16px]" />
                      <span>Meeting link available</span>
                    </div>
                  )}

                  {/* Feedback display */}
                  {booking.feedback && (
                    <div className="flex items-center gap-sm mt-sm p-sm bg-surface-container-low rounded-lg">
                      <div className="flex items-center gap-xs">
                        {Array.from({ length: booking.feedback.rating }).map((_, i) => (
                          <MaterialIcon key={i} name="star" filled className="text-[16px] text-yellow-500" />
                        ))}
                      </div>
                      {booking.feedback.comment && (
                        <span className="text-label-sm text-on-surface-variant">{booking.feedback.comment}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-row md:flex-col items-center justify-center gap-sm p-lg md:border-l border-outline-variant">
                  {/* Join button - only when session is active and has meeting link */}
                  {booking.meeting_url && !isGreyed && (
                    <a
                      href={booking.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-sm px-lg py-sm rounded-xl font-bold text-label-md transition-all active:scale-95 duration-150 ${
                        joinable
                          ? 'bg-primary-container text-on-primary shadow-lg hover:opacity-90'
                          : 'bg-secondary text-on-secondary hover:opacity-90'
                      }`}
                    >
                      <MaterialIcon name="videocam" filled />
                      {joinable ? 'Join Now' : 'Join'}
                    </a>
                  )}

                  {/* Calendar invite buttons */}
                  {!isGreyed && !isCancelled && (
                    <div className="flex items-center gap-xs">
                      <a
                        href={generateGoogleCalendarUrl(booking)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-sm border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
                        title="Add to Google Calendar"
                      >
                        <MaterialIcon name="event" className="text-[18px] text-on-surface-variant" />
                      </a>
                      <button
                        onClick={() => generateICSFile(booking)}
                        className="p-sm border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
                        title="Download .ics file"
                      >
                        <MaterialIcon name="calendar_month" className="text-[18px] text-on-surface-variant" />
                      </button>
                    </div>
                  )}

                  {/* Feedback button for completed sessions */}
                  {isCompleted && !booking.feedback && (
                    <button
                      onClick={() => setFeedbackBooking(booking)}
                      className="flex items-center gap-sm px-lg py-sm bg-secondary-fixed text-on-secondary-fixed rounded-xl font-bold text-label-md hover:opacity-90 transition-all"
                    >
                      <MaterialIcon name="rate_review" />
                      Feedback
                    </button>
                  )}

                  {/* Expired indicator */}
                  {expired && !isCompleted && !isCancelled && (
                    <span className="text-label-sm text-outline flex items-center gap-xs">
                      <MaterialIcon name="event_busy" className="text-[16px]" />
                      Expired
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state */}
      {bookings.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container mb-lg">
            <MaterialIcon name="event_available" className="!text-[40px] text-on-surface-variant" />
          </div>
          <h3 className="text-title-lg text-on-surface mb-sm">No sessions yet</h3>
          <p className="text-body-md text-on-surface-variant mb-lg">Book a session with a mentor to get started</p>
          <Link
            href="/mentors"
            className="inline-flex items-center gap-sm bg-secondary text-on-secondary px-xl py-md rounded-xl font-bold text-label-md hover:opacity-90 transition-opacity active:scale-95 duration-150"
          >
            <MaterialIcon name="groups" />
            Browse Mentors
          </Link>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackBooking && (
        <FeedbackModal
          bookingId={feedbackBooking.id}
          mentorName={feedbackBooking.mentor_name || 'Mentor'}
          isOpen={!!feedbackBooking}
          onClose={() => setFeedbackBooking(null)}
          onSubmitted={loadBookings}
        />
      )}
    </div>
  )
}
