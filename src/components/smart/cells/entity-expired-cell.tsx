import React from 'react'
import { TimerIcon, TimerOffIcon } from 'lucide-react'
import { EntityStatusTooltipCell } from './entity-status-tooltip-cell'

interface EntityExpiredCellProps {
  entity_type: string
  entity: any
  has_expired?: boolean
}

export const EntityExpiredCell = React.memo(
  ({ entity_type, entity, has_expired }: EntityExpiredCellProps) => {
    const e = entity as Record<string, any>
    const expired = has_expired ?? e[`${entity_type}_expired`]

    return (
      <EntityStatusTooltipCell
        status={expired}
        trueIcon={TimerOffIcon}
        falseIcon={TimerIcon}
        trueColor='text-rose-600'
        falseColor='text-teal-600'
        trueLabel='过期'
        falseLabel='有效'
        operator='system'
        operatedAt={e.expired_at}
      />
    )
  }
)

EntityExpiredCell.displayName = 'EntityExpiredCell'
