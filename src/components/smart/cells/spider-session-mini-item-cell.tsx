import React from 'react'
import { SquareCheckBigIcon, SquareXIcon } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { Button } from '@/components/ui/button.tsx'
import { type SpiderSessionItemData } from '@/features/spider-sessions/data/schemas.ts'

interface SpiderSessionMiniItemCellProps {
  session: SpiderSessionItemData | null
  className?: string
  isPrimary?: boolean
  onClick?: () => void
}

export const SpiderSessionMiniItemCell = React.memo(
  ({
    session,
    className,
    isPrimary,
    onClick,
  }: SpiderSessionMiniItemCellProps) => {
    if (!session) {
      return <span>-</span>
    }
    const isSecondary: boolean = !isPrimary
    const enabled = session.has_enabled
    const locked = session.has_locked
    const paused = session.has_paused
    const limited = session.has_limited
    const expired = session.has_expired
    const canApply = !!session.can_apply

    let sessionClassName: string = 'text-green-600'
    if (!enabled) {
      sessionClassName = 'text-red-600 dark:text-red-700'
    } else if (expired) {
      sessionClassName = 'text-rose-600 dark:text-rose-600'
    } else if (locked) {
      sessionClassName = 'text-yellow-600 dark:text-yellow-600'
    } else if (paused) {
      sessionClassName = 'text-violet-600 dark:text-violet-500'
    } else if (limited) {
      sessionClassName = 'text-stone-600 dark:text-stone-500'
    } else if (!canApply) {
      sessionClassName = 'text-muted-foreground'
    }

    const content = (
      <div className='flex flex-col'>
        <div className='flex items-center gap-2'>
          <div className='grid h-3 w-3 grid-cols-2 gap-0.5'>
            <div
              className={
                enabled && !expired
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
              'font-semibold',
              isSecondary ? '' : 'font-semibold',
              sessionClassName
            )}
          >
            {session.session_name}
            {expired && (
              <span className='ml-1 text-xs font-normal text-muted-foreground'>
                (过期)
              </span>
            )}
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          {canApply ? (
            <SquareCheckBigIcon className='h-3.5 w-3.5 text-green-400 dark:text-green-700' />
          ) : (
            <SquareXIcon className='h-3.5 w-3.5 text-red-400 dark:text-red-800' />
          )}
          <code className='text-xs text-muted-foreground'>
            {session.session_slug}
          </code>
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

SpiderSessionMiniItemCell.displayName = 'SpiderSessionMiniItemCell'
