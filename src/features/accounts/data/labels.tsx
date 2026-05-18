import {
  ToggleRightIcon,
  ToggleLeftIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  BadgeCheckIcon,
  BadgeXIcon,
} from 'lucide-react'

export const activeLabels = {
  true: {
    icon: ToggleRightIcon,
    label: '启用',
    className: 'text-green-600',
  },
  false: {
    icon: ToggleLeftIcon,
    label: '禁用',
    className: 'text-red-600',
  },
}

export const superuserLabels = {
  true: {
    icon: ShieldCheckIcon,
    label: '管理员',
    className: 'text-amber-600',
  },
  false: {
    icon: ShieldOffIcon,
    label: '普通用户',
    className: 'text-muted-foreground',
  },
}

export const verifiedLabels = {
  true: {
    icon: BadgeCheckIcon,
    label: '已验证',
    className: 'text-blue-600',
  },
  false: {
    icon: BadgeXIcon,
    label: '未验证',
    className: 'text-muted-foreground',
  },
}
