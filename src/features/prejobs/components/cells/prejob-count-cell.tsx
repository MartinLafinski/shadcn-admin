import React from 'react'
import { Link } from '@tanstack/react-router'
import { ExternalLinkIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import { type PrejobItemData } from '@/features/prejobs/data/schemas'

interface PrejobCountCellProps {
  entrypoint: PrejobItemData
  countKey: keyof PrejobItemData
  to: string
  searchParams?: Record<string, any>
  className?: string
  showExternalIcon?: boolean
}

export const PrejobCountCell = React.memo(
  ({
    entrypoint,
    countKey,
    to,
    searchParams,
    className,
    showExternalIcon = true,
  }: PrejobCountCellProps) => {
    const count = entrypoint[countKey] as number | null | undefined

    if (count === undefined || count === null || count === 0) {
      return <span>-</span>
    }

    return (
      <Link to={to as any} search={{ ...searchParams }} target='_blank'>
        <Badge variant='secondary' className='text-md'>
          <span className={className}>{count}</span>
          {showExternalIcon && <ExternalLinkIcon className='ml-1 h-3 w-3' />}
        </Badge>
      </Link>
    )
  }
)

PrejobCountCell.displayName = 'PrejobCountCell'
