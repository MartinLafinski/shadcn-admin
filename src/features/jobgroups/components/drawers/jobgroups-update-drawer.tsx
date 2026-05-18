import { useEffect } from 'react'
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
import { useUpdateJobGroupMutation } from '../../api/jobgroups.ts'
import {
  JobGroupUpdateSchema,
  type JobGroupUpdateData,
  type JobGroupItemData,
} from '../../data/schemas.ts'

export function JobGroupUpdateDrawer({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: JobGroupItemData
}) {
  const updateMutation = useUpdateJobGroupMutation()

  const defaults = {
    jobgroup_name: currentRow.jobgroup_name,
    jobgroup_slug: currentRow.jobgroup_slug,
    jobgroup_max_spider_task_count: currentRow.jobgroup_max_spider_task_count,
  }

  const form = useForm<JobGroupUpdateData>({
    resolver: zodResolver(JobGroupUpdateSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    form.reset(defaults)
  }, [currentRow, form])

  const onSubmit = async (data: JobGroupUpdateData) => {
    await updateMutation
      .mutateAsync({ id: currentRow.jobgroup_id, data })
      .then(() => {
        toast.success('作业分组更新成功')
        onOpenChange(false)
      })
      .catch(() => toast.error('作业分组更新失败'))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>编辑作业分组</SheetTitle>
          <SheetDescription>
            修改 {currentRow.jobgroup_name} 的信息
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='jobgroup-update-form'
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
                      <Input {...field} />
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
                      <Input {...field} />
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
            form='jobgroup-update-form'
            type='submit'
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? '更新中...' : '保存'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
