// 处理表单
import { useForm } from 'react-hook-form'
// 数据验证
import { zodResolver } from '@hookform/resolvers/zod'
// 显示提交数据
// import { showSubmittedData } from '@/lib/show-submitted-data.tsx'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 输入框控件
import { Input } from '@/components/ui/input.tsx'
import { Textarea } from '@/components/ui/textarea'
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
import { type LinkCreateData, type LinkItemData, LinkCreateSchema } from '../../data/schemas.ts'
// API调用
import { useCreateLinkMutation } from '../../api/links.ts'
// Markdown编辑器
import MDEditor from '@uiw/react-md-editor'
// 日/夜主题
import { useTheme } from '@/context/theme-provider.tsx'
// 操作结果提示框
import {toast} from "sonner"


/**
 * 友链创建抽屉组件
 * 用于创建新友链或编辑现有友链信息
 * 包含表单验证、友链集合编辑器和Markdown编辑器等功能
 */
type LinkCreateDrawerProps = {
  /** 控制抽屉是否打开 */
  open: boolean
  /** 当抽屉打开状态改变时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前正在编辑的友链数据，如果为undefined则表示创建新友链 */
  currentRow?: LinkItemData
}

/**
 * 友链创建抽屉组件
 * 提供创建或编辑友链的表单界面
 * 
 * 功能特性：
 * - 使用 react-hook-form 进行表单管理
 * - 集成 Zod 验证 schema
 * - 支持 友链集合编辑
 * - 支持 Markdown 文档编辑
 * - 主题适配（亮色/暗色模式）
 * - 响应式设计
 */
export function LinkCreateDrawer(
  {
    open,
    onOpenChange,
    currentRow,
  }: LinkCreateDrawerProps)
{
  // 获取当前主题（用于MD编辑器主题适配）
  const { resolvedTheme } = useTheme()
  
  // 初始化创建友链的mutation
  const createLinkMutation = useCreateLinkMutation()
  
  // 初始化表单，设置验证规则和默认值
  const form = useForm<LinkCreateData>({
    resolver: zodResolver(LinkCreateSchema),
    // 如果有currentRow则使用其值作为默认值，否则使用空值
    defaultValues: currentRow ?? {
      // 友链集合名称 - 用于界面展示的可读名称
      links_name: '',
      // 友链集合标识符 - 用于路由和API请求的唯一标识符
      links_slug: '',
      // 友链集合 - 包含友链URL的字符串数组
      links_collection: [],
      // 友链说明文档 - 使用Markdown格式的说明文档内容
      links_readme: '',
    },
  })

  /**
   * 表单提交处理函数
   * 调用API创建或更新友链数据
   * @param data - 表单提交的数据
   */
  const onSubmit = async (data: LinkCreateData) => {
    // 使用 mutation 调用 API 创建友链
    await createLinkMutation.mutateAsync(
      data
    ).then((res) => {
      toast.success(`友链 ${res.links_name} 创建成功`) // 操作成功提示
    }).catch((error) => {
      console.error('友链创建失败:', error) // 记录错误日志
      toast.error('友链创建失败') // 操作失败提示
    })
    // 关闭抽屉
    onOpenChange(false)
    // 重置表单到默认状态
    form.reset()
    // 显示提交的数据（用于调试）
    // showSubmittedData(data)
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
          <SheetTitle>创建友链</SheetTitle>
          <SheetDescription>
            创建新的友链
          </SheetDescription>
        </SheetHeader>
        {/* 将表单与react-hook-form实例连接 */}
        <Form {...form}>
          <form
            id='link-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* 友链名称字段 - 必填，用于显示 */}
            <FormField
              control={form.control}
              name='links_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>友链名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='友链名称(强调可读性)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 友链标识字段 - 必填，用于路由和API */}
            <FormField
              control={form.control}
              name='links_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>友链标识</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='友链标识(字母、数字、连字符或下划线)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 友链集合字段 - 字符串数组，以换行分隔 */}
            <FormField
              control={form.control}
              name='links_collection'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>友链集合</FormLabel>
                  <FormControl>
                    {/* 文本区域，每个链接占一行 */}
                    {/*<textarea*/}
                    {/*  className="w-full h-40 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"*/}
                    {/*  placeholder="请输入友链URL，每行一个"*/}
                    {/*  value={field.value ? field.value.join('\n') : ''}*/}
                    {/*  onChange={(e) => {*/}
                    {/*    const newValue = e.target.value.split('\n').filter(line => line.trim() !== '');*/}
                    {/*    field.onChange(newValue);*/}
                    {/*  }}*/}
                    {/*/>*/}
                    <Textarea
                      value={field.value?.join('\n')}
                      placeholder='每行输入一个网址'
                      onChange={(e) => {
                        const lines = e.target.value.split('\n')
                        // 过滤掉中间的空行，但保留尾部的空行
                        const filteredLines = lines.filter((item, index) => {
                          // 保留非空行
                          if (item.trim() !== '') return true
                          // 保留尾部的空行（即最后一个元素是空字符串）
                          if (index === lines.length - 1) return true
                          // 过滤掉中间的空行
                          return false
                        })
                        field.onChange(filteredLines)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 友链说明字段 - Markdown格式的文档内容 */}
            <FormField
              control={form.control}
              name='links_readme'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>友链说明</FormLabel>
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
          <Button form='link-create-form' type='submit'>
            创建友链
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
