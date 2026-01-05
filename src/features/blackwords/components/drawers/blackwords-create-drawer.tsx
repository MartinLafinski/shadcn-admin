// 引入依赖
import React from "react"
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
// CodeMirror 编辑器
import CodeMirror from '@uiw/react-codemirror'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
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
import { type BlackwordCreateData, type BlackwordItemData, BlackwordCreateSchema } from '../../data/schemas.ts'
// API调用
import { useCreateBlackwordMutation } from '../../api/blackwords.ts'
// Markdown编辑器
import MDEditor from '@uiw/react-md-editor'
// 日/夜主题
import { useTheme } from '@/context/theme-provider.tsx'
// 操作结果提示框
import { toast } from "sonner"
// 图标
import { Maximize2Icon, Minimize2Icon } from "lucide-react"


/**
 * 敏感词创建抽屉组件
 * 用于创建新敏感词或编辑现有敏感词信息
 * 包含表单验证、JSON配置编辑器和Markdown编辑器等功能
 */
type BlackwordCreateDrawerProps = {
  /** 控制抽屉是否打开 */
  open: boolean
  /** 当抽屉打开状态改变时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前正在编辑的敏感词数据，如果为undefined则表示创建新敏感词 */
  currentRow?: BlackwordItemData
}

/**
 * 敏感词创建抽屉组件
 * 提供创建或编辑敏感词的表单界面
 * 
 * 功能特性：
 * - 使用 react-hook-form 进行表单管理
 * - 集成 Zod 验证 schema
 * - 支持 JSON 配置编辑
 * - 支持 Markdown 文档编辑
 * - 主题适配（亮色/暗色模式）
 * - 响应式设计
 */
export function BlackwordCreateDrawer(
  {
    open,
    onOpenChange,
    currentRow,
  }: BlackwordCreateDrawerProps)
{
  // 获取当前主题（用于JSON编辑器和MD编辑器主题适配）
  const { resolvedTheme } = useTheme()

  // 全屏状态管理
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  
  // 初始化创建敏感词的mutation
  const createBlackwordMutation = useCreateBlackwordMutation()
  
  // 初始化表单，设置验证规则和默认值
  const form = useForm<BlackwordCreateData>({
    resolver: zodResolver(BlackwordCreateSchema),
    // 如果有currentRow则使用其值作为默认值，否则使用空值
    defaultValues: currentRow ?? {
      // 敏感词显示名称 - 用于界面展示的可读名称
      blackwords_name: '',
      // 敏感词URL标识符 - 用于路由和API请求的唯一标识符
      blackwords_slug: '',
      // 敏感词集合 - 包含具体敏感词的数组
      blackwords_collection: [],
      // 敏感词说明文档 - 使用Markdown格式的说明文档内容
      blackwords_readme: '',
    },
  })

  /**
   * 表单提交处理函数
   * 调用API创建或更新敏感词数据
   * @param data - 表单提交的数据
   */
  const onSubmit = async (data: BlackwordCreateData) => {
    // 使用 mutation 调用 API 创建敏感词
    await createBlackwordMutation.mutateAsync(
      data
    ).then((res) => {
      toast.success(`敏感词 ${res.blackwords_name} 创建成功`) // 操作成功提示
    }).catch((error) => {
      console.error('敏感词创建失败:', error) // 记录错误日志
      toast.error('敏感词创建失败') // 操作失败提示
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
          <SheetTitle>创建敏感词</SheetTitle>
          <SheetDescription>
            创建新的敏感词
          </SheetDescription>
        </SheetHeader>
        {/* 将表单与react-hook-form实例连接 */}
        <Form {...form}>
          <form
            id='blackword-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* 敏感词名称字段 - 必填，用于显示 */}
            <FormField
              control={form.control}
              name='blackwords_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>敏感词名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='敏感词名称(强调可读性)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 敏感词标识字段 - 必填，用于路由和API */}
            <FormField
              control={form.control}
              name='blackwords_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>敏感词标识</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='敏感词标识(字母、数字、连字符或下划线)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 敏感词集合字段 - 敏感词数组 */}
            <FormField
              control={form.control}
              name='blackwords_collection'
              render={({ field }) => (
                <FormItem className={isFullscreen ? 'fixed inset-0 z-50 m-0 !h-screen !w-screen rounded-none border-0 bg-background' : ''}>
                  <div className='flex items-center justify-between'>
                    <FormLabel>敏感词集合</FormLabel>
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
                  <FormControl>
                    {/*/!* 使用textarea，每行显示一个敏感词 *!/*/}
                    {/*<Textarea*/}
                    {/*  value={field.value.join('\n')}*/}
                    {/*  placeholder='每行输入一个敏感词'*/}
                    {/*  onChange={(e) => {*/}
                    {/*    const lines = e.target.value.split('\n')*/}
                    {/*    // 过滤掉中间的空行，但保留尾部的空行*/}
                    {/*    const filteredLines = lines.filter((item, index) => {*/}
                    {/*      // 保留非空行*/}
                    {/*      if (item.trim() !== '') return true*/}
                    {/*      // 保留尾部的空行（即最后一个元素是空字符串）*/}
                    {/*      if (index === lines.length - 1) return true*/}
                    {/*      // 过滤掉中间的空行*/}
                    {/*      return false*/}
                    {/*    })*/}
                    {/*    field.onChange(filteredLines)*/}
                    {/*  }}*/}
                    {/*/>*/}
                    {/* 使用 CodeMirror 编辑器，每行显示一个敏感词 */}
                    <CodeMirror
                      value={field.value.join('\n')}
                      onChange={(value) => {
                        const lines = value.split('\n')
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
                      theme={resolvedTheme === 'light' ? githubLight : githubDark}
                      placeholder='每行输入一个敏感词'
                      height={isFullscreen ? 'calc(100vh - 60px)' : '200px'}
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
            {/* 敏感词说明字段 - Markdown格式的文档内容 */}
            <FormField
              control={form.control}
              name='blackwords_readme'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>敏感词说明</FormLabel>
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
          <Button form='blackword-create-form' type='submit'>
            创建敏感词
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
