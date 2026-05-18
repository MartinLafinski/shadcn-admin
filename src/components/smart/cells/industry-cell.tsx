import React from 'react'
import { Button } from '@/components/ui/button.tsx'
import { type IndustryItemData } from '@/features/industries/data/schemas.ts'

interface IndustryCellProps {
  industry: IndustryItemData | null
  onClick?: () => void
}

export const IndustryCell = React.memo(
  ({ industry, onClick }: IndustryCellProps) => {
    if (!industry) {
      return <span>-</span>
    }

    return (
      <Button
        variant='ghost'
        onClick={onClick}
        className='mx-0 flex flex-col items-start gap-0.5 px-0 font-normal'
      >
        <span className='text-sm'>{industry.industry_name}</span>
        <code className='text-xs text-muted-foreground'>
          [{industry.industry_slug}]
        </code>
      </Button>
    )
  }
)

IndustryCell.displayName = 'IndustryCell'
