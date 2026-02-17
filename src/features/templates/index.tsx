// 引入依赖
import { useEffect } from "react"
// 用户认证
// import { useAuth } from '@clerk/clerk-react'
// 模板查询
import { useTemplatesQuery } from '@/features/templates/api/templates'
// 表格组件
import { TemplatesTable } from './components/templates-table.tsx'
// 头部组件
import { Header } from '@/components/layout/header'
// 主体区域
import { Main } from '@/components/layout/main'
// 日/夜主题切换组件
import { ThemeSwitch } from '@/components/theme-switch'
// 模板管理对话框
import { TemplatesDialogs } from './components/templates-dialogs'
// 模板搜索框组件
import { Search } from './components/actions/templates-search-actions.tsx'
// 配置抽屉组件
import { ConfigDrawer } from '@/components/config-drawer'
// 模板管理提供者
import { TemplatesProvider, useTemplates } from './components/templates-provider'
// 用户按钮组件
import { UserButton } from '@clerk/clerk-react'
// 模板独立操作按钮
import { TemplatesPrimaryActions } from "./components/actions/templates-primary-actions.tsx"
// 路由
import { getRouteApi } from "@tanstack/react-router"



// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/templates/')

/**
 * 模板管理页面内容组件
 * 
 * 该组件负责展示模板列表、搜索功能和管理操作
 * 使用 useTemplatesQuery Hook 获取模板数据
 * 通过 TemplatesProvider 提供上下文数据
 * 
 * 功能包括：
 * - 显示模板列表表格
 * - 支持搜索和筛选
 * - 提供新建、编辑、删除模板的操作
 * - 分页功能
 * - 错误处理机制
 */
function TemplatesContent() {
  // 从 TemplatesProvider 上下文获取搜索参数
  // 包含：关键词(keyword)、启用状态(enabled)、页码(page)、页面大小(size)
  const { setSearchParams } = useTemplates()
  // const { getToken } = useAuth()
  const search = route.useSearch()

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
  const template_keyword = search.template_keyword
  const template_enabled = search.template_enabled
  const page = search.page
  const size = search.size

  // 同步搜索参数，防抖动
  useEffect(() => {
    setSearchParams({
      template_keyword: template_keyword,
      template_enabled: template_enabled,
      page: page,
      size: size,
    })
  }, [page, size, template_keyword, template_enabled, setSearchParams])

  // 调用自定义 Hook 获取模板列表数据
  // 参数说明：
  // - template_keyword: 搜索关键词，用于模糊匹配模板名称等信息
  // - template_enabled: 状态筛选，true为启用，false为禁用，undefined为全部
  // - page: 当前页码，从1开始
  // - size: 每页显示数量
  // 返回值说明：
  // - data: 包含模板列表和分页信息的响应数据
  // - isLoading: 首次加载且无缓存数据时为 true，显示加载状态
  // - isFetching: 任何时候获取数据时都为 true（包括后台刷新、invalidateQueries等）
  // - isError: 请求出错时为 true，需要处理错误状态
  const { data, isLoading, isFetching, isError } = useTemplatesQuery(
    template_keyword,
    template_enabled,
    page,
    size
  )

  // 错误状态处理：当数据获取失败时显示错误信息
  // 适用于网络错误、服务器错误等场景
  if (isError) {
    return (
      <Main>
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-500">无法获取模板列表数据</p>
        </div>
      </Main>
    )
  }

  // 正常渲染模板管理页面
  // 页面结构：
  // 1. Header: 包含搜索框和用户操作区域
  // 2. Main: 包含页面标题、操作按钮和模板表格
  // 3. TemplatesDialogs: 包含各种操作的对话框组件
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
          <UserButton />
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
            <h2 className='text-2xl font-bold tracking-tight'>模板管理</h2>
            <p className='text-muted-foreground'>
              管理所有模板以及相关设置项
            </p>
          </div>
          
          {/* 主要操作按钮，如新建模板等 */}
          <TemplatesPrimaryActions />
        </div>
        
        {/* 模板列表表格组件 */}
        {/* 传递参数说明： */}
        {/* - data: 从 API 获取的模板列表数据 */}
        {/* - pager: 分页信息，用于控制分页导航 */}
        {/* - isLoading: 是否处于首次加载状态，显示加载动画 */}
        {/* - isFetching: 是否正在获取数据，用于显示更新状态 */}
        <TemplatesTable 
          data={data?.templates} 
          pager={data?.pagination} 
          isLoading={isLoading} 
          isFetching={isFetching} 
        />
      </Main>

      {/* ===== 对话框组件 ===== */}
      {/* 包含新建、编辑、删除等操作的对话框 */}
      {/* 这些对话框通过 context 控制显示/隐藏状态 */}
      <TemplatesDialogs />
    </>
  )
}

/**
 * 模板管理页面主组件
 * 
 * 该组件作为模板管理页面的入口点
 * 使用 TemplatesProvider 为整个页面提供共享状态和上下文
 * 
 * TemplatesProvider 提供的功能：
 * - 搜索参数管理
 * - 对话框状态控制
 * - 选中模板项的管理
 * - 分页状态管理
 * 
 * 开发者注意事项：
 * 1. 所有子组件都可以通过 useTemplates() 访问上下文数据
 * 2. 如需修改搜索参数，使用 context 中的 setSearchParams 方法
 * 3. 如需打开对话框，使用 context 中的相应状态更新方法
 */
export function Templates() {
  return (
    <TemplatesProvider>
      <TemplatesContent />
    </TemplatesProvider>
  )
}