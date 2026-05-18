// 引入依赖
import * as React from 'react'
// 处理表单
import { useForm } from 'react-hook-form'
// 数据验证
import { zodResolver } from '@hookform/resolvers/zod'
// 代码json插件
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
// 代码编辑器
import CodeMirror from '@uiw/react-codemirror'
// Markdown编辑器
import MDEditor from '@uiw/react-md-editor'
// JSON编辑器
import { JsonEditor, githubDarkTheme, githubLightTheme } from 'json-edit-react'
// 图标
import { Maximize2Icon, Minimize2Icon } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 标签数据
import { materialLabels } from '@/lib/labels'
// 工具函数
import { cn } from '@/lib/utils'
// 日/夜主题
import { useTheme } from '@/context/theme-provider.tsx'
// 显示提交数据
// import { showSubmittedData } from '@/lib/show-submitted-data.tsx'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 表单控件
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx'
// 输入框控件
import { Input } from '@/components/ui/input.tsx'
// 选择控件
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
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
// 行业数据查询
import { IndustryCombobox } from '@/components/smart/combobox/industry-combobox'
// 网站数据查询
import { WebsiteCombobox } from '@/components/smart/combobox/website-combobox'
// API调用
import { useCreateEntrypointMutation } from '../../api/entrypoints.ts'
// 数据结构
import {
  type EntrypointCreateData,
  type EntrypointItemData,
  EntrypointCreateSchema,
} from '../../data/schemas.ts'

/**
 * 入口点创建抽屉组件
 * 用于创建新入口点或编辑现有入口点信息
 * 包含表单验证、JSON配置编辑器和Markdown编辑器等功能
 */
type EntrypointCreateDrawerProps = {
  /** 控制抽屉是否打开 */
  open: boolean
  /** 当抽屉打开状态改变时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前正在编辑的入口点数据，如果为undefined则表示创建新入口点 */
  currentRow?: EntrypointItemData
}

/**
 * 入口点创建抽屉组件
 * 提供创建或编辑入口点的表单界面
 *
 * 功能特性：
 * - 使用 react-hook-form 进行表单管理
 * - 集成 Zod 验证 schema
 * - 支持 JSON 配置编辑
 * - 支持 Markdown 文档编辑
 * - 主题适配（亮色/暗色模式）
 * - 响应式设计
 */
