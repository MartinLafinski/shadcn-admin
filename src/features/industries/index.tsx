// 引入依赖
import { memo } from 'react'
// 路由
import { getRouteApi } from '@tanstack/react-router'
// 配置抽屉组件
import { ConfigDrawer } from '@/components/config-drawer'
// 头部组件
import { Header } from '@/components/layout/header'
// 主体区域
import { Main } from '@/components/layout/main'
// 日/夜主题切换组件
import { ThemeSwitch } from '@/components/theme-switch'
// 用户按钮组件
import { UserMenu } from '@/components/user-menu'
// 行业查询
import { useIndustriesQuery } from '@/features/industries/api/industries'
// 行业独立操作按钮
import { IndustriesPrimaryActions } from './components/actions/industries-primary-actions.tsx'
// 行业搜索框组件
import { Search } from './components/actions/industries-search-actions.tsx'
// 行业管理对话框
import { IndustriesDialogs } from './components/industries-dialogs'
// 行业管理提供者
import { IndustriesProvider } from './components/industries-provider'
// 表格组件
import { IndustriesTable } from './components/industries-table.tsx'

// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/industries/')

// 记忆化静态布局组件，防止主内容重渲染时它们也跟着重渲染
const MemoizedHeader = memo(Header)
const MemoizedMain = memo(Main)

/**
 * 行业管理页面内容组件
 *
 * 该组件负责展示行业列表、搜索功能和管理操作
 * 使用 useIndustriesQuery Hook 获取行业数据
 * 通过 IndustriesProvider 提供上下文数据
 */
function IndustriesContent() {
  // 直接从路由读取 URL search 参数（Provider 负责同步到 context）
  const search = route.useSearch()

  // 直接使用 URL 的 search 参数
  const industry_keyword = search.industry_keyword
  const page = search.page
  const size = search.size

  const { data, isLoading, isFetching, isError } = useIndustriesQuery(
    industry_keyword,
    page,
    size
  )

  // 错误状态处理
  if (isError) {
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-lg text-red-500'>无法获取行业列表数据</p>
        </div>
      </Main>
    )
  }

  // 正常渲染行业管理页面
  return (
    <>
      {/* ===== 页面头部区域 ===== */}
      <MemoizedHeader fixed={true}>
        {/* 搜索组件，用于关键词搜索 */}
        <Search />

        {/* 右侧操作区域，包含主题切换、配置抽屉和用户菜单 */}
        <div className='ms-auto flex items-center space-x-4 max-sm:space-x-0'>
          {/* 主题切换按钮 */}
          <ThemeSwitch />

          {/* 配置抽屉 */}
          <ConfigDrawer />

          {/* 用户按钮 */}
          <UserMenu />
        </div>
      </MemoizedHeader>

      {/* ===== 主内容区域 ===== */}
      <MemoizedMain className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* 页面标题和操作按钮区域 */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          {/* 页面标题和描述信息 */}
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>行业管理</h2>
            <p className='text-muted-foreground'>管理所有行业以及相关设置项</p>
          </div>

          {/* 主要操作按钮 */}
          <IndustriesPrimaryActions />
        </div>

        {/* 行业列表表格组件 */}
        <IndustriesTable
          data={data?.industries}
          pager={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </MemoizedMain>

      {/* ===== 对话框组件 ===== */}
      <IndustriesDialogs />
    </>
  )
}

/**
 * 行业管理页面主组件
 *
 * 该组件作为行业管理页面的入口点
 * 使用 IndustriesProvider 为整个页面提供共享状态和上下文
 */
export function Industries() {
  return (
    <IndustriesProvider>
      <IndustriesContent />
    </IndustriesProvider>
  )
}
