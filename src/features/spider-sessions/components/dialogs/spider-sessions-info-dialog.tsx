import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import MDEditor from '@uiw/react-md-editor'
import {
  Loader2,
  FileText,
  Braces,
  FlagIcon,
  UserRoundPlusIcon,
  UserRoundPenIcon,
  ChevronDown,
  Bug,
  Globe,
  Hash,
  Gauge,
  HardDrive,
  Shield,
  ShieldAlert,
  Monitor,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider.tsx'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatCard, CategoryCard } from '@/components/smart/view-cards'
import { useSpiderSessionQuery } from '../../api/spider-sessions.ts'
import type { SpiderSessionItemData } from '../../data/schemas'

interface SpiderSessionsInfoDialogProps {
  open: boolean
  onOpenChange: () => void
  sessionId: number
}

const taskStatusColors: Record<string, string> = {
  working: 'bg-blue-500',
  completed: 'bg-emerald-500',
  failed: 'bg-red-500',
  interrupted: 'bg-amber-500',
  canceled: 'bg-gray-400',
}

const taskStatusLabels: Record<string, string> = {
  working: '运行中',
  completed: '已完成',
  failed: '失败',
  interrupted: '中断',
  canceled: '已取消',
}

function TaskBar({ session }: { session: SpiderSessionItemData }) {
  const items = [
    { key: 'working', count: session.working_spider_task_count ?? 0 },
    { key: 'completed', count: session.completed_spider_task_count ?? 0 },
    { key: 'failed', count: session.failed_spider_task_count ?? 0 },
    { key: 'interrupted', count: session.interrupted_spider_task_count ?? 0 },
    { key: 'canceled', count: session.canceled_spider_task_count ?? 0 },
  ].filter((i) => i.count > 0)

  if (items.length === 0) return null

  const total = items.reduce((s, i) => s + i.count, 0)

  return (
    <div className='space-y-3'>
      <div className='flex h-2.5 overflow-hidden rounded-full bg-muted'>
        {items.map((it) => (
          <div
            key={it.key}
            className={cn('h-full transition-all', taskStatusColors[it.key])}
            style={{ width: `${(it.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className='flex flex-wrap gap-x-5 gap-y-1.5 text-sm'>
        {items.map((it) => (
          <div key={it.key} className='flex items-center gap-1.5'>
            <div
              className={cn(
                'h-2.5 w-2.5 rounded-full',
                taskStatusColors[it.key]
              )}
            />
            <span className='tabular-nums'>{it.count}</span>
            <span className='text-muted-foreground'>
              {taskStatusLabels[it.key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SpiderSessionsInfoDialog({
  open,
  onOpenChange,
  sessionId,
}: SpiderSessionsInfoDialogProps) {
  const { resolvedTheme } = useTheme()
  const { data: session, isLoading, isError } = useSpiderSessionQuery(sessionId)

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-3xl'>
          <DialogTitle className='sr-only'>加载中...</DialogTitle>
          <DialogDescription className='sr-only'>
            正在获取爬虫会话数据
          </DialogDescription>
          <div className='flex h-64 items-center justify-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            <span className='text-muted-foreground'>加载爬虫会话数据...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (isError || !session) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-md'>
          <DialogTitle className='sr-only'>加载失败</DialogTitle>
          <DialogDescription className='sr-only'>
            无法加载爬虫会话数据，请稍后重试
          </DialogDescription>
          <div className='flex h-32 items-center justify-center'>
            <p className='text-muted-foreground'>无法加载爬虫会话数据</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const compactTime = (t: string | null | undefined) =>
    t
      ? new Date(t).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-'

  const hasConfig =
    session.session_config && Object.keys(session.session_config).length > 0
  const hasHeaders =
    session.session_headers && Object.keys(session.session_headers).length > 0
  const hasCookies =
    Array.isArray(session.session_cookies) && session.session_cookies.length > 0
  const totalSpider = session.total_spider_task_count ?? 0
  const website = session.website

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] w-full max-w-4xl flex-col gap-0 space-y-0 overflow-hidden p-0'>
        <DialogHeader className='shrink-0 space-y-3 border-b bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='w-full min-w-0 space-y-1.5'>
              <DialogTitle className='flex items-center gap-3 text-2xl'>
                <Monitor className='h-7 w-7 text-primary/70' />
                <span className='truncate'>{session.session_name}</span>
                <Badge
                  variant={session.session_enabled ? 'success' : 'destructive'}
                  className='text-xs'
                >
                  {session.session_enabled ? '启用' : '停用'}
                </Badge>
                {session.has_expired && (
                  <Badge
                    variant='outline'
                    className='bg-rose-100 text-xs text-rose-800 dark:bg-rose-900/30 dark:text-rose-300'
                  >
                    已过期
                  </Badge>
                )}
              </DialogTitle>
              <div className='flex w-full gap-3 pt-2'>
                <div className='flex flex-1 items-center gap-2'>
                  <FlagIcon className='h-3.5 w-3.5 shrink-0' />
                  <div className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{session.session_slug}</span>
                    <span>ID: {session.session_id}</span>
                  </div>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <UserRoundPlusIcon className='h-3.5 w-3.5 shrink-0' />
                  <div className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{session.created_by || '-'}</span>
                    <span>{compactTime(session.created_at)}</span>
                  </div>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <UserRoundPenIcon className='h-3.5 w-3.5 shrink-0' />
                  <div className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{session.updated_by || '-'}</span>
                    <span>{compactTime(session.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full' type='always'>
            <div className='space-y-6 p-6'>
              <div className='grid grid-cols-2 gap-4'>
                {website && (
                  <CategoryCard
                    icon={Globe}
                    ctype='网站'
                    name={website.website_name}
                    slug={website.website_slug}
                    colorClass='text-sky-600'
                    bgClass='bg-sky-500/10'
                  />
                )}
                {session.session_pool_id != null && (
                  <StatCard
                    icon={Hash}
                    count={session.session_pool_id}
                    label='会话池'
                    colorClass='text-violet-600'
                    bgClass='bg-violet-500/10'
                  />
                )}
                <StatCard
                  icon={Gauge}
                  count={session.session_weight ?? 0}
                  label='权重'
                  colorClass='text-orange-600'
                  bgClass='bg-orange-500/10'
                />
                <StatCard
                  icon={HardDrive}
                  count={session.session_max_spider_task_count ?? 128}
                  label='最大任务数'
                  colorClass='text-teal-600'
                  bgClass='bg-teal-500/10'
                />
              </div>

              {session.session_locked && (
                <div className='flex items-center gap-2 rounded-lg border bg-yellow-50 p-3 dark:bg-yellow-900/20'>
                  <Shield className='h-4 w-4 text-yellow-600' />
                  <span className='text-sm text-yellow-800 dark:text-yellow-300'>
                    此会话已被锁定
                  </span>
                </div>
              )}
              {session.session_paused && (
                <div className='flex items-center gap-2 rounded-lg border bg-violet-50 p-3 dark:bg-violet-900/20'>
                  <ShieldAlert className='h-4 w-4 text-violet-600' />
                  <span className='text-sm text-violet-800 dark:text-violet-300'>
                    此会话已暂停
                  </span>
                </div>
              )}

              {totalSpider > 0 && (
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <Bug className='h-5 w-5 text-blue-500' />
                      爬虫任务分布
                      <Badge variant='secondary' className='ml-auto'>
                        {totalSpider}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TaskBar session={session} />
                  </CardContent>
                </Card>
              )}

              {session.rate_limits && session.rate_limits.length > 0 && (
                <details className='group' open>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <Gauge className='h-5 w-5 text-orange-500' />
                    限流规则
                    <Badge variant='secondary' className='ml-auto'>
                      {session.rate_limits.length}
                    </Badge>
                    <ChevronDown className='ml-2 h-4 w-4 transition-transform group-open:rotate-180' />
                  </summary>
                  <div className='mt-4 space-y-2'>
                    {session.rate_limits.map((rl, idx) => (
                      <div
                        key={idx}
                        className='flex items-center justify-between rounded-lg border bg-card p-3'
                      >
                        <div className='flex items-center gap-4'>
                          <div>
                            <span className='text-xs text-muted-foreground'>
                              最大次数
                            </span>
                            <p className='text-sm font-semibold tabular-nums'>
                              {rl.max_uses}
                            </p>
                          </div>
                          <div>
                            <span className='text-xs text-muted-foreground'>
                              时间窗口
                            </span>
                            <p className='text-sm font-semibold'>
                              {rl.within_minutes} 分钟
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant='outline'
                          className={
                            rl.consider_ip
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                          }
                        >
                          {rl.consider_ip ? '按IP' : '不限IP'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {hasHeaders && (
                <details className='group'>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <FileText className='h-5 w-5 text-indigo-500' />
                    Headers
                    <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                  </summary>
                  <div className='mt-4 rounded-xl border bg-muted/30 p-4'>
                    <JsonView
                      value={session.session_headers}
                      displayDataTypes={false}
                      displayObjectSize
                      enableClipboard
                      shortenTextAfterLength={0}
                      style={
                        resolvedTheme === 'light'
                          ? {
                              ...githubLightTheme,
                              backgroundColor: 'transparent',
                            }
                          : {
                              ...githubDarkTheme,
                              backgroundColor: 'transparent',
                            }
                      }
                    />
                  </div>
                </details>
              )}

              {hasCookies && (
                <details className='group'>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <FileText className='h-5 w-5 text-amber-500' />
                    Cookies
                    <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                  </summary>
                  <div className='mt-4 rounded-xl border bg-muted/30 p-4'>
                    <JsonView
                      value={session.session_cookies}
                      displayDataTypes={false}
                      displayObjectSize
                      enableClipboard
                      shortenTextAfterLength={0}
                      style={
                        resolvedTheme === 'light'
                          ? {
                              ...githubLightTheme,
                              backgroundColor: 'transparent',
                            }
                          : {
                              ...githubDarkTheme,
                              backgroundColor: 'transparent',
                            }
                      }
                    />
                  </div>
                </details>
              )}

              {session.session_readme && (
                <details className='group' open>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <FileText className='h-5 w-5 text-sky-500' />
                    说明文档
                    <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                  </summary>
                  <div
                    className='mt-4 rounded-xl border bg-card p-4'
                    data-color-mode={resolvedTheme}
                  >
                    <MDEditor.Markdown
                      source={session.session_readme}
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </div>
                </details>
              )}

              {hasConfig && (
                <details className='group'>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <Braces className='h-5 w-5 text-fuchsia-500' />
                    配置信息
                    <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                  </summary>
                  <div className='mt-4 rounded-xl border bg-muted/30 p-4'>
                    <JsonView
                      value={session.session_config}
                      displayDataTypes={false}
                      displayObjectSize
                      enableClipboard
                      shortenTextAfterLength={0}
                      style={
                        resolvedTheme === 'light'
                          ? {
                              ...githubLightTheme,
                              backgroundColor: 'transparent',
                            }
                          : {
                              ...githubDarkTheme,
                              backgroundColor: 'transparent',
                            }
                      }
                    />
                  </div>
                </details>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
