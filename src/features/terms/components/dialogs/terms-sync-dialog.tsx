import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { useSyncTermsMutation } from '../../api/terms'
import { type SyncTermsData, SyncTermsSchema } from '../../data/schemas'

interface TermsSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TermsSyncDialog({ open, onOpenChange }: TermsSyncDialogProps) {
  const syncMutation = useSyncTermsMutation()

  const form = useForm<SyncTermsData>({
    resolver: zodResolver(SyncTermsSchema),
    defaultValues: {
      only_clear: false,
    },
  })

  const onSubmit = async (data: SyncTermsData) => {
    await syncMutation
      .mutateAsync(data)
      .then(() => {
        toast.success('术语库同步成功')
      })
      .catch((error) => {
        console.error('术语库同步失败:', error)
        toast.error('术语库同步失败')
      })
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>同步术语库</DialogTitle>
          <DialogDescription>
            配置同步选项并执行术语库同步操作
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='terms-sync-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 py-4'
          >
            <FormField
              control={form.control}
              name='only_clear'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel className='flex flex-col items-start gap-1'>
                      仅清理缓存，不重写数据
                      <span className='text-sm font-normal text-muted-foreground'>
                        同步时仅清理缓存中的术语库数据，不重写数据，相当于清空缓存
                      </span>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className='rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20'>
              <p className='text-sm text-amber-900 dark:text-amber-200'>
                <strong>注意：</strong>
                同步操作仅影响缓存中数据，不会影响持久化数据。
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
            form='terms-sync-form'
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
