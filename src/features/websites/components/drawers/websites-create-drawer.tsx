// 引入依赖
import React from 'react'
// 处理表单
import { useForm } from 'react-hook-form'
// 数据验证
import { zodResolver } from '@hookform/resolvers/zod'
// 显示提交数据
import { showSubmittedData } from '@/lib/show-submitted-data.tsx'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 输入框控件
import { Input } from '@/components/ui/input.tsx'
// 图标
import { Maximize2Icon, Minimize2Icon } from 'lucide-react'
// 表单控件
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx'
// 抽屉控件
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet.tsx'
// 数据结构
import { type WebsiteCreateData, type WebsiteItemData, WebsiteCreateSchema } from '../../data/schemas.ts'
// API调用
import { useCreateWebsiteMutation } from '../../api/websites.ts'
// JSON编辑器
import { JsonEditor, githubDarkTheme, githubLightTheme } from 'json-edit-react'
// Markdown编辑器
import MDEditor from '@uiw/react-md-editor'
// 日/夜主题
import { useTheme } from '@/context/theme-provider.tsx'
// 操作结果提示框
import {toast} from "sonner"
// 代码编辑器
import CodeMirror from '@uiw/react-codemirror'
// 代码json插件
import { json } from '@codemirror/lang-json'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'


/**
 * 网站创建抽屉组件
 * 用于创建新网站或编辑现有网站信息
 * 包含表单验证、JSON配置编辑器和Markdown编辑器等功能
 */
type WebsiteCreateDrawerProps = {
  /** 控制抽屉是否打开 */
  open: boolean
  /** 当抽屉打开状态改变时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前正在编辑的网站数据，如果为undefined则表示创建新网站 */
  currentRow?: WebsiteItemData
}

/**
 * 网站创建抽屉组件
 * 提供创建或编辑网站的表单界面
 * 
 * 功能特性：
 * - 使用 react-hook-form 进行表单管理
 * - 集成 Zod 验证 schema
 * - 支持 JSON 配置编辑
 * - 支持 Markdown 文档编辑
 * - 主题适配（亮色/暗色模式）
 * - 响应式设计
 */
export function WebsiteCreateDrawer(
  {
    open,
    onOpenChange,
    currentRow,
  }: WebsiteCreateDrawerProps)
{
  // 获取当前主题（用于JSON编辑器和MD编辑器主题适配）
  const { resolvedTheme } = useTheme()
  
  // 全屏状态管理
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  
  // 初始化创建网站的mutation
  const createWebsiteMutation = useCreateWebsiteMutation()
  
  // 初始化表单，设置验证规则和默认值
  const form = useForm<WebsiteCreateData>({
    resolver: zodResolver(WebsiteCreateSchema),
    // 如果有currentRow则使用其值作为默认值，否则使用空值
    defaultValues: currentRow ?? {
      // 网站显示名称 - 用于界面展示的可读名称
      website_name: '',
      // 网站URL标识符 - 用于路由和API请求的唯一标识符
      website_slug: '',
      // 网站访问URL - 网站的真实访问地址（可选字段）
      website_url: undefined,
      // 网站配置对象 - 存储网站特定配置信息的JSON对象
      website_config: {},
      // 网站说明文档 - 使用Markdown格式的说明文档内容
      website_readme: '',
    },
  })

  /**
   * 表单提交处理函数
   * 调用API创建或更新网站数据
   * @param data - 表单提交的数据
   */
  const onSubmit = async (data: WebsiteCreateData) => {
    // 使用 mutation 调用 API 创建网站
    await createWebsiteMutation.mutateAsync(
      data
    ).then((res) => {
      toast.success(`网站 ${res.website_name} 创建成功`) // 操作成功提示
    }).catch((error) => {
      console.error('网站创建失败:', error) // 记录错误日志
      toast.error('网站创建失败') // 操作失败提示
    })
    // 关闭抽屉
    onOpenChange(false)
    // 重置表单到默认状态
    form.reset()
    // 显示提交的数据（用于调试）
    showSubmittedData(data)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        // 关闭抽屉时重置表单，确保下次打开时表单是干净的
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col min-w-1/3'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建网站</SheetTitle>
          <SheetDescription>
            创建新的网站
          </SheetDescription>
        </SheetHeader>
        {/* 将表单与react-hook-form实例连接 */}
        <Form {...form}>
          <form
            id='website-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* 网站名称字段 - 必填，用于显示 */}
            <FormField
              control={form.control}
              name='website_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='网站名称(强调可读性)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 网站标识字段 - 必填，用于路由和API */}
            <FormField
              control={form.control}
              name='website_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站标识</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='网站标识(字母、数字、连字符或下划线)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 网站URL字段 - 可选，实际访问地址 */}
            <FormField
              control={form.control}
              name='website_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    {/* 处理null值与空字符串的显示问题 */}
                    <Input {...field} value={field.value ?? ''} placeholder='网站网址(https://www.example.com/)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 网站配置字段 - JSON格式的配置信息 */}
            <FormField
              control={form.control}
              name='website_config'
              render={({ field }) => (
                <FormItem className={isFullscreen ? 'fixed inset-0 z-50 m-0 !h-screen !w-screen rounded-none border-0 bg-background flex flex-col overflow-hidden' : ''}>
                  <div className='flex items-center justify-between flex-shrink-0'>
                    <FormLabel>网站配置</FormLabel>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className='h-8 w-8 p-0'
                    >
                      {isFullscreen ? (
                        <Minimize2Icon className='h-4 w-4' />
                      ) : (
                        <Maximize2Icon className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                  <FormControl className="dark:[&_textarea]:!text-white1 flex-1 min-h-0 overflow-y-auto">
                    {/* JSON编辑器，支持主题切换 */}
                    <JsonEditor
                      data={field.value}
                      setData={field.onChange}
                      rootFontSize={13}
                      theme={resolvedTheme === 'light' ? githubLightTheme : githubDarkTheme}
                      minWidth={isFullscreen ? '100%' : '100%'}
                      maxWidth={isFullscreen ? '100%' : '100%'}
                      TextEditor={
                        (props) => {
                         return (
                           <CodeMirror
                             {...props}
                             theme={resolvedTheme === 'light' ? githubLight : githubDark}
                             extensions={[json()]}
                             height={isFullscreen ? '100%' : '300px'}
                           />
                         )
                        }
                      }
                    />
                  </FormControl>
                  <FormMessage className='flex-shrink-0' />
                </FormItem>
              )}
            />
            {/* 网站说明字段 - Markdown格式的文档内容 */}
            <FormField
              control={form.control}
              name='website_readme'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站说明</FormLabel>
                  <FormControl data-color-mode={resolvedTheme}>
                    {/* Markdown编辑器，适配主题颜色 */}
                    <MDEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='website-create-form' type='submit'>
            创建网站
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
