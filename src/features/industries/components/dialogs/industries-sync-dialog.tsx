// 引入依赖
// 表单处理
import { useForm } from 'react-hook-form'
// 数据验证
import { zodResolver } from '@hookform/resolvers/zod'
// 操作结果提示框
import { toast } from 'sonner'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 复选框控件
import { Checkbox } from '@/components/ui/checkbox.tsx'
// 对话框控件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
// 表单控件
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form.tsx'
// 同步行业API调用
import { useSyncIndustriesMutation } from '../../api/industries.ts'
// 行业数据结构
import {
  type IndustrySyncData,
  IndustrySyncSchema,
} from '../../data/schemas.ts'

/**
 * 行业同步对话框组件的属性接口
 */
interface IndustriesSyncDialogProps {
  /** 对话框的开启状态 */
  open: boolean
  /** 对话框状态变化时的回调函数 */
  onOpenChange: (open: boolean) => void
}

/**
 * 行业同步对话框组件
 * 用于配置同步选项并执行行业同步操作
 *
 * 功能说明：
 * - 通过按钮触发对话框显示
 * - 支持设置清空入口点关联的选项
 * - 使用复选框控制同步选项
 * - 提供表单验证和提交处理
 */
export function IndustriesSyncDialog({
  open,
  onOpenChange,
}: IndustriesSyncDialogProps) {
  // 初始化同步行业的mutation
  const syncIndustriesMutation = useSyncIndustriesMutation()

  // 初始化表单，设置验证规则和默认值
  const form = useForm<IndustrySyncData>({
    resolver: zodResolver(IndustrySyncSchema),
    defaultValues: {
      clear_entrypoints: false,
      clear_prejobs: false,
      clear_spider_tasks: false,
      only_clear: false,
    },
  })

  /**
   * 表单提交处理函数
   * 调用API同步行业数据
   */
  const onSubmit = async (data: IndustrySyncData) => {
    await syncIndustriesMutation
      .mutateAsync(data)
      .then(() => {
        toast.success('行业同步成功')
      })
      .catch((error) => {
        console.error('行业同步失败:', error)
        toast.error('行业同步失败')
      })
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>同步行业</DialogTitle>
          <DialogDescription>配置同步选项并执行行业同步操作</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='industry-sync-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6 py-4'
          >
            {/* 清空入口点关联选项 */}
            <FormField
              control={form.control}
              name='clear_entrypoints'
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
                      清空入口点关联缓存
                      <span className='text-sm font-normal text-muted-foreground'>
                        同步时清空缓存中的行业入口点关联信息
                      </span>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* 清空预备作业关联选项 */}
            <FormField
              control={form.control}
              name='clear_prejobs'
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
                      清空预备作业关联缓存
                      <span className='text-sm font-normal text-muted-foreground'>
                        同步时清空缓存中的行业预备作业关联信息
                      </span>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* 清空爬虫任务关联选项 */}
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
                    <FormLabel className='flex flex-col items-start gap-1'>
                      清空爬虫任务关联缓存
                      <span className='text-sm font-normal text-muted-foreground'>
                        同步时清空缓存中的行业爬虫任务关联信息
                      </span>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* 仅清理缓存，不回写数据选项 */}
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
                      仅清理缓存，不回写行业数据
                      <span className='text-sm font-normal text-muted-foreground'>
                        同步时仅清理缓存中的行业数据，不回写行业数据，相当于清空缓存
                      </span>
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* 警告信息 */}
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
            form='industry-sync-form'
            type='submit'
            disabled={syncIndustriesMutation.isPending}
          >
            {syncIndustriesMutation.isPending ? '同步中...' : '执行同步'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
