import { CheckIcon, XIcon } from 'lucide-react'

export const enableLabels = [
    {
        value: true as const,
        label: '启用',
        icon: CheckIcon,
    },
    {
        value: false as const,
        label: '禁用',
        icon: XIcon,
    },
]