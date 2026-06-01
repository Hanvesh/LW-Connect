'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/api.service'
import { getApiErrorMessage } from '@/lib/user-mapper'
import PreferencesOnboarding from '@/components/features/preferences-onboarding'

type SignupStep = 'account' | 'preferences' | 'complete'

export default function SignupPage() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [currentStep, setCurrentStep] = useState<SignupStep>('account')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'learner' | 'mentor'>('learner')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState<any>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await authService.signup(email, password, fullName, role)
      setUser(data.user)
      setUserData(data.user)
      
      // For learners, show preferences onboarding
      if (role === 'learner') {
        setCurrentStep('preferences')
      } else {
        // For mentors, go directly to dashboard
        router.push('/mentor/dashboard')
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Signup failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferencesComplete = async (preferences: any) => {
    try {
      // Save preferences
      const response = await fetch('/api/v1/preferences/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(preferences),
      })
      
      if (response.ok) {
        setCurrentStep('complete')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (error) {
      console.error('Error saving preferences:', error)
      // Still proceed to dashboard even if preferences fail
      router.push('/dashboard')
    }
  }

  const handleSkipPreferences = () => {
    router.push('/dashboard')
  }

  if (currentStep === 'preferences') {
    return (
      <PreferencesOnboarding 
        onComplete={handlePreferencesComplete}
        onSkip={handleSkipPreferences}
      />
    )
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to LW-Connect!</h2>
            <p className="text-gray-600 mb-4">
              Your account has been created and preferences saved. 
              Redirecting to your dashboard...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join LW-Connect to start learning</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant={role === 'learner' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setRole('learner')}
              >
                Learner
              </Button>
              <Button
                type="button"
                variant={role === 'mentor' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setRole('mentor')}
              >
                Mentor
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Each email can only be used for one account type. Choose learner or mentor carefully.
            </p>
            {role === 'learner' && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  📚 As a learner, we'll help you set up your preferences after creating your account 
                  to personalize your experience.
                </p>
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
