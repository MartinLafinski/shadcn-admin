import { CheckIcon, XIcon, AlertTriangleIcon } from 'lucide-react'

export const reqResultTypeLabels = [
    {
        value: 'succeed' as const,
        label: '成功',
        icon: CheckIcon,
        className: 'bg-green-600 text-white',
    },
    {
        value: 'failed' as const,
        label: '失败',
        icon: XIcon,
        className: 'bg-red-600 text-white',
    },
    {
        value: 'discarded' as const,
        label: '丢弃',
        icon: AlertTriangleIcon,
        className: 'bg-amber-600 text-white',
    },
]

export const reqResultTypeDict = reqResultTypeLabels.reduce((acc, item) => {
    acc[item.value] = item;
    return acc;
}, {} as Record<string, typeof reqResultTypeLabels[number]>);