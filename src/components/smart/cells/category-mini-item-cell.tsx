import React from 'react'
import { categoryTypeDictionary } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CategoryMiniItemCellProps {
  categoryType: string | null | undefined
  className?: string
  onClick?: () => void
}

export const CategoryMiniItemCell = React.memo(
  ({ categoryType, className, onClick }: CategoryMiniItemCellProps) => {
    if (!categoryType) {
      return <span>-</span>
    }

    const label = categoryTypeDictionary[categoryType] || categoryType

    const content = (
      <div
        className={cn(
          'mx-0 flex flex-col items-start gap-0.5 px-0 font-normal',
          className
        )}
      >
        <span className='text-sm'>{label}</span>
        <code className='text-xs text-muted-foreground'>[{categoryType}]</code>
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

CategoryMiniItemCell.displayName = 'CategoryMiniItemCell'
