import { CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react'

export interface Actor {
  id: string
  name: string
  status: 'running' | 'idle' | 'warning' | 'error' | 'stopped'
  msgs: number
  mailbox: number
}

export interface Node {
  id: string
  host: string
  status: 'running' | 'idle' | 'warning' | 'error' | 'stopped'
  cpu: number
  memory: number
  uptime: string
  actors: Actor[]
}

export interface AppData {
  name: string
  version: string
  manager: Node
  workers: Node[]
}

export const statusConfig = {
  running: {
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500 dark:bg-emerald-400',
    bgFaint: 'bg-emerald-500/10 dark:bg-emerald-400/10',
    border: 'border-emerald-500/20 dark:border-emerald-400/20',
    label: 'Running',
    icon: CheckCircle2,
  },
  idle: {
    color: 'text-sky-500 dark:text-sky-400',
    bg: 'bg-sky-500 dark:bg-sky-400',
    bgFaint: 'bg-sky-500/10 dark:bg-sky-400/10',
    border: 'border-sky-500/20 dark:border-sky-400/20',
    label: 'Idle',
    icon: Clock,
  },
  warning: {
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500 dark:bg-amber-400',
    bgFaint: 'bg-amber-500/10 dark:bg-amber-400/10',
    border: 'border-amber-500/20 dark:border-amber-400/20',
    label: 'Warning',
    icon: AlertTriangle,
  },
  error: {
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-500 dark:bg-red-400',
    bgFaint: 'bg-red-500/10 dark:bg-red-400/10',
    border: 'border-red-500/20 dark:border-red-400/20',
    label: 'Error',
    icon: XCircle,
  },
  stopped: {
    color: 'text-zinc-500 dark:text-zinc-500',
    bg: 'bg-zinc-500 dark:bg-zinc-500',
    bgFaint: 'bg-zinc-500/10 dark:bg-zinc-500/10',
    border: 'border-zinc-500/20 dark:border-zinc-500/20',
    label: 'Stopped',
    icon: XCircle,
  },
}

export const appData: AppData = {
  name: 'MyDistributedApp',
  version: 'v2.4.1',
  manager: {
    id: 'manager-01',
    host: '10.0.1.10:8080',
    status: 'running',
    cpu: 23,
    memory: 41,
    uptime: '12d 5h 32m',
    actors: [
      {
        id: 'scheduler',
        name: 'TaskScheduler',
        status: 'running',
        msgs: 14205,
        mailbox: 3,
      },
      {
        id: 'coordinator',
        name: 'WorkerCoordinator',
        status: 'running',
        msgs: 8921,
        mailbox: 0,
      },
      {
        id: 'health',
        name: 'HealthMonitor',
        status: 'running',
        msgs: 32018,
        mailbox: 1,
      },
      {
        id: 'config',
        name: 'ConfigManager',
        status: 'idle',
        msgs: 156,
        mailbox: 0,
      },
      {
        id: 'log-agg',
        name: 'LogAggregator',
        status: 'warning',
        msgs: 54201,
        mailbox: 248,
      },
    ],
  },
  workers: [
    {
      id: 'worker-01',
      host: '10.0.1.21:8081',
      status: 'running',
      cpu: 67,
      memory: 54,
      uptime: '12d 5h 30m',
      actors: [
        {
          id: 'p1',
          name: 'DataProcessor',
          status: 'running',
          msgs: 245012,
          mailbox: 12,
        },
        {
          id: 'c1',
          name: 'CacheActor',
          status: 'running',
          msgs: 182003,
          mailbox: 0,
        },
        {
          id: 'io1',
          name: 'IOHandler',
          status: 'running',
          msgs: 98004,
          mailbox: 5,
        },
      ],
    },
    {
      id: 'worker-02',
      host: '10.0.1.22:8081',
      status: 'running',
      cpu: 45,
      memory: 38,
      uptime: '10d 2h 15m',
      actors: [
        {
          id: 'p2',
          name: 'DataProcessor',
          status: 'running',
          msgs: 213400,
          mailbox: 8,
        },
        {
          id: 'c2',
          name: 'CacheActor',
          status: 'running',
          msgs: 156700,
          mailbox: 0,
        },
        {
          id: 'ml1',
          name: 'MLInference',
          status: 'running',
          msgs: 42050,
          mailbox: 34,
        },
        {
          id: 'io2',
          name: 'IOHandler',
          status: 'warning',
          msgs: 76800,
          mailbox: 512,
        },
      ],
    },
    {
      id: 'worker-03',
      host: '10.0.1.23:8081',
      status: 'error',
      cpu: 0,
      memory: 0,
      uptime: '—',
      actors: [
        {
          id: 'p3',
          name: 'DataProcessor',
          status: 'stopped',
          msgs: 0,
          mailbox: 0,
        },
        {
          id: 'c3',
          name: 'CacheActor',
          status: 'stopped',
          msgs: 0,
          mailbox: 0,
        },
      ],
    },
    {
      id: 'worker-04',
      host: '10.0.1.24:8081',
      status: 'running',
      cpu: 82,
      memory: 71,
      uptime: '8d 14h 22m',
      actors: [
        {
          id: 'p4',
          name: 'DataProcessor',
          status: 'running',
          msgs: 312800,
          mailbox: 21,
        },
        {
          id: 's1',
          name: 'StreamHandler',
          status: 'running',
          msgs: 441020,
          mailbox: 67,
        },
        {
          id: 'c4',
          name: 'CacheActor',
          status: 'running',
          msgs: 128500,
          mailbox: 0,
        },
        {
          id: 'ml2',
          name: 'MLInference',
          status: 'running',
          msgs: 89700,
          mailbox: 45,
        },
        {
          id: 'io4',
          name: 'IOHandler',
          status: 'running',
          msgs: 153200,
          mailbox: 3,
        },
      ],
    },
  ],
}
