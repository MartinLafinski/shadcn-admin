import React from 'react'
import { HelpCircleIcon } from 'lucide-react'
import { paramFormTypeDictionary } from '@/lib/labels'
import { cn } from '@/lib/utils'

interface ParamTypeCellProps {
  value: string | undefined | null
}

export const ParamTypeCell = React.memo(({ value }: ParamTypeCellProps) => {
  if (!value) return <span className='text-muted-foreground'>-</span>

  const entry = paramFormTypeDictionary[value]
  const label = entry?.label ?? value
  const Icon = entry?.icon ?? HelpCircleIcon
  const className =
    entry?.className ?? 'bg-stone-100 text-stone-900 dark:bg-stone-400/70'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-xl px-2 py-0.5 text-xs font-medium',
        className
      )}
    >
      <Icon className='size-3.5' />
      {label}
    </span>
  )
})

ParamTypeCell.displayName = 'ParamTypeCell'
