import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'

export function PanelLabel({
  label,
  error,
}: {
  label: string
  error?: string | null
}) {
  return (
    <div className='flex items-center justify-between border-b px-3 py-1.5'>
      <span className='text-xs font-medium text-muted-foreground'>{label}</span>
      {error && (
        <span className='ml-2 truncate text-xs text-destructive'>{error}</span>
      )}
    </div>
  )
}

const formMetaSchema = z.object({
  param_form_name: z
    .string()
    .min(1, '表单名称不能为空')
    .max(64, '表单名称不能超过 64 个字符'),
  param_form_slug: z
    .string()
    .min(1, '表单标识不能为空')
    .max(64, '表单标识不能超过 64 个字符')
    .regex(/^[a-zA-Z0-9_-]+$/, '表单标识只能包含字母、数字、连字符和下划线'),
  param_form_memo: z
    .string()
    .max(256, '备注说明不能超过 256 个字符')
    .optional()
    .or(z.literal('')),
})

type FormMetaData = z.infer<typeof formMetaSchema>

export function FormMetaPanel() {
  const form = useForm<FormMetaData>({
    resolver: zodResolver(formMetaSchema),
    defaultValues: {
      param_form_name: '',
      param_form_slug: '',
      param_form_memo: '',
    },
  })

  const onSubmit = (data: FormMetaData) => {
    toast.success(`表单元数据已保存: ${data.param_form_name}`)
  }

  return (
    <div className='flex h-full flex-col'>
      <PanelLabel label='表单元数据' />
      <ScrollArea className='flex-1'>
        <div className='p-4'>
          <Form {...form}>
            <form
              id='form-meta-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='flex flex-col gap-4'
            >
              <FormField
                control={form.control}
                name='param_form_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>表单名称</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='请输入表单名称' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='param_form_slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>表单标识</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='字母、数字、连字符或下划线'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='param_form_memo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>备注说明</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder='请输入备注说明...'
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full'>
                保存
              </Button>
            </form>
          </Form>
        </div>
      </ScrollArea>
    </div>
  )
}
