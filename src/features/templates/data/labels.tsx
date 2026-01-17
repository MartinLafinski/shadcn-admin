import { CheckIcon, XIcon } from 'lucide-react'

export const enableLabels = [
  {
    value: true as const,
    label: '启用',
    icon: CheckIcon,
    className: 'bg-green-600 text-white',
  },
  {
    value: false as const,
    label: '禁用',
    icon: XIcon,
    className: 'bg-red-600 text-white',
  },
]