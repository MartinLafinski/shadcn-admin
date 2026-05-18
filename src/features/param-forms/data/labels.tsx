import { ToggleRightIcon, ToggleLeftIcon } from 'lucide-react'

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
