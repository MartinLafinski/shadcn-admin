import React from 'react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'

interface EntitySpiderTasksPieCellProps {
  workingSpiders: number | null | undefined
  maxSpiders: number | null | undefined
  className?: string
}

export const EntitySpiderTasksPieCell = React.memo(
  ({
    workingSpiders,
    maxSpiders,
    className,
  }: EntitySpiderTasksPieCellProps) => {
    const { resolvedTheme } = useTheme()
    const working = workingSpiders || 0
    const max = maxSpiders || 0

    if (max === 0) {
      return (
        <div className='flex items-center justify-center'>
          <div className='h-8 w-8 rounded-full bg-muted' />
        </div>
      )
    }

    const percentage = (working / max) * 100
    const displayPercentage = Math.min(percentage, 100)

    let strokeColor = '#4ade80' // green-400
    if (percentage >= 100) {
      strokeColor = resolvedTheme === 'dark' ? '#b91c1c' : '#f87171' // red-700 / red-400
    } else if (percentage >= 70) {
      strokeColor = resolvedTheme === 'dark' ? '#ca8a04' : '#facc15' // yellow-700 / yellow-400
    } else {
      strokeColor = resolvedTheme === 'dark' ? '#15803d' : '#4ade80' // green-700 / green-400
    }

    const bgColor = resolvedTheme === 'dark' ? '#374151' : '#e5e7eb'

    return (
      <div className={cn('flex items-center gap-2', className)}>
        <svg className='h-8 w-8' viewBox='0 0 36 36'>
          <circle cx='18' cy='18' r='16' fill={bgColor} />
          {displayPercentage > 0 && displayPercentage < 100 && (
            <path
              d={`M 18 18 L 18 2 A 16 16 0 ${displayPercentage > 50 ? 1 : 0} 1 ${18 + 16 * Math.sin((displayPercentage / 100) * 2 * Math.PI)} ${18 - 16 * Math.cos((displayPercentage / 100) * 2 * Math.PI)} Z`}
              fill={strokeColor}
              className='transition-all duration-300'
            />
          )}
          {displayPercentage >= 100 && (
            <circle
              cx='18'
              cy='18'
              r='16'
              fill={strokeColor}
              className='transition-all duration-300'
            />
          )}
        </svg>
        <span className='text-xs font-semibold'>
          {working}/{max}
        </span>
      </div>
    )
  }
)

EntitySpiderTasksPieCell.displayName = 'EntitySpiderTasksPieCell'
