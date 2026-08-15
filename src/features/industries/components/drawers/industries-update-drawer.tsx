// 引入依赖
import React, { useState, useEffect } from 'react'
// 表单处理
import { useForm } from 'react-hook-form'
// 数据验证
import { zodResolver } from '@hookform/resolvers/zod'
// 用于同步后台数据
import { useQueryClient } from '@tanstack/react-query'
// 操作结果提示框
import { toast } from 'sonner'
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
// 更新行业API调用
import {
  useUpdateIndustryMutation,
  useIndustryQuery,
} from '../../api/industries.ts'
// 数据结构
import {
  type IndustryUpdateData,
  type IndustryItemData,
  IndustryUpdateSchema,
} from '../../data/schemas.ts'

/**
 * 行业更新抽屉组件
 * 用于更新现有行业的基本信息（名称、标识、参数要素包关联）
 */
type IndustryUpdateDrawerProps = {
  /** 控制抽屉是否打开 */
  open: boolean
  /** 当抽屉打开状态改变时的回调函数 */
  onOpenChange: (open: boolean) => void
  /** 当前正在编辑的行业数据，如果为undefined则表示更新新行业 */
  currentRow?: IndustryItemData
}

/**
 * 行业更新抽屉组件
 * 提供更新行业基本信息的表单界面
 *
 * 功能特性：
 * - 使用 react-hook-form 进行表单管理
 * - 集成 Zod 验证 schema
 * - 支持参数要素包关联配置
 * - 响应式设计
 */
export const IndustryUpdateDrawer = React.memo(function IndustryUpdateDrawer({
  open,
  onOpenChange,
  currentRow,
}: IndustryUpdateDrawerProps) {
  const queryClient = useQueryClient()
  // 添加查询钩子
  const { data: latestIndustry, isLoading: isLatestDataLoading } =
    useIndustryQuery(currentRow?.industry_id || 0)

  // 添加状态管理
  const [, setShowConflictWarning] = useState(false)

  // 当最新数据获取完成且与当前行数据不同时，显示警告
  useEffect(() => {
    if (latestIndustry && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestIndustry.updated_at !== currentRow.updated_at
      if (hasChanged) {
        setShowConflictWarning(true)
        // 用最新数据更新表单
        form.reset({
          industry_name: latestIndustry.industry_name,
          industry_slug: latestIndustry.industry_slug,
          industry_self_param_slug:
            latestIndustry.industry_self_param_slug ?? '',
          industry_entrypoint_param_slug:
            latestIndustry.industry_entrypoint_param_slug ?? '',
          industry_prejob_param_slug:
            latestIndustry.industry_prejob_param_slug ?? '',
        })
        // 使行业列表查询缓存失效，以更新表格中的数据
        queryClient.invalidateQueries({ queryKey: ['industries'] })
      }
    }
  }, [latestIndustry, currentRow, open, isLatestDataLoading, queryClient])

  // 初始化更新行业的mutation
  const updateIndustryMutation = useUpdateIndustryMutation()

  // 初始化表单，设置验证规则和默认值
  const form = useForm<any>({
    resolver: zodResolver(IndustryUpdateSchema),
    // 如果有currentRow则使用其值作为默认值，否则使用空值
    defaultValues: currentRow
      ? {
          // 行业显示名称 - 用于界面展示的可读名称
          industry_name: currentRow.industry_name,
          // 行业URL标识符 - 用于路由和API请求的唯一标识符
          industry_slug: currentRow.industry_slug,
          // 行业自用参数要素包标识（null视为空字符串）
          industry_self_param_slug: currentRow.industry_self_param_slug ?? '',
          // 行业入口点参数要素包标识（null视为空字符串）
          industry_entrypoint_param_slug:
            currentRow.industry_entrypoint_param_slug ?? '',
          // 行业预备作业参数要素包标识（null视为空字符串）
          industry_prejob_param_slug:
            currentRow.industry_prejob_param_slug ?? '',
        }
      : {
          // 行业显示名称 - 用于界面展示的可读名称
          industry_name: '',
          // 行业URL标识符 - 用于路由和API请求的唯一标识符
          industry_slug: '',
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
   * 调用API更新行业数据
   * @param data - 表单提交的数据
   */
  const onSubmit = async (data: IndustryUpdateData) => {
    // 确保有 currentRow 和 industry_id
    if (!currentRow?.industry_id) {
      console.error('缺少行业ID，无法更新')
      toast.error('缺少行业ID，无法更新')
      return
    }

    // 使用 mutation 调用 API 更新行业
    await updateIndustryMutation
      .mutateAsync({
        industryId: currentRow.industry_id,
        data,
      })
      .then((res) => {
        toast.success(`行业 ${res.industry_name} 更新成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error(`行业 ${currentRow.industry_name} 更新失败:`, error) // 记录错误日志
        toast.error(`行业 ${currentRow.industry_name} 更新失败`) // 操作失败提示
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
          <SheetTitle>更新行业</SheetTitle>
          <SheetDescription>
            {currentRow?.industry_name} (行业ID:{currentRow?.industry_id})
          </SheetDescription>
        </SheetHeader>
        {/* 将表单与react-hook-form实例连接 */}
        <Form {...form}>
          <form
            id='industry-update-form'
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
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='industry-update-form' type='submit'>
            更新行业
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
})
