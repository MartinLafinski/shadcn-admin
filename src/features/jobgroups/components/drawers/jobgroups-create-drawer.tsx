import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
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
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet.tsx'
import { useCreateJobGroupMutation } from '../../api/jobgroups.ts'
import {
  JobGroupCreateSchema,
  type JobGroupCreateData,
} from '../../data/schemas.ts'

export function JobGroupCreateDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createMutation = useCreateJobGroupMutation()

  const form = useForm<JobGroupCreateData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(JobGroupCreateSchema) as any,
    defaultValues: {
      jobgroup_name: '',
      jobgroup_slug: '',
      jobgroup_max_spider_task_count: 128,
      jobgroup_config: {},
      jobgroup_readme: '',
    },
  })

  const onSubmit = async (data: JobGroupCreateData) => {
    await createMutation
      .mutateAsync(data)
      .then(() => {
        toast.success('作业分组创建成功')
        onOpenChange(false)
        form.reset()
      })
      .catch(() => toast.error('作业分组创建失败'))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建作业分组</SheetTitle>
          <SheetDescription>填写作业分组的基本信息</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='jobgroup-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <div className='space-y-4'>
              <h4 className='text-sm font-bold'>基础设置</h4>
              <FormField
                control={form.control}
                name='jobgroup_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      分组名称 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='作业分组名称' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='jobgroup_slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      标识 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='jobgroup-slug' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='jobgroup_max_spider_task_count'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>最大在线任务数</FormLabel>
                    <FormControl>
                      <Input
                        type='number'
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
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
            form='jobgroup-create-form'
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
