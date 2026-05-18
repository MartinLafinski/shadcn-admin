import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Server, Crown, Clock, ChevronDown } from 'lucide-react'
import type { Node } from '../data/data'
import { ActorRow } from './actor-row'
import { StatusBadge } from './status-badge'
import { UsageBar } from './usage-bar'

interface NodeCardProps {
  node: Node
  type?: 'manager' | 'worker'
  defaultExpanded?: boolean
}

export function NodeCard({
  node,
  type = 'worker',
  defaultExpanded = false,
}: NodeCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const isManager = type === 'manager'
  const isError = node.status === 'error'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border transition-colors ${
        isError
          ? 'border-destructive/30 bg-destructive/5'
          : isManager
            ? 'border-primary/30 bg-gradient-to-br from-card to-primary/5'
            : 'border-border bg-card/80'
      }`}
    >
      <div
        className='flex cursor-pointer items-center justify-between p-4 select-none'
        onClick={() => setExpanded(!expanded)}
      >
        <div className='flex min-w-0 items-center gap-3'>
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              isManager
                ? 'bg-primary/15'
                : isError
                  ? 'bg-destructive/15'
                  : 'bg-muted'
            }`}
          >
            {isManager ? (
              <Crown className='h-4 w-4 text-primary' />
            ) : (
              <Server
                className={`h-4 w-4 ${isError ? 'text-destructive' : 'text-muted-foreground'}`}
              />
            )}
          </div>
          <div className='min-w-0'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-foreground'>
                {isManager ? 'Manager' : node.id}
              </span>
              <StatusBadge status={node.status} />
            </div>
            <div className='mt-0.5 flex items-center gap-3'>
              <span className='font-mono text-xs text-muted-foreground'>
                {node.host}
              </span>
              {node.uptime !== '—' && (
                <span className='flex items-center gap-1 text-xs text-muted-foreground/60'>
                  <Clock className='h-3 w-3' />
                  {node.uptime}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className='flex items-center gap-4'>
          <span className='hidden text-xs text-muted-foreground sm:block'>
            {node.actors.length} actor{node.actors.length !== 1 ? 's' : ''}
          </span>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className='h-4 w-4 text-muted-foreground' />
          </motion.div>
        </div>
      </div>

      {!isError && (
        <div className='px-4 pb-1'>
          <div className='grid grid-cols-2 gap-3'>
            <UsageBar value={node.cpu} label='CPU' />
            <UsageBar value={node.memory} label='Memory' />
          </div>
        </div>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='px-3 pt-2 pb-3'>
              <div className='border-t border-border pt-2'>
                <div className='mb-1 px-3 text-[10px] font-bold tracking-wider text-muted-foreground/60 uppercase'>
                  Actors
                </div>
                {node.actors.map((actor, i) => (
                  <ActorRow key={actor.id} actor={actor} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
