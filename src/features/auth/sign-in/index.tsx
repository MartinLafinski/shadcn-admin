import { useSearch } from '@tanstack/react-router'
import { CheckIcon, XIcon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthLayout } from '../auth-layout'
import { UserAuthForm } from './components/user-auth-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/(auth)/sign-in' })

  return (
    <AuthLayout>
      <Card className='gap-4'>
        <CardHeader>
          <CardTitle className='text-lg tracking-tight'>登录</CardTitle>
          <CardDescription>
            请在下方输入您的邮箱和密码，以登录您的账户
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserAuthForm redirectTo={redirect} />
        </CardContent>
        <CardFooter>
          <div className='flex w-full flex-col items-center gap-3 text-sm text-muted-foreground'>
            <p className='flex text-center'>当前：觅蜂采料</p>
            {/*<div className='text-left'>*/}
            {/*  1. 兵蜂数据治理平台已开放： 数据准入通道 / 功能性管道*/}
            {/*  <br/>*/}
            {/*  2. 蜂王浆模型库已部署启动： 基础业务小模型*/}
            {/*</div>*/}
            <div className='mt-4 grid w-full grid-cols-3 gap-2'>
              <a
                href='/terms'
                className='flex flex-1 items-center justify-center gap-1 hover:text-primary'
              >
                <span>数据准入通道</span>
                <CheckIcon className='text-green-500' size={20} />
              </a>
              <a
                href='/terms'
                className='flex flex-1 items-center justify-center gap-1 hover:text-primary'
              >
                <span>数据功能管道</span>
                <XIcon className='text-red-500' size={20} />
              </a>
              <a
                href='/terms'
                className='flex flex-1 items-center justify-center gap-1 hover:text-primary'
              >
                <span>本地业务模型</span>
                <CheckIcon className='text-green-500' size={20} />
              </a>
              {/*<a href='/terms' className='flex flex-1 items-center justify-center gap-1 hover:text-primary'>*/}
              {/*  <span>4. 蜂王浆模型库</span>*/}
              {/*</a>*/}
              {/*<a href='/terms' className='flex flex-1 items-center justify-center gap-1 hover:text-primary'>*/}
              {/*  <span>5. 蜂蜜知识库</span>*/}
              {/*</a>*/}
              {/*<a href='/terms' className='flex flex-1 items-center justify-center gap-1 hover:text-primary'>*/}
              {/*  <span>6. 蜂后孵化中枢</span>*/}
              {/*</a>*/}
              {/*<a href='/terms' className='flex flex-1 items-center justify-center gap-1 hover:text-primary'>*/}
              {/*  <span>7. 码蜂智能体</span>*/}
              {/*</a>*/}
              {/*<a href='/terms' className='flex flex-1 items-center justify-center gap-1 hover:text-primary'>*/}
              {/*  <span>8. 蜂巢新门户</span>*/}
              {/*</a>*/}
              {/*<a href='/terms' className='flex flex-1 items-center justify-center gap-1 hover:text-primary'>*/}
              {/*  <span>9. 蜂群流量投放</span>*/}
              {/*</a>*/}
            </div>

            {/*<a*/}
            {/*  href='/terms'*/}
            {/*  className='underline underline-offset-4 hover:text-primary'*/}
            {/*>*/}
            {/*  */}
            {/*</a>*/}
            {/*{' | '}*/}
            {/*<a*/}
            {/*  href='/privacy'*/}
            {/*  className='underline underline-offset-4 hover:text-primary'*/}
            {/*>*/}
            {/*  */}
            {/*</a>*/}
            {/*{' | '}*/}
            {/*<a*/}
            {/*  href='/privacy'*/}
            {/*  className='underline underline-offset-4 hover:text-primary'*/}
            {/*>*/}
            {/*  */}
            {/*</a>*/}
          </div>
        </CardFooter>
      </Card>
    </AuthLayout>
  )
}
