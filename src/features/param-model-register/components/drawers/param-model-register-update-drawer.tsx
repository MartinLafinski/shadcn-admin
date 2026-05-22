import React, { useState, useEffect, useLayoutEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import {
  useUpdateParamModelRegisterMutation,
  useParamModelRegisterQuery,
} from '../../api/param-model-register'
import {
  type ParamModelRegisterUpdateData,
  type ParamModelRegisterItemData,
  ParamModelRegisterUpdateSchema,
  SHARD_STRATEGIES,
} from '../../data/schemas'

type ParamModelRegisterUpdateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ParamModelRegisterItemData
}

function ParamModelRegisterUpdateDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: ParamModelRegisterUpdateDrawerProps) {
  const queryClient = useQueryClient()

  const { data: latestRegister, isLoading: isLatestDataLoading } =
    useParamModelRegisterQuery(currentRow?.register_id || 0)

  const [showEditors, setShowEditors] = useState(false)
  useLayoutEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setShowEditors(true))
      return () => cancelAnimationFrame(raf)
    }
    setShowEditors(false)
  }, [open])

  useEffect(() => {
    if (latestRegister && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestRegister.updated_at !== currentRow.updated_at
      if (hasChanged) {
        form.reset({
          register_name: latestRegister.register_name,
          shard_strategy: latestRegister.shard_strategy,
          description: latestRegister.description,
        })
        queryClient.invalidateQueries({ queryKey: ['param-model-register'] })
      }
    }
  }, [latestRegister, currentRow, open, isLatestDataLoading, queryClient])

  const updateMutation = useUpdateParamModelRegisterMutation()

  const form = useForm({
    resolver: zodResolver(ParamModelRegisterUpdateSchema),
    defaultValues: currentRow
      ? {
          register_name: currentRow.register_name,
          shard_strategy: currentRow.shard_strategy,
          description: currentRow.description,
        }
      : {
          register_name: '',
          shard_strategy: null,
          description: '',
        },
  })

  const onSubmit = async (data: ParamModelRegisterUpdateData) => {
    if (!currentRow?.register_id) {
      console.error('缺少参数模型集ID，无法更新')
      toast.error('缺少参数模型集ID，无法更新')
      return
    }

    await updateMutation
      .mutateAsync({
        registerId: currentRow.register_id,
        data,
      })
      .then((res) => {
        toast.success(
          `参数模型集 ${res.register_name || res.register_slug} 更新成功`
        )
      })
      .catch((error) => {
        console.error(
          `参数模型集 ${currentRow.register_name || currentRow.register_slug} 更新失败:`,
          error
        )
        toast.error(
          `参数模型集 ${currentRow.register_name || currentRow.register_slug} 更新失败`
        )
      })

    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>编辑参数模型集</SheetTitle>
          <SheetDescription>
            {currentRow?.register_name || currentRow?.register_slug} (ID:
            {currentRow?.register_id})
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='pmr-update-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <h4 className='text-sm font-bold'>不可变字段</h4>
            <div className='space-y-2 rounded-lg border p-3 text-sm text-muted-foreground'>
              <div>
                爬虫标识:{' '}
                <span className='font-mono text-foreground'>
                  {currentRow?.spider_slug}
                </span>
              </div>
              <div>
                类别标识:{' '}
                <span className='text-foreground'>
                  {currentRow?.category_type}
                </span>
              </div>
              <div>
                类别:{' '}
                <span className='font-mono text-foreground'>
                  {currentRow?.category_slug}
                </span>
              </div>
              <div>
                参数要素包:{' '}
                <span className='font-mono text-foreground'>
                  {currentRow?.param_form_slug}
                </span>
              </div>
            </div>

            <h4 className='text-sm font-bold'>可变字段</h4>
            <FormField
              control={form.control}
              name='register_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>注册名称</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder='注册名称（可选）'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h4 className='text-sm font-bold'>分片配置</h4>
            <FormField
              control={form.control}
              name='shard_strategy'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分片策略</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v || null)}
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='无' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SHARD_STRATEGIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showEditors && (
              <>
                <h4 className='text-sm font-bold'>说明</h4>
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>说明</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ''}
                          placeholder='参数模型集说明'
                          rows={4}
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
          <Button form='pmr-update-form' type='submit'>
            更新参数模型集
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const ParamModelRegisterUpdateDrawer = React.memo(
  ParamModelRegisterUpdateDrawerContent
)
