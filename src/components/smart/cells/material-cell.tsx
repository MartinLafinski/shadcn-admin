import React from 'react'
import { materialLabels } from '@/lib/labels.tsx'

interface MaterialCellProps {
  value: string | null | undefined
}

export const MaterialCell = React.memo(({ value }: MaterialCellProps) => {
  const materialValue = (value || 'unknown') as string

  if (!materialValue || materialValue === 'unknown') {
    return <span>-</span>
  }

  const materialType = materialLabels.find((l) => l.value === materialValue)

  return materialType ? (
    <div className='flex flex-col'>
      <div className='flex items-center space-x-1'>
        <materialType.icon className='h-4 w-4' size={12} />
        <span className='text-sm'>{materialType.label}</span>
      </div>
      <code className='text-xs text-muted-foreground'>[{materialValue}]</code>
    </div>
  ) : (
    <span className='text-gray-400'>-</span>
  )
})

MaterialCell.displayName = 'MaterialCell'