export function EntrypointCreateDrawer({
  open,
  onOpenChange,
  currentRow,
}: EntrypointCreateDrawerProps) {
  // 获取当前主题（用于JSON编辑器和MD编辑器主题适配）
  const { resolvedTheme } = useTheme()
  // 全屏状态管理
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  // 初始化创建入口点的mutation
  const createEntrypointMutation = useCreateEntrypointMutation()

  // 初始化表单，设置验证规则和默认值
  const form = useForm<EntrypointCreateData>({
    resolver: zodResolver(EntrypointCreateSchema),
    // 如果有currentRow则使用其值作为默认值，否则使用空值
    defaultValues: currentRow
      ? {
          // 网站ID - 用于关联入口点到特定网站
          website_id: currentRow.website_id ?? undefined,
          // 行业ID - 用于关联入口点到特定行业
          industry_id: currentRow.industry_id ?? undefined,
          // 入口点头像URL
          entrypoint_avatar: currentRow.entrypoint_avatar || undefined,
          // 入口点显示名称 - 用于界面展示的可读名称
          entrypoint_name: currentRow.entrypoint_name,
          // 入口点URL标识符 - 用于路由和API请求的唯一标识符
          entrypoint_slug: currentRow.entrypoint_slug,
          // 入口点访问URL - 入口点的真实访问地址（可选字段）
          entrypoint_url: currentRow.entrypoint_url || undefined,
          // 入口点在线任务上限
          entrypoint_max_spider_task_count:
            currentRow.entrypoint_max_spider_task_count || 0,
          // 材料类型 - 入口点的材料类型
          material_type: currentRow.material_type || 'unknown',
          // 入口点配置对象 - 存储入口点特定配置信息的JSON对象
          entrypoint_config: currentRow.entrypoint_config,
          // 入口点说明文档 - 使用Markdown格式的说明文档内容
          entrypoint_readme: currentRow.entrypoint_readme,
        }
      : {
          // 网站ID - 用于关联入口点到特定网站
          website_id: undefined,
          // 行业ID - 用于关联入口点到特定行业
          industry_id: undefined,
          // 入口点头像URL
          entrypoint_avatar: undefined,
          // 入口点显示名称 - 用于界面展示的可读名称
          entrypoint_name: '',
          // 入口点URL标识符 - 用于路由和API请求的唯一标识符
          entrypoint_slug: '',
          // 入口点访问URL - 入口点的真实访问地址（可选字段）
          entrypoint_url: undefined,
          // 入口点在线任务上限
          entrypoint_max_spider_task_count: 0,
          // 材料类型 - 入口点的材料类型
          material_type: 'unknown',
          // 入口点配置对象 - 存储入口点特定配置信息的JSON对象
          entrypoint_config: {},
          // 入口点说明文档 - 使用Markdown格式的说明文档内容
          entrypoint_readme: '',
        },
  })

  /**
   * 表单提交处理函数
   * 调用API创建或更新入口点数据
   * @param data - 表单提交的数据
   */
  const onSubmit = async (data: EntrypointCreateData) => {
    // 使用 mutation 调用 API 创建入口点
    await createEntrypointMutation
      .mutateAsync(data)
      .then((res) => {
        toast.success(`入口点 ${res.entrypoint_name} 创建成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error('入口点创建失败:', error) // 记录错误日志
        toast.error('入口点创建失败') // 操作失败提示
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
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建入口点</SheetTitle>
          <SheetDescription>创建新的入口点</SheetDescription>
        </SheetHeader>
        {/* 将表单与react-hook-form实例连接 */}
        <Form {...form}>
          <form
            id='entrypoint-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* 网站选择字段 - 用于关联入口点到特定网站 */}
            <FormField
              control={form.control}
              name='website_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>所属网站</FormLabel>
                  <FormControl>
                    <WebsiteCombobox
                      value={field.value}
                      onChange={(id) => {
                        if (id) {
                          form.setValue('website_id', id, {
                            shouldValidate: true,
                          })
                        }
                      }}
                      placeholder='选择一个网站'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 行业选择字段 - 用于关联入口点到特定行业 */}
            <FormField
              control={form.control}
              name='industry_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>所在行业</FormLabel>
                  <FormControl>
                    <IndustryCombobox
                      value={field.value}
                      onChange={(id) => {
                        if (id) {
                          form.setValue('industry_id', id, {
                            shouldValidate: true,
                          })
                        }
                      }}
                      placeholder='选择一个行业'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 入口点头像字段 - 可选，图片URL */}
            <FormField
              control={form.control}
              name='entrypoint_avatar'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>入口点头像</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='入口点头像URL'
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 材料类型字段 - 可选，选择入口点的材料类型 */}
            <FormField
              control={form.control}
              name='material_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>材料类型</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || 'unknown'}
                  >
                    <FormControl
                      className={cn(
                        'w-full justify-between',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='选择材料类型' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materialLabels.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          <div className='flex items-center space-x-2'>
                            <item.icon className='h-4 w-4' />
                            <span className='font-semibold'>{item.label}</span>
                            <span className='text-muted-foreground'>
                              [ {item.value} ]
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 入口点名称字段 - 必填，用于显示 */}
            <FormField
              control={form.control}
              name='entrypoint_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>入口点名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='入口点名称(强调可读性)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 入口点标识字段 - 必填，用于路由和API */}
            <FormField
              control={form.control}
              name='entrypoint_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>入口点标识</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='入口点标识(字母、数字、连字符或下划线)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 网站内在线爬虫任务数量限制 */}
            <FormField
              control={form.control}
              name='entrypoint_max_spider_task_count'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>入口点最大任务数</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='number'
                      placeholder='0表示无限制'
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 入口点URL字段 - 可选，实际访问地址 */}
            <FormField
              control={form.control}
              name='entrypoint_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    {/* 处理null值与空字符串的显示问题 */}
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder='入口点网址(https://www.example.com/)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 入口点配置字段 - JSON格式的配置信息 */}
            <FormField
              control={form.control}
              name='entrypoint_config'
              render={({ field }) => (
                <FormItem
                  className={
                    isFullscreen
                      ? 'fixed inset-0 z-50 m-0 flex h-screen! w-screen! flex-col overflow-hidden rounded-none border-0 bg-background'
                      : ''
                  }
                >
                  <div className='flex shrink-0 items-center justify-between'>
                    <FormLabel>入口点配置</FormLabel>
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
                  <FormControl className='min-h-0 flex-1 overflow-y-auto'>
                    {/* JSON编辑器，支持主题切换 */}
                    <JsonEditor
                      data={field.value}
                      setData={field.onChange}
                      rootFontSize={13}
                      theme={
                        resolvedTheme === 'light'
                          ? githubLightTheme
                          : githubDarkTheme
                      }
                      minWidth={isFullscreen ? '100%' : '100%'}
                      maxWidth={isFullscreen ? '100%' : '100%'}
                      TextEditor={(props) => {
                        return (
                          <CodeMirror
                            {...props}
                            theme={
                              resolvedTheme === 'light'
                                ? githubLight
                                : githubDark
                            }
                            extensions={[json(), EditorView.lineWrapping]}
                            height={isFullscreen ? '100%' : 'auto'}
                            minHeight='300px'
                          />
                        )
                      }}
                    />
                  </FormControl>
                  <FormMessage className='shrink-0' />
                </FormItem>
              )}
            />
            {/* 入口点说明字段 - Markdown格式的文档内容 */}
            <FormField
              control={form.control}
              name='entrypoint_readme'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>入口点说明</FormLabel>
                  <FormControl data-color-mode={resolvedTheme}>
                    {/* Markdown编辑器，适配主题颜色 */}
                    <MDEditor value={field.value} onChange={field.onChange} />
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
          <Button form='entrypoint-create-form' type='submit'>
            创建入口点
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
