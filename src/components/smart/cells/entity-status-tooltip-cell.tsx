import React from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

interface EntityStatusTooltipCellProps {
  status: boolean
  trueIcon: LucideIcon
  falseIcon: LucideIcon
  trueColor: string
  falseColor: string
  trueLabel: string
  falseLabel: string
  operator?: string | null
  operatedAt?: string | null
}

export const EntityStatusTooltipCell = React.memo(
  ({
    status,
    trueIcon: TrueIcon,
    falseIcon: FalseIcon,
    trueColor,
    falseColor,
    trueLabel,
    falseLabel,
    operator,
    operatedAt,
  }: EntityStatusTooltipCellProps) => {
    const Icon = status ? TrueIcon : FalseIcon
    const color = status ? trueColor : falseColor
    const label = status ? trueLabel : falseLabel

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Icon className={cn('h-4 w-4', color)} />
        </TooltipTrigger>
        <TooltipContent side='top' align='center'>
          <p>
            {label}者：{operator || '未知'} [{operatedAt || '时间未知'}]
          </p>
        </TooltipContent>
      </Tooltip>
    )
  }
)

EntityStatusTooltipCell.displayName = 'EntityStatusTooltipCell'
