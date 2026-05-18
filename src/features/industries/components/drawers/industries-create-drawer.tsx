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
// 参数要素下拉控件
import { ParamFormCombobox } from '@/components/smart/combobox/param-form-combobox.tsx'
// API调用
import { useCreateIndustryMutation } from '../../api/industries.ts'
// 数据结构
import {
  type IndustryCreateData,
  type IndustryItemData,
  IndustryCreateSchema,
} from '../../data/schemas.ts'

/**
 * 行业创建抽屉组件
 * 用于创建新行业或编辑现有行业信息
 * 包含表单验证、JSON配置编辑器和Markdown编辑器等功能
 */
type IndustryCreateDrawerProps = {
  /** 控制抽屉是否打开 */
  open: boolean
  /** 当抽屉打开状态改变时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前正在编辑的行业数据，如果为undefined则表示创建新行业 */
  currentRow?: IndustryItemData
}

/**
 * 行业创建抽屉组件
 * 提供创建或编辑行业的表单界面
 *
 * 功能特性：
 * - 使用 react-hook-form 进行表单管理
 * - 集成 Zod 验证 schema
 * - 支持 JSON 配置编辑
 * - 支持 Markdown 文档编辑
 * - 主题适配（亮色/暗色模式）
 * - 响应式设计
 */
export const IndustryCreateDrawer = React.memo(function IndustryCreateDrawer({
  open,
  onOpenChange,
  currentRow,
}: IndustryCreateDrawerProps) {
  // 获取当前主题（用于JSON编辑器和MD编辑器主题适配）
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

  // 初始化创建行业的mutation
  const createIndustryMutation = useCreateIndustryMutation()

  // 初始化表单，设置验证规则和默认值
  const form = useForm<any>({
    resolver: zodResolver(IndustryCreateSchema),
    // 如果有currentRow则使用其值作为默认值，否则使用空值
    defaultValues: currentRow ?? {
      // 行业显示名称 - 用于界面展示的可读名称
      industry_name: '',
      // 行业URL标识符 - 用于路由和API请求的唯一标识符
      industry_slug: '',
      // 行业配置对象 - 存储行业特定配置信息的JSON对象
      industry_config: {},
      // 行业说明文档 - 使用Markdown格式的说明文档内容
      industry_readme: '',
      // 行业自用参数要素包标识
      industry_self_param_slug: '',
      // 行业入口点参数要素包标识
      industry_entrypoint_param_slug: '',
      // 行业预备作业参数要素包标识
      industry_prejob_param_slug: '',
    },
  })

  /**
   * 表单提交处理函数
   * 调用API创建或更新行业数据
   * @param data - 表单提交的数据
   */
  const onSubmit = async (data: IndustryCreateData) => {
    // 使用 mutation 调用 API 创建行业
    await createIndustryMutation
      .mutateAsync(data)
      .then((res) => {
        toast.success(`行业 ${res.industry_name} 创建成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error('行业创建失败:', error) // 记录错误日志
        toast.error('行业创建失败') // 操作失败提示
      })
    // 关闭抽屉
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
      }}
    >
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建行业</SheetTitle>
          <SheetDescription>创建新的行业</SheetDescription>
        </SheetHeader>
        {/* 将表单与react-hook-form实例连接 */}
        <Form {...form}>
          <form
            id='industry-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <h4 className='text-sm font-bold'>基础设置</h4>
            {/* 行业名称字段 - 必填，用于显示 */}
            <FormField
              control={form.control}
              name='industry_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    行业名称 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='行业名称(强调可读性)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 行业标识字段 - 必填，用于路由和API */}
            <FormField
              control={form.control}
              name='industry_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    行业标识 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='行业标识(字母、数字、连字符或下划线)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h4 className='text-sm font-bold'>参数要素包</h4>
            {/* 行业自用参数要素包 */}
            <FormField
              control={form.control}
              name='industry_self_param_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>指定行业自用</FormLabel>
                  <FormControl>
                    <ParamFormCombobox
                      value={field.value}
                      onChange={field.onChange}
                      valueKey='param_form_slug'
                      paramType='industry:self'
                      placeholder='选择自用参数要素包...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 行业入口点参数要素包 */}
            <FormField
              control={form.control}
              name='industry_entrypoint_param_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>指定入口点使用</FormLabel>
                  <FormControl>
                    <ParamFormCombobox
                      value={field.value}
                      onChange={field.onChange}
                      valueKey='param_form_slug'
                      paramType='industry:entrypoint'
                      placeholder='选择入口点参数要素包...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 行业预备作业参数要素包 */}
            <FormField
              control={form.control}
              name='industry_prejob_param_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>指定预备作业使用</FormLabel>
                  <FormControl>
                    <ParamFormCombobox
                      value={field.value}
                      onChange={field.onChange}
                      valueKey='param_form_slug'
                      paramType='industry:prejob'
                      placeholder='选择预备作业参数要素包...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showEditors && (
              <>
                {/* 行业配置字段 - JSON格式的配置信息 */}
                <FormField
                  control={form.control}
                  name='industry_config'
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
                          行业配置 (JSON)
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
                      <FormMessage className='flex-shrink-0' />
                    </FormItem>
                  )}
                />
                {/* 行业说明字段 - Markdown格式的文档内容 */}
                <FormField
                  control={form.control}
                  name='industry_readme'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='pb-2 text-sm font-bold'>
                        行业说明 (Markdown)
                      </FormLabel>
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
              </>
            )}
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='industry-create-form' type='submit'>
            创建行业
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
})
