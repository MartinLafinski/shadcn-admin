import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
} from '@/components/ui/sheet.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { EntrypointCombobox } from '@/components/smart/combobox/entrypoint-combobox'
import { JobGroupCombobox } from '@/components/smart/combobox/jobgroup-combobox'
import { ParamFormCombobox } from '@/components/smart/combobox/param-form-combobox'
import { WebsiteCombobox } from '@/components/smart/combobox/website-combobox'
import { levelLabels } from '@/features/prejobs/data/labels'
import { useCreatePrejobMutation } from '../../api/prejobs.ts'
import {
  PrejobCreateSchema,
  type PrejobCreateData,
} from '../../data/schemas.ts'

export function PrejobCreateDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createMutation = useCreatePrejobMutation()

  const form = useForm<PrejobCreateData & { website_id?: number }>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(PrejobCreateSchema) as any,
    defaultValues: {
      website_id: undefined,
      prejob_name: '',
      prejob_slug: '',
      entrypoint_id: null,
      jobgroup_id: null,
      prejob_self_param_slug: null,
      prejob_level: 'medium',
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
      prejob_config: {},
      prejob_readme: '',
    },
  })

  const onSubmit = async (data: PrejobCreateData & { website_id?: number }) => {
    const { website_id, ...submitData } = data
    await createMutation
      .mutateAsync(submitData)
      .then(() => {
        toast.success('预备作业创建成功')
        onOpenChange(false)
        form.reset()
      })
      .catch(() => toast.error('预备作业创建失败'))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建预备作业</SheetTitle>
          <SheetDescription>填写预备作业的基本信息</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='prejob-create-form'
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
                    <Input placeholder='预备作业名称' {...field} />
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
                    <Input placeholder='prejob-slug' {...field} />
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

            <h4 className='text-sm font-bold'>任务数量限制</h4>
            <div className='grid grid-cols-2 gap-x-4 gap-y-6'>
              <FormField
                control={form.control}
                name='max_tasks_in_website'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>网站内该作业上限任务数</FormLabel>
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
                    <FormLabel>入口点内该作业上限任务数</FormLabel>
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
                    <FormLabel>分组内该作业上限任务数</FormLabel>
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
            <Button variant='outline'>取消</Button>
          </SheetClose>
          <Button
            form='prejob-create-form'
            type='submit'
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? '创建中...' : '创建'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
