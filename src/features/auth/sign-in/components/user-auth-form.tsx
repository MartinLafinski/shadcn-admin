import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
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
import { PasswordInput } from '@/components/password-input'
import { useLoginMutation } from '@/features/auth/api/auth'

const formSchema = z.object({
  username: z.string().min(1, '请输入邮箱或用户名'),
  password: z.string().min(1, '请输入密码'),
})

type UserForm = z.infer<typeof formSchema>

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: '', password: '' },
  })

  function onSubmit(data: UserForm) {
    toast.promise(loginMutation.mutateAsync(data), {
      loading: '登录中...',
      success: () => {
        const targetPath = redirectTo || '/'
        navigate({ to: targetPath, replace: true })
        return `欢迎回来，${data.username}！`
      },
      error: (error) => {
        const msg = error instanceof Error ? error.message : '登录失败'
        if (msg.includes('LOGIN_BAD_CREDENTIALS')) {
          return '邮箱/用户名或密码错误，或账户已被禁用'
        }
        if (msg.includes('LOGIN_USER_NOT_VERIFIED')) {
          return '账户尚未验证，请联系管理员'
        }
        return `登录失败：${msg}`
      },
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱/用户名</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                忘记密码？
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={loginMutation.isPending}>
          {loginMutation.isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <LogIn />
          )}
          登录
        </Button>
      </form>
    </Form>
  )
}
