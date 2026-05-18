import { memo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { useParamFormsQuery } from '@/features/param-forms/api/param-forms'
import { ParamFormsPrimaryActions } from './components/actions/param-forms-primary-actions'
import { Search } from './components/actions/param-forms-search-actions'
import { ParamFormsDialogs } from './components/param-forms-dialogs'
import { ParamFormsProvider } from './components/param-forms-provider'
import { ParamFormsTable } from './components/param-forms-table'

const route = getRouteApi('/_authenticated/param-forms/')
const MemoizedHeader = memo(Header)
const MemoizedMain = memo(Main)

function ParamFormsContent() {
  const search = route.useSearch()
  const keyword = search.keyword
  const enabled = search.enabled
  const param_type = search.param_type
  const page = search.page
  const size = search.size

  const { data, isLoading, isFetching, isError } = useParamFormsQuery(
    keyword,
    enabled,
    param_type,
    page,
    size
  )

  if (isError) {
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-lg text-red-500'>无法获取参数要素列表数据</p>
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
            <h2 className='text-2xl font-bold tracking-tight'>参数要素管理</h2>
            <p className='text-muted-foreground'>
              管理所有参数要素以及相关设置项
            </p>
          </div>
          <ParamFormsPrimaryActions />
        </div>

        <ParamFormsTable
          data={data?.param_forms}
          pager={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </MemoizedMain>

      <ParamFormsDialogs />
    </>
  )
}

export function ParamForms() {
  return (
    <ParamFormsProvider>
      <ParamFormsContent />
    </ParamFormsProvider>
  )
}
