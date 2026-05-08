// 图标
// JSON 数据查看器控件
import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import { Calendar, Globe, InfoIcon, Server } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
// 日/夜主题上下文
import { useTheme } from '@/context/theme-provider.tsx'
// 对话框控件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
// 滚动区域控件
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { taskStatusDetailDict } from '@/features/jobs/data/labels.tsx'
import { type JobItemData } from '../../data/schemas.ts'

interface JobsViewDialogProps {
  /** 对话框的开启状态 */
  open: boolean
  /** 对话框状态变化时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 任务数据 */
  job: JobItemData | null
}

export function JobsViewDialog({
  open,
  onOpenChange,
  job,
}: JobsViewDialogProps) {
  const { resolvedTheme } = useTheme()

  if (!job) {
    return null
  }

  // 合并配置：以 entrypoint.website.website_config 为基座，然后整合 entrypoint.entrypoint_config 的内容
  // 后者 key 的设置会覆盖前者的设置
  const mergedConfig = {
    ...(job.entrypoint?.website?.website_config || {}),
    ...(job.entrypoint?.entrypoint_config || {}),
  }

  // 格式化日期时间
  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const getTaskStatusDisplay = () => {
    const taskStatus = job.task_status as string | null
    return taskStatus
      ? taskStatusDetailDict[taskStatus]
      : {
          value: undefined,
          label: '未知',
          icon: InfoIcon,
          className: 'bg-blue-600 text-white',
        }
  }
  const statusDisplay = getTaskStatusDisplay()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 对话框内容容器 */}
      <DialogContent className='flex h-[80vh] flex-col overflow-hidden p-0 sm:max-w-[80%]'>
        {/* 对话框头部：显示任务名称和描述信息 */}
        <DialogHeader className='shrink-0 p-6 pb-4'>
          <DialogTitle>
            {job.task_name || `任务 #${job.task_id}`} - 任务详情
          </DialogTitle>
          <DialogDescription>查看任务的详细信息。</DialogDescription>
        </DialogHeader>

        {/* 可滚动的内容区域 */}
        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full w-full' type={'always'}>
            <div className='space-y-6 px-6 pb-6'>
              {/* 任务基础信息展示区域 */}
              <div className='space-y-4'>
                {/* 任务结果状态显示区域 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>任务状态</h4>
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-md border p-3',
                      statusDisplay.className
                    )}
                  >
                    <statusDisplay.icon className='h-5 w-5' />
                    <span className='font-medium'>{statusDisplay.label}</span>
                  </div>
                </div>

                {/* 任务ID显示区域 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>任务ID</h4>
                  <div className='rounded-md border bg-background p-2 break-all'>
                    {job.task_id || '-'}
                  </div>
                </div>

                {/* 准任务ID显示区域 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>准任务ID</h4>
                  <div className='rounded-md border bg-background p-2 break-all'>
                    {job.pre_task_id}
                  </div>
                </div>

                {/* 任务名称显示区域 */}
                {job.task_name && (
                  <div className='space-y-2'>
                    <h4 className='text-sm font-medium'>任务名称</h4>
                    <div className='rounded-md border bg-background p-2 break-all'>
                      {job.task_name}
                    </div>
                  </div>
                )}

                {/* 任务标识显示区域 */}
                {job.task_slug && (
                  <div className='space-y-2'>
                    <h4 className='text-sm font-medium'>任务标识</h4>
                    <div className='rounded-md border bg-background p-2 break-all'>
                      {job.task_slug}
                    </div>
                  </div>
                )}
              </div>

              {/* 时间信息区域 */}
              <div className='space-y-4'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <Calendar className='h-4 w-4' />
                  时间信息
                </h4>

                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {/* 创建时间 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      创建时间
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {formatDateTime(job.create_at)}
                    </div>
                  </div>

                  {/* 触发时间 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      触发时间
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {formatDateTime(job.triggered_at)}
                    </div>
                  </div>

                  {/* 采集开始时间 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      采集开始时间
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {formatDateTime(job.begin_at)}
                    </div>
                  </div>

                  {/* 采集结束时间 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      采集结束时间
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {formatDateTime(job.end_at)}
                    </div>
                  </div>

                  {/* 关闭时间 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      关闭时间
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {formatDateTime(job.closed_at)}
                    </div>
                  </div>

                  {/* 最小可用间隔 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      最小可用间隔
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {job.min_available_interval} 秒
                    </div>
                  </div>
                </div>
              </div>

              {/* 节点和 Actor 信息区域 */}
              <div className='space-y-4'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <Server className='h-4 w-4' />
                  节点信息
                </h4>

                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {/* 节点ID */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      节点ID
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm break-all'>
                      {job.node_id || '-'}
                    </div>
                  </div>

                  {/* 节点地址 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      节点地址
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm break-all'>
                      {job.node_address || '-'}
                    </div>
                  </div>

                  {/* Actor ID */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      Actor ID
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm break-all'>
                      {job.uid || '-'}
                    </div>
                  </div>

                  {/* Actor 地址 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      Actor 地址
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm break-all'>
                      {job.address || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 关联信息区域 */}
              <div className='space-y-4'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <Globe className='h-4 w-4' />
                  关联信息
                </h4>

                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {/* 网站信息 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>网站</span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {job.website_slug}
                    </div>
                  </div>

                  {/* 入口点信息 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      入口点
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {job.entrypoint_slug}
                    </div>
                  </div>

                  {/* 网站任务ID */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      网站任务ID
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {job.website_task_id || '-'}
                    </div>
                  </div>

                  {/* 入口点任务ID */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      入口点任务ID
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {job.entrypoint_task_id || '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 优先级信息 */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>优先级</h4>
                <div className='rounded-md border bg-background p-2 text-sm'>
                  {job.priority}
                </div>
              </div>

              {/* 配置信息区域：展示 JSON 格式的配置数据 */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>配置信息</h4>
                <p className='text-xs text-muted-foreground'>
                  配置以网站配置为基座，入口点配置会覆盖网站配置中的同名设置
                </p>
                {/* 使用 react-json-view 组件展示 JSON 数据 */}
                <div className='rounded-md border bg-muted/50 p-4'>
                  <JsonView
                    value={mergedConfig}
                    displayDataTypes={false} // 不显示数据类型
                    displayObjectSize={true} // 显示对象大小
                    enableClipboard={true} // 启用复制功能
                    shortenTextAfterLength={0} // 不截断长文本
                    style={
                      resolvedTheme === 'light'
                        ? {
                            ...githubLightTheme,
                            backgroundColor: 'transparent',
                          }
                        : { ...githubDarkTheme, backgroundColor: 'transparent' }
                    }
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
