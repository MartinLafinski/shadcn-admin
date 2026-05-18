import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form.tsx'
import { useSyncJobGroupsMutation } from '../../api/jobgroups.ts'
import {
  type SyncJobGroupsData,
  SyncJobGroupsSchema,
} from '../../data/schemas.ts'

export function JobGroupsSyncDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const syncMutation = useSyncJobGroupsMutation()
  const form = useForm<any>({
    resolver: zodResolver(SyncJobGroupsSchema),
    defaultValues: {
      clear_locked: false,
      clear_paused: false,
      clear_spider_tasks: false,
    },
  })

  const onSubmit = async (data: SyncJobGroupsData) => {
    await syncMutation
      .mutateAsync(data)
      .then(() => {
        toast.success('作业分组同步成功')
      })
      .catch(() => toast.error('作业分组同步失败'))
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>同步作业分组</DialogTitle>
          <DialogDescription>
            配置同步选项并执行作业分组同步操作
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='jobgroup-sync-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 py-4'
          >
            <FormField
              control={form.control}
              name='clear_locked'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>重置锁定信息</FormLabel>
                    <p className='text-sm font-normal text-muted-foreground'>
                      同步时重置作业分组的锁定状态信息
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='clear_paused'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>重置暂停信息</FormLabel>
                    <p className='text-sm font-normal text-muted-foreground'>
                      同步时重置作业分组的暂停状态信息
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='clear_spider_tasks'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>重置爬虫任务关联</FormLabel>
                    <p className='text-sm font-normal text-muted-foreground'>
                      同步时重置作业分组的爬虫任务关联信息
                    </p>
                  </div>
                </FormItem>
              )}
            />
            <div className='rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20'>
              <p className='text-sm text-amber-900 dark:text-amber-200'>
                <strong>注意：</strong>同步操作可能会修改现有数据，请谨慎操作。
              </p>
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => {
              onOpenChange(false)
              form.reset()
            }}
          >
            取消
          </Button>
          <Button
            form='jobgroup-sync-form'
            type='submit'
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? '同步中...' : '执行同步'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
