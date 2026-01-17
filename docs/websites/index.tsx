import { useAuth } from '@clerk/clerk-react'
import { useWebsitesQuery } from '@/features/websites/api/websites'
import { WebsitesTable } from './components/websites-table.tsx'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { WebsitesDialogs } from './components/websites-dialogs'
import { Search } from './components/actions/websites-search-actions.tsx'
import { ConfigDrawer } from '@/components/config-drawer'
import { WebsitesProvider, useWebsites } from './components/websites-provider'
import { UserButton } from '@clerk/clerk-react'
import { WebsitesPrimaryActions } from "./components/actions/websites-primary-actions.tsx"
import { getRouteApi } from "@tanstack/react-router"
import { useEffect } from "react"

const route = getRouteApi('/_authenticated/websites/')

function WebsitesContent() {
  const { searchParams, setSearchParams } = useWebsites()
  const { getToken } = useAuth()
  const search = route.useSearch()

  const handleGetToken = async () => {
    const token = await getToken()
    console.log('JWT 令牌:', token)
  }

  // 直接使用 URL 的 search 参数
  const website_keyword = search.website_keyword
  const website_enabled = search.website_enabled
  const page = search.page
  const size = search.size

  useEffect(() => {
    setSearchParams({
      website_keyword: website_keyword,
      website_enabled: website_enabled,
      page: page,
      size: size,
    })
  }, [page, size, website_keyword, website_enabled, setSearchParams])

  const { data, isLoading, isFetching, isError } = useWebsitesQuery(
    website_keyword,
    website_enabled,
    page,
    size
  )

  if (isError) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-500">无法获取网站列表数据</p>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Header fixed={true}>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <UserButton />
          <button onClick={handleGetToken}>获取 JWT 令牌</button>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>网站管理</h2>
            <p className='text-muted-foreground'>
              管理所有网站以及相关设置项
            </p>
          </div>
          <WebsitesPrimaryActions />
        </div>
        
        <WebsitesTable 
          data={data?.websites} 
          pager={data?.pagination} 
          isLoading={isLoading} 
          isFetching={isFetching} 
        />
      </Main>

      <WebsitesDialogs />
    </>
  )
}

export function Websites() {
  const search = route.useSearch()
  
  return (
    <WebsitesProvider initialSearchParams={search}>
      <WebsitesContent />
    </WebsitesProvider>
  )
}