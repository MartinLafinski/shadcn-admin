import {
  Construction,
  LayoutDashboard,
  Monitor,
  Bug,
  ListTodo,
  FileX,
  HelpCircle,
  Lock,
  Bell,
  Package,
  Palette,
  ServerOff,
  Settings,
  Wrench,
  UserCog,
  UserX,
  Users,
  MessagesSquare,
  ShieldCheck,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  GlobeIcon,
  DoorOpenIcon,
  MapPinIcon,
  ListVideoIcon,
  ListTree,
  Newspaper,
  NetworkIcon,
  BriefcaseIcon,
  ServerIcon,
  RouterIcon,
  BotIcon,
  SnailIcon,
  LayersIcon,
  CodeIcon,
  BotMessageSquareIcon,
  FileCodeIcon,
  BookTextIcon,
  LibraryBigIcon,
  WorkflowIcon,
  BookOpenTextIcon,
  ShieldUserIcon,
  HeadsetIcon,
  UtensilsIcon,
  RouteIcon,
  GhostIcon,
  BugIcon,
  SquareUserRoundIcon,
  DramaIcon,
  BookMarkedIcon,
  TurtleIcon,
  CirclePileIcon,
  ListOrderedIcon,
  ListStartIcon,
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
  LayoutTemplateIcon,
  Flower2Icon,
  ScanEyeIcon,
  AntennaIcon,
  BrainIcon,
  VideotapeIcon,
  VibrateIcon,
  ShapesIcon,
  RadarIcon,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Smart Spider',
      logo: Command,
      plan: '觅蜂语料采集管理',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: '业务支撑',
      items: [
        {
          title: '仪表盘',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: '集群面板',
          url: '/clusters',
          icon: LayersIcon,
        },
        {
          title: '觅蜂集群',
          icon: NetworkIcon,
          items: [
            {
              title: '服务器',
              url: '/servers',
              icon: ServerIcon,
            },
            {
              title: '服务',
              url: '/services',
              icon: RouterIcon,
            },
            {
              title: '工作者',
              url: '/actors',
              icon: GhostIcon,
            },
            {
              title: '觅蜂',
              url: '/spiders',
              icon: BotIcon,
            },
          ],
        },
        {
          title: '来源支撑',
          icon: RouteIcon,
          items: [
            {
              title: '行业',
              url: '/industries',
              icon: BriefcaseIcon,
            },
            {
              title: '网站',
              url: '/websites',
              icon: GlobeIcon,
            },
            {
              title: '入口点',
              url: '/entrypoints',
              icon: MapPinIcon,
            },
          ],
        },
        {
          title: '数据支撑',
          icon: BookMarkedIcon,
          items: [
            {
              title: '术语库',
              url: '/terms',
              icon: LibraryBigIcon,
            },
            {
              title: '属性字典',
              url: '/dictionaries',
              icon: BookMarkedIcon,
            },
            {
              title: '参数要素包',
              url: '/param-forms',
              icon: FileCodeIcon,
            },
            {
              title: '参数模型集',
              url: '/param-model-register',
              icon: WorkflowIcon,
            },
          ],
        },
        {
          title: '爬虫支撑',
          icon: SnailIcon,
          items: [
            {
              title: '爬虫包',
              url: '/spider-packages',
              icon: BugIcon,
            },
            {
              title: '爬虫会话',
              url: '/spider-sessions',
              icon: DramaIcon,
            },
          ],
        },
        {
          title: '作业编排',
          icon: ListStartIcon,
          items: [
            {
              title: '作业分组',
              url: '/jobgroups',
              icon: ListOrderedIcon,
            },
            {
              title: '预备作业',
              url: '/prejobs',
              icon: ListTodo,
            },
          ],
        },
        {
          title: '功能管道',
          icon: ShapesIcon,
          items: [
            {
              title: '表单构建',
              url: '/form-builder',
              icon: LayoutTemplateIcon,
            },
            {
              title: '数据判重',
              url: '/duplicate-checker',
              icon: RadarIcon,
            },
          ],
        },
      ],
    },
    {
      title: '任务',
      items: [
        {
          title: '采料任务',
          icon: Flower2Icon,
          items: [
            {
              title: '任务列表',
              url: '/spider-tasks',
              icon: ListVideoIcon,
            },
            {
              title: '请求历史',
              url: '/spider-task-requests',
              icon: VideotapeIcon,
            },
            {
              title: '任务通知',
              url: '/spider-task-notifications',
              icon: VibrateIcon,
            },
          ],
        },
        {
          title: '过检任务',
          url: '/validate-tasks',
          icon: ScanEyeIcon,
        },
        {
          title: 'IO任务',
          url: '/io-tasks',
          icon: AntennaIcon,
        },
        {
          title: 'AI任务',
          url: '/ai-tasks',
          icon: BrainIcon,
        },
      ],
    },
    {
      title: '采料',
      items: [
        {
          title: '采料成果',
          icon: CirclePileIcon,
          items: [
            {
              title: '未知采料',
              url: '/material/unknown',
              icon: HelpCircleIcon,
            },
            {
              title: '自定义采料',
              url: '/material/customize',
              icon: UtensilsIcon,
            },
            {
              title: '子料',
              url: '/material/subs',
              tip: '入口 采集点',
              icon: NetworkIcon,
            },
            {
              title: '语料',
              tip: '评论 微博 弹幕',
              url: '/material/speech',
              icon: MessageSquareMoreIcon,
            },
            {
              title: '讯料',
              tip: '资讯 新闻',
              url: '/material/news',
              icon: NewspaperIcon,
            },
            {
              title: '笔料',
              url: '/material/note',
              tip: '笔记 想法 片段',
              icon: NotebookTextIcon,
            },
            {
              title: '文料',
              url: '/material/article',
              tip: '文章 专稿 条文',
              icon: FileTextIcon,
            },
            {
              title: '书料',
              url: '/material/book',
              tip: '图书 教程 合集',
              icon: BookOpenTextIcon,
            },
            {
              title: '标料',
              url: '/material/bid',
              tip: '标书 招标文件',
              icon: GavelIcon,
            },
            {
              title: '贸料',
              url: '/material/trade',
              tip: '商情 贸易 摄合',
              icon: HandCoinsIcon,
            },
            {
              title: '产料',
              url: '/material/product',
              tip: '产品 商品 服务',
              icon: PackageIcon,
            },
            {
              title: '企料',
              url: '/material/company',
              tip: '公司 工厂 组织',
              icon: Building2Icon,
            },
            {
              title: '店料',
              url: '/material/shop',
              tip: '网店 商铺',
              icon: StoreIcon,
            },
            {
              title: '聘料',
              url: '/material/recruit',
              tip: '招聘 求职 简历',
              icon: HandshakeIcon,
            },
            {
              title: '户料',
              url: '/material/account',
              tip: '用户 账户 客户',
              icon: ShieldUserIcon,
            },
            {
              title: '图料',
              url: '/material/image',
              tip: '图片 图像 动图',
              icon: ImageIcon,
            },
            {
              title: '音料',
              url: '/material/audio',
              tip: '音频 语音',
              icon: HeadsetIcon,
            },
            {
              title: '影料',
              url: '/material/video',
              tip: '视频 影像',
              icon: ClapperboardIcon,
            },
            {
              title: '资料',
              url: '/material/file',
              tip: '文件 软件 App',
              icon: FoldersIcon,
            },
          ],
        },
      ],
    },
    {
      title: '监控及异常',
      items: [
        {
          title: 'Auth',
          icon: ShieldCheck,
          items: [
            {
              title: 'Sign In',
              url: '/sign-in',
            },
            {
              title: 'Sign In (2 Col)',
              url: '/sign-in-2',
            },
            {
              title: 'Sign Up',
              url: '/sign-up',
            },
            {
              title: 'Forgot Password',
              url: '/forgot-password',
            },
            {
              title: 'OTP',
              url: '/otp',
            },
          ],
        },
        {
          title: '异常处理',
          icon: Bug,
          items: [
            {
              title: 'Unauthorized',
              url: '/errors/unauthorized',
              icon: Lock,
            },
            {
              title: 'Forbidden',
              url: '/errors/forbidden',
              icon: UserX,
            },
            {
              title: 'Not Found',
              url: '/errors/not-found',
              icon: FileX,
            },
            {
              title: 'Internal Server Error',
              url: '/errors/internal-server-error',
              icon: ServerOff,
            },
            {
              title: 'Maintenance Error',
              url: '/errors/maintenance-error',
              icon: Construction,
            },
          ],
        },
      ],
    },
    {
      title: '用户及管理',
      items: [
        {
          title: 'Settings',
          icon: Settings,
          items: [
            {
              title: 'Profile',
              url: '/settings',
              icon: UserCog,
            },
            {
              title: 'Account',
              url: '/settings/account',
              icon: Wrench,
            },
            {
              title: 'Appearance',
              url: '/settings/appearance',
              icon: Palette,
            },
            {
              title: 'Notifications',
              url: '/settings/notifications',
              icon: Bell,
            },
            {
              title: 'Display',
              url: '/settings/display',
              icon: Monitor,
            },
          ],
        },
        {
          title: '用户管理',
          url: '/accounts',
          icon: Users,
        },
        {
          title: 'AI使用接口',
          url: 'http://127.0.0.1:8888/docs#/',
          icon: BotMessageSquareIcon,
        },
        {
          title: 'API开发接口',
          url: 'http://127.0.0.1:8888/docs#/',
          icon: FileCodeIcon,
        },
        {
          title: '文档入口',
          url: 'http://127.0.0.1:8888/docs#/',
          icon: BookTextIcon,
        },
        {
          title: '帮助中心',
          url: '/help-center',
          icon: HelpCircle,
        },
      ],
    },
    {
      title: '其他',
      items: [
        {
          title: '预备作业',
          url: '/pre-tasks',
          icon: ListTodo,
        },

        {
          title: '作业任务',
          url: '/jobs',
          icon: ListVideoIcon,
        },
        {
          title: '请求结果',
          url: '/reqs',
          icon: ListTree,
        },
        {
          title: '文章',
          url: '/articles',
          icon: Newspaper,
        },
        {
          title: 'Tasks',
          url: '/tasks',
          icon: ListTodo,
        },
        {
          title: 'Apps',
          url: '/apps',
          icon: Package,
        },
        {
          title: 'Chats',
          url: '/chats',
          badge: '3',
          icon: MessagesSquare,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
      ],
    },
  ],
}
