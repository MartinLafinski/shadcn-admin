// 用户认证
import { useAuth } from '@clerk/clerk-react'
// 友链查询
import { useLinksQuery } from '@/features/links/api/links'
// 表格组件
import { LinksTable } from './components/links-table.tsx'
// 头部组件
import { Header } from '@/components/layout/header'
// 主体区域
import { Main } from '@/components/layout/main'
// 日/夜主题切换组件
import { ThemeSwitch } from '@/components/theme-switch'
// 友链管理对话框
import { LinksDialogs } from './components/links-dialogs'
// 友链搜索框组件
import { Search } from './components/actions/links-search-actions.tsx'
// 配置抽屉组件
import { ConfigDrawer } from '@/components/config-drawer'
// 友链管理提供者
import { LinksProvider, useLinks } from './components/links-provider'
// 用户按钮组件
import { UserButton } from '@clerk/clerk-react'
// 友链独立操作按钮
import { LinksPrimaryActions } from "./components/actions/links-primary-actions.tsx"

/**
 * 友链管理页面内容组件
 * 
 * 该组件负责展示友链列表、搜索功能和管理操作
 * 使用 useLinksQuery Hook 获取友链数据
 * 通过 LinksProvider 提供上下文数据
 * 
 * 功能包括：
 * - 显示友链列表表格
 * - 支持搜索和筛选
 * - 提供新建、编辑、删除友链的操作
 * - 分页功能
 * - 错误处理机制
 */
function LinksContent() {
  // 从 LinksProvider 上下文获取搜索参数
  // 包含：关键词(keyword)、启用状态(enabled)、页码(page)、页面大小(size)
  const { searchParams } = useLinks()

  const { getToken } = useAuth()

  const handleGetToken = async () => {
    // 获取访问令牌
    const token = await getToken()
    console.log('JWT 令牌:', token)

    // 获取具有特定权限的令牌
    // const tokenWithPermission = await getToken({
    //   template: 'token-template-name' // 可选：使用特定模板
    // })
  }

  // 调用自定义 Hook 获取友链列表数据
  // 参数说明：
  // - links_keyword: 搜索关键词，用于模糊匹配友链名称等信息
  // - links_enabled: 状态筛选，true为启用，false为禁用，undefined为全部
  // - page: 当前页码，从1开始
  // - size: 每页显示数量
  // 返回值说明：
  // - data: 包含友链列表和分页信息的响应数据
  // - isLoading: 首次加载且无缓存数据时为 true，显示加载状态
  // - isFetching: 任何时候获取数据时都为 true（包括后台刷新、invalidateQueries等）
  // - isError: 请求出错时为 true，需要处理错误状态
  const { data, isLoading, isFetching, isError } = useLinksQuery(
    searchParams.links_keyword,
    searchParams.links_enabled,
    searchParams.page,
    searchParams.size
  )

  // 错误状态处理：当数据获取失败时显示错误信息
  // 适用于网络错误、服务器错误等场景
  if (isError) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-500">无法获取友链列表数据</p>
        </div>
      </Main>
    )
  }

  // 正常渲染友链管理页面
  // 页面结构：
  // 1. Header: 包含搜索框和用户操作区域
  // 2. Main: 包含页面标题、操作按钮和友链表格
  // 3. LinksDialogs: 包含各种操作的对话框组件
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
        <div className='ms-auto flex items-center space-x-4'>
          {/* 主题切换按钮，允许用户切换明暗主题 */}
          <ThemeSwitch />
          
          {/* 配置抽屉，提供页面或应用的配置选项 */}
          <ConfigDrawer />
          
          {/* 用户按钮，显示用户信息和账户操作菜单 */}
          <UserButton />
          <button onClick={handleGetToken}>获取 JWT 令牌</button>
        </div>
      </Header>

      {/* ===== 主内容区域 ===== */}
      {/* 使用 flex 布局，垂直排列，gap 为 4(sm) 或 6(md+) */}
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* 页面标题和操作按钮区域 */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          {/* 页面标题和描述信息 */}
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>友链管理</h2>
            <p className='text-muted-foreground'>
              管理所有友链以及相关设置项
            </p>
          </div>
          
          {/* 主要操作按钮，如新建友链等 */}
          <LinksPrimaryActions />
        </div>
        
        {/* 友链列表表格组件 */}
        {/* 传递参数说明： */}
        {/* - data: 从 API 获取的友链列表数据 */}
        {/* - pager: 分页信息，用于控制分页导航 */}
        {/* - isLoading: 是否处于首次加载状态，显示加载动画 */}
        {/* - isFetching: 是否正在获取数据，用于显示更新状态 */}
        <LinksTable 
          data={data?.links} 
          pager={data?.pagination} 
          isLoading={isLoading} 
          isFetching={isFetching} 
        />
      </Main>

      {/* ===== 对话框组件 ===== */}
      {/* 包含新建、编辑、删除等操作的对话框 */}
      {/* 这些对话框通过 context 控制显示/隐藏状态 */}
      <LinksDialogs />
    </>
  )
}

/**
 * 友链管理页面主组件
 * 
 * 该组件作为友链管理页面的入口点
 * 使用 LinksProvider 为整个页面提供共享状态和上下文
 * 
 * LinksProvider 提供的功能：
 * - 搜索参数管理
 * - 对话框状态控制
 * - 选中友链项的管理
 * - 分页状态管理
 * 
 * 开发者注意事项：
 * 1. 所有子组件都可以通过 useLinks() 访问上下文数据
 * 2. 如需修改搜索参数，使用 context 中的 setSearchParams 方法
 * 3. 如需打开对话框，使用 context 中的相应状态更新方法
 */
export function Links() {
  return (
    <LinksProvider>
      <LinksContent />
    </LinksProvider>
  )
}