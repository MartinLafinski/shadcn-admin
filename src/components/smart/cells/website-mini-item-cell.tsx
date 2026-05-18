import React from 'react'
import { SquareCheckBigIcon, SquareXIcon } from 'lucide-react'
// 样式
import { cn } from '@/lib/utils.ts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.tsx'
import { Button } from '@/components/ui/button.tsx'
import { type WebsiteData } from '@/features/websites/data/schemas.ts'

interface WebsiteMiniItemCellProps {
  website: WebsiteData | null
  asLink?: boolean
  className?: string
  onClick?: () => void
}

export const WebsiteMiniItemCell = React.memo(
  ({ website, asLink, className, onClick }: WebsiteMiniItemCellProps) => {
    if (!website) {
      return <span>-</span>
    }
    const isLink = asLink ?? false
    const enabled = isLink ? website.website_enabled : website.has_enabled
    const locked = isLink ? website.website_locked : website.has_locked
    const paused = isLink ? website.website_paused : website.has_paused
    const limited = isLink ? website.website_limited : website.has_limited
    const canApply = !!website.can_apply
    // const limited = true
    // const canApply = false

    let websiteClassName: string = 'text-green-600'
    if (!enabled) {
      websiteClassName = 'text-red-600 dark:text-red-700'
    } else if (locked) {
      websiteClassName = 'text-yellow-600 dark:text-yellow-600'
    } else if (paused) {
      websiteClassName = 'text-violet-600 dark:text-violet-500'
    } else if (limited) {
      websiteClassName = 'text-stone-600 dark:text-stone-500'
    } else if (!canApply) {
      websiteClassName = 'text-muted-foreground'
    }

    const content = (
      <div className='flex items-center gap-3'>
        <Avatar className='h-10 w-10'>
          <AvatarImage
            src={website.website_avatar || undefined}
            alt={website.website_name}
          />
          <AvatarFallback>{website.website_name.charAt(0)}</AvatarFallback>
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
                    ? 'dark:bg-yello-700 bg-yellow-400'
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
                isLink ? '' : 'font-semibold',
                isLink ? websiteClassName : 'text-foreground'
              )}
            >
              {website.website_name}
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            {canApply ? (
              <SquareCheckBigIcon className='h-3.5 w-3.5 text-green-400 dark:text-green-700' />
            ) : (
              <SquareXIcon className='h-3.5 w-3.5 text-red-400 dark:text-red-800' />
            )}
            <code className='text-xs text-muted-foreground'>
              {website.website_slug}
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

WebsiteMiniItemCell.displayName = 'WebsiteMiniItemCell'
