import React from 'react'
import { Link } from '@tanstack/react-router'
import { type LucideIcon } from 'lucide-react'
import { type PrejobItemData } from '@/features/prejobs/data/schemas'

interface PrejobMaterialCountCellProps {
  prejob: PrejobItemData
  countKey: keyof PrejobItemData
  icon: LucideIcon
}

export const PrejobMaterialCountCell = React.memo(
  ({ prejob, countKey, icon: Icon }: PrejobMaterialCountCellProps) => {
    const count = prejob[countKey] as number | null | undefined

    if (count === undefined || count === null || count === 0) {
      return <span>-</span>
    }

    return (
      <Link
        to='/prejobs'
        // search={{ prejob_id: prejob.prejob_id }}
        target='_blank'
      >
        <div className='text-md flex items-center gap-0.5'>
          <span className='font-semibold'>{count ?? 0}</span>
          <Icon size={16} strokeWidth={1} className='text-muted-foreground' />
        </div>
      </Link>
    )
  }
)

PrejobMaterialCountCell.displayName = 'PrejobMaterialCountCell'
