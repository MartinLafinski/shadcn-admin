import React from 'react'
import { ToggleLeftIcon, ToggleRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { EntityLimitedCell } from '@/components/smart/cells/entity-limited-cell'
import { EntityLockedCell } from '@/components/smart/cells/entity-locked-cell'
import { EntityPausedCell } from '@/components/smart/cells/entity-paused-cell'
import { type EntrypointItemData } from '@/features/entrypoints/data/schemas'

interface PrejobEntrypointCellProps {
  entrypoint: EntrypointItemData | null | undefined
}

export const PrejobEntrypointCell = React.memo(
  ({ entrypoint }: PrejobEntrypointCellProps) => {
    if (!entrypoint) {
      return <span>-</span>
    }

    let entrypointClassName: string = 'text-green-600'
    if (!entrypoint?.entrypoint_enabled) {
      entrypointClassName = 'text-red-600'
    } else if (entrypoint?.entrypoint_locked) {
      entrypointClassName = 'text-yellow-600'
    } else if (entrypoint?.entrypoint_paused) {
      entrypointClassName = 'text-violet-600'
    } else if (entrypoint?.entrypoint_limited) {
      entrypointClassName = 'text-stone-700 dark:text-stone-400'
    }

    return (
      <Button
        variant='ghost'
        size='sm'
        className={'mx-0 flex h-auto flex-col items-start px-0 py-1'}
      >
        <span className={`${entrypointClassName} font-semibold opacity-100`}>
          {entrypoint?.entrypoint_name || '-'}
        </span>
        <span className='mt-0.5 inline-flex items-center gap-1'>
          {entrypoint.entrypoint_enabled ? (
            <ToggleRightIcon className='h-3.5 w-3.5 text-green-600' />
          ) : (
            <ToggleLeftIcon className='h-3.5 w-3.5 text-red-600' />
          )}
          <EntityLockedCell
            entity_type='entrypoint'
            entity={entrypoint}
            has_locked={entrypoint.entrypoint_locked}
          />
          <EntityPausedCell
            entity_type='entrypoint'
            entity={entrypoint}
            has_paused={entrypoint.entrypoint_paused}
          />
          <EntityLimitedCell
            entity_type='entrypoint'
            entity={entrypoint}
            has_limited={entrypoint.entrypoint_limited}
          />
        </span>
      </Button>
    )
  }
)

PrejobEntrypointCell.displayName = 'PrejobEntrypointCell'
