import React from 'react'
import { SigmaIcon, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CounterCellProps {
  count: number | null | undefined
  className?: string
  icon?: LucideIcon
  onClick?: () => void
}

export const CounterCell = React.memo(
  ({ count, className, icon: Icon, onClick }: CounterCellProps) => {
    if (count === undefined || count === null || count === 0) {
      return <span>-</span>
    }

    const content = (
      <>
        {Icon ? (
          <Icon size={16} className='opacity-70' />
        ) : (
          <SigmaIcon size={16} className='opacity-70' />
        )}
        <span className='font-semibold'>{count}</span>
      </>
    )

    if (onClick) {
      return (
        <Button
          variant='ghost'
          size='sm'
          className={cn('h-auto px-0 py-0 hover:bg-transparent', className)}
          onClick={onClick}
        >
          <span
            className={cn(
              'inline-flex items-center justify-center gap-1 rounded-2xl bg-muted px-1.5 py-0 pr-2 font-mono text-sm tabular-nums',
              className
            )}
          >
            {content}
          </span>
        </Button>
      )
    }

    return (
      <div
        className={cn(
          'inline-flex items-center justify-center gap-1 rounded-2xl bg-muted px-1.5 py-0 pr-2 font-mono text-sm tabular-nums',
          className
        )}
      >
        {content}
      </div>
    )
  }
)

CounterCell.displayName = 'CounterCell'
