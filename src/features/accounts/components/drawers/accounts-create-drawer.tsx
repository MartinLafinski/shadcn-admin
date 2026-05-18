import React from 'react'
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
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { useCreateAccountMutation } from '../../api/accounts.ts'
import {
  type AccountCreateData,
  AccountCreateSchema,
} from '../../data/schemas.ts'

type AccountsCreateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const AccountsCreateDrawer = React.memo(function AccountsCreateDrawer({
  open,
  onOpenChange,
}: AccountsCreateDrawerProps) {
  const createAccountMutation = useCreateAccountMutation()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(AccountCreateSchema),
    defaultValues: {
      email: '',
      password: '',
      username: '',
      is_active: true,
      is_superuser: false,
      is_verified: false,
    },
  })

  const onSubmit = async (data: AccountCreateData) => {
    await createAccountMutation
      .mutateAsync(data)
      .then((res) => {
        toast.success(`用户 ${res.username} 创建成功`)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('用户创建失败:', error)
        toast.error('用户创建失败')
      })
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
      }}
    >
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建用户</SheetTitle>
          <SheetDescription>创建新的用户账户</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='account-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <h4 className='text-sm font-bold'>基础信息</h4>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    邮箱 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='user@example.com' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    用户名 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='用户名 (2-64 字符)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    密码 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='password'
                      placeholder='至少 8 位，含字母和数字'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <h4 className='text-sm font-bold'>权限设置</h4>
            <FormField
              control={form.control}
              name='is_active'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel>启用状态</FormLabel>
                    <p className='text-sm text-muted-foreground'>
                      是否启用该用户账户
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='is_superuser'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel>管理员</FormLabel>
                    <p className='text-sm text-muted-foreground'>
                      是否赋予管理员权限
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='is_verified'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <FormLabel>验证状态</FormLabel>
                    <p className='text-sm text-muted-foreground'>
                      是否标记为已验证用户
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='account-create-form' type='submit'>
            创建用户
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
})
