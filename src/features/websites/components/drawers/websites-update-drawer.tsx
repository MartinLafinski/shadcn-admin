// 引入依赖
import React from 'react'
import { useEffect } from 'react'
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
// 参数要素包组合框
import { ParamFormCombobox } from '@/components/smart/combobox/param-form-combobox.tsx'
// 更新网站API调用
import {
  useUpdateWebsiteMutation,
  useWebsiteQuery,
} from '../../api/websites.ts'
// 数据结构
import {
  type WebsiteUpdateData,
  type WebsiteItemData,
  WebsiteUpdateSchema,
} from '../../data/schemas.ts'

type WebsiteUpdateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: WebsiteItemData
}

export const WebsiteUpdateDrawer = React.memo(function WebsiteUpdateDrawer({
  open,
  onOpenChange,
  currentRow,
}: WebsiteUpdateDrawerProps) {
  const queryClient = useQueryClient()
  const {
    data: latestWebsite,
    isLoading: isLatestDataLoading,
    refetch,
  } = useWebsiteQuery(currentRow?.website_id || 0)

  // 检查数据一致性
  useEffect(() => {
    if (open && currentRow?.website_id) {
      refetch()
    }
  }, [open, currentRow?.website_id])

  // 当最新数据获取完成且与当前行数据不同时，用最新数据更新表单
  useEffect(() => {
    if (latestWebsite && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestWebsite.updated_at !== currentRow.updated_at
      if (hasChanged) {
        form.reset({
          website_name: latestWebsite.website_name,
          website_slug: latestWebsite.website_slug,
          website_avatar: latestWebsite.website_avatar || undefined,
          website_url: latestWebsite.website_url || undefined,
          website_max_spider_task_count:
            latestWebsite.website_max_spider_task_count || 0,
          website_self_param_slug: latestWebsite.website_self_param_slug || '',
          website_entrypoint_param_slug:
            latestWebsite.website_entrypoint_param_slug || '',
          website_prejob_param_slug:
            latestWebsite.website_prejob_param_slug || '',
        })
        queryClient.invalidateQueries({ queryKey: ['websites'] })
      }
    }
  }, [latestWebsite, currentRow, open, isLatestDataLoading, queryClient])

  // 初始化更新网站的mutation
  const updateWebsiteMutation = useUpdateWebsiteMutation()

  // 初始化表单，设置验证规则和默认值
  const form = useForm<WebsiteUpdateData>({
    resolver: zodResolver(WebsiteUpdateSchema),
    defaultValues: currentRow ?? {
      website_name: '',
      website_slug: '',
      website_avatar: undefined,
      website_url: undefined,
      website_self_param_slug: '',
      website_entrypoint_param_slug: '',
      website_prejob_param_slug: '',
    },
  })

  const onSubmit = async (data: WebsiteUpdateData) => {
    if (!currentRow?.website_id) {
      // eslint-disable-next-line no-console
      console.error('缺少网站ID，无法更新')
      toast.error('缺少网站ID，无法更新')
      return
    }

    await updateWebsiteMutation
      .mutateAsync({
        websiteId: currentRow.website_id,
        data,
      })
      .then((res) => {
        toast.success(`网站 ${res.website_name} 更新成功`)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`网站 ${currentRow.website_name} 更新失败:`, error)
        toast.error(`网站 ${currentRow.website_name} 更新失败`)
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
          <SheetTitle>更新网站</SheetTitle>
          <SheetDescription>
            {currentRow?.website_name} (网站ID:{currentRow?.website_id})
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='website-update-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <h4 className='text-sm font-bold'>基础设置</h4>

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
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='website-update-form' type='submit'>
            更新网站
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
})
