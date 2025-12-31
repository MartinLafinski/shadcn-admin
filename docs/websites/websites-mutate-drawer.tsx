import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SelectDropdown } from '@/components/select-dropdown'
import { type WebsiteCreateData, type WebsiteItemData, WebsiteCreateSchema } from '../data/schemas'

type TaskMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: WebsiteItemData
}

// const formSchema = z.object({
//   title: z.string().min(1, 'Title is required.'),
//   status: z.string().min(1, 'Please select a status.'),
//   label: z.string().min(1, 'Please select a label.'),
//   priority: z.string().min(1, 'Please choose a priority.'),
// })
// type TaskForm = z.infer<typeof formSchema>

export function WebsitesMutateDrawer(
  {
    open,
    onOpenChange,
    currentRow,
  }: TaskMutateDrawerProps)
{
  const isUpdate = !!currentRow

  const form = useForm<WebsiteCreateData>({
    resolver: zodResolver(WebsiteCreateSchema),
    defaultValues: currentRow ?? {
      // 网站显示名称
      website_name: '',
      // 网站URL标识符（通常用于路由）
      website_slug: '',
      // 网站访问URL（可选字段）
      website_url: undefined,
      // 网站配置对象，存储任意键值对配置信息
      website_config: {},
      // 网站说明文档内容
      website_readme: '',
    },
  })

  const onSubmit = (data: WebsiteCreateData) => {
    // do something with the form data
    onOpenChange(false)
    form.reset()
    showSubmittedData(data)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Task</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the task by providing necessary info.'
              : 'Add a new task by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='tasks-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='website_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>网站名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='网站名称(强调可读性好)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/*<FormField*/}
            {/*  control={form.control}*/}
            {/*  name='status'*/}
            {/*  render={({ field }) => (*/}
            {/*    <FormItem>*/}
            {/*      <FormLabel>Status</FormLabel>*/}
            {/*      <SelectDropdown*/}
            {/*        defaultValue={field.value}*/}
            {/*        onValueChange={field.onChange}*/}
            {/*        placeholder='Select dropdown'*/}
            {/*        items={[*/}
            {/*          { label: 'In Progress', value: 'in progress' },*/}
            {/*          { label: 'Backlog', value: 'backlog' },*/}
            {/*          { label: 'Todo', value: 'todo' },*/}
            {/*          { label: 'Canceled', value: 'canceled' },*/}
            {/*          { label: 'Done', value: 'done' },*/}
            {/*        ]}*/}
            {/*      />*/}
            {/*      <FormMessage />*/}
            {/*    </FormItem>*/}
            {/*  )}*/}
            {/*/>*/}
            {/*<FormField*/}
            {/*  control={form.control}*/}
            {/*  name='label'*/}
            {/*  render={({ field }) => (*/}
            {/*    <FormItem className='relative'>*/}
            {/*      <FormLabel>Label</FormLabel>*/}
            {/*      <FormControl>*/}
            {/*        <RadioGroup*/}
            {/*          onValueChange={field.onChange}*/}
            {/*          defaultValue={field.value}*/}
            {/*          className='flex flex-col space-y-1'*/}
            {/*        >*/}
            {/*          <FormItem className='flex items-center'>*/}
            {/*            <FormControl>*/}
            {/*              <RadioGroupItem value='documentation' />*/}
            {/*            </FormControl>*/}
            {/*            <FormLabel className='font-normal'>*/}
            {/*              Documentation*/}
            {/*            </FormLabel>*/}
            {/*          </FormItem>*/}
            {/*          <FormItem className='flex items-center'>*/}
            {/*            <FormControl>*/}
            {/*              <RadioGroupItem value='feature' />*/}
            {/*            </FormControl>*/}
            {/*            <FormLabel className='font-normal'>Feature</FormLabel>*/}
            {/*          </FormItem>*/}
            {/*          <FormItem className='flex items-center'>*/}
            {/*            <FormControl>*/}
            {/*              <RadioGroupItem value='bug' />*/}
            {/*            </FormControl>*/}
            {/*            <FormLabel className='font-normal'>Bug</FormLabel>*/}
            {/*          </FormItem>*/}
            {/*        </RadioGroup>*/}
            {/*      </FormControl>*/}
            {/*      <FormMessage />*/}
            {/*    </FormItem>*/}
            {/*  )}*/}
            {/*/>*/}
            {/*<FormField*/}
            {/*  control={form.control}*/}
            {/*  name='priority'*/}
            {/*  render={({ field }) => (*/}
            {/*    <FormItem className='relative'>*/}
            {/*      <FormLabel>Priority</FormLabel>*/}
            {/*      <FormControl>*/}
            {/*        <RadioGroup*/}
            {/*          onValueChange={field.onChange}*/}
            {/*          defaultValue={field.value}*/}
            {/*          className='flex flex-col space-y-1'*/}
            {/*        >*/}
            {/*          <FormItem className='flex items-center'>*/}
            {/*            <FormControl>*/}
            {/*              <RadioGroupItem value='high' />*/}
            {/*            </FormControl>*/}
            {/*            <FormLabel className='font-normal'>High</FormLabel>*/}
            {/*          </FormItem>*/}
            {/*          <FormItem className='flex items-center'>*/}
            {/*            <FormControl>*/}
            {/*              <RadioGroupItem value='medium' />*/}
            {/*            </FormControl>*/}
            {/*            <FormLabel className='font-normal'>Medium</FormLabel>*/}
            {/*          </FormItem>*/}
            {/*          <FormItem className='flex items-center'>*/}
            {/*            <FormControl>*/}
            {/*              <RadioGroupItem value='low' />*/}
            {/*            </FormControl>*/}
            {/*            <FormLabel className='font-normal'>Low</FormLabel>*/}
            {/*          </FormItem>*/}
            {/*        </RadioGroup>*/}
            {/*      </FormControl>*/}
            {/*      <FormMessage />*/}
            {/*    </FormItem>*/}
            {/*  )}*/}
            {/*/>*/}
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='tasks-form' type='submit'>
            保存
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
