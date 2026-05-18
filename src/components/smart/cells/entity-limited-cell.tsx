import React from 'react'
import { CheckIcon, XIcon } from 'lucide-react'
import { EntityStatusTooltipCell } from './entity-status-tooltip-cell'

interface EntityLimitedCellProps {
  entity_type: string
  entity: any
  has_limited?: boolean
}

export const EntityLimitedCell = React.memo(
  ({ entity_type, entity, has_limited }: EntityLimitedCellProps) => {
    const e = entity as Record<string, any>
    const limited = has_limited ?? e[`${entity_type}_limited`]

    return (
      <EntityStatusTooltipCell
        status={limited}
        trueIcon={XIcon}
        falseIcon={CheckIcon}
        trueColor='text-stone-700 dark:text-stone-400'
        falseColor='text-green-600'
        trueLabel='受限'
        falseLabel='正常'
        operator={
          limited
            ? e[`${entity_type}_limited_by`]
            : e[`${entity_type}_unlimited_by`]
        }
        operatedAt={
          limited
            ? e[`${entity_type}_limited_at`]
            : e[`${entity_type}_unlimited_at`]
        }
      />
    )
  }
)
