import React from 'react'
import { Link } from '@tanstack/react-router'
import { ExternalLinkIcon, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EntityItemCountCellProps {
  count: number | null | undefined
  to: string
  searchParams?: Record<string, any>
  className?: string
  icon?: LucideIcon
}

export const EntityItemCountCell = React.memo(
  ({
    count,
    to,
    searchParams,
    className,
    icon: Icon,
  }: EntityItemCountCellProps) => {
    if (count === undefined || count === null || count === 0) {
      return <span>-</span>
    }

    return (
      <Link
        to={to as any}
        // @ts-expect-error - TanStack Router type issue
        search={{ ...searchParams }}
        target='_blank'
        className={cn('flex flex-row items-center')}
      >
        <div
          className={cn(
            'flex items-center justify-center gap-1 rounded-2xl bg-muted px-1.5 py-0 pr-2 text-sm',
            className
          )}
        >
          {Icon ? (
            <Icon size={16} className='opacity-70' />
          ) : (
            <ExternalLinkIcon size={16} className='opacity-70' />
          )}
          <span className='font-semibold'>{count}</span>
        </div>
      </Link>
    )
  }
)

EntityItemCountCell.displayName = 'EntityItemCountCell'
