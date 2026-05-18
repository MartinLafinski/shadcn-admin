// 图标
// JSON 数据查看器控件
import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
// Markdown 编辑器控件
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
// 日/夜主题上下文
import { useTheme } from '@/context/theme-provider.tsx'
// UI 组件
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
import { useIndustryQuery } from '../../api/industries.ts'
import type { IndustryItemData } from '../../data/schemas'

// =====================================================================================================================
// 配色/映射数据
// =====================================================================================================================

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

// =====================================================================================================================
// 子组件
// =====================================================================================================================

function StatCard({
  icon: Icon,
  count,
  label,
  colorClass,
  bgClass,
}: {
  icon: React.FC<{ className?: string }>
  count: number
  label: string
  colorClass: string
  bgClass: string
}) {
  return (
    <Card className='overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg'>
      <CardContent className='flex items-center gap-2 px-3 py-0'>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            bgClass
          )}
        >
          <Icon className={cn('h-6 w-6', colorClass)} />
        </div>
        <div>
          <p className='text-xl font-bold tabular-nums'>
            {count.toLocaleString()}
          </p>
          <p className='text-sm text-muted-foreground'>{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function SpiderTaskBar({
  counts,
}: {
  counts: Pick<
    IndustryItemData,
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

function MaterialGrid({ industry }: { industry: IndustryItemData }) {
  const entries = materialLabels
    .map((m) => ({ ...m, count: (industry as any)[m.key] as number }))
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

// =====================================================================================================================
// 主组件
// =====================================================================================================================

interface IndustriesViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  industryId: number
}

export function IndustriesViewDialog({
  open,
  onOpenChange,
  industryId,
}: IndustriesViewDialogProps) {
  const { resolvedTheme } = useTheme()
  const { data: industry, isLoading, isError } = useIndustryQuery(industryId)

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-5xl'>
          <DialogTitle className='sr-only'>加载中...</DialogTitle>
          <DialogDescription className='sr-only'>
            正在获取行业数据
          </DialogDescription>
          <div className='flex h-64 items-center justify-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            <span className='text-muted-foreground'>加载行业数据...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (isError || !industry) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-md'>
          <DialogTitle className='sr-only'>加载失败</DialogTitle>
          <DialogDescription className='sr-only'>
            无法加载行业数据，请稍后重试
          </DialogDescription>
          <div className='flex h-32 items-center justify-center'>
            <p className='text-muted-foreground'>无法加载行业数据</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const totalSpider = industry.total_spider_task_count ?? 0
  const totalMaterial = industry.total_material_count ?? 0

  const hasParamForms =
    industry.param_form_self ||
    industry.param_form_entrypoint ||
    industry.param_form_prejob

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
      <DialogContent className='flex max-h-[92vh] w-full max-w-5xl flex-col gap-0 space-y-0 overflow-hidden p-0'>
        {/* ===== Header ===== */}
        <DialogHeader className='shrink-0 space-y-3 border-b bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='w-full min-w-0 space-y-1.5'>
              <DialogTitle className='flex items-center gap-3 text-2xl'>
                <Building2 className='h-7 w-7 text-primary/70' />
                <span className='truncate'>{industry.industry_name}</span>
              </DialogTitle>
              {/*<div className='flex flex-wrap items-center gap-3 text-sm text-muted-foreground'>*/}
              {/*  <Badge variant='secondary' className='font-mono text-xs'>*/}
              {/*    ID: {industry.industry_id}*/}
              {/*  </Badge>*/}
              {/*  <span className='font-mono text-xs'>{industry.industry_slug}</span>*/}
              {/*</div>*/}
              <div className='flex w-full gap-3 pt-2'>
                <div className='flex flex-1 items-center gap-2'>
                  <p>
                    <FlagIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span className=''>{industry.industry_slug}</span>
                    <span className=''>ID: {industry.industry_id}</span>
                  </p>
                </div>

                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <p>
                    <UserRoundPlusIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span className=''>{industry.created_by || '-'}</span>
                    <span className=''>{compactTime(industry.created_at)}</span>
                  </p>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <p>
                    <UserRoundPenIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span className=''>{industry.updated_by || '-'}</span>
                    <span className=''>{compactTime(industry.updated_at)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ===== Body ===== */}
        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full' type='always'>
            <div className='space-y-6 p-6'>
              {/* ------ Stats Row ------ */}
              <div className='grid grid-cols-2 gap-4'>
                <StatCard
                  icon={DoorOpen}
                  count={industry.entrypoint_count ?? 0}
                  label='入口点'
                  colorClass='text-violet-600'
                  bgClass='bg-violet-500/10'
                />
                <StatCard
                  icon={Wrench}
                  count={industry.prejob_count ?? 0}
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
              </div>

              {/* ------ Spider Tasks + Materials (side-by-side) ------ */}
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
                          industry.working_spider_task_count,
                        completed_spider_task_count:
                          industry.completed_spider_task_count,
                        failed_spider_task_count:
                          industry.failed_spider_task_count,
                        interrupted_spider_task_count:
                          industry.interrupted_spider_task_count,
                        canceled_spider_task_count:
                          industry.canceled_spider_task_count,
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
                    <MaterialGrid industry={industry} />
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
                  <CardContent className=''>
                    <div className='flex flex-col gap-3'>
                      {[
                        { data: industry.param_form_self, label: '行业自用' },
                        {
                          data: industry.param_form_entrypoint,
                          label: '入口点指定',
                        },
                        {
                          data: industry.param_form_prejob,
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

              {/* ------ Readme ------ */}
              {industry.industry_readme && (
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
                      source={industry.industry_readme}
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </div>
                </details>
              )}

              {/* ------ Config ------ */}
              {industry.industry_config &&
                Object.keys(industry.industry_config).length > 0 && (
                  <details className='group'>
                    <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                      <Braces className='h-5 w-5 text-fuchsia-500' />
                      配置信息
                      <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                    </summary>
                    <div className='mt-4 rounded-xl border bg-muted/30 p-4'>
                      <JsonView
                        value={industry.industry_config}
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
