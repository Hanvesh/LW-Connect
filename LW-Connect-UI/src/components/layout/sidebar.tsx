'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, BookOpen, MessageSquare, Calendar, Settings, BarChart3, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'

const learnerNav = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Find Mentors', href: '/mentors', icon: Users },
  { name: 'Courses', href: '/courses', icon: BookOpen },
  { name: 'AI Assistant', href: '/ai-assistant', icon: MessageSquare },
  { name: 'My Sessions', href: '/sessions', icon: Calendar },
]

const mentorNav = [
  { name: 'Dashboard', href: '/mentor/dashboard', icon: Home },
  { name: 'Sessions', href: '/mentor/sessions', icon: Calendar },
  { name: 'Availability', href: '/mentor/availability', icon: Settings },
  { name: 'Profile', href: '/mentor/profile', icon: Users },
]

const adminNav = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
  { name: 'Cohorts', href: '/admin/cohorts', icon: Users },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const navigation = user?.role === 'admin' ? adminNav : user?.role === 'mentor' ? mentorNav : learnerNav

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">LW-Connect</h1>
        <p className="text-sm text-muted-foreground mt-1">PeopleWave</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  )
}
