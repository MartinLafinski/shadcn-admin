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
import { EntrypointCombobox } from '@/components/smart/combobox/entrypoint-combobox'
import { useCreatePrejobMutation } from '../../api/prejobs.ts'
import {
  PrejobCreateSchema,
  type PrejobCreateData,
} from '../../data/schemas.ts'

const LEVEL_OPTIONS = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
]

export function PrejobCreateDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createMutation = useCreatePrejobMutation()

  const form = useForm<PrejobCreateData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(PrejobCreateSchema) as any,
    defaultValues: {
      prejob_name: '',
      prejob_slug: '',
      entrypoint_id: null,
      prejob_level: 'medium',
      max_tasks_in_website: 0,
      max_tasks_in_entrypoint: 0,
      max_tasks_in_prejob: 0,
      min_tasks_in_prejob: 0,
      prejob_max_spider_task_count: 128,
      lock_prejob_on_working: false,
      lock_entrypoint_on_working: false,
      lock_website_on_working: false,
      last_trigger_at: null,
      next_trigger_at: null,
      interval: 0,
      on_success: 'continue',
      on_failure: 'retry',
      prejob_config: {},
      prejob_readme: '',
    },
  })

  const onSubmit = async (data: PrejobCreateData) => {
    await createMutation
      .mutateAsync(data)
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
            <div className='space-y-4'>
              <h4 className='text-sm font-bold'>基础设置</h4>
              <FormField
                control={form.control}
                name='prejob_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      名称 <span className='text-destructive'>*</span>
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
                      标识 <span className='text-destructive'>*</span>
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
                name='entrypoint_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入口点</FormLabel>
                    <FormControl>
                      <EntrypointCombobox
                        value={field.value?.toString()}
                        onChange={(v) => field.onChange(v ? Number(v) : null)}
                        variant='default'
                        placeholder='选择入口点（可选）'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='prejob_level'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>优先级</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LEVEL_OPTIONS.map((l) => (
                          <SelectItem key={l.value} value={l.value}>
                            {l.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
