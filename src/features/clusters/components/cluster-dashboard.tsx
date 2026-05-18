import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Box,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Zap,
  Heart,
  Crown,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { appData } from '../data/data'
import { NodeCard } from './node-card'
import { StatCard } from './stat-card'

export function ClusterDashboard() {
  const [refreshing, setRefreshing] = useState(false)
  const data = appData

  const totalActors =
    data.manager.actors.length +
    data.workers.reduce((s, w) => s + w.actors.length, 0)
  const runningWorkers = data.workers.filter(
    (w) => w.status === 'running'
  ).length
  const warningActors = [
    ...data.manager.actors,
    ...data.workers.flatMap((w) => w.actors),
  ].filter((a) => a.status === 'warning').length
  const errorNodes = data.workers.filter((w) => w.status === 'error').length

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <>
      <Header fixed>
        <div className='flex items-center gap-3'>
          <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15'>
            <Zap className='h-5 w-5 text-primary' />
          </div>
          <div>
            <h1 className='text-sm leading-tight font-bold'>{data.name}</h1>
            <span className='font-mono text-[10px] text-muted-foreground'>
              {data.version}
            </span>
          </div>
        </div>

        <div className='ms-auto flex items-center space-x-4'>
          <div className='mr-2 hidden items-center gap-1.5 md:flex'>
            <Heart className='h-3.5 w-3.5 text-emerald-500' />
            <span className='text-xs text-muted-foreground'>
              System Healthy
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className='inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:bg-secondary/80'
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`}
            />
            Refresh
          </button>
          <ThemeSwitch />
          <UserMenu />
        </div>
      </Header>

      <Main className='space-y-6'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          <StatCard
            icon={Server}
            label='Workers'
            value={`${runningWorkers}/${data.workers.length}`}
            sub='nodes online'
            color='indigo'
          />
          <StatCard
            icon={Box}
            label='Total Actors'
            value={totalActors}
            sub='across all nodes'
            color='sky'
          />
          <StatCard
            icon={AlertTriangle}
            label='Warnings'
            value={warningActors}
            sub='need attention'
            color='amber'
          />
          <StatCard
            icon={XCircle}
            label='Errors'
            value={errorNodes}
            sub='nodes down'
            color={errorNodes > 0 ? 'red' : 'emerald'}
          />
        </div>

        <section>
          <h2 className='mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
            <Crown className='h-3.5 w-3.5 text-primary' />
            Manager
          </h2>
          <NodeCard node={data.manager} type='manager' defaultExpanded={true} />
        </section>

        <section>
          <h2 className='mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase'>
            <Server className='h-3.5 w-3.5 text-muted-foreground' />
            Workers
            <span className='text-muted-foreground/60'>
              ({data.workers.length})
            </span>
          </h2>
          <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
            {data.workers.map((worker, i) => (
              <motion.div
                key={worker.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <NodeCard node={worker} type='worker' />
              </motion.div>
            ))}
          </div>
        </section>
      </Main>
    </>
  )
}
