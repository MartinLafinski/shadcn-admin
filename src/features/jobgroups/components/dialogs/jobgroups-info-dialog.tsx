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
} from 'lucide-react'
import { useTheme } from '@/context/theme-provider.tsx'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { StatCard } from '@/components/smart/view-cards'
import { useJobGroupQuery } from '../../api/jobgroups.ts'

interface JobGroupsInfoDialogProps {
  open: boolean
  onOpenChange: () => void
  jobgroupId: number
}

export function JobGroupsInfoDialog({
  open,
  onOpenChange,
  jobgroupId,
}: JobGroupsInfoDialogProps) {
  const { resolvedTheme } = useTheme()
  const { data: group, isLoading, isError } = useJobGroupQuery(jobgroupId)

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-3xl'>
          <DialogTitle className='sr-only'>加载中...</DialogTitle>
          <DialogDescription className='sr-only'>
            正在获取作业分组数据
          </DialogDescription>
          <div className='flex h-64 items-center justify-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            <span className='text-muted-foreground'>加载作业分组数据...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (isError || !group) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-md'>
          <DialogTitle className='sr-only'>加载失败</DialogTitle>
          <DialogDescription className='sr-only'>
            无法加载作业分组数据，请稍后重试
          </DialogDescription>
          <div className='flex h-32 items-center justify-center'>
            <p className='text-muted-foreground'>无法加载作业分组数据</p>
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
    group.jobgroup_config && Object.keys(group.jobgroup_config).length > 0
  const totalSpider = group.total_spider_task_count ?? 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] w-full max-w-3xl flex-col gap-0 space-y-0 overflow-hidden p-0'>
        <DialogHeader className='shrink-0 space-y-3 border-b bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='w-full min-w-0 space-y-1.5'>
              <DialogTitle className='flex items-center gap-3 text-2xl'>
                <Bug className='h-7 w-7 text-primary/70' />
                <span className='truncate'>{group.jobgroup_name}</span>
                <Badge
                  variant={group.jobgroup_enabled ? 'default' : 'secondary'}
                  className='text-xs'
                >
                  {group.jobgroup_enabled ? '启用' : '停用'}
                </Badge>
              </DialogTitle>
              <div className='flex w-full gap-3 pt-2'>
                <div className='flex flex-1 items-center gap-2'>
                  <FlagIcon className='h-3.5 w-3.5 shrink-0' />
                  <div className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{group.jobgroup_slug}</span>
                    <span>ID: {group.jobgroup_id}</span>
                  </div>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <UserRoundPlusIcon className='h-3.5 w-3.5 shrink-0' />
                  <div className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{group.created_by || '-'}</span>
                    <span>{compactTime(group.created_at)}</span>
                  </div>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <UserRoundPenIcon className='h-3.5 w-3.5 shrink-0' />
                  <div className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{group.updated_by || '-'}</span>
                    <span>{compactTime(group.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='min-h-0 flex-1'>
          <div className='space-y-6 p-6'>
            <div className='grid grid-cols-2 gap-4'>
              <StatCard
                icon={Bug}
                count={group.jobgroup_max_spider_task_count ?? 128}
                label='最大任务数'
                colorClass='text-teal-600'
                bgClass='bg-teal-500/10'
              />
              <StatCard
                icon={Bug}
                count={totalSpider}
                label='爬虫任务总数'
                colorClass='text-blue-600'
                bgClass='bg-blue-500/10'
              />
            </div>

            {group.jobgroup_readme && (
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
                    source={group.jobgroup_readme}
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
                <div className='mt-4 h-full overflow-hidden rounded-xl border bg-muted/30 p-4'>
                  <ScrollArea
                    className='h-[320px] w-full max-w-full'
                    type='always'
                  >
                    <JsonView
                      value={group.jobgroup_config}
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
