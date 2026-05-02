// 图标
// JSON 数据查看器控件
import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import { Calendar, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
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
import { ReqData } from '../../data/schemas.ts'

interface ReqsViewDialogProps {
  /** 对话框的开启状态 */
  open: boolean
  /** 对话框状态变化时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 请求数据 */
  req: ReqData | null
}

export function ReqsViewDialog({
  open,
  onOpenChange,
  req,
}: ReqsViewDialogProps) {
  const { resolvedTheme } = useTheme()

  if (!req) {
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

  // 判断请求结果状态
  const getResultStatus = () => {
    if (req.succeed) {
      return {
        label: '成功',
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
      }
    } else if (req.exp_type) {
      return {
        label: '失败',
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
      }
    } else if (req.discard_type) {
      return {
        label: '丢弃',
        icon: AlertCircle,
        color: 'text-amber-600 dark:text-amber-400',
      }
    }
    return {
      label: '未知',
      icon: AlertCircle,
      color: 'text-gray-600 dark:text-gray-400',
    }
  }

  const resultStatus = getResultStatus()
  const StatusIcon = resultStatus.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 对话框内容容器 */}
      <DialogContent className='flex h-[80vh] flex-col overflow-hidden p-0 sm:max-w-[80%]'>
        {/* 对话框头部：显示请求ID和描述信息 */}
        <DialogHeader className='shrink-0 p-6 pb-4'>
          <DialogTitle>请求 #{req.req_id} - 详情</DialogTitle>
          <DialogDescription>查看请求的详细信息。</DialogDescription>
        </DialogHeader>

        {/* 可滚动的内容区域 */}
        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full w-full' type={'always'}>
            <div className='space-y-6 px-6 pb-6'>
              {/* 请求基础信息展示区域 */}
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                {/* 请求ID */}
                <div className='space-y-1'>
                  <h4 className='text-sm font-medium'>请求ID</h4>
                  <div className='rounded-md border bg-background p-2 text-sm break-all'>
                    {req.req_id || '-'}
                  </div>
                </div>

                {/* 任务ID */}
                <div className='space-y-1'>
                  <h4 className='text-sm font-medium'>任务ID</h4>
                  <div className='rounded-md border bg-background p-2 text-sm break-all'>
                    {req.task_id}
                  </div>
                </div>

                {/* 请求结果状态 */}
                <div className='space-y-1'>
                  <h4 className='text-sm font-medium'>请求状态</h4>
                  <div className='flex items-center gap-2 rounded-md border bg-background p-2 text-sm'>
                    <StatusIcon className={`h-4 w-4 ${resultStatus.color}`} />
                    <span className={resultStatus.color}>
                      {resultStatus.label}
                    </span>
                  </div>
                </div>

                {/* HTTP方法 */}
                <div className='space-y-1'>
                  <h4 className='text-sm font-medium'>HTTP方法</h4>
                  <div className='rounded-md border bg-background p-2 text-sm'>
                    {req.method}
                  </div>
                </div>
              </div>

              {/* 标题和URL */}
              <div className='space-y-4'>
                <div className='space-y-1'>
                  <h4 className='text-sm font-medium'>标题</h4>
                  <div className='rounded-md border bg-background p-2 text-sm break-all'>
                    {req.title || '-'}
                  </div>
                </div>

                <div className='space-y-1'>
                  <h4 className='text-sm font-medium'>URL</h4>
                  {req.url ? (
                    <a
                      href={req.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='block rounded-md border bg-background p-2 text-sm break-all text-blue-600 hover:text-blue-800 hover:underline'
                    >
                      {req.url}
                    </a>
                  ) : (
                    <div className='rounded-md border bg-background p-2 text-sm text-gray-400'>
                      -
                    </div>
                  )}
                </div>
              </div>

              {/* 时间信息区域 */}
              <div className='space-y-4'>
                <h4 className='flex items-center gap-2 text-sm font-medium'>
                  <Calendar className='h-4 w-4' />
                  时间信息
                </h4>

                <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                  {/* 发布日期 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      发布日期
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {formatDateTime(req.published_at)} [GMT+8]
                    </div>
                  </div>

                  {/* 发生时间 */}
                  <div className='space-y-1'>
                    <span className='text-xs text-muted-foreground'>
                      发生时间
                    </span>
                    <div className='rounded-md border bg-background p-2 text-sm'>
                      {formatDateTime(req.occurred_at)} [GMT+8]
                    </div>
                  </div>
                </div>
              </div>

              {/* 异常信息区域 */}
              {(req.exp_type || req.exp_msg) && (
                <div className='space-y-4'>
                  <h4 className='flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400'>
                    <XCircle className='h-4 w-4' />
                    异常信息
                  </h4>

                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    {/* 异常类型 */}
                    {req.exp_type && (
                      <div className='space-y-1'>
                        <span className='text-xs text-muted-foreground'>
                          异常类型
                        </span>
                        <div className='rounded-md border bg-background p-2 text-sm break-all'>
                          {req.exp_type}
                        </div>
                      </div>
                    )}

                    {/* 异常消息 */}
                    {req.exp_msg && (
                      <div className='space-y-1'>
                        <span className='text-xs text-muted-foreground'>
                          异常消息
                        </span>
                        <div className='rounded-md border bg-background p-2 text-sm break-all'>
                          {req.exp_msg}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 丢弃信息区域 */}
              {(req.discard_type || req.discard_msg) && (
                <div className='space-y-4'>
                  <h4 className='flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400'>
                    <AlertCircle className='h-4 w-4' />
                    丢弃信息
                  </h4>

                  <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                    {/* 丢弃类型 */}
                    {req.discard_type && (
                      <div className='space-y-1'>
                        <span className='text-xs text-muted-foreground'>
                          丢弃类型
                        </span>
                        <div className='rounded-md border bg-background p-2 text-sm break-all'>
                          {req.discard_type}
                        </div>
                      </div>
                    )}

                    {/* 丢弃消息 */}
                    {req.discard_msg && (
                      <div className='space-y-1'>
                        <span className='text-xs text-muted-foreground'>
                          丢弃消息
                        </span>
                        <div className='rounded-md border bg-background p-2 text-sm break-all'>
                          {req.discard_msg}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 请求参数 */}
              {req.params && Object.keys(req.params).length > 0 && (
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium'>请求参数</h4>
                  <div className='rounded-md border bg-muted/50 p-4'>
                    <JsonView
                      value={req.params}
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
              )}

              {/* 额外信息 */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>额外信息</h4>
                <div className='rounded-md border bg-muted/50 p-4'>
                  <JsonView
                    value={req.extra_info || {}}
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
