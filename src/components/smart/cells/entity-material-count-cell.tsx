import React from 'react'
import { Link } from '@tanstack/react-router'
import { ExternalLinkIcon, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EntityMaterialCountCellProps {
  entity: any
  countKey: string
  icon: LucideIcon
  linkTo?: string
  linkSearch?: Record<string, any>
  className?: string
}

export const EntityMaterialCountCell = React.memo(
  ({
    entity,
    countKey,
    icon: Icon,
    linkTo,
    linkSearch,
    className,
  }: EntityMaterialCountCellProps) => {
    const count = entity[countKey] as number | null | undefined

    // if (count === undefined || count === null || count === 0) {
    //   return <span>-</span>
    // }

    const content = (
      <div
        className={cn(
          'flex items-center justify-center gap-1 rounded-2xl bg-muted px-1.5 py-0 pr-2 text-sm',
          className
        )}
      >
        {/*<Icon size={16} strokeWidth={1} className='text-muted-foreground' />*/}
        {Icon ? (
          <Icon size={16} className='opacity-70' />
        ) : (
          <ExternalLinkIcon size={16} className='opacity-70' />
        )}
        <span className='font-semibold'>{count ?? 0}</span>
      </div>
    )

    if (linkTo) {
      return (
        <Link
          to={linkTo}
          search={linkSearch ?? {}}
          target='_blank'
          className={cn('flex flex-row items-center')}
        >
          {content}
        </Link>
      )
    }

    return content
  }
)

EntityMaterialCountCell.displayName = 'EntityMaterialCountCell'
