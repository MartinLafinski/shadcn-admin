import React from 'react'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { EntityStatusTooltipCell } from './entity-status-tooltip-cell'

interface EntityPausedCellProps {
  entity_type: string
  entity: any
  has_paused?: boolean
}

export const EntityPausedCell = React.memo(
  ({ entity_type, entity, has_paused }: EntityPausedCellProps) => {
    const e = entity as Record<string, any>
    const paused = has_paused ?? e[`${entity_type}_paused`]

    return (
      <EntityStatusTooltipCell
        status={paused}
        trueIcon={PauseIcon}
        falseIcon={PlayIcon}
        trueColor='text-violet-600'
        falseColor='text-green-600'
        trueLabel='暂停'
        falseLabel='恢复'
        operator={
          paused
            ? e[`${entity_type}_paused_by`]
            : e[`${entity_type}_resumed_by`]
        }
        operatedAt={
          paused
            ? e[`${entity_type}_paused_at`]
            : e[`${entity_type}_resumed_at`]
        }
      />
    )
  }
)

EntityPausedCell.displayName = 'EntityPausedCell'
