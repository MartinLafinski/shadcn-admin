import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import MDEditor from '@uiw/react-md-editor'
import {
  Ban,
  Braces,
  Bug,
  Building2,
  CheckCircle2,
  ChevronDown,
  DoorOpen,
  FileText,
  Loader2,
  PauseCircle,
  Settings,
  Wrench,
  XCircle,
  Package,
  UserRoundPenIcon,
  UserRoundPlusIcon,
  FlagIcon,
} from 'lucide-react'
import { materialLabels } from '@/lib/labels'
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { StatCard } from '@/components/smart/view-cards'
import { useWebsiteQuery } from '../../api/websites.ts'
import type { WebsiteItemData } from '../../data/schemas'

const spiderStatusColors: Record<string, string> = {
  working: 'bg-blue-500',
  completed: 'bg-emerald-500',
  failed: 'bg-red-500',
  interrupted: 'bg-amber-500',
  canceled: 'bg-gray-400',
}

const spiderStatusIcons: Record<string, React.FC<{ className?: string }>> = {
  working: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
  interrupted: PauseCircle,
  canceled: Ban,
}

const spiderStatusLabels: Record<string, string> = {
  working: '运行中',
  completed: '已完成',
  failed: '失败',
  interrupted: '中断',
  canceled: '已取消',
}

