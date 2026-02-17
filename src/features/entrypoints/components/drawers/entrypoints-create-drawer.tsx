// 引入依赖
import * as React from 'react'
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
// Popover 和 Command 控件
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
// 图标
import { CheckIcon, ChevronsUpDownIcon, Maximize2Icon, Minimize2Icon } from 'lucide-react'
// 数据结构
import { type EntrypointCreateData, type EntrypointItemData, EntrypointCreateSchema } from '../../data/schemas.ts'
// API调用
import { useCreateEntrypointMutation } from '../../api/entrypoints.ts'
// 网站数据查询
import { useWebsitesQuery } from '@/features/websites/api/websites.ts'
// JSON编辑器
import { JsonEditor, githubDarkTheme, githubLightTheme } from 'json-edit-react'
// Markdown编辑器
import MDEditor from '@uiw/react-md-editor'
// 日/夜主题
import { useTheme } from '@/context/theme-provider.tsx'
// 操作结果提示框
import {toast} from "sonner"
// 工具函数
import { cn } from '@/lib/utils'
// 代码编辑器
import CodeMirror from '@uiw/react-codemirror'
// 代码json插件
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'

const WEBSITE_SEARCH_SIZE: number = Number(import.meta.env.VITE_WEBSITE_SEARCH_SIZE || 50)

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
export function EntrypointCreateDrawer(
  {
    open,
    onOpenChange,
    currentRow,
  }: EntrypointCreateDrawerProps)
{
  // 获取当前主题（用于JSON编辑器和MD编辑器主题适配）
  const { resolvedTheme } = useTheme()
  // 全屏状态管理
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  // 网站搜索关键词状态
  const [websiteKeyword, setWebsiteKeyword] = React.useState<string>('')
  // 控制网站下拉框的打开状态
  const [websitePopoverOpen, setWebsitePopoverOpen] = React.useState(false)
  
  // 获取网站列表数据（支持搜索）
  const { data: websitesData, isLoading: websitesLoading } = useWebsitesQuery(websiteKeyword, undefined, 1, WEBSITE_SEARCH_SIZE)
  
  // 初始化创建入口点的mutation
  const createEntrypointMutation = useCreateEntrypointMutation()
  
  // 初始化表单，设置验证规则和默认值
  const form = useForm<EntrypointCreateData>({
    resolver: zodResolver(EntrypointCreateSchema),
    // 如果有currentRow则使用其值作为默认值，否则使用空值
    defaultValues: currentRow ? {
      // 网站ID - 用于关联入口点到特定网站
      website_id: currentRow.website_id ?? undefined,
      // 入口点显示名称 - 用于界面展示的可读名称
      entrypoint_name: currentRow.entrypoint_name,
      // 入口点URL标识符 - 用于路由和API请求的唯一标识符
      entrypoint_slug: currentRow.entrypoint_slug,
      // 入口点访问URL - 入口点的真实访问地址（可选字段）
      entrypoint_url: currentRow.entrypoint_url || undefined,
      // 入口点配置对象 - 存储入口点特定配置信息的JSON对象
      entrypoint_config: currentRow.entrypoint_config,
      // 入口点说明文档 - 使用Markdown格式的说明文档内容
      entrypoint_readme: currentRow.entrypoint_readme,
    } : {
      // 网站ID - 用于关联入口点到特定网站
      website_id: undefined,
      // 入口点显示名称 - 用于界面展示的可读名称
      entrypoint_name: '',
      // 入口点URL标识符 - 用于路由和API请求的唯一标识符
      entrypoint_slug: '',
      // 入口点访问URL - 入口点的真实访问地址（可选字段）
      entrypoint_url: undefined,
      // 入口点配置对象 - 存储入口点特定配置信息的JSON对象
      entrypoint_config: {},
      // 入口点说明文档 - 使用Markdown格式的说明文档内容
      entrypoint_readme: '',
    },
  })
  
  // 获取当前选中的网站
  const selectedWebsite = websitesData?.websites?.find(w => w.website_id === form.watch('website_id'))

  /**
   * 表单提交处理函数
   * 调用API创建或更新入口点数据
   * @param data - 表单提交的数据
   */
  const onSubmit = async (data: EntrypointCreateData) => {
    // 使用 mutation 调用 API 创建入口点
    await createEntrypointMutation.mutateAsync(
      data
    ).then((res) => {
      toast.success(`入口点 ${res.entrypoint_name} 创建成功`) // 操作成功提示
    }).catch((error) => {
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
      <SheetContent className='flex flex-col min-w-1/3'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建入口点</SheetTitle>
          <SheetDescription>
            创建新的入口点
          </SheetDescription>
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
                  <Popover open={websitePopoverOpen} onOpenChange={setWebsitePopoverOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? selectedWebsite
                              ? `${selectedWebsite.website_name} [${selectedWebsite.website_slug}]`
                              : '选择一个网站'
                            : '选择一个网站'}
                          <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-full p-0' align='start'>
                      <Command  shouldFilter={false} className='w-full'>
                        <CommandInput
                          className='w-full'
                          placeholder='搜索网站...'
                          value={websiteKeyword}
                          onValueChange={setWebsiteKeyword}
                        />
                        <CommandList className='w-full'>
                          {!websitesLoading && (!websitesData?.websites || websitesData.websites.length === 0) && (
                            <CommandEmpty>未找到网站</CommandEmpty>
                          )}
                          {websitesLoading && (
                            <CommandEmpty>加载中...</CommandEmpty>
                          )}
                          {websitesData?.websites && websitesData.websites.length > 0 && (
                              <CommandGroup key={websitesData?.websites.length.toString()}>
                                {websitesData.websites.map((website) => (
                                  <CommandItem
                                    key={website.website_id.toString()}
                                    value={`${website.website_id}`}
                                    onSelect={() => {
                                      form.setValue('website_id', website.website_id, { shouldValidate: true })
                                      setWebsitePopoverOpen(false)
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === website.website_id
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <span className="font-semibold">{website.website_name}</span>
                                    <span className="ml-2 text-muted-foreground text-xs">
                                      [{website.website_slug}]
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                    <Input {...field} placeholder='入口点标识(字母、数字、连字符或下划线)' />
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
                    <Input {...field} value={field.value ?? ''} placeholder='入口点网址(https://www.example.com/)' />
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
                <FormItem className={isFullscreen ? 'fixed inset-0 z-50 m-0 h-screen! w-screen! rounded-none border-0 bg-background flex flex-col overflow-hidden' : ''}>
                  <div className='flex items-center justify-between shrink-0'>
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
                  <FormControl className="flex-1 min-h-0 overflow-y-auto">
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
                              extensions={[json(), EditorView.lineWrapping]}
                              height={isFullscreen ? '100%' : 'auto'}
                              minHeight='300px'
                            />
                          )
                        }
                      }
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
          <Button form='entrypoint-create-form' type='submit'>
            创建入口点
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}