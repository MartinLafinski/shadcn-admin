import React from 'react'
import { ToggleLeftIcon, ToggleRightIcon } from 'lucide-react'
import { EntityStatusTooltipCell } from './entity-status-tooltip-cell'

interface EntityEnabledStatusCellProps {
  entity_type: string
  entity: any
}

export const EntityEnabledStatusCell = React.memo(
  ({ entity_type, entity }: EntityEnabledStatusCellProps) => {
    const e = entity as Record<string, any>
    const enabled = !!e[`${entity_type}_enabled`]

    return (
      <EntityStatusTooltipCell
        status={enabled}
        trueIcon={ToggleRightIcon}
        falseIcon={ToggleLeftIcon}
        trueColor='text-green-600'
        falseColor='text-red-600'
        trueLabel='启用'
        falseLabel='禁用'
        operator={e.updated_by}
        operatedAt={e.updated_at}
      />
    )
  }
)

EntityEnabledStatusCell.displayName = 'EntityEnabledStatusCell'
