import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { ClerkFullLogo } from '@/assets/clerk-full-logo'
import { Logo } from '@/assets/logo'
import { LearnMore } from '@/components/learn-more'

export const Route = createFileRoute('/(auth)')({
  component: ClerkAuthLayout,
})

function ClerkAuthLayout() {
  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-e'>
        <div className='absolute inset-0 bg-slate-500' />
        <Link
          to='/'
          className='relative z-20 flex items-center text-lg font-medium'
        >
          <Logo className='me-2' />
          智蛛语料
        </Link>

        <ClerkFullLogo className='relative m-auto size-96' />

        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              请选择您的账号进行登录操盘
            </p>
            <footer className='text-sm'>只能以第三方账号登录</footer>
          </blockquote>
        </div>
      </div>
      <div className='lg:p-8'>
        <div className='relative mx-auto flex w-full flex-col items-center justify-center gap-4'>
          <LearnMore
            defaultOpen
            triggerProps={{
              className: 'absolute -top-12 end-0 sm:end-20 size-6',
            }}
            contentProps={{ side: 'top', align: 'end', className: 'w-auto' }}
          >
            欢迎登录智蛛系统 <br />
            返回{' '}
            <Link
              to='/'
              className='underline decoration-dashed underline-offset-2'
            >
              控制台
            </Link>{' '}
            ?
          </LearnMore>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
