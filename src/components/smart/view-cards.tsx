import React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  icon: React.FC<{ className?: string }>
  count: number
  label: string
  colorClass: string
  bgClass: string
}

export function StatCard({
  icon: Icon,
  count,
  label,
  colorClass,
  bgClass,
}: StatCardProps) {
  return (
    <Card className='overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg'>
      <CardContent className='flex items-center gap-2 px-3 py-0'>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            bgClass
          )}
        >
          <Icon className={cn('h-6 w-6', colorClass)} />
        </div>
        <div>
          <p className='text-xl font-bold tabular-nums'>
            {count.toLocaleString()}
          </p>
          <p className='text-sm text-muted-foreground'>{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface CategoryCardProps {
  icon: React.FC<{ className?: string }>
  ctype: string
  name: string
  slug: string
  colorClass: string
  bgClass: string
}

export function CategoryCard({
  icon: Icon,
  ctype,
  name,
  slug,
  colorClass,
  bgClass,
}: CategoryCardProps) {
  return (
    <Card className='overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg'>
      <CardContent className='flex items-center gap-2 px-3 py-0'>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            bgClass
          )}
        >
          <Icon className={cn('h-6 w-6', colorClass)} />
        </div>
        <div>
          <p className='text-sm font-bold tabular-nums'>{name}</p>
          <p className='text-sm text-muted-foreground'>
            {ctype}: {slug}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
