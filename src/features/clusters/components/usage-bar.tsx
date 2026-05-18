import React from 'react'
import { motion } from 'framer-motion'

interface UsageBarProps {
  value: number
  label: string
}

export function UsageBar({ value, label }: UsageBarProps) {
  const getColor = (v: number) => {
    if (v > 80) return 'bg-red-500 dark:bg-red-400'
    if (v > 60) return 'bg-amber-500 dark:bg-amber-400'
    return 'bg-emerald-500 dark:bg-emerald-400'
  }

  return (
    <div className='space-y-1'>
      <div className='flex justify-between text-xs'>
        <span className='text-muted-foreground'>{label}</span>
        <span className='font-mono text-foreground/80'>{value}%</span>
      </div>
      <div className='h-1.5 overflow-hidden rounded-full bg-secondary'>
        <motion.div
          className={`h-full rounded-full ${getColor(value)}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
