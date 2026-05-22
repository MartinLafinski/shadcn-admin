import React from 'react'
import { SquareCheckBigIcon, SquareXIcon } from 'lucide-react'
// 样式
import { cn } from '@/lib/utils.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { type EntrypointItemData } from '@/features/entrypoints/data/schemas.ts'

interface EntrypointMiniItemCellProps {
  entrypoint: EntrypointItemData
  isPrimary?: boolean
  className?: string
  onClick?: () => void
}

export const EntrypointMiniItemCell = React.memo(
  ({
    entrypoint,
    isPrimary,
    className,
    onClick,
  }: EntrypointMiniItemCellProps) => {
    if (!entrypoint) {
      return <span>-</span>
    }

    const isSecondary: boolean = !isPrimary

    const enabled = isSecondary
      ? entrypoint.entrypoint_enabled
      : entrypoint.has_enabled
    const locked = isSecondary
      ? entrypoint.entrypoint_locked
      : entrypoint.has_locked
    const paused = isSecondary
      ? entrypoint.entrypoint_paused
      : entrypoint.has_paused
    const limited = isSecondary
      ? entrypoint.entrypoint_limited
      : entrypoint.has_limited
    const canApply = !!entrypoint.can_apply

    let entrypointClassName: string = 'text-green-600'
    if (!enabled) {
      entrypointClassName = 'text-red-600 dark:text-red-700'
    } else if (locked) {
      entrypointClassName = 'text-yellow-600 dark:text-yellow-600'
    } else if (paused) {
      entrypointClassName = 'text-violet-600 dark:text-violet-500'
    } else if (limited) {
      entrypointClassName = 'text-stone-600 dark:text-stone-500'
    } else if (!canApply) {
      entrypointClassName = 'text-muted-foreground'
    }

    const content = (
      <div className='flex items-center gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage
            src={entrypoint.entrypoint_avatar || undefined}
            alt={entrypoint.entrypoint_name}
          />
          <AvatarFallback>
            {entrypoint.entrypoint_name.charAt(0)}
          </AvatarFallback>
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
                entrypointClassName
                // isSecondary ? entrypointClassName : 'text-foreground'
              )}
            >
              {entrypoint.entrypoint_name}
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            {canApply ? (
              <SquareCheckBigIcon className='h-3.5 w-3.5 text-green-400 dark:text-green-700' />
            ) : (
              <SquareXIcon className='h-3.5 w-3.5 text-red-400 dark:text-red-800' />
            )}
            <code className='text-xs text-muted-foreground'>
              {entrypoint.entrypoint_slug}
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

EntrypointMiniItemCell.displayName = 'EntrypointMiniItemCell'
