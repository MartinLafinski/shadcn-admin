import React from 'react'
import { ExternalLinkIcon, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'

interface UrlCellProps {
  url: string | null | undefined
  className?: string
  icon?: LucideIcon
}

export const UrlCell = React.memo(
  ({ url, className, icon: Icon }: UrlCellProps) => {
    if (!url) {
      return <span className='text-gray-400'>-</span>
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className={cn(
              'line-clamp-2 text-sm leading-[1.4] break-all whitespace-pre-wrap text-sky-700 hover:underline dark:text-blue-400',
              className
            )}
          >
            {Icon ? (
              <Icon
                className='mr-1 inline-block shrink-0 align-middle'
                size={12}
              />
            ) : (
              <ExternalLinkIcon
                className='mr-1 inline-block shrink-0 align-middle'
                size={12}
              />
            )}
            {url}
          </a>
        </TooltipTrigger>
        <TooltipContent className='max-w-125 leading-[1.2] break-all whitespace-pre-wrap'>
          {url}
        </TooltipContent>
      </Tooltip>
    )
  }
)

UrlCell.displayName = 'UrlCell'
