import {
  CheckIcon,
  PlayIcon,
  StopCircleIcon,
  RecycleIcon,
  LoaderIcon,
  CirclePauseIcon,
} from 'lucide-react'

export const taskStatusLabels = [
  {
    value: 'running' as const,
    label: '运行中',
    icon: PlayIcon,
    className: 'bg-blue-600 text-white',
  },
  {
    value: 'completed' as const,
    label: '已完成',
    icon: CheckIcon,
    className: 'bg-green-600 text-white',
  },
  {
    value: 'canceled' as const,
    label: '已取消',
    icon: StopCircleIcon,
    className: 'bg-red-600 text-white',
  },
]

export const taskStatusDetailLabels = [
  {
    value: 'idle' as const,
    label: '待机中',
    icon: LoaderIcon,
    className: 'bg-neutral-300/40 border-neutral-300',
  },
  {
    value: 'initialed' as const,
    label: '初始化',
    icon: CirclePauseIcon,
    className:
      'bg-zinc-200/40 text-zinc-600 dark:text-zinc-100 border-zinc-300',
  },
  {
    value: 'crawling' as const,
    label: '抓取中',
    icon: PlayIcon,
    className: 'bg-sky-200/40 text-sky-600 dark:text-sky-100 border-sky-300',
  },
  {
    value: 'closing' as const,
    label: '回收中',
    icon: RecycleIcon,
    className:
      'bg-amber-200/40 text-amber-600 dark:text-amber-100 border-amber-300',
  },
  {
    value: 'completed' as const,
    label: '已完成',
    icon: CheckIcon,
    className:
      'bg-green-200/40 text-green-600 dark:text-green-100 border-green-300',
  },
  {
    value: 'canceled' as const,
    label: '已取消',
    icon: StopCircleIcon,
    className: 'bg-red-200/40 text-red-600 dark:text-red-100 border-red-300',
  },
]

export const taskStatusDetailDict = taskStatusDetailLabels.reduce(
  (acc, item) => {
    acc[item.value] = item
    return acc
  },
  {} as Record<string, (typeof taskStatusDetailLabels)[number]>
)
