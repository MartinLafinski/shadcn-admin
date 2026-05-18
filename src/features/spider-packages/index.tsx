import { memo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { useSpiderPackagesQuery } from '@/features/spider-packages/api/spider-packages'
import { SpiderPackagesPrimaryActions } from './components/actions/spider-packages-primary-actions.tsx'
import { Search } from './components/actions/spider-packages-search-actions.tsx'
import { SpiderPackagesDialogs } from './components/spider-packages-dialogs'
import { SpiderPackagesProvider } from './components/spider-packages-provider'
import { SpiderPackagesTable } from './components/spider-packages-table.tsx'

const route = getRouteApi('/_authenticated/spider-packages/')

const MemoizedHeader = memo(Header)
const MemoizedMain = memo(Main)
const MemoizedSpiderPackagesPrimaryActions = memo(SpiderPackagesPrimaryActions)

function SpiderPackagesContent() {
  const search = route.useSearch()

  const spider_package_keyword = search.spider_package_keyword
  const spider_package_enabled = search.spider_package_enabled
  const page = search.page
  const size = search.size

  const { data, isLoading, isFetching, isError } = useSpiderPackagesQuery(
    spider_package_keyword,
    spider_package_enabled,
    page,
    size
  )

  if (isError) {
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-lg text-red-500'>无法获取爬虫包列表数据</p>
        </div>
      </Main>
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
            <h2 className='text-2xl font-bold tracking-tight'>爬虫包管理</h2>
            <p className='text-muted-foreground'>
              管理所有爬虫包以及相关设置项
            </p>
          </div>
          <MemoizedSpiderPackagesPrimaryActions />
        </div>

        <SpiderPackagesTable
          data={data?.spiderPackages}
          pager={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </MemoizedMain>

      <SpiderPackagesDialogs />
    </>
  )
}

export function SpiderPackages() {
  return (
    <SpiderPackagesProvider>
      <SpiderPackagesContent />
    </SpiderPackagesProvider>
  )
}
