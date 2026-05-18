import { memo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { useTermsQuery } from '@/features/terms/api/terms'
import { TermsPrimaryActions } from './components/actions/terms-primary-actions'
import { Search } from './components/actions/terms-search-actions'
import { TermsDialogs } from './components/terms-dialogs'
import { TermsProvider } from './components/terms-provider'
import { TermsTable } from './components/terms-table'

const route = getRouteApi('/_authenticated/terms/')

const MemoizedHeader = memo(Header)
const MemoizedMain = memo(Main)

function TermsContent() {
  const search = route.useSearch()

  const term_keyword = search.term_keyword as string | undefined
  const term_enabled = search.term_enabled as boolean | undefined
  const page = search.page as number | undefined
  const size = search.size as number | undefined

  const { data, isLoading, isFetching, isError } = useTermsQuery(
    term_keyword,
    term_enabled,
    page,
    size
  )

  if (isError) {
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-lg text-red-500'>无法获取术语库列表数据</p>
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
            <h2 className='text-2xl font-bold tracking-tight'>术语库管理</h2>
            <p className='text-muted-foreground'>
              管理所有术语库以及相关设置项
            </p>
          </div>
          <TermsPrimaryActions />
        </div>

        <TermsTable
          data={data?.terms}
          pager={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </MemoizedMain>

      <TermsDialogs />
    </>
  )
}

export function Terms() {
  return (
    <TermsProvider>
      <TermsContent />
    </TermsProvider>
  )
}
