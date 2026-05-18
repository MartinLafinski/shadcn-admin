// 引入依赖
import { useEffect } from 'react'
// 表单处理
import { useForm } from 'react-hook-form'
// 数据验证
import { zodResolver } from '@hookform/resolvers/zod'
// 用于同步后台数据
import { useQueryClient } from '@tanstack/react-query'
// 操作结果提示框
import { toast } from 'sonner'
// 标签数据
import { materialLabels } from '@/lib/labels'
// css相关
import { cn } from '@/lib/utils.ts'
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
// 参数要素包组合框
import { ParamFormCombobox } from '@/components/smart/combobox/param-form-combobox.tsx'
// 网站数据查询
import { WebsiteCombobox } from '@/components/smart/combobox/website-combobox'
// 更新入口点API调用
import {
  useUpdateEntrypointMutation,
  useEntrypointQuery,
} from '../../api/entrypoints.ts'
// 数据结构
import {
  type EntrypointUpdateData,
  type EntrypointItemData,
  EntrypointUpdateSchema,
} from '../../data/schemas.ts'

/**
 * 入口点更新抽屉组件
 * 用于更新新入口点或编辑现有入口点信息
 * 包含表单验证、JSON配置编辑器和Markdown编辑器等功能
 */
type EntrypointUpdateDrawerProps = {
  /** 控制抽屉是否打开 */
  open: boolean
  /** 当抽屉打开状态改变时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前正在编辑的入口点数据，如果为undefined则表示更新新入口点 */
  currentRow?: EntrypointItemData
}

/**
 * 入口点更新抽屉组件
 * 提供更新或编辑入口点的表单界面
 *
 * 功能特性：
 * - 使用 react-hook-form 进行表单管理
 * - 集成 Zod 验证 schema
 * - 支持 JSON 配置编辑
 * - 支持 Markdown 文档编辑
 * - 主题适配（亮色/暗色模式）
 * - 响应式设计
 */
