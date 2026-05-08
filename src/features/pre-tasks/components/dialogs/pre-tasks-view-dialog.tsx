// 图标
// JSON 数据查看器控件
import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import { Globe, Calendar } from 'lucide-react'
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
import { type PreTaskItemData } from '../../data/schemas.ts'

interface PreTasksViewDialogProps {
  /** 对话框的开启状态 */
  open: boolean
  /** 对话框状态变化时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 准任务数据 */
  preTask: PreTaskItemData | null
}

export function PreTasksViewDialog({
  open,
  onOpenChange,
  preTask,
}: PreTasksViewDialogProps) {
  const { resolvedTheme } = useTheme()

  if (!preTask) {
    return null
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 对话框内容容器 */}
      <DialogContent className='flex h-[80vh] flex-col overflow-hidden p-0 sm:max-w-[80%]'>
        {/* 对话框头部：显示准任务名称和描述信息 */}
        <DialogHeader className='shrink-0 p-6 pb-4'>
          <DialogTitle>准任务 #{preTask.pre_task_id} - 详情</DialogTitle>
          <DialogDescription>查看待执行准任务的详细信息。</DialogDescription>
        </DialogHeader>

        {/* 可滚动的内容区域 */}
        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full w-full' type={'always'}>
            <div className='space-y-6 px-6 pb-6'>
              {/* 准任务基础信息展示区域 */}
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                {/* 准任务ID显示区域 */}
                <div className='space-y-1'>
                  <h4 className='text-sm font-medium'>准任务ID</h4>
                  <div className='rounded-md border bg-background p-2 text-sm break-all'>
                    {preTask.pre_task_id}
                  </div>
                </div>

                {/* 优先级信息 */}
                <div className='space-y-1'>
                  <h4 className='text-sm font-medium'>优先级</h4>
                  <div className='rounded-md border bg-background p-2 text-sm'>
                    {preTask.priority}
                  </div>
                </div>

                {/*/!* 爬虫类型显示区域 *!/*/}
                {/*<div className='space-y-2'>*/}
                {/*  <h4 className='text-sm font-medium'>爬虫类型</h4>*/}
                {/*  <div className='rounded-md border p-2 bg-background break-all'>*/}
                {/*    {preTask.spider_type}*/}
                {/*  </div>*/}
                {/*</div>*/}
              </div>

              {/* 时间信息区域 */}
              <div className='space-y-4'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <Calendar className='h-4 w-4' />
                  时间信息
                </h4>

                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {/* 触发时间 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      触发时间
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {formatDateTime(preTask.triggered_at)} [GMT+8]
                    </div>
                  </div>

                  {/* 采集结束时间 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      采集结束时间
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {formatDateTime(preTask.end_at)} [GMT+8]
                    </div>
                  </div>

                  {/* 最小可用间隔 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      最小可用间隔
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {preTask.min_available_interval} 秒
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
                    <div className='rounded-md border bg-background p-2 text-sm break-all'>
                      {preTask.website_slug}
                    </div>
                  </div>

                  {/* 入口点信息 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      入口点
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm break-all'>
                      {preTask.entrypoint_slug}
                    </div>
                  </div>

                  {/* 网站ID */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      网站ID
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm break-all'>
                      {preTask.website_id}
                    </div>
                  </div>

                  {/* 入口点ID */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      入口点ID
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm break-all'>
                      {preTask.entrypoint_id}
                    </div>
                  </div>
                </div>
              </div>

              {/* 入口点信息区域 */}
              {preTask.entrypoint && (
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium'>入口点详细信息</h4>

                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    {/* 入口点名称 */}
                    <div className='space-y-1'>
                      <span className='text-xs text-muted-foreground'>
                        入口点名称
                      </span>
                      <div className='rounded-md border bg-background p-2 text-sm'>
                        {preTask.entrypoint.entrypoint_name}
                      </div>
                    </div>

                    {/* 入口点URL */}
                    {preTask.entrypoint.entrypoint_url && (
                      <div className='space-y-1'>
                        <span className='text-xs text-muted-foreground'>
                          入口点URL
                        </span>
                        <div className='rounded-md border bg-background p-2 text-sm break-all'>
                          {preTask.entrypoint.entrypoint_url}
                        </div>
                      </div>
                    )}

                    {/* 入口点启用状态 */}
                    <div className='space-y-1'>
                      <span className='text-xs text-muted-foreground'>
                        启用状态
                      </span>
                      <div className='rounded-md border bg-background p-2 text-sm'>
                        {preTask.entrypoint.entrypoint_enabled ? (
                          <span className='text-green-600 dark:text-green-400'>
                            已启用
                          </span>
                        ) : (
                          <span className='text-red-600 dark:text-red-400'>
                            已禁用
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 抓取开始时间 */}
                    <div className='space-y-1'>
                      <span className='text-xs text-muted-foreground'>
                        抓取开始时间
                      </span>
                      <div className='rounded-md border bg-background p-2 text-sm'>
                        {formatDateTime(preTask.entrypoint.begin_at)}
                      </div>
                    </div>

                    {/* 抓取结束时间 */}
                    <div className='space-y-1'>
                      <span className='text-xs text-muted-foreground'>
                        抓取结束时间
                      </span>
                      <div className='rounded-md border bg-background p-2 text-sm'>
                        {formatDateTime(preTask.entrypoint.end_at)}
                      </div>
                    </div>

                    {/* 入口点最小可用间隔 */}
                    <div className='space-y-1'>
                      <span className='text-xs text-muted-foreground'>
                        最小可用间隔
                      </span>
                      <div className='rounded-md border bg-background p-2 text-sm'>
                        {preTask.entrypoint.min_available_interval} 秒
                      </div>
                    </div>
                  </div>

                  {/* 入口点说明文档 */}
                  {preTask.entrypoint.entrypoint_readme && (
                    <div className='space-y-2'>
                      <h5 className='text-xs font-medium'>说明文档</h5>
                      <div className='rounded-md border bg-muted/50 p-3 text-sm whitespace-pre-wrap'>
                        {preTask.entrypoint.entrypoint_readme}
                      </div>
                    </div>
                  )}

                  {/* 入口点配置信息 */}
                  <div className='space-y-2'>
                    <h5 className='text-xs font-medium'>入口点配置</h5>
                    <div className='rounded-md border bg-muted/50 p-4'>
                      <JsonView
                        value={preTask.entrypoint.entrypoint_config}
                        displayDataTypes={false}
                        displayObjectSize={true}
                        enableClipboard={true}
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
                  </div>
                </div>
              )}

              {/* 网站信息区域 */}
              {preTask.entrypoint?.website && (
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium'>网站详细信息</h4>

                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    {/* 网站名称 */}
                    <div className='space-y-1'>
                      <span className='text-xs text-muted-foreground'>
                        网站名称
                      </span>
                      <div className='rounded-md border bg-background p-2 text-sm'>
                        {preTask.entrypoint.website.website_name}
                      </div>
                    </div>

                    {/* 网站URL */}
                    {preTask.entrypoint.website.website_url && (
                      <div className='space-y-1'>
                        <span className='text-xs text-muted-foreground'>
                          网站URL
                        </span>
                        <div className='rounded-md border bg-background p-2 text-sm break-all'>
                          {preTask.entrypoint.website.website_url}
                        </div>
                      </div>
                    )}

                    {/* 网站启用状态 */}
                    <div className='space-y-1'>
                      <span className='text-xs text-muted-foreground'>
                        启用状态
                      </span>
                      <div className='rounded-md border bg-background p-2 text-sm'>
                        {preTask.entrypoint.website.website_enabled ? (
                          <span className='text-green-600 dark:text-green-400'>
                            已启用
                          </span>
                        ) : (
                          <span className='text-red-600 dark:text-red-400'>
                            已禁用
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 创建时间 */}
                    <div className='space-y-1'>
                      <span className='text-xs text-muted-foreground'>
                        创建时间
                      </span>
                      <div className='rounded-md border bg-background p-2 text-sm'>
                        {formatDateTime(preTask.entrypoint.website.created_at)}
                      </div>
                    </div>

                    {/* 更新时间 */}
                    <div className='space-y-1'>
                      <span className='text-xs text-muted-foreground'>
                        更新时间
                      </span>
                      <div className='rounded-md border bg-background p-2 text-sm'>
                        {formatDateTime(preTask.entrypoint.website.updated_at)}
                      </div>
                    </div>
                  </div>

                  {/* 网站说明文档 */}
                  {preTask.entrypoint.website.website_readme && (
                    <div className='space-y-2'>
                      <h5 className='text-xs font-medium'>说明文档</h5>
                      <div className='rounded-md border bg-muted/50 p-3 text-sm whitespace-pre-wrap'>
                        {preTask.entrypoint.website.website_readme}
                      </div>
                    </div>
                  )}

                  {/* 网站配置信息 */}
                  <div className='space-y-2'>
                    <h5 className='text-xs font-medium'>网站配置</h5>
                    <div className='rounded-md border bg-muted/50 p-4'>
                      <JsonView
                        value={preTask.entrypoint.website.website_config}
                        displayDataTypes={false}
                        displayObjectSize={true}
                        enableClipboard={true}
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
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
