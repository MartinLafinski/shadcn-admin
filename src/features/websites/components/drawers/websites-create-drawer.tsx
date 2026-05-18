// 引入依赖
import React, { useLayoutEffect, useState } from 'react'
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
// 日/夜主题
import { useTheme } from '@/context/theme-provider.tsx'
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
// 参数要素包组合框
import { ParamFormCombobox } from '@/components/smart/combobox/param-form-combobox.tsx'
// API调用
import { useCreateWebsiteMutation } from '../../api/websites.ts'
// 数据结构
import {
  type WebsiteCreateData,
  type WebsiteItemData,
  WebsiteCreateSchema,
} from '../../data/schemas.ts'

type WebsiteCreateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: WebsiteItemData
}

export const WebsiteCreateDrawer = React.memo(function WebsiteCreateDrawer({
  open,
  onOpenChange,
  currentRow,
}: WebsiteCreateDrawerProps) {
  const { resolvedTheme } = useTheme()

  // 全屏状态管理
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // 延迟挂载重型编辑器，让抽屉框架先渲染
  const [showEditors, setShowEditors] = useState(false)
  useLayoutEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setShowEditors(true))
      return () => cancelAnimationFrame(raf)
    }
    setShowEditors(false)
  }, [open])

  // 初始化创建网站的mutation
  const createWebsiteMutation = useCreateWebsiteMutation()

  // 初始化表单，设置验证规则和默认值
  const form = useForm<WebsiteCreateData>({
    resolver: zodResolver(WebsiteCreateSchema),
    defaultValues: currentRow ?? {
      website_name: '',
      website_slug: '',
      website_avatar: undefined,
      website_url: undefined,
      website_max_spider_task_count: 0,
      website_config: {},
      website_readme: '',
      website_self_param_slug: '',
      website_entrypoint_param_slug: '',
      website_prejob_param_slug: '',
    },
  })

  const onSubmit = async (data: WebsiteCreateData) => {
    await createWebsiteMutation
      .mutateAsync(data)
      .then((res) => {
        toast.success(`网站 ${res.website_name} 创建成功`)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('网站创建失败:', error)
        toast.error('网站创建失败')
      })
    onOpenChange(false)
    form.reset()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建网站</SheetTitle>
          <SheetDescription>创建新的网站</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='website-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <h4 className='text-sm font-bold'>基础设置</h4>

            {/* 网站名称字段 */}
            <FormField
              control={form.control}
              name='website_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    网站名称<span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='网站名称(强调可读性)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 网站标识字段 */}
            <FormField
              control={form.control}
              name='website_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    网站标识<span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='网站标识(字母、数字、连字符或下划线)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 网站头像字段 */}
            <FormField
              control={form.control}
              name='website_avatar'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站头像</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder='https://example.com/avatar.png'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 网站内在线爬虫任务数量限制 */}
            <FormField
              control={form.control}
              name='website_max_spider_task_count'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站内最大任务数</FormLabel>
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
            {/* 网站URL字段 */}
            <FormField
              control={form.control}
              name='website_url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder='网站网址(https://www.example.com/)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h4 className='text-sm font-bold'>参数要素包</h4>

            <FormField
              control={form.control}
              name='website_self_param_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站自用参数</FormLabel>
                  <FormControl>
                    <ParamFormCombobox
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      valueKey='param_form_slug'
                      paramType='website:self'
                      placeholder='选择自用参数要素包...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='website_entrypoint_param_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站入口点参数</FormLabel>
                  <FormControl>
                    <ParamFormCombobox
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      valueKey='param_form_slug'
                      paramType='website:entrypoint'
                      placeholder='选择入口点参数要素包...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='website_prejob_param_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站预备作业参数</FormLabel>
                  <FormControl>
                    <ParamFormCombobox
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      valueKey='param_form_slug'
                      paramType='website:prejob'
                      placeholder='选择预备作业参数要素包...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 网站配置字段 - JSON格式的配置信息 */}
            {showEditors && (
              <>
                <FormField
                  control={form.control}
                  name='website_config'
                  render={({ field }) => (
                    <FormItem
                      className={
                        isFullscreen
                          ? 'fixed inset-0 z-50 m-0 flex !h-screen !w-screen flex-col overflow-hidden rounded-none border-0 bg-background'
                          : ''
                      }
                    >
                      <div className='flex flex-shrink-0 items-center justify-between'>
                        <FormLabel className='text-sm font-bold'>
                          网站配置
                        </FormLabel>
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
                      <FormControl className='dark:[&_textarea]:!text-white1 min-h-0 flex-1 overflow-y-auto'>
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
                      <FormLabel className='text-sm font-bold'>
                        网站说明
                      </FormLabel>
                      <FormControl data-color-mode={resolvedTheme}>
                        <MDEditor
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
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
})