export function EntrypointUpdateDrawer({
  open,
  onOpenChange,
  currentRow,
}: EntrypointUpdateDrawerProps) {
  const queryClient = useQueryClient()
  // 添加查询钩子
  const {
    data: latestEntrypoint,
    isLoading: isLatestDataLoading,
    refetch,
  } = useEntrypointQuery(currentRow?.entrypoint_id || 0)

  // 检查数据一致性
  useEffect(() => {
    if (open && currentRow?.entrypoint_id) {
      // 重新获取最新数据
      refetch()
    }
  }, [open, currentRow?.entrypoint_id])

  // 当最新数据获取完成且与当前行数据不同时，显示警告
  useEffect(() => {
    if (latestEntrypoint && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestEntrypoint.updated_at !== currentRow.updated_at
      if (hasChanged) {
        // 用最新数据更新表单
        form.reset({
          website_id: latestEntrypoint.website_id ?? undefined,
          industry_id: latestEntrypoint.industry_id ?? undefined,
          entrypoint_avatar: latestEntrypoint.entrypoint_avatar || undefined,
          entrypoint_name: latestEntrypoint.entrypoint_name,
          entrypoint_slug: latestEntrypoint.entrypoint_slug,
          entrypoint_url: latestEntrypoint.entrypoint_url || undefined,
          entrypoint_max_spider_task_count:
            latestEntrypoint.entrypoint_max_spider_task_count || 0,
          material_type: latestEntrypoint.material_type || 'unknown',
          entrypoint_self_param_slug:
            latestEntrypoint.entrypoint_self_param_slug || '',
          entrypoint_prejob_param_slug:
            latestEntrypoint.entrypoint_prejob_param_slug || '',
        })
        // 使入口点列表查询缓存失效，以更新表格中的数据
        queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
      }
    }
  }, [latestEntrypoint, currentRow, open, isLatestDataLoading, queryClient])

  // 初始化更新入口点的mutation
  const updateEntrypointMutation = useUpdateEntrypointMutation()

  // 初始化表单，设置验证规则和默认值
  const form = useForm<EntrypointUpdateData>({
    resolver: zodResolver(EntrypointUpdateSchema),
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
          // 入口点在线任务上限
          entrypoint_max_spider_task_count:
            currentRow.entrypoint_max_spider_task_count || 0,
          // 入口点访问URL - 入口点的真实访问地址（可选字段）
          entrypoint_url: currentRow.entrypoint_url || undefined,
          // 材料类型 - 入口点的材料类型
          material_type: currentRow.material_type || 'unknown',
          // 入口点自用参数要素包标识
          entrypoint_self_param_slug:
            currentRow.entrypoint_self_param_slug || '',
          // 入口点预备作业参数要素包标识
          entrypoint_prejob_param_slug:
            currentRow.entrypoint_prejob_param_slug || '',
        }
      : {
          // 网站ID - 用于关联入口点到特定网站
          website_id: undefined,
          // 行业ID - 用于关联入口点到特定行业
          industry_id: undefined,
          // 入口点显示名称 - 用于界面展示的可读名称
          entrypoint_name: '',
          // 入口点URL标识符 - 用于路由和API请求的唯一标识符
          entrypoint_slug: '',
          // 入口点在线任务上限
          entrypoint_max_spider_task_count: 0,
          // 入口点访问URL - 入口点的真实访问地址（可选字段）
          entrypoint_url: undefined,
          // 材料类型 - 入口点的材料类型
          material_type: 'unknown',
          // 入口点自用参数要素包标识
          entrypoint_self_param_slug: '',
          // 入口点预备作业参数要素包标识
          entrypoint_prejob_param_slug: '',
        },
  })

  /**
   * 表单提交处理函数
   * 调用API更新入口点数据
   * @param data - 表单提交的数据
   */
  const onSubmit = async (data: EntrypointUpdateData) => {
    // 确保有 currentRow 和 entrypoint_id
    if (!currentRow?.entrypoint_id) {
      // eslint-disable-next-line no-console
      console.error('缺少入口点ID，无法更新')
      toast.error('缺少入口点ID，无法更新')
      return
    }

    await updateEntrypointMutation
      .mutateAsync({
        entrypointId: currentRow.entrypoint_id,
        data,
      })
      .then((res) => {
        toast.success(`入口点 ${res.entrypoint_name} 更新成功`)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`入口点 ${currentRow.entrypoint_name} 更新失败:`, error)
        toast.error(`入口点 ${currentRow.entrypoint_name} 更新失败`)
      })

    onOpenChange(false)
    form.reset()
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
          <SheetTitle>更新入口点</SheetTitle>
          <SheetDescription>
            更新入口点 (入口点ID:{currentRow?.entrypoint_id})
          </SheetDescription>
        </SheetHeader>
        {/* 将表单与react-hook-form实例连接 */}
        <Form {...form}>
          <form
            id='entrypoint-update-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* 网站选择字段 - 用于关联入口点到特定网站 */}
            <FormField
              control={form.control}
              name='website_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>关联网站</FormLabel>
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

            {/* 入口点自用参数要素包标识 */}
            <FormField
              control={form.control}
              name='entrypoint_self_param_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>入口点自用参数</FormLabel>
                  <FormControl>
                    <ParamFormCombobox
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      valueKey='param_form_slug'
                      paramType='entrypoint:self'
                      placeholder='选择自用参数要素包...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* 入口点预备作业参数要素包标识 */}
            <FormField
              control={form.control}
              name='entrypoint_prejob_param_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>入口点预备作业参数</FormLabel>
                  <FormControl>
                    <ParamFormCombobox
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      valueKey='param_form_slug'
                      paramType='entrypoint:prejob'
                      placeholder='选择预备作业参数要素包...'
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
          <Button form='entrypoint-update-form' type='submit'>
            更新入口点
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
