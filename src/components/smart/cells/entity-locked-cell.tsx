import React from 'react'
import { LockKeyholeIcon, KeyRoundIcon } from 'lucide-react'
import { EntityStatusTooltipCell } from './entity-status-tooltip-cell'

interface EntityLockedCellProps {
  entity_type: string
  entity: any
  has_locked?: boolean
}

export const EntityLockedCell = React.memo(
  ({ entity_type, entity, has_locked }: EntityLockedCellProps) => {
    const e = entity as Record<string, any>
    const locked = has_locked ?? e[`${entity_type}_locked`]

    return (
      <EntityStatusTooltipCell
        status={locked}
        trueIcon={LockKeyholeIcon}
        falseIcon={KeyRoundIcon}
        trueColor='text-yellow-600'
        falseColor='text-green-600'
        trueLabel='锁定'
        falseLabel='解锁'
        operator={
          locked
            ? e[`${entity_type}_locked_by`]
            : e[`${entity_type}_unlocked_by`]
        }
        operatedAt={
          locked
            ? e[`${entity_type}_locked_at`]
            : e[`${entity_type}_unlocked_at`]
        }
      />
    )
  }
)

EntityLockedCell.displayName = 'EntityLockedCell'