function SpiderTaskBar({
  counts,
}: {
  counts: Pick<
    WebsiteItemData,
    | 'working_spider_task_count'
    | 'completed_spider_task_count'
    | 'failed_spider_task_count'
    | 'interrupted_spider_task_count'
    | 'canceled_spider_task_count'
  >
}) {
  const items = [
    { key: 'working', count: counts.working_spider_task_count ?? 0 },
    { key: 'completed', count: counts.completed_spider_task_count ?? 0 },
    { key: 'failed', count: counts.failed_spider_task_count ?? 0 },
    { key: 'interrupted', count: counts.interrupted_spider_task_count ?? 0 },
    { key: 'canceled', count: counts.canceled_spider_task_count ?? 0 },
  ].filter((i) => i.count > 0)

  if (items.length === 0) return null

  const total = items.reduce((s, i) => s + i.count, 0)

  return (
    <div className='space-y-3'>
      <div className='flex h-2.5 overflow-hidden rounded-full bg-muted'>
        {items.map((it) => (
          <div
            key={it.key}
            className={cn('h-full transition-all', spiderStatusColors[it.key])}
            style={{ width: `${(it.count / total) * 100}%` }}
          />
        ))}
      </div>
      <div className='flex flex-wrap gap-x-5 gap-y-1.5'>
        {items.map((it) => {
          const Icon = spiderStatusIcons[it.key]
          return (
            <div key={it.key} className='flex items-center gap-1.5 text-sm'>
              <div
                className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  spiderStatusColors[it.key]
                )}
              />
              <Icon className='h-3.5 w-3.5 text-muted-foreground' />
              <span>{it.count}</span>
              <span className='text-muted-foreground'>
                {spiderStatusLabels[it.key]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function MaterialGrid({ website }: { website: WebsiteItemData }) {
  const entries = materialLabels
    .map((m) => ({ ...m, count: (website as any)[m.key] as number }))
    .filter((m) => m.count > 0)

  if (entries.length === 0) return null

  return (
    <div className='grid grid-cols-4 gap-3'>
      {entries.map((m) => (
        <div
          key={m.key}
          className='group flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm'
        >
          <m.icon className={cn('h-5 w-5', m.color)} />
          <span className='text-base font-bold tabular-nums'>
            {m.count.toLocaleString()}
          </span>
          <span className='text-xs text-muted-foreground'>{m.label}</span>
        </div>
      ))}
    </div>
  )
}

interface WebsitesViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  websiteId: number
}

export function WebsitesViewDialog({
  open,
  onOpenChange,
  websiteId,
}: WebsitesViewDialogProps) {
  const { resolvedTheme } = useTheme()
  const { data: website, isLoading, isError } = useWebsiteQuery(websiteId)

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-5xl'>
          <DialogTitle className='sr-only'>加载中...</DialogTitle>
          <DialogDescription className='sr-only'>
            正在获取网站数据
          </DialogDescription>
          <div className='flex h-64 items-center justify-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            <span className='text-muted-foreground'>加载网站数据...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (isError || !website) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-md'>
          <DialogTitle className='sr-only'>加载失败</DialogTitle>
          <DialogDescription className='sr-only'>
            无法加载网站数据，请稍后重试
          </DialogDescription>
          <div className='flex h-32 items-center justify-center'>
            <p className='text-muted-foreground'>无法加载网站数据</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const totalSpider = website.total_spider_task_count ?? 0
  const totalMaterial = website.total_material_count ?? 0

  const hasParamForms =
    website.param_form_self ||
    website.param_form_entrypoint ||
    website.param_form_prejob

  const compactTime = (t: string) =>
    t
      ? new Date(t).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] w-full max-w-3xl flex-col gap-0 space-y-0 overflow-hidden p-0 lg:max-w-2/3'>
        {/* ===== Header ===== */}
        <DialogHeader className='shrink-0 space-y-3 border-b bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='w-full min-w-0 space-y-1.5'>
              <DialogTitle className='flex items-center gap-3 text-2xl'>
                <Building2 className='h-7 w-7 text-primary/70' />
                <span className='truncate'>{website.website_name}</span>
              </DialogTitle>
              <div className='flex w-full gap-3 pt-2'>
                <div className='flex flex-1 items-center gap-2'>
                  <p>
                    <FlagIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{website.website_slug}</span>
                    <span>ID: {website.website_id}</span>
                  </p>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <p>
                    <UserRoundPlusIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{website.created_by || '-'}</span>
                    <span>{compactTime(website.created_at)}</span>
                  </p>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <p>
                    <UserRoundPenIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{website.updated_by || '-'}</span>
                    <span>{compactTime(website.updated_at)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ===== Body ===== */}
        <div className='min-h-0 flex-1'>
          <div className='space-y-6 p-6'>
            {/* ------ Stats Row ------ */}
            <div className='grid grid-cols-2 gap-4'>
              <StatCard
                icon={DoorOpen}
                count={website.entrypoint_count ?? 0}
                label='入口点'
                colorClass='text-violet-600'
                bgClass='bg-violet-500/10'
              />
              <StatCard
                icon={Wrench}
                count={website.prejob_count ?? 0}
                label='预备作业'
                colorClass='text-orange-600'
                bgClass='bg-orange-500/10'
              />
              <StatCard
                icon={Bug}
                count={totalSpider}
                label='爬虫任务'
                colorClass='text-blue-600'
                bgClass='bg-blue-500/10'
              />
              <StatCard
                icon={Package}
                count={totalMaterial}
                label='采料总数'
                colorClass='text-emerald-600'
                bgClass='bg-emerald-500/10'
              />
              <StatCard
                icon={Package}
                count={website.spider_package_count ?? 0}
                label='爬虫包'
                colorClass='text-amber-600'
                bgClass='bg-amber-500/10'
              />
            </div>

            {/* ------ Spider Tasks ------ */}
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
                  <SpiderTaskBar
                    counts={{
                      working_spider_task_count:
                        website.working_spider_task_count,
                      completed_spider_task_count:
                        website.completed_spider_task_count,
                      failed_spider_task_count:
                        website.failed_spider_task_count,
                      interrupted_spider_task_count:
                        website.interrupted_spider_task_count,
                      canceled_spider_task_count:
                        website.canceled_spider_task_count,
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* ------ Material Types ------ */}
            {totalMaterial > 0 && (
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Package className='h-5 w-5 text-emerald-500' />
                    采料类型分布
                    <Badge variant='secondary' className='ml-auto'>
                      {totalMaterial}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MaterialGrid website={website} />
                </CardContent>
              </Card>
            )}

            {/* ------ Param Forms ------ */}
            {hasParamForms && (
              <Card className='gap-0 space-y-0'>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <Settings className='h-5 w-5 text-amber-500' />
                    关联参数要素包
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-col gap-3'>
                    {[
                      { data: website.param_form_self, label: '网站自用' },
                      {
                        data: website.param_form_entrypoint,
                        label: '入口点指定',
                      },
                      {
                        data: website.param_form_prejob,
                        label: '预备作业指定',
                      },
                    ].map(
                      (pf) =>
                        pf.data && (
                          <div
                            key={pf.label}
                            className='rounded-lg border bg-muted/30 p-3'
                          >
                            <div className='flex items-center justify-between'>
                              <span className='text-xs text-muted-foreground'>
                                {pf.label}
                              </span>
                              <Badge
                                variant={
                                  pf.data.param_form_enabled
                                    ? 'success'
                                    : 'destructive'
                                }
                                className='h-5 px-1.5 text-xs'
                              >
                                {pf.data.param_form_enabled ? '启用' : '停用'}
                              </Badge>
                            </div>
                            <p className='mt-1.5 text-sm font-semibold'>
                              {pf.data.param_form_name}
                            </p>
                            <p className='font-mono text-xs text-muted-foreground'>
                              {pf.data.param_form_slug}
                            </p>
                          </div>
                        )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className='space-y-6 p-6'>
            {/* ------ Readme ------ */}
            {website.website_readme && (
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
                    source={website.website_readme}
                    style={{ backgroundColor: 'transparent' }}
                  />
                </div>
              </details>
            )}

            {/* ------ Config ------ */}
            {website.website_config &&
              Object.keys(website.website_config).length > 0 && (
                <details className='group'>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <Braces className='h-5 w-5 text-fuchsia-500' />
                    配置信息
                    <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                  </summary>
                  <div className='mt-4 h-full overflow-hidden rounded-xl border bg-muted/30 p-4'>
                    <ScrollArea
                      className='h-[320px] w-full max-w-full'
                      type='always'
                    >
                      <JsonView
                        value={website.website_config}
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
                      <ScrollBar orientation='horizontal' />
                    </ScrollArea>
                  </div>
                </details>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
