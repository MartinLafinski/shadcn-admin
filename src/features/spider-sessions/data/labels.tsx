import {
  ToggleRightIcon,
  ToggleLeftIcon,
  LockKeyholeIcon,
  KeyRoundIcon,
  PlayIcon,
  PauseIcon,
  TicketCheckIcon,
  TicketXIcon,
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
