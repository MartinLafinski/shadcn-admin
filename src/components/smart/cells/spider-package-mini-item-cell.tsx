import React from 'react'
import { SquareCheckBigIcon, SquareXIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SpiderPackageMiniItemCellProps {
  entity:
    | {
        spider_package_name: string
        spider_package_slug: string
        spider_package_enabled: boolean
      }
    | null
    | undefined
  isPrimary?: boolean
  className?: string
  onClick?: () => void
}

export const SpiderPackageMiniItemCell = React.memo(
  ({
    entity,
    isPrimary,
    className,
    onClick,
  }: SpiderPackageMiniItemCellProps) => {
    if (!entity) {
      return <span>-</span>
    }

    const entityClassName = isPrimary && 'font-semibold'

    const content = (
      <div
        className={cn(
          'mx-0 flex flex-col items-start gap-0.5 px-0 font-normal',
          className
        )}
      >
        <p className='flex flex-row items-center gap-1'>
          <span className={cn('text-sm', entityClassName)}>
            {entity.spider_package_name}
          </span>
        </p>
        <p className='flex flex-row items-center gap-1'>
          {entity.spider_package_enabled ? (
            <SquareCheckBigIcon className='h-3.5 w-3.5 text-green-400 dark:text-green-700' />
          ) : (
            <SquareXIcon className='h-3.5 w-3.5 text-red-400 dark:text-red-800' />
          )}
          <code className='text-xs text-muted-foreground'>
            [{entity.spider_package_slug}]
          </code>
        </p>
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

SpiderPackageMiniItemCell.displayName = 'SpiderPackageMiniItemCell'
