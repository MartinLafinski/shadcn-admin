import {
  CheckIcon,
  LockKeyholeIcon,
  PauseIcon,
  PlayIcon,
  XIcon,
  HelpCircleIcon,
  MessageSquareMoreIcon,
  NewspaperIcon,
  FileTextIcon,
  NotebookTextIcon,
  GavelIcon,
  HandCoinsIcon,
  PackageIcon,
  Building2Icon,
  StoreIcon,
  HandshakeIcon,
  ImageIcon,
  ClapperboardIcon,
  FoldersIcon,
  NetworkIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
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

export const materialLabels = [
  {
    value: 'unknown' as const,
    label: '未知',
    icon: HelpCircleIcon,
    className: 'bg-green-600 text-white',
  },
  {
    value: 'speech' as const,
    label: '语料',
    icon: MessageSquareMoreIcon,
    className: 'bg-red-600 text-white',
  },
  {
    value: 'news' as const,
    label: '讯料',
    icon: NewspaperIcon,
    className: 'bg-green-600 text-white',
  },
  {
    value: 'note' as const,
    label: '笔料',
    icon: NotebookTextIcon,
    className: 'bg-red-600 text-white',
  },
  {
    value: 'article' as const,
    label: '文料',
    icon: FileTextIcon,
    className: 'bg-green-600 text-white',
  },
  {
    value: 'bid' as const,
    label: '标料',
    icon: GavelIcon,
    className: 'bg-red-600 text-white',
  },
  {
    value: 'trade' as const,
    label: '贸料',
    icon: HandCoinsIcon,
    className: 'bg-red-600 text-white',
  },
  {
    value: 'product' as const,
    label: '产料',
    icon: PackageIcon,
    className: 'bg-red-600 text-white',
  },
  {
    value: 'company' as const,
    label: '司料',
    icon: Building2Icon,
    className: 'bg-red-600 text-white',
  },
  {
    value: 'shop' as const,
    label: '店料',
    icon: StoreIcon,
    className: 'bg-red-600 text-white',
  },
  {
    value: 'recruit' as const,
    label: '聘料',
    icon: HandshakeIcon,
    className: 'bg-red-600 text-white',
  },
  {
    value: 'image' as const,
    label: '图料',
    icon: ImageIcon,
    className: 'bg-red-600 text-white',
  },
  {
    value: 'video' as const,
    label: '影料',
    icon: ClapperboardIcon,
    className: 'bg-red-600 text-white',
  },
  {
    value: 'file' as const,
    label: '资料',
    icon: FoldersIcon,
    className: 'bg-red-600 text-white',
  },
  {
    value: 'subs' as const,
    label: '子料',
    icon: NetworkIcon,
    className: 'bg-red-600 text-white',
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
