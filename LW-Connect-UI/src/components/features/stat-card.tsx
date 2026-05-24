'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
}

export function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs mt-1">
            {change >= 0 ? (
              <ArrowUp className="h-3 w-3 text-green-600" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-600" />
            )}
            <span className={cn(change >= 0 ? 'text-green-600' : 'text-red-600')}>
              {Math.abs(change)}%
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
