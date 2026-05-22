import React from 'react'
import { SquareCheckBigIcon, SquareXIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button.tsx'
import type { PrejobItemData } from '@/features/prejobs/data/schemas'

interface PrejobMiniItemCellProps {
  prejob: PrejobItemData
  isPrimary?: boolean
  className?: string
  onClick?: () => void
}

export const PrejobMiniItemCell = React.memo(
  ({ prejob, isPrimary, className, onClick }: PrejobMiniItemCellProps) => {
    const isSecondary: boolean = !isPrimary
    const enabled = isPrimary ? prejob.has_enabled : prejob.prejob_enabled
    const locked = isPrimary ? prejob.has_locked : prejob.prejob_locked
    const paused = isPrimary ? prejob.has_paused : prejob.prejob_paused
    const limited = isPrimary ? prejob.has_limited : prejob.prejob_limited
    const canApply = !!prejob.can_apply

    let prejobClassName: string = 'text-green-600'
    if (!enabled) {
      prejobClassName = 'text-red-600 dark:text-red-700'
    } else if (locked) {
      prejobClassName = 'text-yellow-600 dark:text-yellow-600'
    } else if (paused) {
      prejobClassName = 'text-violet-600 dark:text-violet-500'
    } else if (limited) {
      prejobClassName = 'text-stone-600 dark:text-stone-500'
    } else if (!canApply) {
      prejobClassName = 'text-muted-foreground'
    }

    const content = (
      <div className='flex items-center gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarFallback>{prejob.prejob_name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className='flex flex-col'>
          <div className='flex items-center gap-2'>
            <div className='grid h-3 w-3 grid-cols-2 gap-0.5'>
              <div
                className={
                  enabled
                    ? 'bg-green-400 dark:bg-green-700'
                    : 'bg-red-400 dark:bg-red-700'
                }
              />
              <div
                className={
                  locked
                    ? 'bg-yellow-400 dark:bg-yellow-700'
                    : 'bg-green-400 dark:bg-green-700'
                }
              />
              <div
                className={
                  paused
                    ? 'bg-violet-400 dark:bg-violet-700'
                    : 'bg-green-400 dark:bg-green-700'
                }
              />
              <div
                className={
                  limited
                    ? 'bg-stone-400 dark:bg-stone-600'
                    : 'bg-green-400 dark:bg-green-700'
                }
              />
            </div>
            <span
              className={cn(
                'text-sm',
                isSecondary ? '' : 'font-semibold',
                prejobClassName
              )}
            >
              {prejob.prejob_name}
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            {canApply ? (
              <SquareCheckBigIcon className='h-3.5 w-3.5 text-green-400 dark:text-green-700' />
            ) : (
              <SquareXIcon className='h-3.5 w-3.5 text-red-400 dark:text-red-800' />
            )}
            <code className='text-xs text-muted-foreground'>
              {prejob.prejob_slug}
            </code>
          </div>
        </div>
      </div>
    )
    return (
      <Button
        variant='ghost'
        onClick={onClick}
        className={cn(
          'mx-0 flex flex-col items-start gap-0.5 bg-transparent px-0 font-normal hover:bg-transparent',
          className
        )}
      >
        {content}
      </Button>
    )
  }
)

PrejobMiniItemCell.displayName = 'PrejobMiniItemCell'
