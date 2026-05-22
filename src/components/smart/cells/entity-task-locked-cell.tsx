import React from 'react'
import { CircleAlertIcon, CircleOffIcon } from 'lucide-react'

interface EntityTaskLockedCellProps {
  entity: {
    lock_jobgroup_on_working: boolean
    lock_prejob_on_working: boolean
    lock_entrypoint_on_working: boolean
    lock_website_on_working: boolean
  }
}

export const EntityTaskLockedCell = React.memo(
  ({ entity }: EntityTaskLockedCellProps) => {
    return (
      <div className='flex items-center gap-1 text-xs'>
        {entity.lock_jobgroup_on_working ? (
          <CircleAlertIcon className='h-3 w-3 text-red-600' />
        ) : (
          <CircleOffIcon className='h-3 w-3 text-zinc-500' />
        )}
        <span className='text-gray-400'>|</span>
        {entity.lock_prejob_on_working ? (
          <CircleAlertIcon className='h-3 w-3 text-red-600' />
        ) : (
          <CircleOffIcon className='h-3 w-3 text-zinc-500' />
        )}
        <span className='text-gray-400'>|</span>
        {entity.lock_entrypoint_on_working ? (
          <CircleAlertIcon className='h-3 w-3 text-red-600' />
        ) : (
          <CircleOffIcon className='h-3 w-3 text-zinc-500' />
        )}
        <span className='text-gray-400'>|</span>
        {entity.lock_website_on_working ? (
          <CircleAlertIcon className='h-3 w-3 text-red-600' />
        ) : (
          <CircleOffIcon className='h-3 w-3 text-zinc-500' />
        )}
      </div>
    )
  }
)

EntityTaskLockedCell.displayName = 'EntityTaskLockedCell'
