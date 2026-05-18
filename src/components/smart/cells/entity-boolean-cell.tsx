import React from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EntityBooleanCellProps {
  value: boolean
  trueIcon: LucideIcon
  falseIcon: LucideIcon
  trueLabel: string
  falseLabel: string
  trueClassName?: string
  falseClassName?: string
}

export const EntityBooleanCell = React.memo(
  ({
    value,
    trueIcon: TrueIcon,
    falseIcon: FalseIcon,
    trueLabel,
    falseLabel,
    trueClassName,
    falseClassName,
  }: EntityBooleanCellProps) => {
    const Icon = value ? TrueIcon : FalseIcon
    const label = value ? trueLabel : falseLabel
    const className = value
      ? cn('text-green-600', trueClassName)
      : cn('text-muted-foreground', falseClassName)

    return (
      <div className='flex items-center gap-1.5'>
        <Icon className={cn('h-4 w-4', className)} />
        <span className={cn('text-sm', className)}>{label}</span>
      </div>
    )
  }
)

EntityBooleanCell.displayName = 'EntityBooleanCell'
