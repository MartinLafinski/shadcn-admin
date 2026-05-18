import { memo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { usePrejobsQuery } from '@/features/prejobs/api/prejobs'
import { PrejobsPrimaryActions } from './components/actions/prejobs-primary-actions.tsx'
import { Search } from './components/actions/prejobs-search-actions.tsx'
import { PrejobsDialogs } from './components/prejobs-dialogs'
import { PrejobsProvider } from './components/prejobs-provider'
import { PrejobsTable } from './components/prejobs-table.tsx'

const route = getRouteApi('/_authenticated/prejobs/')

const MemoizedHeader = memo(Header)
const MemoizedMain = memo(Main)
const MemoizedPrejobsPrimaryActions = memo(PrejobsPrimaryActions)

function PrejobsContent() {
  const search = route.useSearch()

  const industry_id = search.industry_id
  const website_id = search.website_id
  const entrypoint_id = search.entrypoint_id
  const prejob_keyword = search.prejob_keyword
  const prejob_enabled = search.prejob_enabled
  const prejob_locked = search.prejob_locked
  const prejob_paused = search.prejob_paused
  const prejob_limited = search.prejob_limited
  const prejob_level = search.prejob_level
  const deeply_search = search.deeply_search
  const page = search.page
  const size = search.size

  const { data, isLoading, isFetching, isError } = usePrejobsQuery(
    industry_id,
    website_id,
    entrypoint_id,
    prejob_keyword,
    prejob_level,
    prejob_enabled,
    prejob_locked,
    prejob_paused,
    prejob_limited,
    deeply_search,
    page,
    size
  )

  if (isError) {
    return (
      <MemoizedMain>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-lg text-red-500'>无法获取预备作业列表数据</p>
        </div>
      </MemoizedMain>
    )
  }

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
            <h2 className='text-2xl font-bold tracking-tight'>预备作业管理</h2>
            <p className='text-muted-foreground'>
              管理所有预备作业以及相关设置项
            </p>
          </div>

          <MemoizedPrejobsPrimaryActions />
        </div>

        <PrejobsTable
          data={data?.prejobs}
          pager={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </MemoizedMain>

      <PrejobsDialogs />
    </>
  )
}

export function Prejobs() {
  return (
    <PrejobsProvider>
      <PrejobsContent />
    </PrejobsProvider>
  )
}
