'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MaterialIcon } from '@/components/ui/material-icon'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/api.service'
import { getApiErrorMessage } from '@/lib/user-mapper'

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await authService.login(email, password)
      setUser(data.user)
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (data.user.role === 'mentor') {
        router.push('/mentor/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = (role: 'learner' | 'mentor' | 'admin') => {
    const demoUsers = {
      learner: { id: '1', email: 'learner@demo.com', name: 'Sarah Chen', role: 'learner' as const },
      mentor: { id: '2', email: 'mentor@demo.com', name: 'Dr. Sarah Johnson', role: 'mentor' as const },
      admin: { id: '3', email: 'admin@demo.com', name: 'Admin User', role: 'admin' as const },
    }
    setUser(demoUsers[role])
    router.push(role === 'admin' ? '/admin/dashboard' : role === 'mentor' ? '/mentor/dashboard' : '/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-margin-mobile">
      <div className="w-full max-w-md">
        <div className="text-center mb-xl">
          <Link href="/" className="inline-block">
            <h1 className="text-headline-md font-bold text-primary">LW-Connect</h1>
          </Link>
          <p className="text-label-md text-on-surface-variant mt-sm">Public Innovation Portal</p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-ambient p-xl">
          <div className="text-center mb-lg">
            <h2 className="text-title-lg font-bold">Welcome back</h2>
            <p className="text-body-md text-on-surface-variant">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-md">
            <div>
              <label className="text-label-md font-medium block mb-xs">Email</label>
              <Input
                type="email"
                placeholder="you@agency.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-surface-container-low border-outline-variant rounded-lg focus:ring-secondary-container"
              />
            </div>
            <div>
              <label className="text-label-md font-medium block mb-xs">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-surface-container-low border-outline-variant rounded-lg focus:ring-secondary-container"
              />
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-lg">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-outline-variant" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface-container-lowest px-sm text-on-surface-variant text-label-sm">Demo Access</span>
              </div>
            </div>

            <div className="mt-md space-y-sm">
              {(['learner', 'mentor', 'admin'] as const).map((role) => (
                <Button
                  key={role}
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDemoLogin(role)}
                >
                  Demo as {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <p className="text-center text-body-md text-on-surface-variant mt-lg">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-secondary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-lg flex items-center justify-center gap-sm text-on-surface-variant">
          <MaterialIcon name="verified_user" className="text-on-tertiary-container" />
          <span className="text-label-sm">Government-grade security</span>
        </div>
      </div>
    </div>
  )
}
