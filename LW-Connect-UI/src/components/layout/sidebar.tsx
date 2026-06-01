'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { MaterialIcon } from '@/components/ui/material-icon'

const learnerNav = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { name: 'Courses', href: '/courses', icon: 'school' },
  { name: 'Mentors', href: '/mentors', icon: 'groups' },
  { name: 'Cohorts', href: '/cohorts', icon: 'diversity_3' },
  { name: 'AI Assistant', href: '/ai-assistant', icon: 'auto_awesome' },
  { name: 'Sessions', href: '/sessions', icon: 'event_available' },
  { name: 'Preferences', href: '/preferences', icon: 'tune' },
]

const mentorNav = [
  { name: 'Dashboard', href: '/mentor/dashboard', icon: 'dashboard' },
  { name: 'Sessions', href: '/mentor/sessions', icon: 'event_available' },
  { name: 'Availability', href: '/mentor/availability', icon: 'schedule' },
  { name: 'Profile', href: '/mentor/profile', icon: 'person' },
]

const adminNav = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: 'analytics' },
  { name: 'Cohorts', href: '/admin/cohorts', icon: 'groups' },
  { name: 'Users', href: '/admin/users', icon: 'person' },
  { name: 'Analytics', href: '/admin/analytics', icon: 'bar_chart' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navigation =
    user?.role === 'admin' ? adminNav : user?.role === 'mentor' ? mentorNav : learnerNav

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-primary-container py-lg shadow-md z-50">
      <div className="px-lg mb-xl">
        <h1 className="text-headline-md font-bold text-on-primary">LW-Connect</h1>
        <p className="text-label-md text-on-primary-container">Public Innovation Portal</p>
      </div>

      <nav className="flex-1 space-y-sm">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center py-3 transition-colors',
                isActive
                  ? 'text-tertiary-fixed font-bold border-l-4 border-tertiary-fixed pl-4 hover:bg-on-primary-fixed-variant/10'
                  : 'text-on-primary-container hover:text-tertiary-fixed-dim pl-5 hover:bg-on-primary-fixed-variant/10'
              )}
            >
              <MaterialIcon name={item.icon} filled={isActive} className="mr-3 text-xl" />
              <span className="text-label-md">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-lg py-md border-t border-on-primary-container/20 space-y-md">
        {user?.role === 'mentor' && (
          <Link
            href="/mentor/sessions"
            className="block w-full bg-secondary text-on-secondary-container py-sm rounded-lg text-label-md text-center hover:opacity-90 transition-opacity active:scale-95"
          >
            Manage Sessions
          </Link>
        )}
        {user?.role === 'learner' && (
          <Link
            href="/sessions"
            className="block w-full bg-secondary text-on-secondary-container py-sm rounded-lg text-label-md text-center hover:opacity-90 transition-opacity active:scale-95"
          >
            My Sessions
          </Link>
        )}
        <div className="space-y-sm">
          <button
            onClick={handleLogout}
            className="flex items-center text-on-primary-container hover:text-tertiary-fixed-dim pl-1 py-1 transition-colors w-full"
          >
            <MaterialIcon name="logout" className="mr-3" />
            <span className="text-label-md">Logout</span>
          </button>
          <a
            href="#"
            className="flex items-center text-on-primary-container hover:text-tertiary-fixed-dim pl-1 py-1 transition-colors"
          >
            <MaterialIcon name="help" className="mr-3" />
            <span className="text-label-md">Support</span>
          </a>
        </div>
      </div>
    </aside>
  )
}
