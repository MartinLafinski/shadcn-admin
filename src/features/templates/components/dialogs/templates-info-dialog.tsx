// 滚动区域控件
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
// 对话框控件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
// Markdown 编辑器控件
import MDEditor from '@uiw/react-md-editor'
// 日/夜主题上下文
import { useTheme } from '@/context/theme-provider.tsx'

/**
 * 模板信息对话框组件的属性接口
 * 
 * 该接口定义了 TemplatesInfoDialog 组件所需的全部属性
 * 
 * 属性说明：
 * - open: 控制对话框的打开/关闭状态
 * - onOpenChange: 对话框打开状态变化时的回调函数
 * - readme: 模板的说明文档内容（Markdown 格式）
 * - content: 模板的内容（Markdown 格式）
 * - templateName: 模板名称，用于在对话框标题中显示
 * 
 * 二次开发指引：
 * - 如需增加新的属性，可在此接口中添加
 * - 如需修改属性类型，直接修改对应属性的类型标注
 * - 所有属性都应有明确的类型定义，便于 TypeScript 类型检查
 */
interface TemplatesInfoDialogProps {
  /** 对话框的开启状态 */
  open: boolean
  /** 对话框状态变化时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 模板说明文档内容（Markdown 格式） */
  readme: string
  /** 模板内容（Markdown 格式） */
  content: string
  /** 模板名称 */
  templateName: string
}

/**
 * 模板信息对话框组件
 * 用于展示模板的 Markdown 内容和说明文档
 * 
 * 功能说明：
 * - 通过按钮触发对话框显示
 * - 支持展示 Markdown 格式的模板内容
 * - 支持展示 Markdown 格式的说明文档
 * - 响应式布局，适配不同屏幕尺寸
 * - 支持主题色跟随系统主题
 * 
 * 二次开发指引：
 * - 如需修改对话框尺寸，调整 DialogContent 的 sm:max-w 和 h 属性
 * - 如需修改内容区域样式，调整 ScrollArea 及其子元素的类名
 * - 如需添加新的信息展示区域，可在 ScrollArea 内添加新的 div 区域
 * - 如需修改 Markdown 展示样式，调整 MDEditor.Markdown 的属性
 */
export function TemplatesInfoDialog({ open, onOpenChange, readme, content, templateName }: TemplatesInfoDialogProps) {
  const { resolvedTheme } = useTheme()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 对话框内容容器 */}
      <DialogContent className='sm:max-w-[80%] h-[80vh] flex flex-col p-0 overflow-hidden'>
        {/* 对话框头部：显示模板名称和描述信息 */}
        <DialogHeader className='shrink-0 p-6 pb-4'>
          <DialogTitle>{templateName} - 模板内容与说明</DialogTitle>
          <DialogDescription>
            查看模板的 Markdown 内容及说明文档。
          </DialogDescription>
        </DialogHeader>
        
        {/* 可滚动的内容区域：包含模板内容和说明文档两部分 */}
        <div className='flex-1 min-h-0 overflow-hidden'>
          <ScrollArea className="h-full w-full" type={'always'}>
            <div className='space-y-6 px-6 pb-6'>

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
                    source={readme}
                    style={{ backgroundColor: 'transparent' }}
                  />
                </div>
              </div>

              {/* 模板内容区域：展示 Markdown 格式的模板内容 */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>模板内容</h4>
                {/* 使用 MDEditor.Markdown 渲染 Markdown 内容 */}
                {/* data-color-mode 属性使 Markdown 渲染适配当前主题 */}
                <div
                  className='rounded-md border p-4 bg-background'
                  data-color-mode={resolvedTheme}
                >
  <pre className='whitespace-pre-wrap break-words'>
    {content}
  </pre>
                </div>
              </div>

            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}