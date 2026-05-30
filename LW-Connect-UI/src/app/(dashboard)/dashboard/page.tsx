'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MaterialIcon } from '@/components/ui/material-icon'
import { mockMentors, mockCourses } from '@/lib/mock-data'
import { useAuthStore } from '@/store/auth.store'
import { sessionService } from '@/services/api.service'

const COURSE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB57XpIhtAdRi15ajb0C-zsE9YtsNn6tg3lj6fj0gbPPBW8d22hnE4FBkKy-0_eVhYu3SMzrLm5pqdr1snto17Jo22y8VIxmTKNefmE8Uigx7FBKa-OFNrsC9II0pGzjr9_4ZID-5xB46yfczQxu9cLRJHPIMJaA822kAn-O779mGQym93z09muYXxEKWNimd9ZnrcB6PQfoQ5aAKqfbLs3UgOBakHtt1UVptJUpmrFp_GJFpcxHqZignKFp9hxlXgMK2wI1PwSgJ4'

const MENTOR_IMAGES = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA3i9x-i6ZYJ94uSudR5tZWPY2WmGO8WZw67zeODnM9g4PpsKzuuUDgqXwcrFgjxpRaA3E4n9kznLAPFy4D_0zXJbN3IJT-6TMET32rplyIqJWU2hd1EqIHfL55lCaIwTzpfKx9Lq5PEnzcYikeZQYiJnHzScjHQonuMwaSF1GngUDf1WEZfKWo3xBf_cjJNMV1P69Er4Ous2Iq-SPXOJVRPty4XFvJsZE41TXp1K_tZKb8OZaXzBrSvB0EMHMikCbWmgs0h9kCq7w',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAm3fbiVqBHLbeyP0H2mY90Ev6vBafCnHfsnOJxrV1XKZDgaddkNgwVddh96ThAt5bHvTzSRvUg-EyHxZQxM3bh8u38Q9YKK712kfF-Hnn_2t2hD3FWL1aCd7WD7YoXejYXza4cOm7INTKOD5uWRubQoEsdb8km5PP2y0PEnoY58yVFjO9JUnNDVU5xGCbe3K_SL-rW-QeMlz6PC7LDODfZNhX-IgRslv1q4VhYWsFlV9oeMTaKkTjSsMO2ARGsY-aoUiMGh8TEbxo',
]

interface BookingItem {
  id: string
  mentor_name?: string
  scheduled_at: string
  duration_minutes: number
  status: string
  meeting_url?: string
}

function formatSessionDate(dateStr: string) {
  const date = new Date(dateStr)
  return {
    month: date.toLocaleString('en-US', { month: 'short' }),
    day: date.getDate(),
  }
}

function formatSessionTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const firstName = user?.name?.split(' ')[0] || 'there'
  const [upcomingSessions, setUpcomingSessions] = useState<BookingItem[]>([])
  const recommendedMentors = mockMentors.slice(0, 2)
  const currentCourse = mockCourses[1]

  useEffect(() => {
    if (user?.role === 'learner') {
      sessionService.getMyBookings().then((data: BookingItem[]) => {
        const upcoming = (data || []).filter(
          (b) => b.status === 'pending' || b.status === 'confirmed'
        )
        setUpcomingSessions(upcoming)
      }).catch(() => setUpcomingSessions([]))
    }
  }, [user])

  return (
    <div className="p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto space-y-gutter">
      {/* Hero Widget */}
      <section className="relative overflow-hidden rounded-xl bg-primary-container p-xl text-on-primary shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-lg">
          <div className="space-y-sm">
            <h2 className="text-headline-lg">Welcome back, {firstName}.</h2>
            {upcomingSessions.length > 0 && upcomingSessions[0].meeting_url ? (
              <p className="text-body-lg text-primary-fixed">
                Your next session with &quot;{upcomingSessions[0].mentor_name || 'Mentor'}&quot; is ready to join.
              </p>
            ) : upcomingSessions.length > 0 ? (
              <p className="text-body-lg text-primary-fixed">
                Your next session with &quot;{upcomingSessions[0].mentor_name || 'Mentor'}&quot; is coming up.
              </p>
            ) : (
              <p className="text-body-lg text-primary-fixed">
                Ready to continue your learning journey?
              </p>
            )}
            <div className="flex gap-md pt-md flex-wrap">
              {upcomingSessions.length > 0 && upcomingSessions[0].meeting_url ? (
                <a
                  href={upcomingSessions[0].meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-secondary text-on-secondary-container px-lg py-sm rounded-lg text-label-md hover:opacity-90 transition-opacity flex items-center gap-sm"
                >
                  <MaterialIcon name="videocam" filled />
                  Join Now
                </a>
              ) : (
                <Link
                  href="/mentors"
                  className="bg-secondary text-on-secondary-container px-lg py-sm rounded-lg text-label-md hover:opacity-90 transition-opacity"
                >
                  Book Session
                </Link>
              )}
              <Link
                href="/sessions"
                className="border border-outline-variant text-on-primary px-lg py-sm rounded-lg text-label-md hover:bg-white/10 transition-colors"
              >
                View Sessions
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-secondary rounded-full blur-[100px] opacity-20" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-tertiary-fixed rounded-full blur-[100px] opacity-10" />
      </section>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Left Column */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter">
          {/* Current Learning Pathway */}
          <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
            <div className="flex justify-between items-center mb-lg">
              <h3 className="text-title-lg">Current Learning Pathway</h3>
              <Link href="/courses" className="text-secondary text-label-md hover:underline">
                View All
              </Link>
            </div>
            <div className="flex flex-col md:flex-row gap-lg items-start">
              <div className="w-full md:w-1/3 aspect-video rounded-lg overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt="Course Thumbnail" className="w-full h-full object-cover" src={COURSE_IMAGE} />
              </div>
              <div className="flex-1 space-y-md w-full">
                <div className="flex items-center gap-sm">
                  <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant text-xs font-bold rounded uppercase">
                    Government
                  </span>
                  <span className="text-on-surface-variant text-label-sm">• 64% Complete</span>
                </div>
                <h4 className="text-headline-md">{currentCourse.title}</h4>
                <div className="w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full transition-all duration-700 w-[64%]" />
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-body-md text-on-surface-variant">Module 4: Agile Governance Models</p>
                  <Link href="/courses" className="flex items-center gap-xs text-secondary font-bold">
                    <span className="text-label-md">Resume</span>
                    <MaterialIcon name="play_circle" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="ai-glow bg-surface-container-lowest rounded-xl p-lg space-y-lg relative overflow-hidden">
            <div className="flex items-center gap-sm mb-md">
              <MaterialIcon name="auto_awesome" filled className="text-secondary" />
              <h3 className="text-title-lg">AI Mentor Recommendations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {recommendedMentors.map((mentor, index) => (
                <Link
                  key={mentor.id}
                  href="/mentors"
                  className="glass-card p-md rounded-xl border border-outline-variant flex items-center gap-md hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-secondary/20 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={mentor.name}
                      className="w-full h-full object-cover"
                      src={MENTOR_IMAGES[index] || MENTOR_IMAGES[0]}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-xs">
                      <h5 className="text-label-md font-bold">{mentor.name}</h5>
                      <MaterialIcon name="verified" filled className="text-secondary text-sm" />
                    </div>
                    <p className="text-label-sm text-on-surface-variant">{mentor.title}</p>
                    <p className="text-label-sm text-secondary mt-1">{98 - index * 3}% Match for your path</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="grid grid-cols-2 gap-lg">
            <div className="bg-surface-container rounded-xl p-lg flex flex-col items-center justify-center text-center border border-outline-variant">
              <MaterialIcon name="school" className="text-secondary mb-2 text-3xl" />
              <span className="text-display-lg block leading-none">12</span>
              <span className="text-label-sm text-on-surface-variant">Courses Completed</span>
            </div>
            <div className="bg-surface-container rounded-xl p-lg flex flex-col items-center justify-center text-center border border-outline-variant">
              <MaterialIcon name="timer" className="text-secondary mb-2 text-3xl" />
              <span className="text-display-lg block leading-none">48</span>
              <span className="text-label-sm text-on-surface-variant">Hours Mentored</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-lg border border-outline-variant shadow-sm">
            <h3 className="text-title-lg mb-lg">Upcoming Sessions</h3>
            <div className="space-y-md">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.slice(0, 2).map((session, index) => {
                  const { month, day } = formatSessionDate(session.scheduled_at)
                  return (
                    <div
                      key={session.id}
                      className={`p-md bg-surface-container-low rounded-lg flex gap-md group hover:bg-surface-container transition-colors border-l-4 ${
                        index === 0 ? 'border-secondary' : 'border-outline-variant'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center bg-white rounded p-2 min-w-[50px] shadow-sm">
                        <span className={`text-label-sm uppercase ${index === 0 ? 'text-secondary' : 'text-on-surface-variant'}`}>
                          {month}
                        </span>
                        <span className="text-headline-md leading-none">{day}</span>
                      </div>
                      <div className="flex-1">
                        <h6 className="text-label-md font-bold">{session.mentor_name || 'Mentor'}</h6>
                        <p className="text-label-sm text-on-surface-variant">Mentorship Session</p>
                        <p className={`text-label-sm mt-1 flex items-center gap-1 ${index === 0 ? 'text-secondary' : 'text-on-surface-variant'}`}>
                          <MaterialIcon name="schedule" className="text-xs" />
                          {formatSessionTime(session.scheduled_at)}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-body-md text-on-surface-variant text-center py-4">No upcoming sessions</p>
              )}
            </div>
            <Link
              href="/sessions"
              className="block w-full mt-xl py-sm border-2 border-outline-variant rounded-lg text-label-md text-center hover:bg-surface-container transition-colors"
            >
              Manage Calendar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
