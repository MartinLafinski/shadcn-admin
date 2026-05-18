import { memo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { useSpiderSessionsQuery } from '@/features/spider-sessions/api/spider-sessions'
import { SpiderSessionsPrimaryActions } from './components/actions/spider-sessions-primary-actions.tsx'
import { Search } from './components/actions/spider-sessions-search-actions.tsx'
import { SpiderSessionsDialogs } from './components/spider-sessions-dialogs'
import { SpiderSessionsProvider } from './components/spider-sessions-provider'
import { SpiderSessionsTable } from './components/spider-sessions-table.tsx'

const route = getRouteApi('/_authenticated/spider-sessions/')
const MH = memo(Header)
const MM = memo(Main)
const MPA = memo(SpiderSessionsPrimaryActions)

function SpiderSessionsContent() {
  const s = route.useSearch()
  const { data, isLoading, isFetching, isError } = useSpiderSessionsQuery(
    s.keyword,
    s.enabled,
    s.website_id,
    s.locked,
    s.paused,
    s.limited,
    s.expired,
    s.session_pool_id,
    s.page,
    s.size
  )
  if (isError)
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-lg text-red-500'>无法获取爬虫会话列表数据</p>
        </div>
      </Main>
    )
  return (
    <>
      <MH fixed={true}>
        <Search />
        <div className='ms-auto flex items-center space-x-4 max-sm:space-x-0'>
          <ThemeSwitch />
          <ConfigDrawer />
          <UserMenu />
        </div>
      </MH>
      <MM className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>爬虫会话管理</h2>
            <p className='text-muted-foreground'>
              管理所有爬虫会话以及相关设置项
            </p>
          </div>
          <MPA />
        </div>
        <SpiderSessionsTable
          data={data?.spiderSessions}
          pager={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </MM>
      <SpiderSessionsDialogs />
    </>
  )
}

export function SpiderSessions() {
  return (
    <SpiderSessionsProvider>
      <SpiderSessionsContent />
    </SpiderSessionsProvider>
  )
}
