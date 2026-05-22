import React, { useLayoutEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { categoryTypeLabels } from '@/lib/labels'
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
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { EntrypointCombobox } from '@/components/smart/combobox/entrypoint-combobox'
import { IndustrySlugCombobox } from '@/components/smart/combobox/industry-slug-combobox'
import { ParamFormCombobox } from '@/components/smart/combobox/param-form-combobox'
import { PrejobCombobox } from '@/components/smart/combobox/prejob-combobox'
import { SpiderPackageCombobox } from '@/components/smart/combobox/spider-package-combobox'
import { WebsiteSlugCombobox } from '@/components/smart/combobox/website-slug-combobox'
import { useCreateParamModelRegisterMutation } from '../../api/param-model-register'
import {
  type ParamModelRegisterCreateData,
  ParamModelRegisterCreateSchema,
  SHARD_STRATEGIES,
} from '../../data/schemas'

type ParamModelRegisterCreateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function ParamModelRegisterCreateDrawerContent({
  open,
  onOpenChange,
}: ParamModelRegisterCreateDrawerProps) {
  const [showEditors, setShowEditors] = useState(false)
  useLayoutEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setShowEditors(true))
      return () => cancelAnimationFrame(raf)
    }
    setShowEditors(false)
  }, [open])

  const createMutation = useCreateParamModelRegisterMutation()

  const form = useForm({
    resolver: zodResolver(ParamModelRegisterCreateSchema),
    defaultValues: {
      register_name: '',
      spider_slug: '',
      category_type: 'website',
      category_slug: '',
      param_form_slug: '',
      shard_strategy: null,
      description: '',
    },
  })

  const categoryType = form.watch('category_type')

  const onSubmit = async (data: ParamModelRegisterCreateData) => {
    await createMutation
      .mutateAsync(data)
      .then((res) => {
        toast.success(
          `参数模型集 ${res.register_name || res.register_slug} 创建成功`
        )
      })
      .catch((error) => {
        console.error('参数模型集创建失败:', error)
        toast.error('参数模型集创建失败')
      })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建参数模型集</SheetTitle>
          <SheetDescription>创建新的参数模型参数模型集</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='pmr-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <h4 className='text-sm font-bold'>基础设置</h4>
            <FormField
              control={form.control}
              name='register_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    注册名称 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ''}
                      placeholder='注册名称（可选）'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='category_type'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    类别标识 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='选择类别标识' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryTypeLabels.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label} [{item.value}]
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
              name='category_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    类别标识 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    {(() => {
                      switch (categoryType) {
                        case 'industry':
                          return (
                            <IndustrySlugCombobox
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )
                        case 'website':
                          return (
                            <WebsiteSlugCombobox
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )
                        case 'entrypoint':
                          return (
                            <EntrypointCombobox
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )
                        case 'prejob':
                          return (
                            <PrejobCombobox
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )
                        default:
                          return (
                            <IndustrySlugCombobox
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )
                      }
                    })()}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='spider_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    爬虫包 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <SpiderPackageCombobox
                      value={field.value}
                      onChange={field.onChange}
                    />
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
                  <FormLabel>
                    参数要素包标识 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <ParamFormCombobox
                      value={field.value}
                      onChange={field.onChange}
                      valueKey='param_form_slug'
                      paramType='spider_package:self'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h4 className='text-sm font-bold'>分片配置</h4>
            <FormField
              control={form.control}
              name='shard_strategy'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分片策略</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v || null)}
                    value={field.value ?? ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='无' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SHARD_STRATEGIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showEditors && (
              <>
                <h4 className='text-sm font-bold'>说明</h4>
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>说明</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value ?? ''}
                          placeholder='参数模型集说明'
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='pmr-create-form' type='submit'>
            创建参数模型集
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const ParamModelRegisterCreateDrawer = React.memo(
  ParamModelRegisterCreateDrawerContent
)
