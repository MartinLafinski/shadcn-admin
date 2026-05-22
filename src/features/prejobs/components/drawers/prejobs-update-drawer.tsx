import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button.tsx'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { EntrypointCombobox } from '@/components/smart/combobox/entrypoint-combobox'
import { JobGroupCombobox } from '@/components/smart/combobox/jobgroup-combobox'
import { ParamFormCombobox } from '@/components/smart/combobox/param-form-combobox'
import { WebsiteCombobox } from '@/components/smart/combobox/website-combobox'
import { levelLabels } from '@/features/prejobs/data/labels.tsx'
import { useUpdatePrejobMutation, usePrejobQuery } from '../../api/prejobs.ts'
import {
  type PrejobUpdateData,
  type PrejobItemData,
  PrejobUpdateSchema,
} from '../../data/schemas.ts'

type PrejobUpdateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: PrejobItemData
}

export function PrejobUpdateDrawer({
  open,
  onOpenChange,
  currentRow,
}: PrejobUpdateDrawerProps) {
  const queryClient = useQueryClient()
  const {
    data: latestPrejob,
    isLoading: isLatestDataLoading,
    refetch,
  } = usePrejobQuery(currentRow?.prejob_id || 0)
  const [, setShowConflictWarning] = useState(false)

  useEffect(() => {
    if (open && currentRow?.prejob_id) {
      refetch()
    }
  }, [open, currentRow?.prejob_id])

  useEffect(() => {
    if (latestPrejob && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestPrejob.updated_at !== currentRow.updated_at
      if (hasChanged) {
        setShowConflictWarning(true)
        form.reset({
          prejob_name: latestPrejob.prejob_name,
          prejob_slug: latestPrejob.prejob_slug,
          entrypoint_id: latestPrejob.entrypoint_id,
          jobgroup_id: latestPrejob.jobgroup?.jobgroup_id ?? null,
          website_id: latestPrejob.entrypoint?.website_id ?? undefined,
          prejob_level: latestPrejob.prejob_level,
          prejob_self_param_slug: latestPrejob.prejob_self_param_slug ?? null,
          max_tasks_in_website: latestPrejob.max_tasks_in_website,
          max_tasks_in_entrypoint: latestPrejob.max_tasks_in_entrypoint,
          max_tasks_in_jobgroup: latestPrejob.max_tasks_in_jobgroup ?? 0,
          prejob_max_spider_task_count:
            latestPrejob.prejob_max_spider_task_count,
          lock_prejob_on_working: latestPrejob.lock_prejob_on_working,
          lock_entrypoint_on_working: latestPrejob.lock_entrypoint_on_working,
          lock_website_on_working: latestPrejob.lock_website_on_working,
          lock_jobgroup_on_working:
            latestPrejob.lock_jobgroup_on_working ?? false,
          last_trigger_at: latestPrejob.last_trigger_at ?? null,
          next_trigger_at: latestPrejob.next_trigger_at ?? null,
          interval: latestPrejob.interval,
          on_success: latestPrejob.on_success,
          on_failure: latestPrejob.on_failure,
        })
        queryClient.invalidateQueries({ queryKey: ['prejobs'] })
      }
    }
  }, [latestPrejob, currentRow, open, isLatestDataLoading, queryClient])

  const updatePrejobMutation = useUpdatePrejobMutation()

  const form = useForm<PrejobUpdateData & { website_id?: number }>({
    resolver: zodResolver(PrejobUpdateSchema),
    defaultValues: currentRow
      ? {
          ...currentRow,
          website_id: currentRow?.entrypoint?.website_id ?? undefined,
        }
      : ({
          website_id: undefined,
          entrypoint_id: null,
          jobgroup_id: null,
          prejob_name: '',
          prejob_slug: '',
          prejob_level: 'medium',
          prejob_self_param_slug: null,
          max_tasks_in_website: 0,
          max_tasks_in_entrypoint: 0,
          max_tasks_in_jobgroup: 0,
          prejob_max_spider_task_count: 128,
          lock_prejob_on_working: false,
          lock_entrypoint_on_working: false,
          lock_website_on_working: false,
          lock_jobgroup_on_working: false,
          last_trigger_at: null,
          next_trigger_at: null,
          interval: 60,
          on_success: 'continue',
          on_failure: 'pause_prejob',
        } as any),
  })

  const onSubmit = async (data: PrejobUpdateData & { website_id?: number }) => {
    if (!currentRow?.prejob_id) {
      console.error('缺少预备作业ID，无法更新')
      toast.error('缺少预备作业ID，无法更新')
      return
    }

    // 剔除 website_id 后提交
    const { website_id, ...submitData } = data
    await updatePrejobMutation
      .mutateAsync({
        prejobId: currentRow.prejob_id,
        data: submitData as PrejobUpdateData,
      })
      .then((res) => {
        toast.success(`预备作业 ${res.prejob_name} 更新成功`)
      })
      .catch((error) => {
        console.error(`预备作业 ${currentRow.prejob_name} 更新失败:`, error)
        toast.error(`预备作业 ${currentRow.prejob_name} 更新失败`)
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
          <SheetTitle>更新预备作业</SheetTitle>
          <SheetDescription>
            更新预备作业 (预备作业ID:{currentRow?.prejob_id})
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='prejob-update-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='website_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>所属网站</FormLabel>
                  <FormControl>
                    <WebsiteCombobox
                      value={field.value}
                      onChange={(id) => {
                        if (id) {
                          form.setValue('website_id', id, {
                            shouldValidate: true,
                          })
                          form.setValue('entrypoint_id', null)
                        }
                      }}
                      placeholder='选择一个网站'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='entrypoint_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>关联入口点</FormLabel>
                  <FormControl>
                    <EntrypointCombobox
                      mode='id'
                      value={field.value}
                      onChange={(id) => {
                        form.setValue(
                          'entrypoint_id',
                          (id ?? null) as number | null,
                          {
                            shouldValidate: true,
                          }
                        )
                      }}
                      placeholder='选择入口点'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='jobgroup_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>作业分组</FormLabel>
                  <FormControl>
                    <JobGroupCombobox
                      value={field.value}
                      onChange={(id) => {
                        form.setValue('jobgroup_id', id ?? null, {
                          shouldValidate: true,
                        })
                      }}
                      placeholder='选择作业分组'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='prejob_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    预备作业名称 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='预备作业名称(强调可读性)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='prejob_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    预备作业标识 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='预备作业标识(字母、数字、连字符或下划线)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='prejob_self_param_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>自用参数要素包</FormLabel>
                  <FormControl>
                    <ParamFormCombobox
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      valueKey='param_form_slug'
                      paramType='prejob:self'
                      placeholder='选择自用参数要素包...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 任务数量限制 */}
            <h4 className='text-sm font-bold'>任务数量限制</h4>
            <div className='grid grid-cols-2 gap-x-4 gap-y-6'>
              <FormField
                control={form.control}
                name='max_tasks_in_website'
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
                name='max_tasks_in_entrypoint'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入口点内最大任务数</FormLabel>
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
                name='max_tasks_in_jobgroup'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分组内最大任务数</FormLabel>
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
                name='prejob_max_spider_task_count'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>最大在线任务数</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='128'
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 触发设置 */}
            <h4 className='text-sm font-bold'>触发设置</h4>
            <div className='grid grid-cols-2 gap-x-4 gap-y-6'>
              <FormField
                control={form.control}
                name='prejob_level'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>优先级</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='选择优先级' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levelLabels.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='interval'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>触发间隔（秒）</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='触发间隔时间'
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='on_success'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>成功后续处理</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='选择成功处理方式' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='continue'>继续（周期性）</SelectItem>
                        <SelectItem value='break'>停止（一次性）</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='on_failure'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>失败后续处理</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='选择失败处理方式' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='ignore'>忽略</SelectItem>
                        <SelectItem value='continue'>继续</SelectItem>
                        <SelectItem value='pause_website'>暂停网站</SelectItem>
                        <SelectItem value='pause_entrypoint'>
                          暂停入口点
                        </SelectItem>
                        <SelectItem value='pause_prejob'>
                          暂停预备作业
                        </SelectItem>
                        <SelectItem value='pause_jobgroup'>
                          暂停作业分组
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='grid grid-cols-2 gap-x-4 gap-y-6'>
              <FormField
                control={form.control}
                name='last_trigger_at'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>上次触发时间</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder='自动记录'
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='next_trigger_at'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>下次触发时间</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder='自动计算'
                        disabled
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 独占设置 */}
            <h4 className='text-sm font-bold'>独占与启用</h4>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='lock_jobgroup_on_working'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>独占同作业分组</FormLabel>
                      <div className='text-[0.8rem] text-muted-foreground'>
                        运行时阻止同作业分组下分配其他任务
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        className='data-[state=checked]:bg-green-400 dark:data-[state=checked]:bg-green-700'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lock_prejob_on_working'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>独占同预备作业</FormLabel>
                      <div className='text-[0.8rem] text-muted-foreground'>
                        运行时阻止同预备作业下分配其他任务
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        className='data-[state=checked]:bg-green-400 dark:data-[state=checked]:bg-green-700'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='lock_entrypoint_on_working'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>独占同入口点</FormLabel>
                      <div className='text-[0.8rem] text-muted-foreground'>
                        运行时阻止同入口点下分配其他任务
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        className='data-[state=checked]:bg-green-400 dark:data-[state=checked]:bg-green-700'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='lock_website_on_working'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>独占同网站</FormLabel>
                      <div className='text-[0.8rem] text-muted-foreground'>
                        运行时阻止同网站下分配其他任务
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        className='data-[state=checked]:bg-green-400 dark:data-[state=checked]:bg-green-700'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='prejob-update-form' type='submit'>
            更新预备作业
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
