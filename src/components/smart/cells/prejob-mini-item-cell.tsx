import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PrejobMiniItemCellProps {
  entity:
    | {
        prejob_name: string
        prejob_slug: string
      }
    | null
    | undefined
  asButton?: boolean
  className?: string
  onClick?: () => void
}

export const PrejobMiniItemCell = React.memo(
  ({ entity, asButton, className, onClick }: PrejobMiniItemCellProps) => {
    if (!entity) {
      return <span>-</span>
    }

    const entityClassName = asButton || 'font-semibold'

    const content = (
      <div
        className={cn(
          'mx-0 flex flex-col items-start gap-0.5 px-0 font-normal',
          className
        )}
      >
        <span className={cn('text-sm', entityClassName)}>
          {entity.prejob_name}
        </span>
        <code className='text-xs text-muted-foreground'>
          [{entity.prejob_slug}]
        </code>
      </div>
    )

    return (
      <Button
        variant='ghost'
        onClick={onClick}
        className='mx-0 flex flex-col items-start gap-0.5 bg-transparent px-0 font-normal hover:bg-transparent'
      >
        {content}
      </Button>
    )
  }
)

PrejobMiniItemCell.displayName = 'PrejobMiniItemCell'
