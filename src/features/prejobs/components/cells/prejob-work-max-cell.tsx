import React from 'react'
import { Link } from '@tanstack/react-router'
import { ExternalLinkIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import { type PrejobItemData } from '../../data/schemas'

interface PrejobWorkMaxCellProps {
  prejob: PrejobItemData
}

export const PrejobWorkMaxCell = React.memo(
  ({ prejob }: PrejobWorkMaxCellProps) => {
    return (
      <Link
        to='/prejobs'
        search={{ entrypoint_id: prejob.entrypoint_id ?? undefined }}
        target='_blank'
      >
        <Badge variant='secondary' className='text-md'>
          <span className='text-green-600'>
            {prejob.working_spider_task_count || '-'}
          </span>
          <span className='text-muted-foreground'>/</span>
          <span className='text-yellow-600'>
            {prejob.prejob_max_spider_task_count || '-'}
          </span>
          <span className='text-muted-foreground'>/</span>
          <span className='text-orange-600'>
            {prejob.entrypoint?.entrypoint_max_spider_task_count || '-'}
          </span>
          <span className='text-muted-foreground'>/</span>
          <span className='text-red-600'>
            {prejob.entrypoint?.website?.website_max_spider_task_count || '-'}
          </span>
          <ExternalLinkIcon className='ml-1 h-3 w-3' />
        </Badge>
      </Link>
    )
  }
)

PrejobWorkMaxCell.displayName = 'PrejobWorkMaxCell'
