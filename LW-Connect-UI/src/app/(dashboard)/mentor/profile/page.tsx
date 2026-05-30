'use client'

import { useEffect, useState } from 'react'
import { MaterialIcon } from '@/components/ui/material-icon'
import { mentorService } from '@/services/api.service'
import { useAuthStore } from '@/store/auth.store'
import { Loading } from '@/components/ui/loading'

interface MentorProfile {
  id: string
  bio: string
  expertise: string[]
  skills: string[]
  job_title: string
  organization: string
  years_of_experience: number
  is_available: boolean
}

export default function MentorProfilePage() {
  const user = useAuthStore((state) => state.user)
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [bio, setBio] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [organization, setOrganization] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    mentorService.getMentors().then((mentors: any[]) => {
      const myProfile = mentors.find((m: any) => m.user_id === user.id)
      if (myProfile) {
        setProfile(myProfile)
        setBio(myProfile.bio || '')
        setJobTitle(myProfile.job_title || '')
        setOrganization(myProfile.organization || '')
      }
    }).catch(() => {
      setError('Failed to load profile.')
    }).finally(() => setIsLoading(false))
  }, [user])

  const handleSave = async () => {
    if (!profile) return
    setIsSaving(true)
    setError('')
    setSuccess('')
    try {
      await mentorService.updateProfile(profile.id, {
        bio,
        job_title: jobTitle,
        organization,
      })
      setSuccess('Profile updated!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Failed to save profile.')
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
        <h1 className="text-headline-lg text-primary">My Profile</h1>
        <p className="text-body-md text-on-surface-variant">Manage your mentor profile information</p>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container p-md rounded-lg text-label-md">{error}</div>
      )}
      {success && (
        <div className="bg-tertiary-fixed/20 text-on-tertiary-container p-md rounded-lg text-label-md">{success}</div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm space-y-lg">
        {/* Name & Email (read-only) */}
        <div className="flex items-center gap-lg p-md bg-surface-container-low rounded-lg">
          <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-on-primary text-2xl font-bold">
            {user?.name?.charAt(0) || 'M'}
          </div>
          <div>
            <h2 className="text-title-lg">{user?.name}</h2>
            <p className="text-label-md text-on-surface-variant">{user?.email}</p>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-md">
          <div>
            <label className="text-label-sm text-on-surface-variant uppercase block mb-xs">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md focus:ring-2 focus:ring-secondary outline-none"
              placeholder="e.g. Senior Data Scientist"
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant uppercase block mb-xs">Organization</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md focus:ring-2 focus:ring-secondary outline-none"
              placeholder="e.g. InnovateCity"
            />
          </div>
          <div>
            <label className="text-label-sm text-on-surface-variant uppercase block mb-xs">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm text-body-md focus:ring-2 focus:ring-secondary outline-none resize-none"
              placeholder="Tell learners about your experience..."
            />
          </div>
        </div>

        {/* Skills & Expertise (read-only display) */}
        {profile && (
          <div className="space-y-md pt-lg border-t border-outline-variant">
            <div>
              <h3 className="text-label-sm text-on-surface-variant uppercase mb-sm">Expertise</h3>
              <div className="flex flex-wrap gap-sm">
                {(profile.expertise || []).map((item) => (
                  <span key={item} className="px-md py-xs bg-secondary-fixed text-on-secondary-fixed rounded-full text-label-sm">
                    {item}
                  </span>
                ))}
                {(!profile.expertise || profile.expertise.length === 0) && (
                  <span className="text-label-md text-on-surface-variant">No expertise listed</span>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-label-sm text-on-surface-variant uppercase mb-sm">Skills</h3>
              <div className="flex flex-wrap gap-sm">
                {(profile.skills || []).map((item) => (
                  <span key={item} className="px-md py-xs bg-tertiary-fixed/20 text-on-tertiary-container rounded-full text-label-sm">
                    {item}
                  </span>
                ))}
                {(!profile.skills || profile.skills.length === 0) && (
                  <span className="text-label-md text-on-surface-variant">No skills listed</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-on-primary px-xl py-md rounded-xl font-bold text-label-md hover:opacity-90 transition-opacity active:scale-95 duration-150 disabled:opacity-50 flex items-center gap-sm"
        >
          <MaterialIcon name="save" />
          {isSaving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}
