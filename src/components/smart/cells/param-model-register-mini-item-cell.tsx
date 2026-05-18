import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ParamModelRegisterMiniItemCellProps {
  entity:
    | {
        register_name: string | null | undefined
        register_slug: string
      }
    | null
    | undefined
  asButton?: boolean
  className?: string
  onClick?: () => void
}

export const ParamModelRegisterMiniItemCell = React.memo(
  ({
    entity,
    asButton,
    className,
    onClick,
  }: ParamModelRegisterMiniItemCellProps) => {
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
          {entity.register_name || entity.register_slug}
        </span>
        <code className='text-xs text-muted-foreground'>
          [{entity.register_slug}]
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

ParamModelRegisterMiniItemCell.displayName = 'ParamModelRegisterMiniItemCell'
