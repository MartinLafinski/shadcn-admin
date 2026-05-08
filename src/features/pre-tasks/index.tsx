// 引入依赖
import { useEffect } from 'react'
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
// 用户认证
// 准任务查询
import { usePreTasksQuery } from '@/features/pre-tasks/api/pre-tasks'
// 准任务独立操作按钮
import { PreTasksPrimaryActions } from './components/actions/pre-tasks-primary-actions.tsx'
// 准任务搜索框组件
import { Search } from './components/actions/pre-tasks-search-actions.tsx'
// 准任务管理对话框
import { PreTasksDialogs } from './components/pre-tasks-dialogs'
// 准任务管理提供者
import { PreTasksProvider, usePreTasks } from './components/pre-tasks-provider'
// 表格组件
import { PreTasksTable } from './components/pre-tasks-table.tsx'

// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/pre-tasks/')

/**
 * 准任务管理页面内容组件
 *
 * 该组件负责展示准任务列表、搜索功能和管理操作
 * 使用 usePreTasksQuery Hook 获取准任务数据
 * 通过 PreTasksProvider 提供上下文数据
 *
 * 功能包括：
 * - 显示准任务列表表格
 * - 支持搜索和筛选
 * - 提供重置、清空准任务等操作
 * - 分页功能
 * - 错误处理机制
 */
function PreTasksContent() {
  // 从 PreTasksProvider 上下文获取搜索参数
  // 包含：网站ID(website_id)、页码(page)、页面大小(size)
  const { setSearchParams } = usePreTasks()

  // url搜索参数
  const search = route.useSearch()

  // // 获取访问令牌
  // const { getToken } = useAuth()
  //
  // const handleGetToken = async () => {
  //   // 获取访问令牌
  //   const token = await getToken()
  //   console.log('JWT 令牌:', token)
  //
  //   // 获取具有特定权限的令牌
  //   // const tokenWithPermission = await getToken({
  //   //   template: 'token-template-name' // 可选：使用特定模板
  //   // })
  // }

  // 直接使用 URL 的 search 参数
  const website_id = search.website_id
  const page = search.page
  const size = search.size

  // 同步搜索参数，防抖动
  useEffect(() => {
    setSearchParams({
      website_id: website_id,
      page: page,
      size: size,
    })
  }, [page, size, website_id, setSearchParams])

  // 调用自定义 Hook 获取准任务列表数据
  // 参数说明：
  // - website_id: 网站ID筛选，用于筛选特定网站的准任务
  // - page: 当前页码，从1开始
  // - size: 每页显示数量
  // 返回值说明：
  // - data: 包含准任务列表和分页信息的响应数据
  // - isLoading: 首次加载且无缓存数据时为 true，显示加载状态
  // - isFetching: 任何时候获取数据时都为 true（包括后台刷新、invalidateQueries等）
  // - isError: 请求出错时为 true，需要处理错误状态
  const { data, isLoading, isFetching, isError } = usePreTasksQuery(
    website_id,
    page,
    size
  )

  // 错误状态处理：当数据获取失败时显示错误信息
  // 适用于网络错误、服务器错误等场景
  if (isError) {
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-lg text-red-500'>无法获取准任务列表数据</p>
        </div>
      </Main>
    )
  }

  // 正常渲染准任务管理页面
  // 页面结构：
  // 1. Header: 包含搜索框和用户操作区域
  // 2. Main: 包含页面标题、操作按钮和准任务表格
  // 3. PreTasksDialogs: 包含各种操作的对话框组件
  return (
    <>
      {/* ===== 页面头部区域 ===== */}
      {/* fixed=true 表示头部固定在页面顶部 */}
      <Header fixed={true}>
        {/* 可选的顶部导航栏（当前被注释） */}
        {/*<TopNav links={topNav} />*/}

        {/* 搜索组件，用于关键词搜索和筛选 */}
        <Search />

        {/* 右侧操作区域，包含主题切换、配置抽屉和用户菜单 */}
        <div className='ms-auto flex items-center space-x-4 max-sm:space-x-0'>
          {/* 主题切换按钮，允许用户切换明暗主题 */}
          <ThemeSwitch />

          {/* 配置抽屉，提供页面或应用的配置选项 */}
          <ConfigDrawer />

          {/* 用户按钮，显示用户信息和账户操作菜单 */}
          <UserMenu />
          {/*<button onClick={handleGetToken}>获取 JWT 令牌</button>*/}
        </div>
      </Header>

      {/* ===== 主内容区域 ===== */}
      {/* 使用 flex 布局，垂直排列，gap 为 4(sm) 或 6(md+) */}
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* 页面标题和操作按钮区域 */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          {/* 页面标题和描述信息 */}
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>准任务管理</h2>
            <p className='text-muted-foreground'>
              管理所有排队准任务以及相关设置项
            </p>
          </div>

          {/* 主要操作按钮，如重置、清空准任务等 */}
          <PreTasksPrimaryActions />
        </div>

        {/* 准任务列表表格组件 */}
        {/* 传递参数说明： */}
        {/* - data: 从 API 获取的准任务列表数据 */}
        {/* - pager: 分页信息，用于控制分页导航 */}
        {/* - isLoading: 是否处于首次加载状态，显示加载动画 */}
        {/* - isFetching: 是否正在获取数据，用于显示更新状态 */}
        <PreTasksTable
          data={data?.preTasks}
          pager={data?.pagination}
          isLoading={isLoading}
          isFetching={isFetching}
        />
      </Main>

      {/* ===== 对话框组件 ===== */}
      {/* 包含重置、清空等操作的对话框 */}
      {/* 这些对话框通过 context 控制显示/隐藏状态 */}
      <PreTasksDialogs />
    </>
  )
}

/**
 * 准任务管理页面主组件
 *
 * 该组件作为准任务管理页面的入口点
 * 使用 PreTasksProvider 为整个页面提供共享状态和上下文
 *
 * PreTasksProvider 提供的功能：
 * - 搜索参数管理
 * - 对话框状态控制
 * - 选中准任务项的管理
 * - 分页状态管理
 *
 * 开发者注意事项：
 * 1. 所有子组件都可以通过 usePreTasks() 访问上下文数据
 * 2. 如需修改搜索参数，使用 context 中的 setSearchParams 方法
 * 3. 如需打开对话框，使用 context 中的相应状态更新方法
 */
export function PreTasks() {
  return (
    <PreTasksProvider>
      <PreTasksContent />
    </PreTasksProvider>
  )
}
