'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/api.service'
import { Loading } from '@/components/ui/loading'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser } = useAuthStore()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  const isFullBleed = pathname === '/ai-assistant'

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    if (!token && !user) {
      router.push('/login')
      setIsCheckingAuth(false)
      return
    }

    if (token && !user) {
      authService
        .getCurrentUser()
        .then((currentUser) => {
          setUser(currentUser)
        })
        .catch(() => {
          localStorage.removeItem('token')
          router.push('/login')
        })
        .finally(() => setIsCheckingAuth(false))
      return
    }

    setIsCheckingAuth(false)
  }, [user, setUser, router])

  useEffect(() => {
    if (!user || isCheckingAuth) return

    if (pathname.startsWith('/admin') && user.role !== 'admin') {
      router.push('/dashboard')
      return
    }

    if (pathname.startsWith('/mentor/') && user.role !== 'mentor' && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, pathname, router, isCheckingAuth])

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <Loading />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {!isFullBleed && <DashboardHeader />}
        <main className={`flex-1 overflow-y-auto bg-surface ${isFullBleed ? '' : 'pb-20 md:pb-0'}`}>
          {children}
        </main>
        <MobileBottomNav />
      </div>
    </div>
  )
}
