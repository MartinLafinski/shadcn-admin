import {
  PlayIcon,
  PauseIcon,
  LockKeyholeIcon,
  ToggleLeftIcon,
  ToggleRightIcon,
  KeyRoundIcon,
  TicketCheckIcon,
  TicketXIcon,
  HelpCircleIcon,
  MessageSquareMoreIcon,
  NewspaperIcon,
  NotebookTextIcon,
  FileTextIcon,
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
  UtensilsIcon,
  BookOpenTextIcon,
  ShieldUserIcon,
  HeadsetIcon,
  CirclePileIcon,
  BriefcaseIcon,
  GlobeIcon,
  MapPinIcon,
  ListTodoIcon,
  SearchIcon,
  SearchCheckIcon,
  BugIcon,
  CalendarIcon,
  DecimalsArrowRightIcon,
  TimerIcon,
  TimerOffIcon,
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
    label: '运行',
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

export const expiredLabels = [
  {
    value: true as const,
    label: '过期',
    icon: TimerOffIcon,
    className: 'text-rose-600',
  },
  {
    value: false as const,
    label: '生效',
    icon: TimerIcon,
    className: 'text-green-600',
  },
]

export const materialLabels = [
  {
    key: 'material_unknown_count' as const,
    value: 'unknown' as const,
    label: '未知',
    icon: HelpCircleIcon,
    className:
      'bg-yellow-100 text-yellow-900 dark:bg-yellow-400/70 dark:text-yellow-900',
    color: 'text-gray-400',
    category: '其他',
  },
  {
    key: 'material_customize_count' as const,
    value: 'customize' as const,
    label: '自定义',
    icon: UtensilsIcon,
    className:
      'bg-yellow-100 text-yellow-900 dark:bg-yellow-200/70 dark:text-yellow-900',
    color: 'text-fuchsia-500',
    category: '其他',
  },
  {
    key: 'material_subs_count' as const,
    value: 'subs' as const,
    label: '子料',
    icon: NetworkIcon,
    className: 'bg-stone-100 dark:bg-stone-300/70 dark:text-stone-800',
    color: 'text-emerald-500',
    category: '其他',
  },
  {
    key: 'material_speech_count' as const,
    value: 'speech' as const,
    label: '语料',
    icon: MessageSquareMoreIcon,
    className:
      'bg-cyan-100 text-cyan-900 dark:bg-cyan-400/70 dark:text-cyan-900',
    color: 'text-rose-500',
    category: '媒体',
  },
  {
    key: 'material_news_count' as const,
    value: 'news' as const,
    label: '讯料',
    icon: NewspaperIcon,
    className:
      'bg-cyan-100 text-cyan-900 dark:bg-cyan-300/70 dark:text-cyan-900',
    color: 'text-blue-500',
    category: '文本',
  },
  {
    key: 'material_note_count' as const,
    value: 'note' as const,
    label: '笔料',
    icon: NotebookTextIcon,
    className:
      'bg-cyan-100 text-cyan-900 dark:bg-cyan-200/70 dark:text-cyan-900',
    color: 'text-violet-500',
    category: '文本',
  },
  {
    key: 'material_article_count' as const,
    value: 'article' as const,
    label: '文料',
    icon: FileTextIcon,
    className:
      'bg-cyan-100 text-cyan-900 dark:bg-cyan-100/70 dark:text-cyan-900',
    color: 'text-indigo-500',
    category: '文本',
  },
  {
    key: 'material_book_count' as const,
    value: 'book' as const,
    label: '书料',
    icon: BookOpenTextIcon,
    className:
      'bg-rose-100 text-rose-900 dark:bg-rose-300/70 dark:text-rose-900',
    color: 'text-purple-500',
    category: '文本',
  },
  {
    key: 'material_bid_count' as const,
    value: 'bid' as const,
    label: '标料',
    icon: GavelIcon,
    className:
      'bg-rose-100 text-rose-900 dark:bg-rose-200/70 dark:text-rose-900',
    color: 'text-amber-500',
    category: '商业',
  },
  {
    key: 'material_trade_count' as const,
    value: 'trade' as const,
    label: '贸料',
    icon: HandCoinsIcon,
    className:
      'bg-lime-100 text-lime-900 dark:bg-lime-400/70 dark:text-lime-900',
    color: 'text-yellow-500',
    category: '商业',
  },
  {
    key: 'material_product_count' as const,
    value: 'product' as const,
    label: '产料',
    icon: PackageIcon,
    className:
      'bg-lime-100 text-lime-900 dark:bg-lime-300/70 dark:text-lime-900',
    color: 'text-teal-500',
    category: '商业',
  },
  {
    key: 'material_company_count' as const,
    value: 'company' as const,
    label: '企料',
    icon: Building2Icon,
    className:
      'bg-lime-100 text-lime-900 dark:bg-lime-200/70 dark:text-lime-900',
    color: 'text-green-500',
    category: '商业',
  },
  {
    key: 'material_shop_count' as const,
    value: 'shop' as const,
    label: '店料',
    icon: StoreIcon,
    className:
      'bg-lime-100 text-lime-900 dark:bg-lime-100/70 dark:text-lime-900',
    color: 'text-lime-500',
    category: '商业',
  },
  {
    key: 'material_recruit_count' as const,
    value: 'recruit' as const,
    label: '聘料',
    icon: HandshakeIcon,
    className:
      'bg-indigo-100 text-indigo-900 dark:bg-indigo-300/70 dark:text-indigo-900',
    color: 'text-sky-500',
    category: '商业',
  },
  {
    key: 'material_account_count' as const,
    value: 'account' as const,
    label: '户料',
    icon: ShieldUserIcon,
    className:
      'bg-indigo-100 text-indigo-900 dark:bg-indigo-200/70 dark:text-indigo-900',
    color: 'text-slate-500',
    category: '商业',
  },
  {
    key: 'material_image_count' as const,
    value: 'image' as const,
    label: '图料',
    icon: ImageIcon,
    className:
      'bg-green-100 text-green-900 dark:bg-green-300/70 dark:text-green-900',
    color: 'text-pink-500',
    category: '媒体',
  },
  {
    key: 'material_audio_count' as const,
    value: 'audio' as const,
    label: '音料',
    icon: HeadsetIcon,
    className:
      'bg-green-100 text-green-900 dark:bg-green-200/70 dark:text-green-900',
    color: 'text-orange-500',
    category: '媒体',
  },
  {
    key: 'material_video_count' as const,
    value: 'video' as const,
    label: '影料',
    icon: ClapperboardIcon,
    className:
      'bg-green-100 text-green-900 dark:bg-green-100/70 dark:text-green-900',
    color: 'text-red-500',
    category: '媒体',
  },
  {
    key: 'material_file_count' as const,
    value: 'file' as const,
    label: '资料',
    icon: FoldersIcon,
    className:
      'bg-orange-100 text-orange-900 dark:bg-orange-200/70 dark:text-orange-900',
    color: 'text-cyan-500',
    category: '媒体',
  },
]

export const materialDictionary = {
  unknown: materialLabels[0],
  customize: materialLabels[1],
  subs: materialLabels[2],
  speech: materialLabels[3],
  news: materialLabels[4],
  note: materialLabels[5],
  article: materialLabels[6],
  book: materialLabels[7],
  bid: materialLabels[8],
  trade: materialLabels[9],
  product: materialLabels[10],
  company: materialLabels[11],
  shop: materialLabels[12],
  recruit: materialLabels[13],
  account: materialLabels[14],
  image: materialLabels[15],
  audio: materialLabels[16],
  video: materialLabels[17],
  file: materialLabels[18],
  all: {
    key: '' as const,
    value: 'all' as const,
    label: '全部',
    icon: CirclePileIcon,
    className: 'bg-stone-100 dark:bg-stone-700',
    color: 'text-stone-600',
    category: '',
  },
}

export const paramFormTypeLabels = [
  {
    value: 'unknown:unknown' as const,
    label: '未知',
    icon: HelpCircleIcon,
    className:
      'bg-stone-100 text-stone-900 dark:bg-stone-400/70 dark:text-stone-900',
  },
  {
    value: 'industry:common' as const,
    label: '行业通用',
    icon: BriefcaseIcon,
    className:
      'bg-blue-100 text-blue-900 dark:bg-blue-400/70 dark:text-blue-900',
  },
  {
    value: 'industry:self' as const,
    label: '行业自用',
    icon: BriefcaseIcon,
    className:
      'bg-blue-100 text-blue-900 dark:bg-blue-300/70 dark:text-blue-900',
  },
  {
    value: 'industry:entrypoint' as const,
    label: '行业指定入口点使用',
    icon: BriefcaseIcon,
    className:
      'bg-blue-100 text-blue-900 dark:bg-blue-300/70 dark:text-blue-900',
  },
  {
    value: 'industry:prejob' as const,
    label: '行业指定预备作业使用',
    icon: BriefcaseIcon,
    className:
      'bg-blue-100 text-blue-900 dark:bg-blue-300/70 dark:text-blue-900',
  },

  {
    value: 'website:common' as const,
    label: '网站通用',
    icon: GlobeIcon,
    className:
      'bg-cyan-100 text-cyan-900 dark:bg-cyan-400/70 dark:text-cyan-900',
  },
  {
    value: 'website:self' as const,
    label: '网站自用',
    icon: GlobeIcon,
    className:
      'bg-cyan-100 text-cyan-900 dark:bg-cyan-300/70 dark:text-cyan-900',
  },
  {
    value: 'website:entrypoint' as const,
    label: '网站指定入口点使用',
    icon: GlobeIcon,
    className:
      'bg-cyan-100 text-cyan-900 dark:bg-cyan-300/70 dark:text-cyan-900',
  },
  {
    value: 'website:prejob' as const,
    label: '网站指定预备作业使用',
    icon: GlobeIcon,
    className:
      'bg-cyan-100 text-cyan-900 dark:bg-cyan-300/70 dark:text-cyan-900',
  },

  {
    value: 'entrypoint:common' as const,
    label: '入口点通用',
    icon: MapPinIcon,
    className:
      'bg-green-100 text-green-900 dark:bg-green-400/70 dark:text-green-900',
  },
  {
    value: 'entrypoint:self' as const,
    label: '入口点自用',
    icon: MapPinIcon,
    className:
      'bg-green-100 text-green-900 dark:bg-green-300/70 dark:text-green-900',
  },
  {
    value: 'entrypoint:prejob' as const,
    label: '入口点指定预备作业使用',
    icon: MapPinIcon,
    className:
      'bg-green-100 text-green-900 dark:bg-green-300/70 dark:text-green-900',
  },

  {
    value: 'prejob:common' as const,
    label: '预备作业通用',
    icon: ListTodoIcon,
    className:
      'bg-purple-100 text-purple-900 dark:bg-purple-400/70 dark:text-purple-900',
  },
  {
    value: 'prejob:self' as const,
    label: '预备作业自用',
    icon: ListTodoIcon,
    className:
      'bg-purple-100 text-purple-900 dark:bg-purple-300/70 dark:text-purple-900',
  },
  {
    value: 'spider_package:self' as const,
    label: '爬虫包自用',
    icon: BugIcon,
    className: 'bg-red-100 text-red-900 dark:bg-red-300/70 dark:text-red-900',
  },
]

export const paramFormTypeDictionary = {
  'unknown:unknown': paramFormTypeLabels[0],

  'industry:common': paramFormTypeLabels[1],
  'industry:self': paramFormTypeLabels[2],
  'industry:entrypoint': paramFormTypeLabels[3],
  'industry:prejob': paramFormTypeLabels[4],

  'website:common': paramFormTypeLabels[5],
  'website:self': paramFormTypeLabels[6],
  'website:entrypoint': paramFormTypeLabels[7],
  'website:prejob': paramFormTypeLabels[8],

  'entrypoint:common': paramFormTypeLabels[9],
  'entrypoint:self': paramFormTypeLabels[10],
  'entrypoint:prejob': paramFormTypeLabels[11],

  'prejob:common': paramFormTypeLabels[12],
  'prejob:self': paramFormTypeLabels[13],

  'spider_package:self': paramFormTypeLabels[14],
}

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

export const categoryTypeLabels = [
  { value: 'industry', label: '行业' },
  { value: 'website', label: '网站' },
  { value: 'entrypoint', label: '入口点' },
  { value: 'prejob', label: '预备作业' },
]

export const categoryTypeDictionary: Record<string, string> = {
  industry: '行业',
  website: '网站',
  entrypoint: '入口点',
  prejob: '预备作业',
}

export const shardStrategyLabels: Array<Record<string, any>> = [
  {
    value: 'date',
    label: '按日期',
    icon: CalendarIcon,
  },
  {
    value: 'id_range',
    label: '按ID范围',
    icon: DecimalsArrowRightIcon,
  },
]

export const shardStrategyDictionary: Record<string, Record<string, any>> = {
  date: shardStrategyLabels[0],
  id_range: shardStrategyLabels[1],
}

export const onSuccessLabels = [
  { value: 'continue' as const, label: '继续（周期性）' },
  { value: 'break' as const, label: '停止（一次性）' },
]

export const onFailureLabels = [
  { value: 'ignore' as const, label: '忽略' },
  { value: 'continue' as const, label: '继续' },
  { value: 'pause_website' as const, label: '暂停网站' },
  { value: 'pause_entrypoint' as const, label: '暂停入口点' },
  { value: 'pause_prejob' as const, label: '暂停预备作业' },
  { value: 'pause_jobgroup' as const, label: '暂停作业分组' },
]

export const onSuccessDictionary: Record<string, string> = {
  continue: '继续（周期性）',
  break: '停止（一次性）',
}

export const onFailureDictionary: Record<string, string> = {
  ignore: '忽略',
  continue: '继续',
  pause_website: '暂停网站',
  pause_entrypoint: '暂停入口点',
  pause_prejob: '暂停预备作业',
  pause_jobgroup: '暂停作业分组',
}
