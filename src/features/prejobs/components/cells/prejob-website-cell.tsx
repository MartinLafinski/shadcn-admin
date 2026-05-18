import React from 'react'
import { ToggleLeftIcon, ToggleRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { EntityLimitedCell } from '@/components/smart/cells/entity-limited-cell'
import { EntityLockedCell } from '@/components/smart/cells/entity-locked-cell'
import { EntityPausedCell } from '@/components/smart/cells/entity-paused-cell'
import { type WebsiteItemData } from '@/features/websites/data/schemas'

interface PrejobWebsiteCellProps {
  website: WebsiteItemData | null | undefined
}

export const PrejobWebsiteCell = React.memo(
  ({ website }: PrejobWebsiteCellProps) => {
    if (!website) {
      return <span>-</span>
    }

    let websiteClassName: string = 'text-green-600'
    if (!website?.website_enabled) {
      websiteClassName = 'text-red-600'
    } else if (website?.website_locked) {
      websiteClassName = 'text-yellow-600'
    } else if (website?.website_paused) {
      websiteClassName = 'text-violet-500'
    } else if (website?.website_limited) {
      websiteClassName = 'text-stone-700 dark:text-stone-400'
    }

    return (
      <Button
        variant='ghost'
        size='sm'
        className={'mx-0 flex h-auto flex-col items-start px-0 py-1'}
      >
        <span className={`${websiteClassName} font-semibold opacity-100`}>
          {website?.website_name || '-'}
        </span>
        <span className='mt-0.5 inline-flex items-center gap-1'>
          {website.website_enabled ? (
            <ToggleRightIcon className='h-3.5 w-3.5 text-green-600' />
          ) : (
            <ToggleLeftIcon className='h-3.5 w-3.5 text-red-600' />
          )}
          <EntityLockedCell
            entity_type='website'
            entity={website}
            has_locked={website.website_locked}
          />
          <EntityPausedCell
            entity_type='website'
            entity={website}
            has_paused={website.website_paused}
          />
          <EntityLimitedCell
            entity_type='website'
            entity={website}
            has_limited={website.website_limited}
          />
        </span>
      </Button>
    )
  }
)

PrejobWebsiteCell.displayName = 'PrejobWebsiteCell'
