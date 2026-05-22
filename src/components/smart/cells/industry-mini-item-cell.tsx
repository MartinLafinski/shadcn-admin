import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button.tsx'
import { type IndustryItemData } from '@/features/industries/data/schemas'

interface IndustryMiniItemCellProps {
  industry: IndustryItemData | null | undefined
  isPrimary?: boolean
  className?: string
  onClick?: () => void
}

export const IndustryMiniItemCell = React.memo(
  ({ industry, isPrimary, className, onClick }: IndustryMiniItemCellProps) => {
    if (!industry) {
      return <span>-</span>
    }

    const isSecondary: boolean = !isPrimary

    const entityClassName = isSecondary || 'font-semibold'

    const content = (
      <div
        className={cn(
          'mx-0 flex flex-col items-start gap-0.5 px-0 font-normal',
          className
        )}
      >
        <span className={cn('text-sm', entityClassName)}>
          {industry.industry_name}
        </span>
        <code className='text-xs text-muted-foreground'>
          [{industry.industry_slug}]
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

IndustryMiniItemCell.displayName = 'IndustryMiniItemCell'
