// 引入依赖
import { useState, useEffect } from 'react'
// 导入表单库
import { useForm } from 'react-hook-form'
// 数据验证库
import { zodResolver } from '@hookform/resolvers/zod'
// 用于同步后台数据
import { useQueryClient } from '@tanstack/react-query'
// Markdown编辑器
import MDEditor from '@uiw/react-md-editor'
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
// 文本区域控件
import { Textarea } from '@/components/ui/textarea.tsx'
// 配置友链API调用
import { usePatchLinkMutation, useLinkQuery } from '../../api/links.ts'
// 数据结构
import {
  type LinkConfigData,
  type LinkItemData,
  LinkConfigSchema,
} from '../../data/schemas.ts'

/**
 * 友链配置和说明抽屉组件
 * 用于配置和说明新友链或编辑现有友链信息
 * 包含表单验证、JSON配置编辑器和Markdown编辑器等功能
 */
type LinkConfigDrawerProps = {
  /** 控制抽屉是否打开 */
  open: boolean
  /** 当抽屉打开状态改变时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前正在编辑的友链数据，如果为undefined则表示配置和说明新友链 */
  currentRow?: LinkItemData
}

/**
 * 友链配置和说明抽屉组件
 * 提供配置和说明或编辑友链的表单界面
 *
 * 功能特性：
 * - 使用 react-hook-form 进行表单管理
 * - 集成 Zod 验证 schema
 * - 支持 JSON 配置编辑
 * - 支持 Markdown 文档编辑
 * - 主题适配（亮色/暗色模式）
 * - 响应式设计
 */
export function LinkConfigDrawer({
  open,
  onOpenChange,
  currentRow,
}: LinkConfigDrawerProps) {
  const queryClient = useQueryClient()
  // 添加查询钩子
  const {
    data: latestLink,
    isLoading: isLatestDataLoading,
    refetch,
  } = useLinkQuery(currentRow?.links_id || 0)

  // 添加状态管理
  const [, setShowConflictWarning] = useState(false)

  // 检查数据一致性
  useEffect(() => {
    if (open && currentRow?.links_id) {
      // 重新获取最新数据
      refetch()
    }
  }, [open, currentRow?.links_id])

  // 当最新数据获取完成且与当前行数据不同时，显示警告
  useEffect(() => {
    if (latestLink && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestLink.updated_at !== currentRow.updated_at
      if (hasChanged) {
        setShowConflictWarning(true)
        // 用最新数据更新表单
        form.reset({
          links_collection: latestLink.links_collection,
          links_readme: latestLink.links_readme,
        })
        // 使友链列表查询缓存失效，以更新表格中的数据
        queryClient.invalidateQueries({ queryKey: ['links'] })
      }
    }
  }, [latestLink, currentRow, open, isLatestDataLoading, queryClient])

  // 获取当前主题（用于JSON编辑器和MD编辑器主题适配）
  const { resolvedTheme } = useTheme()

  // 初始化配置和说明友链的mutation
  const configLinkMutation = usePatchLinkMutation()

  // 初始化表单，设置验证规则和默认值
  const form = useForm<LinkConfigData>({
    resolver: zodResolver(LinkConfigSchema),
    // 如果有currentRow则使用其值作为默认值，否则使用空值
    defaultValues: currentRow ?? {
      // 友链集合 - 存储友链URL数组
      links_collection: [],
      // 友链说明文档 - 使用Markdown格式的说明文档内容
      links_readme: '',
    },
  })

  /**
   * 表单提交处理函数
   * 调用API配置和说明友链数据
   * @param data - 表单提交的数据
   */
  const onSubmit = async (data: LinkConfigData) => {
    // 确保有 currentRow 和 links_id
    if (!currentRow?.links_id) {
      console.error('缺少友链ID，无法配置和说明')
      return
    }

    // 使用 mutation 调用 API 配置和说明友链
    await configLinkMutation
      .mutateAsync({
        linkId: currentRow.links_id,
        data,
      })
      .then((res) => {
        toast.success(`友链 ${res.links_name} 说明与配置编辑成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error(
          `友链 ${currentRow.links_name} 说明与配置编辑失败:`,
          error
        ) // 记录错误日志
        toast.error(`友链 ${currentRow.links_name} 说明与配置编辑失败`) // 操作失败提示
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
          <SheetTitle>配置和说明友链</SheetTitle>
          <SheetDescription>
            配置和说明友链 (友链ID:{currentRow?.links_id})
          </SheetDescription>
        </SheetHeader>
        {/* 将表单与react-hook-form实例连接 */}
        <Form {...form}>
          <form
            id='link-config-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* 友链说明字段 - Markdown格式的文档内容 */}
            <FormField
              control={form.control}
              name='links_readme'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>友链说明</FormLabel>
                  <FormControl data-color-mode={resolvedTheme}>
                    {/* Markdown编辑器，适配主题颜色 */}
                    <MDEditor value={field.value} onChange={field.onChange} />
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
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='link-config-form' type='submit'>
            配置友链
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
