// 引入依赖
import React, { useState, useEffect } from 'react'
// 导入表单库
import { useForm } from 'react-hook-form'
// 用于同步后台数据
import { useQueryClient } from '@tanstack/react-query'
// 数据验证库
import { zodResolver } from '@hookform/resolvers/zod'
// 显示提交数据
import { showSubmittedData } from '@/lib/show-submitted-data.tsx'
// 图标
import { Maximize2Icon, Minimize2Icon } from 'lucide-react'
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
// 数据结构
import { type WebsiteConfigData, type WebsiteItemData, WebsiteConfigSchema } from '../../data/schemas.ts'
// 配置网站API调用
import { usePatchWebsiteMutation, useWebsiteQuery } from '../../api/websites.ts'
// JSON编辑器
import { JsonEditor, githubDarkTheme, githubLightTheme } from 'json-edit-react'
// Markdown编辑器
import MDEditor from '@uiw/react-md-editor'
// 日/夜主题
import { useTheme } from '@/context/theme-provider.tsx'
// 操作结果提示框
import { toast } from "sonner"
// 代码编辑器
import CodeMirror from '@uiw/react-codemirror'
// 代码json插件
import { json } from '@codemirror/lang-json'
import { EditorView } from "@codemirror/view"
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'

/**
 * 网站配置和说明抽屉组件
 * 用于配置和说明新网站或编辑现有网站信息
 * 包含表单验证、JSON配置编辑器和Markdown编辑器等功能
 */
type WebsiteConfigDrawerProps = {
  /** 控制抽屉是否打开 */
  open: boolean
  /** 当抽屉打开状态改变时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前正在编辑的网站数据，如果为undefined则表示配置和说明新网站 */
  currentRow?: WebsiteItemData
}

/**
 * 网站配置和说明抽屉组件
 * 提供配置和说明或编辑网站的表单界面
 *
 * 功能特性：
 * - 使用 react-hook-form 进行表单管理
 * - 集成 Zod 验证 schema
 * - 支持 JSON 配置编辑
 * - 支持 Markdown 文档编辑
 * - 主题适配（亮色/暗色模式）
 * - 响应式设计
 */
export function WebsiteConfigDrawer(
  {
    open,
    onOpenChange,
    currentRow,
  }: WebsiteConfigDrawerProps)
{
  const queryClient = useQueryClient()
  // 添加查询钩子
  const { data: latestWebsite, isLoading: isLatestDataLoading, refetch } = useWebsiteQuery(currentRow?.website_id || 0)

  // 添加状态管理
  const [, setShowConflictWarning] = useState(false)

  // 检查数据一致性
  useEffect(() => {
    if (open && currentRow?.website_id) {
      // 重新获取最新数据
      refetch()
    }
  }, [open, currentRow?.website_id])

  // 当最新数据获取完成且与当前行数据不同时，显示警告
  useEffect(() => {
    if (latestWebsite && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestWebsite.updated_at !== currentRow.updated_at
      if (hasChanged) {
        setShowConflictWarning(true)
        // 用最新数据更新表单
        form.reset({
          website_config: latestWebsite.website_config,
          website_readme: latestWebsite.website_readme,
        })
        // 使网站列表查询缓存失效，以更新表格中的数据
        queryClient.invalidateQueries({ queryKey: ['websites'] })
      }
    }
  }, [latestWebsite, currentRow, open, isLatestDataLoading, queryClient])

  // 获取当前主题（用于JSON编辑器和MD编辑器主题适配）
  const { resolvedTheme } = useTheme()

  // 全屏状态管理
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // 初始化配置和说明网站的mutation
  const configWebsiteMutation = usePatchWebsiteMutation()

  // 初始化表单，设置验证规则和默认值
  const form = useForm<WebsiteConfigData>({
    resolver: zodResolver(WebsiteConfigSchema),
    // 如果有currentRow则使用其值作为默认值，否则使用空值
    defaultValues: currentRow ?? {
      // 网站配置对象 - 存储网站特定配置信息的JSON对象
      website_config: {},
      // 网站说明文档 - 使用Markdown格式的说明文档内容
      website_readme: '',
    },
  })

  /**
   * 表单提交处理函数
   * 调用API配置和说明网站数据
   * @param data - 表单提交的数据
   */
  const onSubmit = async (data: WebsiteConfigData) => {
    // 确保有 currentRow 和 website_id
    if (!currentRow?.website_id) {
        console.error('缺少网站ID，无法配置和说明')
        return
    }

    // 使用 mutation 调用 API 配置和说明网站
    await configWebsiteMutation.mutateAsync({
        websiteId: currentRow.website_id,
        data
    }).then((res) => {
      toast.success(`网站 ${res.website_name} 说明与配置编辑成功`) // 操作成功提示
    }).catch((error) => {
      console.error(`网站 ${currentRow.website_name} 说明与配置编辑失败:`, error) // 记录错误日志
      toast.error(`网站 ${currentRow.website_name} 说明与配置编辑失败`) // 操作失败提示
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
          <SheetTitle>配置和说明网站</SheetTitle>
          <SheetDescription>
            配置和说明网站 (网站ID:{currentRow?.website_id})
          </SheetDescription>
        </SheetHeader>
        {/* 将表单与react-hook-form实例连接 */}
        <Form {...form}>
          <form
            id='website-config-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
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
            {/* 网站配置字段 - JSON格式的配置信息 */}
            {/*<FormField*/}
            {/*  control={form.control}*/}
            {/*  name='website_config'*/}
            {/*  render={({ field }) => (*/}
            {/*    <FormItem>*/}
            {/*      <FormLabel>网站配置</FormLabel>*/}
            {/*      <FormControl>*/}
            {/*        /!* JSON编辑器，支持主题切换 *!/*/}
            {/*        <JsonEditor*/}
            {/*          data={field.value}*/}
            {/*          setData={field.onChange}*/}
            {/*          rootFontSize={13}*/}
            {/*          theme={resolvedTheme === 'light' ? githubLightTheme : githubDarkTheme}*/}
            {/*          minWidth="100%" />*/}
            {/*      </FormControl>*/}
            {/*      <FormMessage />*/}
            {/*    </FormItem>*/}
            {/*  )}*/}
            {/*/>*/}

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
                              extensions={[json(), EditorView.lineWrapping]}
                              height={isFullscreen ? '100%' : 'auto'}
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



          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='website-config-form' type='submit'>
            配置网站
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
