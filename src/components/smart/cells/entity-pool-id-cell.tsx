import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const POOL_COLORS: Record<number, string> = {
  0: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
  1: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  2: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  3: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300 border-lime-200 dark:border-lime-800',
  4: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  5: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  6: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  7: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  8: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  9: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
}

const NULL_CLASS =
  'border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500'

interface EntityPoolIdCellProps {
  value: number | null | undefined
  className?: string
}

export const EntityPoolIdCell = React.memo(
  ({ value, className }: EntityPoolIdCellProps) => {
    if (!value) {
      return (
        <Badge variant='outline' className={cn(NULL_CLASS, className)}>
          # 0
        </Badge>
      )
    }
    const color = POOL_COLORS[value % 10] ?? NULL_CLASS
    return (
      <Badge variant='outline' className={cn(color, className)}>
        # {value}
      </Badge>
    )
  }
)

EntityPoolIdCell.displayName = 'EntityPoolIdCell'
