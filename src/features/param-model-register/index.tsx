import { memo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { useParamModelRegistersQuery } from '@/features/param-model-register/api/param-model-register'
import { ParamModelRegisterPrimaryActions } from './components/actions/param-model-register-primary-actions'
import { Search } from './components/actions/param-model-register-search-actions'
import { ParamModelRegisterDialogs } from './components/param-model-register-dialogs'
import { ParamModelRegistersProvider } from './components/param-model-register-provider'
import { ParamModelRegisterTable } from './components/param-model-register-table'

const route = getRouteApi('/_authenticated/param-model-register/')

const MemoizedHeader = memo(Header)
const MemoizedMain = memo(Main)

function ParamModelRegisterContent() {
  const search = route.useSearch()

  const spider_slug = search.spider_slug as string | undefined
  const category_type = search.category_type as string | undefined
  const category_slug = search.category_slug as string | undefined
  const param_form_slug = search.param_form_slug as string | undefined
  const page = search.page as number | undefined
  const size = search.size as number | undefined

  const { data, isLoading, isFetching, isError } = useParamModelRegistersQuery(
    spider_slug,
    category_type,
    category_slug,
    param_form_slug,
    page,
    size
  )

  if (isError) {
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-lg text-red-500'>无法获取参数模型集列表数据</p>
        </div>
      </Main>
    )
  }

  return (
    <>
      <MemoizedHeader fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4 max-sm:space-x-0'>
          <ThemeSwitch />
          <ConfigDrawer />
          <UserMenu />
        </div>
      </MemoizedHeader>

      <MemoizedMain className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              参数模型集管理
            </h2>
            <p className='text-muted-foreground'>
              管理所有参数模型集和其下条目
            </p>
          </div>
          <ParamModelRegisterPrimaryActions />
        </div>

        <ParamModelRegisterTable
          data={data?.registers}
          pager={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </MemoizedMain>

      <ParamModelRegisterDialogs />
    </>
  )
}

export function ParamModelRegister() {
  return (
    <ParamModelRegistersProvider>
      <ParamModelRegisterContent />
    </ParamModelRegistersProvider>
  )
}
