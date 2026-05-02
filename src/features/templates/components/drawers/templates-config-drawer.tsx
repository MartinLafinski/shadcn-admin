// 引入依赖
import React, { useState, useEffect } from 'react'
// 导入表单库
import { useForm } from 'react-hook-form'
// 数据验证库
import { zodResolver } from '@hookform/resolvers/zod'
// 用于同步后台数据
import { useQueryClient } from '@tanstack/react-query'
import { html } from '@codemirror/lang-html'
import { EditorView } from '@codemirror/view'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
// CodeMirror 编辑器
import CodeMirror from '@uiw/react-codemirror'
// Markdown编辑器
import MDEditor from '@uiw/react-md-editor'
// 图标
import { Maximize2Icon, Minimize2Icon } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
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
// 配置模板API调用
import {
  usePatchTemplateMutation,
  useTemplateQuery,
} from '../../api/templates.ts'
// 数据结构
import {
  type TemplateConfigData,
  type TemplateItemData,
  TemplateConfigSchema,
} from '../../data/schemas.ts'

/**
 * 模板配置和说明抽屉组件
 * 用于配置和说明新模板或编辑现有模板信息
 * 包含表单验证、JSON配置编辑器和Markdown编辑器等功能
 */
type TemplateConfigDrawerProps = {
  /** 控制抽屉是否打开 */
  open: boolean
  /** 当抽屉打开状态改变时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前正在编辑的模板数据，如果为undefined则表示配置和说明新模板 */
  currentRow?: TemplateItemData
}

/**
 * 模板配置和说明抽屉组件
 * 提供配置和说明或编辑模板的表单界面
 *
 * 功能特性：
 * - 使用 react-hook-form 进行表单管理
 * - 集成 Zod 验证 schema
 * - 支持 JSON 配置编辑
 * - 支持 Markdown 文档编辑
 * - 主题适配（亮色/暗色模式）
 * - 响应式设计
 */
export function TemplateConfigDrawer({
  open,
  onOpenChange,
  currentRow,
}: TemplateConfigDrawerProps) {
  const queryClient = useQueryClient()
  // 添加查询钩子
  const {
    data: latestTemplate,
    isLoading: isLatestDataLoading,
    refetch,
  } = useTemplateQuery(currentRow?.template_id || 0)

  // 添加状态管理
  const [, setShowConflictWarning] = useState(false)

  // 检查数据一致性
  useEffect(() => {
    if (open && currentRow?.template_id) {
      // 重新获取最新数据
      refetch()
    }
  }, [open, currentRow?.template_id])

  // 当最新数据获取完成且与当前行数据不同时，显示警告
  useEffect(() => {
    if (latestTemplate && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestTemplate.updated_at !== currentRow.updated_at
      if (hasChanged) {
        setShowConflictWarning(true)
        // 用最新数据更新表单
        form.reset({
          template_content: latestTemplate.template_content ?? '',
          template_readme: latestTemplate.template_readme,
        })
        // 使模板列表查询缓存失效，以更新表格中的数据
        queryClient.invalidateQueries({ queryKey: ['templates'] })
      }
    }
  }, [latestTemplate, currentRow, open, isLatestDataLoading, queryClient])

  // 获取当前主题（用于JSON编辑器和MD编辑器主题适配）
  const { resolvedTheme } = useTheme()

  // 全屏状态管理
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // 初始化配置和说明模板的mutation
  const configTemplateMutation = usePatchTemplateMutation()

  // 初始化表单，设置验证规则和默认值
  const form = useForm<TemplateConfigData>({
    resolver: zodResolver(TemplateConfigSchema),
    // 如果有currentRow则使用其值作为默认值，否则使用空值
    defaultValues: currentRow
      ? {
          // 模板内容 - 模板的主要内容
          template_content: currentRow.template_content || '',
          // 模板说明文档 - 使用Markdown格式的说明文档内容
          template_readme: currentRow.template_readme || '',
        }
      : {
          // 模板内容 - 模板的主要内容
          template_content: '',
          // 模板说明文档 - 使用Markdown格式的说明文档内容
          template_readme: '',
        },
  })

  /**
   * 表单提交处理函数
   * 调用API配置和说明模板数据
   * @param data - 表单提交的数据
   */
  const onSubmit = async (data: TemplateConfigData) => {
    // 确保有 currentRow 和 template_id
    if (!currentRow?.template_id) {
      console.error('缺少模板ID，无法配置和说明')
      return
    }

    // 使用 mutation 调用 API 配置和说明模板
    await configTemplateMutation
      .mutateAsync({
        templateId: currentRow.template_id,
        data,
      })
      .then((res) => {
        toast.success(`模板 ${res.template_name} 说明与配置编辑成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error(
          `模板 ${currentRow.template_name} 说明与配置编辑失败:`,
          error
        ) // 记录错误日志
        toast.error(`模板 ${currentRow.template_name} 说明与配置编辑失败`) // 操作失败提示
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
          <SheetTitle>配置和说明模板</SheetTitle>
          <SheetDescription>
            配置和说明模板 (模板ID:{currentRow?.template_id})
          </SheetDescription>
        </SheetHeader>
        {/* 将表单与react-hook-form实例连接 */}
        <Form {...form}>
          <form
            id='template-config-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* 模板内容字段 - Markdown格式的文档内容 */}
            <FormField
              control={form.control}
              name='template_content'
              render={({ field }) => (
                <FormItem
                  className={
                    isFullscreen
                      ? 'fixed inset-0 z-50 m-0 !h-screen !w-screen rounded-none border-0 bg-background'
                      : ''
                  }
                >
                  <div className='flex items-center justify-between'>
                    <FormLabel>模板内容</FormLabel>
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
                  <FormControl data-color-mode={resolvedTheme}>
                    <CodeMirror
                      extensions={[html(), EditorView.lineWrapping]}
                      value={field.value}
                      onChange={field.onChange}
                      theme={
                        resolvedTheme === 'light' ? githubLight : githubDark
                      }
                      placeholder='请输入模板内容...'
                      height={isFullscreen ? 'calc(100vh - 60px)' : 'auto'}
                      minHeight='300px'
                      basicSetup={{
                        lineNumbers: true,
                        highlightActiveLineGutter: true,
                        highlightSpecialChars: true,
                        foldGutter: true,
                        drawSelection: true,
                        dropCursor: true,
                        allowMultipleSelections: true,
                        indentOnInput: true,
                        syntaxHighlighting: true,
                        bracketMatching: true,
                        closeBrackets: true,
                        autocompletion: true,
                        rectangularSelection: true,
                        crosshairCursor: true,
                        highlightActiveLine: true,
                        highlightSelectionMatches: true,
                        closeBracketsKeymap: true,
                        searchKeymap: true,
                        foldKeymap: true,
                        completionKeymap: true,
                        lintKeymap: true,
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 模板说明字段 - Markdown格式的文档内容 */}
            <FormField
              control={form.control}
              name='template_readme'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模板说明</FormLabel>
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
          <Button form='template-config-form' type='submit'>
            配置模板
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
