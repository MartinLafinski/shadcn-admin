import React from 'react'
import { statusConfig } from '../data/data'
import { StatusDot } from './status-dot'

interface StatusBadgeProps {
  status: keyof typeof statusConfig
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status] || statusConfig.stopped
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bgFaint} ${cfg.color} border ${cfg.border}`}
    >
      <StatusDot status={status} />
      {cfg.label}
    </span>
  )
}
