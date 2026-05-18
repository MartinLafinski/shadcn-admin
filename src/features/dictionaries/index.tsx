import { memo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { useDictionariesQuery } from '@/features/dictionaries/api/dictionaries'
import { DictionariesPrimaryActions } from './components/actions/dictionaries-primary-actions'
import { Search } from './components/actions/dictionaries-search-actions'
import { DictionariesDialogs } from './components/dictionaries-dialogs'
import { DictionariesProvider } from './components/dictionaries-provider'
import { DictionariesTable } from './components/dictionaries-table'

const route = getRouteApi('/_authenticated/dictionaries/')
const MemoizedHeader = memo(Header)
const MemoizedMain = memo(Main)

function DictionariesContent() {
  const search = route.useSearch()
  const dictionary_keyword = search.dictionary_keyword as string | undefined
  const dictionary_enabled = search.dictionary_enabled as boolean | undefined
  const page = search.page as number | undefined
  const size = search.size as number | undefined

  const { data, isLoading, isFetching, isError } = useDictionariesQuery(
    dictionary_keyword,
    dictionary_enabled,
    page,
    size
  )

  if (isError)
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-lg text-red-500'>无法获取属性字典列表数据</p>
        </div>
      </Main>
    )

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
            <h2 className='text-2xl font-bold tracking-tight'>属性字典管理</h2>
            <p className='text-muted-foreground'>
              管理所有属性字典以及相关设置项
            </p>
          </div>
          <DictionariesPrimaryActions />
        </div>
        <DictionariesTable
          data={data?.dictionaries}
          pager={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </MemoizedMain>
      <DictionariesDialogs />
    </>
  )
}

export function Dictionaries() {
  return (
    <DictionariesProvider>
      <DictionariesContent />
    </DictionariesProvider>
  )
}
