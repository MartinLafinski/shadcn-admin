// 引入依赖
import React, { useState, useEffect } from 'react'
// 获取当前路由信息
// import { useLocation } from '@tanstack/react-router'
import { useSearch } from '@tanstack/react-router'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 网站数据结构
import { type WebsiteItemData } from '../data/schemas'

/**
 * 网站管理对话框类型枚举
 * 定义了网站管理功能中可能打开的各种对话框类型
 *
 * 类型说明：
 * - 'create': 创建网站对话框 - 用于添加新的网站记录
 * - 'update': 更新网站对话框 - 用于修改现有的网站信息
 * - 'delete': 删除网站对话框 - 用于确认删除网站操作
 * - 'export': 导入网站对话框 - 用于批量导入网站数据
 * - 'configInfo': 网站配置信息对话框 - 用于查看网站配置详情
 * - 'config': 网站配置对话框 - 用于编辑网站的配置信息
 * - 'editConfig': 单独修改网站爬虫配置对话框 - 用于单独修改网站的爬虫配置
 */
type WebsitesDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'configInfo'
  | 'config'
  | 'editConfig'
  | 'view'
  | 'sync'

/**
 * 网站搜索参数类型定义
 */
type WebsiteSearchParams = {
  // 搜索关键词
  website_keyword?: string
  // 网站启用状态过滤
  website_enabled?: boolean
  // 网站锁定状态过滤
  website_locked?: boolean
  // 网站暂停状态过滤
  website_paused?: boolean
  // 网站受限状态过滤
  website_limited?: boolean
  // 页码
  page?: number
  // 页容量
  size?: number
}

/**
 * 网站管理状态上下文类型定义
 */
type WebsitesSearchContextType = {
  // 搜索参数状态
  searchParams: WebsiteSearchParams
}

type WebsitesDialogContextType = {
  // 当前打开的对话框类型，可为创建、更新、删除或导入，null表示无对话框打开
  open: WebsitesDialogType | null
  // 当前操作的数据行，null表示没有选中任何行
  currentRow: WebsiteItemData | null
}

/**
 * 网站管理操作上下文类型定义
 */
type WebsitesActionsContextType = {
  // 设置对话框打开状态的方法
  setOpen: (str: WebsitesDialogType | null) => void
  // 设置当前操作数据行的方法
  setCurrentRow: React.Dispatch<React.SetStateAction<WebsiteItemData | null>>
  // 设置搜索参数的方法
  setSearchParams: React.Dispatch<React.SetStateAction<WebsiteSearchParams>>
}

// 创建网站管理搜索上下文
const WebsitesSearchContext =
  React.createContext<WebsitesSearchContextType | null>(null)
// 创建网站管理对话框上下文
const WebsitesDialogContext =
  React.createContext<WebsitesDialogContextType | null>(null)
// 创建网站管理操作上下文
const WebsitesActionsContext =
  React.createContext<WebsitesActionsContextType | null>(null)

/**
 * 网站管理上下文提供者组件
 * 为子组件提供网站管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 * @param initialSearchParams - 初始搜索参数，默认为{}
 */
export function WebsitesProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: WebsiteSearchParams
}) {
  // 使用自定义hook管理对话框打开状态，初始为null（关闭状态）
  const [open, setOpen] = useDialogState<WebsitesDialogType>(null)
  // 管理当前操作的数据行，初始为null（未选中任何行）
  const [currentRow, setCurrentRow] = useState<WebsiteItemData | null>(null)
  // 管理搜索参数状态
  const [searchParams, setSearchParams] =
    useState<WebsiteSearchParams>(initialSearchParams)

  // 监听 URL 的 search 参数变化，同步到 state
  const search = useSearch({ from: '/_authenticated/websites/' })
  useEffect(() => {
    setSearchParams({
      website_keyword: search.website_keyword,
      website_enabled: search.website_enabled,
      website_locked: search.website_locked,
      website_paused: search.website_paused,
      website_limited: search.website_limited,
      page: search.page,
      size: search.size,
    })
  }, [
    search.website_keyword,
    search.website_enabled,
    search.website_locked,
    search.website_paused,
    search.website_limited,
    search.page,
    search.size,
  ])

  // 记忆化搜索状态
  const searchState = React.useMemo(
    () => ({
      searchParams,
    }),
    [searchParams]
  )

  // 记忆化对话框状态
  const dialogState = React.useMemo(
    () => ({
      open,
      currentRow,
    }),
    [open, currentRow]
  )

  // 使用 useMemo 记忆化操作方法，确保引用稳定
  const actions = React.useMemo(
    () => ({
      setOpen,
      setCurrentRow,
      setSearchParams,
    }),
    [setOpen]
  ) // setCurrentRow and setSearchParams are stable from useState

  return (
    <WebsitesSearchContext.Provider value={searchState}>
      <WebsitesDialogContext.Provider value={dialogState}>
        <WebsitesActionsContext.Provider value={actions}>
          {children}
        </WebsitesActionsContext.Provider>
      </WebsitesDialogContext.Provider>
    </WebsitesSearchContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于访问网站搜索状态
 */
export const useWebsitesSearch = () => {
  const context = React.useContext(WebsitesSearchContext)
  if (!context) {
    throw new Error(
      'useWebsitesSearch has to be used within <WebsitesProvider>'
    )
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于访问网站对话框状态
 */
export const useWebsitesDialog = () => {
  const context = React.useContext(WebsitesDialogContext)
  if (!context) {
    throw new Error(
      'useWebsitesDialog has to be used within <WebsitesProvider>'
    )
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于访问网站管理操作方法
 */
export const useWebsitesActions = () => {
  const context = React.useContext(WebsitesActionsContext)
  if (!context) {
    throw new Error(
      'useWebsitesActions has to be used within <WebsitesProvider>'
    )
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于在组件中访问网站管理上下文 (保持兼容性)
 * 注意：同时消费状态和方法会导致组件在状态变化时重渲染
 */
export const useWebsites = () => {
  const search = useWebsitesSearch()
  const dialog = useWebsitesDialog()
  const actions = useWebsitesActions()

  return React.useMemo(
    () => ({ ...search, ...dialog, ...actions }),
    [search, dialog, actions]
  )
}
