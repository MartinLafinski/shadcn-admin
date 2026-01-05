// 图标
import { Info } from 'lucide-react'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 滚动区域控件
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
// 对话框控件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
// Markdown 编辑器控件
import MDEditor from '@uiw/react-md-editor'
// JSON 数据查看器控件
import JsonView from '@uiw/react-json-view'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
// 日/夜主题上下文
import { useTheme } from '@/context/theme-provider.tsx'
import { WebsiteItemData } from '../../data/schemas.ts'

interface WebsitesViewDialogProps {
  /** 对话框的开启状态 */
  open: boolean
  /** 对话框状态变化时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 网站说明文档内容（Markdown 格式） */
  website: WebsiteItemData
}

export function WebsitesViewDialog({ open, onOpenChange, website }: WebsitesViewDialogProps) {
  const { resolvedTheme } = useTheme()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 触发按钮：信息图标按钮，用于打开对话框 */}
      <DialogTrigger asChild>
        <Button
          variant='outline'
          size='icon'
          title='查看配置与说明'
          className='h-8 w-8'
        >
          <Info className='h-4 w-4' />
        </Button>
      </DialogTrigger>

      {/* 对话框内容容器 */}
      <DialogContent className='sm:max-w-[80%] h-[80vh] flex flex-col p-0 overflow-hidden'>
        {/* 对话框头部：显示网站名称和描述信息 */}
        <DialogHeader className='shrink-0 p-6 pb-4'>
          <DialogTitle>{website.website_name} - 网站信息</DialogTitle>
          <DialogDescription>
            查看 {website.website_name} 网站的信息。
          </DialogDescription>
        </DialogHeader>

        {/* 可滚动的内容区域：包含说明文档和配置信息两部分 */}
        <div className='flex-1 min-h-0 overflow-hidden'>
          <ScrollArea className="h-full w-full" type={'always'}>
            <div className='space-y-6 px-6 pb-6'>
              {/* 网站基础信息展示区域 - 包含网站ID、名称、标识和URL */}
              <div className="space-y-4">
                {/* 网站ID显示区域 - 用于唯一标识网站 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>网站ID</h4>
                  <div
                    className='rounded-md border p-2 bg-background break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {website.website_id}
                  </div>
                </div>
                
                {/* 网站名称显示区域 - 展示网站的显示名称 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>网站名称</h4>
                  <div
                    className='rounded-md border p-2 bg-background break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {website.website_name}
                  </div>
                </div>

                {/* 网站标识显示区域 - 显示网站的URL友好标识符 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>网站标识</h4>
                  <div
                    className='rounded-md border p-2 bg-background break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {website.website_slug}
                  </div>
                </div>

                {/* 网站URL显示区域 - 展示网站的实际访问地址 */}
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>网站URL</h4>
                  <div
                    className='rounded-md border p-2 bg-background break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {/* 添加链接功能，便于直接访问或复制网站URL */}
                    <a 
                      href={website.website_url ?? '#'}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
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
                  className='rounded-md border p-4 bg-background'
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
                <div className='rounded-md border p-4 bg-muted/50'>
                  <JsonView
                    value={website.website_config}
                    displayDataTypes={false}        // 不显示数据类型
                    displayObjectSize={true}         // 显示对象大小
                    enableClipboard={true}           // 启用复制功能
                    shortenTextAfterLength={0}       // 不截断长文本
                    style={resolvedTheme === 'light' ? {...githubLightTheme, backgroundColor: 'transparent'} : {...githubDarkTheme, backgroundColor: 'transparent'}}
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
