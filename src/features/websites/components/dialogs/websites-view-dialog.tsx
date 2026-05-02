// 图标
// JSON 数据查看器控件
import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
// Markdown 编辑器控件
import MDEditor from '@uiw/react-md-editor'
import { Check, X } from 'lucide-react'
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
import { WebsiteItemData } from '../../data/schemas.ts'

interface WebsitesViewDialogProps {
  /** 对话框的开启状态 */
  open: boolean
  /** 对话框状态变化时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 网站说明文档内容（Markdown 格式） */
  website: WebsiteItemData | null
}

export function WebsitesViewDialog({
  open,
  onOpenChange,
  website,
}: WebsitesViewDialogProps) {
  const { resolvedTheme } = useTheme()

  if (!website) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 对话框内容容器 */}
      <DialogContent className='flex h-[80vh] flex-col overflow-hidden p-0 sm:max-w-[80%]'>
        {/* 对话框头部：显示网站名称和描述信息 */}
        <DialogHeader className='shrink-0 p-6 pb-4'>
          <DialogTitle>{website.website_name} - 网站信息</DialogTitle>
          <DialogDescription>
            查看 {website.website_name} 网站的信息。
          </DialogDescription>
        </DialogHeader>

        {/* 可滚动的内容区域：包含说明文档和配置信息两部分 */}
        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full w-full' type={'always'}>
            <div className='space-y-6 px-6 pb-6'>
              {/* 网站基础信息展示区域 - 包含网站ID、名称、标识和URL */}
              <div className='space-y-4'>
                {/* 网站可用性显示区域 - 显示网站是否启用 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>网站可用性</h4>
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-md border p-3',
                      website.website_enabled
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                    )}
                  >
                    {website.website_enabled ? (
                      <>
                        <Check className='h-5 w-5 text-green-600 dark:text-green-400' />
                        <span className='font-medium text-green-700 dark:text-green-300'>
                          已启用
                        </span>
                      </>
                    ) : (
                      <>
                        <X className='h-5 w-5 text-red-600 dark:text-red-400' />
                        <span className='font-medium text-red-700 dark:text-red-300'>
                          已禁用
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* 网站ID显示区域 - 用于唯一标识网站 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>网站ID</h4>
                  <div
                    className='rounded-md border bg-background p-2 break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {website.website_id}
                  </div>
                </div>

                {/* 网站名称显示区域 - 展示网站的显示名称 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>网站名称</h4>
                  <div
                    className='rounded-md border bg-background p-2 break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {website.website_name}
                  </div>
                </div>

                {/* 网站标识显示区域 - 显示网站的URL友好标识符 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>网站标识</h4>
                  <div
                    className='rounded-md border bg-background p-2 break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {website.website_slug}
                  </div>
                </div>

                {/* 网站URL显示区域 - 展示网站的实际访问地址 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>网站URL</h4>
                  <div
                    className='rounded-md border bg-background p-2 break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {/* 添加链接功能，便于直接访问或复制网站URL */}
                    <a
                      href={website.website_url ?? '#'}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='break-all text-blue-600 hover:underline'
                    >
                      {website.website_url}
                    </a>
                  </div>
                </div>
              </div>

              {/* 说明文档区域：展示 Markdown 格式的说明文档 */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>说明文档</h4>
                {/* 使用 MDEditor.Markdown 渲染 Markdown 内容 */}
                {/* data-color-mode 属性使 Markdown 渲染适配当前主题 */}
                <div
                  className='rounded-md border bg-background p-4'
                  data-color-mode={resolvedTheme}
                >
                  <MDEditor.Markdown
                    source={website.website_readme}
                    style={{ backgroundColor: 'transparent' }}
                  />
                </div>
              </div>

              {/* 配置信息区域：展示 JSON 格式的配置数据 */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>配置信息</h4>
                {/* 使用 react-json-view 组件展示 JSON 数据 */}
                <div className='rounded-md border bg-muted/50 p-4'>
                  <JsonView
                    value={website.website_config}
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
