'use client'

import { useCallback, useEffect, useState } from 'react'
import { MaterialIcon } from '@/components/ui/material-icon'
import { sessionService } from '@/services/api.service'
import { Loading } from '@/components/ui/loading'

interface MentorBooking {
  id: string
  learner_id: string
  scheduled_at: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  meeting_url?: string
  notes?: string
  feedback?: { id: string; rating: number; comment?: string }
}

function isSessionExpired(scheduledAt: string, durationMinutes: number): boolean {
  const endTime = new Date(scheduledAt).getTime() + durationMinutes * 60 * 1000
  return Date.now() > endTime
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function MentorSessionsPage() {
  const [bookings, setBookings] = useState<MentorBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [meetingLinkInput, setMeetingLinkInput] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const loadBookings = useCallback(async () => {
    try {
      const data = await sessionService.getMentorBookings()
      setBookings(data || [])
    } catch {
      setError('Unable to load sessions.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  const handleSetMeetingLink = async (bookingId: string) => {
    const url = meetingLinkInput[bookingId]?.trim()
    if (!url) return
    setSavingId(bookingId)
    try {
      await sessionService.setMeetingLink(bookingId, url)
      await loadBookings()
      setMeetingLinkInput((prev) => ({ ...prev, [bookingId]: '' }))
    } catch {
      setError('Failed to set meeting link.')
    } finally {
      setSavingId(null)
    }
  }

  const handleMarkCompleted = async (bookingId: string) => {
    setSavingId(bookingId)
    try {
      await sessionService.updateBooking(bookingId, { status: 'completed' })
      await loadBookings()
    } catch {
      setError('Failed to update session.')
    } finally {
      setSavingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loading />
      </div>
    )
  }

  const sortedBookings = [...bookings].sort((a, b) => {
    const aExpired = isSessionExpired(a.scheduled_at, a.duration_minutes) || a.status === 'cancelled' || a.status === 'completed'
    const bExpired = isSessionExpired(b.scheduled_at, b.duration_minutes) || b.status === 'cancelled' || b.status === 'completed'
    if (aExpired !== bExpired) return aExpired ? 1 : -1
    return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  })

  return (
    <div className="p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto space-y-gutter pb-32 md:pb-8">
      <div>
        <h1 className="text-headline-lg text-primary">My Sessions</h1>
        <p className="text-body-md text-on-surface-variant">Manage your mentorship sessions and add meeting links</p>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-md rounded-lg text-label-md">
          {error}
          <button onClick={() => setError('')} className="ml-md underline">Dismiss</button>
        </div>
      )}

      <div className="space-y-md">
        {sortedBookings.map((booking) => {
          const expired = isSessionExpired(booking.scheduled_at, booking.duration_minutes)
          const isCancelled = booking.status === 'cancelled'
          const isCompleted = booking.status === 'completed'
          const isGreyed = expired || isCancelled || isCompleted
          const needsMeetingLink = !booking.meeting_url && !isGreyed

          return (
            <div
              key={booking.id}
              className={`bg-surface-container-lowest border rounded-xl overflow-hidden shadow-sm transition-all ${
                isGreyed ? 'border-outline-variant opacity-60' : 'border-outline-variant hover:shadow-md'
              }`}
            >
              <div className="p-lg space-y-md">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-md">
                    <div className={`flex flex-col items-center justify-center rounded-lg p-sm min-w-[56px] ${
                      isGreyed ? 'bg-surface-container-low' : 'bg-secondary/10'
                    }`}>
                      <span className={`text-label-sm uppercase font-bold ${isGreyed ? 'text-outline' : 'text-secondary'}`}>
                        {new Date(booking.scheduled_at).toLocaleString('en-US', { month: 'short' })}
                      </span>
                      <span className={`text-headline-md leading-none ${isGreyed ? 'text-outline' : 'text-on-surface'}`}>
                        {new Date(booking.scheduled_at).getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className={`text-title-lg ${isGreyed ? 'text-outline' : 'text-on-surface'}`}>
                        Learner Session
                      </h3>
                      <div className="flex items-center gap-md text-label-md text-on-surface-variant">
                        <span className="flex items-center gap-xs">
                          <MaterialIcon name="schedule" className="text-[16px]" />
                          {formatTime(booking.scheduled_at)}
                        </span>
                        <span className="flex items-center gap-xs">
                          <MaterialIcon name="calendar_today" className="text-[16px]" />
                          {formatDate(booking.scheduled_at)}
                        </span>
                      </div>
                    </div>
                  </div>

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

                {/* Meeting link display */}
                {booking.meeting_url && (
                  <div className="flex items-center gap-sm p-sm bg-surface-container-low rounded-lg">
                    <MaterialIcon name="videocam" filled className="text-secondary text-[18px]" />
                    <a
                      href={booking.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-label-md text-secondary hover:underline truncate"
                    >
                      {booking.meeting_url}
                    </a>
                  </div>
                )}

                {/* Add meeting link form */}
                {needsMeetingLink && (
                  <div className="flex items-center gap-sm p-md bg-surface-container-low rounded-lg border border-dashed border-secondary/30">
                    <MaterialIcon name="link" className="text-secondary text-[20px] shrink-0" />
                    <input
                      type="url"
                      placeholder="Paste Google Meet link (e.g. https://meet.google.com/abc-defg-hij)"
                      value={meetingLinkInput[booking.id] || ''}
                      onChange={(e) => setMeetingLinkInput((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                      className="flex-1 bg-transparent border-none outline-none text-label-md placeholder:text-on-surface-variant/50"
                    />
                    <button
                      onClick={() => handleSetMeetingLink(booking.id)}
                      disabled={!meetingLinkInput[booking.id]?.trim() || savingId === booking.id}
                      className="bg-secondary text-on-secondary px-md py-xs rounded-lg text-label-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
                    >
                      {savingId === booking.id ? 'Saving...' : 'Add Link'}
                    </button>
                  </div>
                )}

                {/* Feedback display */}
                {booking.feedback && (
                  <div className="flex items-center gap-sm p-sm bg-surface-container-low rounded-lg">
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

                {/* Actions */}
                {!isGreyed && booking.meeting_url && (
                  <div className="flex items-center gap-sm pt-sm">
                    <button
                      onClick={() => handleMarkCompleted(booking.id)}
                      disabled={savingId === booking.id}
                      className="flex items-center gap-xs px-md py-xs border border-outline-variant rounded-lg text-label-sm font-bold hover:bg-surface-container transition-colors disabled:opacity-40"
                    >
                      <MaterialIcon name="check_circle" className="text-[16px]" />
                      Mark Completed
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {bookings.length === 0 && !error && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container mb-lg">
            <MaterialIcon name="event_available" className="!text-[40px] text-on-surface-variant" />
          </div>
          <h3 className="text-title-lg text-on-surface mb-sm">No sessions yet</h3>
          <p className="text-body-md text-on-surface-variant">Learners will book sessions with you from the mentors page.</p>
        </div>
      )}
    </div>
  )
}
