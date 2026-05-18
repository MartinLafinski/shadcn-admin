import React from 'react'
import { statusConfig } from '../data/data'

interface StatusDotProps {
  status: keyof typeof statusConfig
  size?: 'small' | 'large'
}

export function StatusDot({ status, size = 'small' }: StatusDotProps) {
  const cfg = statusConfig[status] || statusConfig.stopped
  const s = size === 'small' ? 'h-2 w-2' : 'h-2.5 w-2.5'

  return (
    <span className='relative flex items-center justify-center'>
      {status === 'running' && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${cfg.bg} animate-ping opacity-40`}
        />
      )}
      <span className={`relative inline-flex rounded-full ${s} ${cfg.bg}`} />
    </span>
  )
}
