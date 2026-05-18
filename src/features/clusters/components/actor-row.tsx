import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Layers } from 'lucide-react'
import type { Actor } from '../data/data'
import { statusConfig } from '../data/data'

interface ActorRowProps {
  actor: Actor
  index: number
}

function formatNum(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

export function ActorRow({ actor, index }: ActorRowProps) {
  const cfg = statusConfig[actor.status] || statusConfig.stopped
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className='group flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-accent'
    >
      <div className='flex min-w-0 items-center gap-3'>
        <Icon className={`h-3.5 w-3.5 ${cfg.color} flex-shrink-0`} />
        <span className='truncate text-sm font-medium text-foreground/90'>
          {actor.name}
        </span>
      </div>
      <div className='flex flex-shrink-0 items-center gap-4'>
        <div
          className='flex items-center gap-1 text-xs text-muted-foreground'
          title='Processed messages'
        >
          <MessageSquare className='h-3 w-3' />
          <span className='font-mono'>{formatNum(actor.msgs)}</span>
        </div>
        <div
          className={`flex items-center gap-1 font-mono text-xs ${actor.mailbox > 100 ? 'text-amber-500 dark:text-amber-400' : 'text-muted-foreground'}`}
          title='Mailbox queue'
        >
          <Layers className='h-3 w-3' />
          <span>{actor.mailbox}</span>
        </div>
      </div>
    </motion.div>
  )
}
