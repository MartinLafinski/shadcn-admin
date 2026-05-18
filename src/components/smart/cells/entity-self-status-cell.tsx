import React from 'react'
import {
  ToggleRightIcon,
  ToggleLeftIcon,
  LockKeyholeIcon,
  KeyRoundIcon,
  PauseIcon,
  PlayIcon,
  CheckIcon,
  XIcon,
  TimerOffIcon,
} from 'lucide-react'

interface EntitySelfStatusCellProps {
  entity_type: string
  entity: any
}

export const EntitySelfStatusCell = React.memo(
  ({ entity_type, entity }: EntitySelfStatusCellProps) => {
    const e = entity as Record<string, any>
    const enabled = !!e[`${entity_type}_enabled`]
    const locked = !!e[`${entity_type}_locked`]
    const paused = !!e[`${entity_type}_paused`]
    const expired = !!e[`${entity_type}_expired`]
    const limited = !!e[`${entity_type}_limited`]

    return (
      <div className='grid h-12 w-12 grid-cols-2 gap-0.5'>
        <div
          className={`flex items-center justify-center ${enabled && !expired ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'}`}
        >
          {enabled ? (
            expired ? (
              <TimerOffIcon className='h-4 w-4 text-rose-500 dark:text-rose-300' />
            ) : (
              <ToggleRightIcon className='h-4 w-4 text-green-500 dark:text-green-300' />
            )
          ) : (
            <ToggleLeftIcon className='h-4 w-4 text-red-500 dark:text-red-300' />
          )}
        </div>

        <div
          className={`flex items-center justify-center ${locked ? 'bg-yellow-100 dark:bg-yellow-800' : 'bg-green-100 dark:bg-green-800'}`}
        >
          {locked ? (
            <LockKeyholeIcon className='h-4 w-4 text-yellow-500 dark:text-yellow-400' />
          ) : (
            <KeyRoundIcon className='h-4 w-4 text-green-500 dark:text-green-300' />
          )}
        </div>

        <div
          className={`flex items-center justify-center ${paused ? 'bg-violet-100 dark:bg-violet-800' : 'bg-green-100 dark:bg-green-800'}`}
        >
          {paused ? (
            <PauseIcon className='h-4 w-4 text-violet-500 dark:text-violet-300' />
          ) : (
            <PlayIcon className='h-4 w-4 text-green-500 dark:text-green-300' />
          )}
        </div>

        <div
          className={`flex items-center justify-center ${limited ? 'bg-stone-200 dark:bg-stone-700' : 'bg-green-100 dark:bg-green-800'}`}
        >
          {limited ? (
            <XIcon className='h-4 w-4 text-stone-500 dark:text-stone-300' />
          ) : (
            <CheckIcon className='h-4 w-4 text-green-500 dark:text-green-300' />
          )}
        </div>
      </div>
    )
  }
)

EntitySelfStatusCell.displayName = 'EntitySelfStatusCell'
