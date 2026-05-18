import { memo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { useJobGroupsQuery } from '@/features/jobgroups/api/jobgroups'
import { JobGroupsPrimaryActions } from './components/actions/jobgroups-primary-actions.tsx'
import { Search } from './components/actions/jobgroups-search-actions.tsx'
import { JobGroupsDialogs } from './components/jobgroups-dialogs'
import { JobGroupsProvider } from './components/jobgroups-provider'
import { JobGroupsTable } from './components/jobgroups-table.tsx'

const route = getRouteApi('/_authenticated/jobgroups/')
const MemoizedHeader = memo(Header)
const MemoizedMain = memo(Main)
const MemoizedPrimaryActions = memo(JobGroupsPrimaryActions)

function JobGroupsContent() {
  const search = route.useSearch()
  const { data, isLoading, isFetching, isError } = useJobGroupsQuery(
    search.keyword,
    search.enabled,
    search.locked,
    search.paused,
    search.limited,
    search.page,
    search.size
  )

  if (isError)
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-lg text-red-500'>无法获取作业分组列表数据</p>
        </div>
      </Main>
    )

  return (
    <>
      <MemoizedHeader fixed={true}>
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
            <h2 className='text-2xl font-bold tracking-tight'>作业分组管理</h2>
            <p className='text-muted-foreground'>
              管理所有作业分组以及相关设置项
            </p>
          </div>
          <MemoizedPrimaryActions />
        </div>
        <JobGroupsTable
          data={data?.jobGroups}
          pager={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </MemoizedMain>
      <JobGroupsDialogs />
    </>
  )
}

export function JobGroups() {
  return (
    <JobGroupsProvider>
      <JobGroupsContent />
    </JobGroupsProvider>
  )
}
