import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import {
  useCurrentAccountQuery,
  useUpdateCurrentAccountMutation,
} from '../api/accounts'
import { type AccountUpdateData, AccountUpdateSchema } from '../data/schemas'

export function AccountsMe() {
  const { data: account, isLoading, isError } = useCurrentAccountQuery()
  const updateMutation = useUpdateCurrentAccountMutation()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(AccountUpdateSchema),
    values: account
      ? {
          email: account.email,
          username: account.username,
          password: '',
          is_active: account.is_active,
          is_superuser: account.is_superuser,
          is_verified: account.is_verified,
        }
      : {
          email: '',
          username: '',
          password: '',
          is_active: true,
          is_superuser: false,
          is_verified: false,
        },
  })

  const onSubmit = async (data: AccountUpdateData) => {
    await updateMutation
      .mutateAsync(data)
      .then((res) => {
        toast.success(`用户 ${res.username} 信息更新成功`)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('用户信息更新失败:', error)
        toast.error('用户信息更新失败')
      })
  }

  return (
    <>
      <Header fixed>
        <div className='flex flex-1 items-center justify-between'>
          <h2 className='text-lg font-semibold'>我的资料</h2>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <UserMenu />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>个人资料</h2>
          <p className='text-muted-foreground'>管理您的个人账户信息和密码</p>
        </div>
        <Separator className='my-4' />

        {isLoading ? (
          <div className='max-w-xl space-y-6'>
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
            <Skeleton className='h-10 w-full' />
          </div>
        ) : isError ? (
          <div className='flex h-64 items-center justify-center'>
            <p className='text-lg text-red-500'>无法获取用户信息</p>
          </div>
        ) : (
          <div className='max-w-xl'>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-8'
              >
                <Card>
                  <CardHeader>
                    <CardTitle>基本信息</CardTitle>
                    <CardDescription>更新您的账户基本信息</CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>邮箱</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder='user@example.com'
                            />
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
                          <FormLabel>用户名</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder='用户名'
                            />
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
                          <FormLabel>新密码 (留空不修改)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type='password'
                              value={field.value ?? ''}
                              placeholder='至少 8 位，含字母和数字'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>权限信息</CardTitle>
                    <CardDescription>
                      查看当前账户的权限状态（仅管理员可修改）
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <FormField
                      control={form.control}
                      name='is_active'
                      render={({ field }) => (
                        <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                          <div className='space-y-0.5'>
                            <FormLabel>启用状态</FormLabel>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value ?? true}
                              onCheckedChange={field.onChange}
                              disabled
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
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                              disabled
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
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value ?? false}
                              onCheckedChange={field.onChange}
                              disabled
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Button type='submit' disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? '保存中...' : '保存更改'}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </Main>
    </>
  )
}
