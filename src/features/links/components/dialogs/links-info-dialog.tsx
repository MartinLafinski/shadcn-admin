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
// 日/夜主题上下文
import { useTheme } from '@/context/theme-provider.tsx'

/**
 * 友链信息对话框组件的属性接口
 * 
 * 该接口定义了 LinksInfoDialog 组件所需的全部属性
 * 
 * 属性说明：
 * - open: 控制对话框的打开/关闭状态
 * - onOpenChange: 对话框打开状态变化时的回调函数
 * - readme: 友链的说明文档内容（Markdown 格式）
 * - collection: 友链的集合信息（字符串数组）
 * - linksName: 友链名称，用于在对话框标题中显示
 * 
 * 二次开发指引：
 * - 如需增加新的属性，可在此接口中添加
 * - 如需修改属性类型，直接修改对应属性的类型标注
 * - 所有属性都应有明确的类型定义，便于 TypeScript 类型检查
 */
interface LinksInfoDialogProps {
  /** 对话框的开启状态 */
  open: boolean
  /** 对话框状态变化时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 友链说明文档内容（Markdown 格式） */
  readme: string
  /** 友链集合信息数组 */
  collection: string[]
  /** 友链名称 */
  linksName: string
}

/**
 * 友链信息对话框组件
 * 用于展示友链的 Markdown 说明文档和集合信息
 * 
 * 功能说明：
 * - 通过按钮触发对话框显示
 * - 支持展示 Markdown 格式的说明文档
 * - 以列表形式展示集合信息
 * - 响应式布局，适配不同屏幕尺寸
 * - 支持主题色跟随系统主题
 * 
 * 二次开发指引：
 * - 如需修改对话框尺寸，调整 DialogContent 的 sm:max-w 和 h 属性
 * - 如需修改内容区域样式，调整 ScrollArea 及其子元素的类名
 * - 如需添加新的信息展示区域，可在 ScrollArea 内添加新的 div 区域
 * - 如需修改 Markdown 展示样式，调整 MDEditor.Markdown 的属性
 */
export function LinksInfoDialog({ open, onOpenChange, readme, collection, linksName }: LinksInfoDialogProps) {
  const { resolvedTheme } = useTheme()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 触发按钮：信息图标按钮，用于打开对话框 */}
      <DialogTrigger asChild>
        <Button 
          variant='outline' 
          size='icon' 
          title='查看集合与说明' 
          className='h-8 w-8'
        >
          <Info className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      
      {/* 对话框内容容器 */}
      <DialogContent className='sm:max-w-[80%] h-[80vh] flex flex-col p-0 overflow-hidden'>
        {/* 对话框头部：显示友链名称和描述信息 */}
        <DialogHeader className='shrink-0 p-6 pb-4'>
          <DialogTitle>{linksName} - 集合与说明</DialogTitle>
          <DialogDescription>
            查看友链的 Markdown 说明文档及集合信息。
          </DialogDescription>
        </DialogHeader>
        
        {/* 可滚动的内容区域：包含说明文档和集合信息两部分 */}
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
              
              {/* 集合信息区域：展示字符串数组形式的集合数据 */}
              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>集合信息</h4>
                {/* 以列表形式展示集合数据 */}
                <div className='rounded-md border p-4 bg-muted/50'>
                  {collection && collection.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {collection.map((item, index) => (
                        <li key={index} className="break-all">
                          <a 
                            href={item} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">暂无集合信息</p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}