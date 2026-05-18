import React from 'react'
import { shardStrategyDictionary } from '@/lib/labels'

interface ShardStrategyCellProps {
  strategy: string | null | undefined
  className?: string
}

export const ShardStrategyCell = React.memo(
  ({ strategy, className }: ShardStrategyCellProps) => {
    if (!strategy) {
      return <span className='text-muted-foreground'>-</span>
    }

    const item = shardStrategyDictionary[strategy]
    if (!item) {
      return <span className={className}>{strategy}</span>
    }

    const Icon = item.icon
    return (
      <span className={`flex items-center gap-1 ${className ?? ''}`}>
        <Icon className='h-4 w-4' />
        {item.label}
      </span>
    )
  }
)

ShardStrategyCell.displayName = 'ShardStrategyCell'
