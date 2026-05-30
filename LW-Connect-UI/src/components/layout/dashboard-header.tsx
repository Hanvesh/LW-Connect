'use client'

import Link from 'next/link'
import { MaterialIcon } from '@/components/ui/material-icon'
import { useAuthStore } from '@/store/auth.store'

export function DashboardHeader() {
  const user = useAuthStore((state) => state.user)

  return (
    <header className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop bg-surface border-b border-outline-variant sticky top-0 z-40">
      <div className="flex items-center w-full max-w-xl">
        <div className="relative w-full">
          <MaterialIcon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-full focus:ring-2 focus:ring-secondary-container outline-none text-label-md"
            placeholder="Search learning materials, mentors, or sessions..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-lg ml-lg shrink-0">
        <button className="text-on-surface-variant hover:text-primary transition-opacity" aria-label="Notifications">
          <MaterialIcon name="notifications" />
        </button>
        <Link
          href="/ai-assistant"
          className="text-on-surface-variant hover:text-primary transition-opacity"
          aria-label="AI Assistant"
        >
          <MaterialIcon name="auto_awesome" filled />
        </Link>
        <div
          className="h-8 w-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container"
          title={user?.name}
        >
          <MaterialIcon name="account_circle" />
        </div>
      </div>
    </header>
  )
}
