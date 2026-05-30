'use client'

import { useCallback, useEffect, useState } from 'react'
import { MaterialIcon } from '@/components/ui/material-icon'
import { sessionService } from '@/services/api.service'
import { Loading } from '@/components/ui/loading'
import api from '@/lib/api'

interface MentorBooking {
  id: string
  learner_id: string
  scheduled_at: string
  duration_minutes: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  meeting_url?: string
  notes?: string
  mentor_name?: string
  feedback?: { id: string; rating: number; comment?: string }
}

interface LearnerOption {
  id: string
  full_name: string
  email: string
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
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Create session form state
  const [learners, setLearners] = useState<LearnerOption[]>([])
  const [selectedLearnerId, setSelectedLearnerId] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const [sessionMeetingUrl, setSessionMeetingUrl] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [isCreating, setIsCreating] = useState(false)

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

  const loadLearners = async () => {
    try {
      const { data } = await api.get('/users', { params: { role: 'learner' } })
      setLearners((data || []).filter((u: any) => u.role === 'learner').map((u: any) => ({
        id: u.id,
        full_name: u.full_name,
        email: u.email,
      })))
    } catch {
      setLearners([])
    }
  }

  const handleOpenCreate = () => {
    setShowCreateForm(true)
    loadLearners()
  }

  const handleCreateSession = async () => {
    if (!selectedLearnerId || !sessionDate || !sessionTime) return
    setIsCreating(true)
    setError('')
    try {
      const scheduledAt = `${sessionDate}T${sessionTime}:00`
      // Create booking via mentor-specific endpoint
      const { data } = await api.post('/bookings/mentor/create', {
        learner_id: selectedLearnerId,
        scheduled_at: scheduledAt,
        meeting_url: sessionMeetingUrl || undefined,
        notes: sessionNotes || undefined,
      })
      // If meeting URL provided, also set it to confirm
      if (sessionMeetingUrl && data?.id) {
        await sessionService.setMeetingLink(data.id, sessionMeetingUrl)
      }
      setShowCreateForm(false)
      setSelectedLearnerId('')
      setSessionDate('')
      setSessionTime('')
      setSessionMeetingUrl('')
      setSessionNotes('')
      await loadBookings()
    } catch {
      setError('Failed to create session. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-headline-lg text-primary">My Sessions</h1>
          <p className="text-body-md text-on-surface-variant">Schedule and manage mentorship sessions</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-secondary text-on-secondary px-lg py-sm rounded-lg text-label-md font-bold hover:opacity-90 transition-opacity active:scale-95 duration-150 flex items-center gap-sm"
        >
          <MaterialIcon name="add" />
          Create Session
        </button>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-md rounded-lg text-label-md">
          {error}
          <button onClick={() => setError('')} className="ml-md underline">Dismiss</button>
        </div>
      )}

      {/* Create Session Form */}
      {showCreateForm && (
        <div className="bg-surface-container-lowest border-2 border-secondary/30 rounded-xl p-lg shadow-md space-y-md">
          <div className="flex items-center justify-between">
            <h3 className="text-title-lg flex items-center gap-sm">
              <MaterialIcon name="event_note" className="text-secondary" />
              Schedule New Session
            </h3>
            <button onClick={() => setShowCreateForm(false)} className="p-xs hover:bg-surface-variant rounded-md">
              <MaterialIcon name="close" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase block mb-xs">Learner</label>
              <select
                value={selectedLearnerId}
                onChange={(e) => setSelectedLearnerId(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md focus:ring-2 focus:ring-secondary outline-none"
              >
                <option value="">Select a learner...</option>
                {learners.map((l) => (
                  <option key={l.id} value={l.id}>{l.full_name} ({l.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase block mb-xs">Date</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md focus:ring-2 focus:ring-secondary outline-none"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase block mb-xs">Time</label>
              <input
                type="time"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md focus:ring-2 focus:ring-secondary outline-none"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase block mb-xs">Google Meet Link</label>
              <input
                type="url"
                value={sessionMeetingUrl}
                onChange={(e) => setSessionMeetingUrl(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md focus:ring-2 focus:ring-secondary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-label-sm text-on-surface-variant uppercase block mb-xs">Notes (optional)</label>
            <input
              type="text"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="Session topic or agenda..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md focus:ring-2 focus:ring-secondary outline-none"
            />
          </div>

          <div className="flex justify-end gap-sm pt-sm">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-lg py-sm border border-outline-variant rounded-lg text-label-md hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSession}
              disabled={!selectedLearnerId || !sessionDate || !sessionTime || isCreating}
              className="bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center gap-sm"
            >
              <MaterialIcon name="check" />
              {isCreating ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </div>
      )}

      {/* Session Cards */}
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

                {booking.notes && (
                  <p className="text-body-md text-on-surface-variant">{booking.notes}</p>
                )}

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

      {bookings.length === 0 && !error && !showCreateForm && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-container mb-lg">
            <MaterialIcon name="event_available" className="!text-[40px] text-on-surface-variant" />
          </div>
          <h3 className="text-title-lg text-on-surface mb-sm">No sessions yet</h3>
          <p className="text-body-md text-on-surface-variant mb-lg">Create your first session to get started</p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-sm bg-secondary text-on-secondary px-xl py-md rounded-xl font-bold text-label-md hover:opacity-90 transition-opacity active:scale-95 duration-150"
          >
            <MaterialIcon name="add" />
            Create Session
          </button>
        </div>
      )}
    </div>
  )
}
