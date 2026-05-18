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
import { useCreateSpiderPackageMutation } from '../../api/spider-packages.ts'
import {
  SpiderPackageCreateSchema,
  type SpiderPackageCreateData,
} from '../../data/schemas.ts'

export function SpiderPackageCreateDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const createMutation = useCreateSpiderPackageMutation()

  const form = useForm<SpiderPackageCreateData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(SpiderPackageCreateSchema) as any,
    defaultValues: {
      spider_package_name: '',
      spider_package_slug: '',
      spider_package_version: 'latest',
      spider_package_url: '',
      spider_package_config: {},
      spider_package_readme: '',
    },
  })

  const onSubmit = async (data: SpiderPackageCreateData) => {
    await createMutation
      .mutateAsync(data)
      .then(() => {
        toast.success('爬虫包创建成功')
        onOpenChange(false)
        form.reset()
      })
      .catch(() => toast.error('爬虫包创建失败'))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建爬虫包</SheetTitle>
          <SheetDescription>填写爬虫包的基本信息</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='spider-package-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <div className='space-y-4'>
              <h4 className='text-sm font-bold'>基础设置</h4>
              <FormField
                control={form.control}
                name='spider_package_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      包名称 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='爬虫包名称' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='spider_package_slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      标识 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='spider-package-slug' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='spider_package_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      下载地址 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='https://...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='spider_package_version'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>版本号</FormLabel>
                    <FormControl>
                      <Input placeholder='latest' {...field} />
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
            form='spider-package-create-form'
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
