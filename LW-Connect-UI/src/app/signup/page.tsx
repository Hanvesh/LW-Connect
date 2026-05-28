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

export default function SignupPage() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'learner' | 'mentor'>('learner')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await authService.signup(email, password, fullName, role)
      setUser(data.user)
      router.push(role === 'mentor' ? '/mentor/dashboard' : '/dashboard')
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Signup failed'))
    } finally {
      setIsLoading(false)
    }
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
