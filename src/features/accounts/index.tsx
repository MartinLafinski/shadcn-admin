import { useEffect } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { useAccountsQuery } from '@/features/accounts/api/accounts'
import { AccountsDialogs } from './components/accounts-dialogs'
import { AccountsProvider, useAccounts } from './components/accounts-provider'
import { AccountsTable } from './components/accounts-table.tsx'
import { AccountsPrimaryActions } from './components/actions/accounts-primary-actions.tsx'
import { Search } from './components/actions/accounts-search-actions.tsx'

const route = getRouteApi('/_authenticated/accounts/')

function AccountsContent() {
  const { setSearchParams } = useAccounts()
  const search = route.useSearch()

  const keyword = search.keyword
  const is_active = search.is_active
  const is_superuser = search.is_superuser
  const is_verified = search.is_verified
  const page = search.page
  const size = search.size

  useEffect(() => {
    setSearchParams({
      keyword,
      is_active,
      is_superuser,
      is_verified,
      page,
      size,
    })
  }, [
    page,
    size,
    keyword,
    is_active,
    is_superuser,
    is_verified,
    setSearchParams,
  ])

  const { data, isLoading, isFetching, isError } = useAccountsQuery(
    keyword,
    is_active,
    is_superuser,
    is_verified,
    page,
    size
  )

  if (isError) {
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-lg text-red-500'>无法获取用户列表数据</p>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Header fixed={true}>
        <Search />
        <div className='ms-auto flex items-center space-x-4 max-sm:space-x-0'>
          <ThemeSwitch />
          <ConfigDrawer />
          <UserMenu />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>用户管理</h2>
            <p className='text-muted-foreground'>管理系统用户及其权限设置</p>
          </div>

          <AccountsPrimaryActions />
        </div>

        <AccountsTable
          data={data?.accounts}
          pager={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </Main>

      <AccountsDialogs />
    </>
  )
}

export function Accounts() {
  return (
    <AccountsProvider>
      <AccountsContent />
    </AccountsProvider>
  )
}
