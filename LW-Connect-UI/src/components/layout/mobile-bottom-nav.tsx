'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MaterialIcon } from '@/components/ui/material-icon'

const navItems = [
  { name: 'Home', href: '/dashboard', icon: 'home' },
  { name: 'Discover', href: '/courses', icon: 'explore' },
  { name: 'Assistant', href: '/ai-assistant', icon: 'auto_awesome', featured: true },
  { name: 'Sessions', href: '/sessions', icon: 'event_available' },
  { name: 'Profile', href: '/dashboard', icon: 'person' },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container rounded-t-xl shadow-lg border-t border-outline-variant/10">
      {navItems.map((item) => {
        const isActive = pathname === item.href

        if (item.featured) {
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center text-secondary active:scale-90 duration-75"
            >
              <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white -mt-8 shadow-lg">
                <MaterialIcon name={item.icon} filled className="text-xl text-white" />
              </div>
            </Link>
          )
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center rounded-2xl px-4 py-1 active:scale-90 duration-75',
              isActive
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface-variant'
            )}
          >
            <MaterialIcon name={item.icon} className="text-sm" />
            <span className="text-label-sm text-[10px]">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
