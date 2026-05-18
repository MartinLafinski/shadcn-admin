import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  sub?: string
  color?: 'emerald' | 'amber' | 'indigo' | 'sky' | 'red' | 'zinc'
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'zinc',
}: StatCardProps) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
    zinc: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400',
  }

  return (
    <div className='rounded-xl border border-border bg-card p-4'>
      <div className='flex items-center gap-3'>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorMap[color]}`}
        >
          <Icon className='h-4 w-4' />
        </div>
        <div>
          <div className='text-xs text-muted-foreground'>{label}</div>
          <div className='text-xl leading-tight font-bold text-foreground'>
            {value}
          </div>
          {sub && (
            <div className='mt-0.5 text-xs text-muted-foreground/60'>{sub}</div>
          )}
        </div>
      </div>
    </div>
  )
}
