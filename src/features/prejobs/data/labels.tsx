import {
  CheckIcon,
  XIcon,
  LockKeyholeIcon,
  LockOpenIcon,
  PauseIcon,
  PlayIcon,
  WavesIcon,
  WavesArrowUpIcon,
  WavesArrowDownIcon,
  ToggleRightIcon,
  ToggleLeftIcon,
  KeyRoundIcon,
  TicketCheckIcon,
  TicketXIcon,
  SearchIcon,
  SearchCheckIcon,
} from 'lucide-react'

export const enableLabels = [
  {
    value: true as const,
    label: '启用',
    icon: ToggleRightIcon,
    className: 'text-green-600',
  },
  {
    value: false as const,
    label: '禁用',
    icon: ToggleLeftIcon,
    className: 'text-red-600',
  },
]

export const levelLabels = [
  {
    value: 'high' as const,
    label: '高',
    icon: WavesArrowUpIcon,
    className: 'text-green-600 text-base',
  },
  {
    value: 'medium' as const,
    label: '中',
    icon: WavesIcon,
    className: 'text-foreground text-base',
  },
  {
    value: 'low' as const,
    label: '低',
    icon: WavesArrowDownIcon,
    className: 'text-zinc-400 text-base',
  },
]

export const lockedLabels = [
  {
    value: false as const,
    label: '解锁',
    icon: KeyRoundIcon,
    className: 'text-green-600',
  },
  {
    value: true as const,
    label: '锁定',
    icon: LockKeyholeIcon,
    className: 'text-yellow-600',
  },
]

export const pausedLabels = [
  {
    value: false as const,
    label: '运转',
    icon: PlayIcon,
    className: 'text-green-600',
  },
  {
    value: true as const,
    label: '暂停',
    icon: PauseIcon,
    className: 'text-violet-600',
  },
]

export const limitedLabels = [
  {
    value: false as const,
    label: '正常',
    icon: TicketCheckIcon,
    className: 'text-green-600',
  },
  {
    value: true as const,
    label: '受限',
    icon: TicketXIcon,
    className: 'text-stone-700 dark:text-stone-40',
  },
]

export const historyLabels = [
  {
    value: true as const,
    label: '追溯',
    icon: CheckIcon,
    className: 'bg-green-600 text-white',
  },
  {
    value: false as const,
    label: '实时',
    icon: XIcon,
    className: 'bg-red-600 text-white',
  },
]

export const remainImageLabels = [
  {
    value: true as const,
    label: '存图',
    icon: CheckIcon,
    className: 'bg-green-600 text-white',
  },
  {
    value: false as const,
    label: '丢图',
    icon: XIcon,
    className: 'bg-red-600 text-white',
  },
]

export const backupLabels = [
  {
    value: true as const,
    label: '备份',
    icon: CheckIcon,
    className: 'bg-green-600 text-white',
  },
  {
    value: false as const,
    label: '免备',
    icon: XIcon,
    className: 'bg-red-600 text-white',
  },
]

export const deeplySearchLabels = [
  {
    value: true as const,
    label: '深度搜索',
    icon: SearchCheckIcon,
    className: 'text-blue-600',
  },
  {
    value: false as const,
    label: '普通搜索',
    icon: SearchIcon,
    className: 'text-muted-foreground',
  },
]
