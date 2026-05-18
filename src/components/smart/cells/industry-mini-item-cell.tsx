import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button.tsx'
import { type IndustryItemData } from '@/features/industries/data/schemas'

interface IndustryMiniItemCellProps {
  entity: IndustryItemData | null | undefined
  asButton?: boolean
  className?: string
  onClick?: () => void
}

export const IndustryMiniItemCell = React.memo(
  ({ entity, asButton, className, onClick }: IndustryMiniItemCellProps) => {
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
          {entity.industry_name}
        </span>
        <code className='text-xs text-muted-foreground'>
          [{entity.industry_slug}]
        </code>
      </div>
    )

    // if (!asButton) {
    //   return content
    // }

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

IndustryMiniItemCell.displayName = 'IndustryMiniItemCell'
