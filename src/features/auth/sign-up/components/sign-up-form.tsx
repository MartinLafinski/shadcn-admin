import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, UserPlus } from 'lucide-react'
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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'

const formSchema = z
  .object({
    email: z.string().email('请输入有效的邮箱地址'),
    username: z
      .string()
      .min(2, '用户名长度不小于 2')
      .max(64, '用户名长度不大于 64'),
    password: z
      .string()
      .min(8, '密码至少 8 位')
      .regex(/[a-z]/, '密码需包含小写字母')
      .regex(/\d/, '密码需包含数字'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

type SignUpForm = z.infer<typeof formSchema>

interface SignUpFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

export function SignUpForm({
  className,
  redirectTo,
  ...props
}: SignUpFormProps) {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()

  const form = useForm<SignUpForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: SignUpForm) {
    const registerBody = {
      email: data.email,
      username: data.username,
      password: data.password,
      is_active: true,
      is_superuser: false,
      is_verified: false,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || `HTTP ${response.status}`)
      }

      toast.success(`用户 ${data.username} 注册成功，正在自动登录...`)

      await loginMutation.mutateAsync({
        username: data.email,
        password: data.password,
      })

      navigate({ to: redirectTo || '/', replace: true })
    } catch (error) {
      const msg = error instanceof Error ? error.message : '注册失败'
      if (msg.includes('REGISTER_USER_ALREADY_EXISTS')) {
        toast.error('该邮箱已被注册')
      } else {
        toast.error(`注册失败：${msg}`)
      }
    }
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
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
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
                <Input placeholder='用户名 (2-64 字符)' {...field} />
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
              <FormLabel>密码</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder='至少 8 位，含字母和数字'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <FormItem>
              <FormLabel>确认密码</FormLabel>
              <FormControl>
                <PasswordInput placeholder='再次输入密码' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={loginMutation.isPending}>
          {loginMutation.isPending ? (
            <Loader2 className='animate-spin' />
          ) : (
            <UserPlus />
          )}
          注册
        </Button>
        <p className='px-8 text-center text-sm text-muted-foreground'>
          已有账号？{' '}
          <Link
            to='/sign-in'
            className='underline underline-offset-4 hover:text-primary'
          >
            登录
          </Link>
        </p>
      </form>
    </Form>
  )
}
