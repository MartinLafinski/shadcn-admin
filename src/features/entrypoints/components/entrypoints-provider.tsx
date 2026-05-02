// 引入依赖
import React, { useState, useEffect } from 'react'
// 获取当前URL参数信息
import { useSearch } from '@tanstack/react-router'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 入口点数据结构
import { type EntrypointItemData } from '../data/schemas'

/**
 * 入口点管理对话框类型枚举
 * 定义了入口点管理功能中可能打开的各种对话框类型
 *
 * 类型说明：
 * - 'create': 创建入口点对话框 - 用于添加新的入口点记录
 * - 'update': 更新入口点对话框 - 用于修改现有的入口点信息
 * - 'delete': 删除入口点对话框 - 用于确认删除入口点操作
 * - 'export': 导入入口点对话框 - 用于批量导入入口点数据
 * - 'configInfo': 入口点配置信息对话框 - 用于查看入口点配置详情
 * - 'config': 入口点配置对话框 - 用于编辑入口点的配置信息
 * - 'configSpider': 爬虫配置对话框 - 用于编辑入口点的爬虫配置
 * - 'period': 日期区间对话框 - 用于编辑入口点的日期区间
 * - 'viewWebsite': 查看网站对话框 - 用于查看关联网站的详细信息
 * - 'viewIndustry': 查看行业对话框 - 用于查看关联行业的详细信息
 * - 'viewEntrypoint': 查看入口点对话框 - 用于查看入口点的详细信息
 */
type EntrypointsDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'configInfo'
  | 'config'
  | 'viewWebsite'
  | 'viewIndustry'
  | 'viewEntrypoint'
  | 'configSpider'
  | 'period'
  | 'createPrejob'
  | 'sync'

/**
 * 入口点搜索参数类型定义
 */
type EntrypointSearchParams = {
  website_id?: number
  industry_id?: number
  entrypoint_keyword?: string
  entrypoint_enabled?: boolean
  entrypoint_locked?: boolean
  entrypoint_paused?: boolean
  entrypoint_limited?: boolean
  deeply_search?: boolean
  page?: number
  size?: number
}

/**
 * 入口点管理状态上下文类型定义
 */
type EntrypointsSearchContextType = {
  // 搜索参数状态
  searchParams: EntrypointSearchParams
}

type EntrypointsDialogContextType = {
  // 当前打开的对话框类型，可为创建、更新、删除或导入，null表示无对话框打开
  open: EntrypointsDialogType | null
  // 当前操作的数据行，null表示没有选中任何行
  currentRow: EntrypointItemData | null
}

/**
 * 入口点管理操作上下文类型定义
 */
type EntrypointsActionsContextType = {
  // 设置对话框打开状态的方法
  setOpen: (str: EntrypointsDialogType | null) => void
  // 设置当前操作数据行的方法
  setCurrentRow: React.Dispatch<React.SetStateAction<EntrypointItemData | null>>
  // 设置搜索参数的方法
  setSearchParams: React.Dispatch<React.SetStateAction<EntrypointSearchParams>>
}

// 创建入口点管理搜索上下文
const EntrypointsSearchContext =
  React.createContext<EntrypointsSearchContextType | null>(null)
// 创建入口点管理对话框上下文
const EntrypointsDialogContext =
  React.createContext<EntrypointsDialogContextType | null>(null)
// 创建入口点管理操作上下文
const EntrypointsActionsContext =
  React.createContext<EntrypointsActionsContextType | null>(null)

/**
 * 入口点管理上下文提供者组件
 * 为子组件提供入口点管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 * @param initialSearchParams - 初始搜索参数，默认为{}
 */
export function EntrypointsProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: EntrypointSearchParams
}) {
  // 使用自定义hook管理对话框打开状态，初始为null（关闭状态）
  const [open, setOpen] = useDialogState<EntrypointsDialogType>(null)
  // 管理当前操作的数据行，初始为null（未选中任何行）
  const [currentRow, setCurrentRow] = useState<EntrypointItemData | null>(null)
  // 管理搜索参数状态
  const [searchParams, setSearchParams] =
    useState<EntrypointSearchParams>(initialSearchParams)

  // 监听 URL 的 search 参数变化，同步到 state
  const search = useSearch({ from: '/_authenticated/entrypoints/' })
  useEffect(() => {
    setSearchParams({
      website_id: search.website_id,
      industry_id: search.industry_id,
      entrypoint_keyword: search.entrypoint_keyword,
      entrypoint_enabled: search.entrypoint_enabled,
      entrypoint_locked: search.entrypoint_locked,
      entrypoint_paused: search.entrypoint_paused,
      entrypoint_limited: search.entrypoint_limited,
      deeply_search: search.deeply_search,
      page: search.page,
      size: search.size,
    })
  }, [
    search.website_id,
    search.industry_id,
    search.entrypoint_keyword,
    search.entrypoint_enabled,
    search.entrypoint_locked,
    search.entrypoint_paused,
    search.entrypoint_limited,
    search.deeply_search,
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
  )

  return (
    <EntrypointsSearchContext.Provider value={searchState}>
      <EntrypointsDialogContext.Provider value={dialogState}>
        <EntrypointsActionsContext.Provider value={actions}>
          {children}
        </EntrypointsActionsContext.Provider>
      </EntrypointsDialogContext.Provider>
    </EntrypointsSearchContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于访问入口点搜索状态
 */
export const useEntrypointsSearch = () => {
  const context = React.useContext(EntrypointsSearchContext)
  if (!context) {
    throw new Error(
      'useEntrypointsSearch has to be used within <EntrypointsProvider>'
    )
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于访问入口点对话框状态
 */
export const useEntrypointsDialog = () => {
  const context = React.useContext(EntrypointsDialogContext)
  if (!context) {
    throw new Error(
      'useEntrypointsDialog has to be used within <EntrypointsProvider>'
    )
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于访问入口点管理操作方法
 */
export const useEntrypointsActions = () => {
  const context = React.useContext(EntrypointsActionsContext)
  if (!context) {
    throw new Error(
      'useEntrypointsActions has to be used within <EntrypointsProvider>'
    )
  }
  return context
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于在组件中访问入口点管理上下文 (保持兼容性)
 * 注意：同时消费状态和方法会导致组件在状态变化时重渲染
 */
export const useEntrypoints = () => {
  const search = useEntrypointsSearch()
  const dialog = useEntrypointsDialog()
  const actions = useEntrypointsActions()

  return React.useMemo(
    () => ({ ...search, ...dialog, ...actions }),
    [search, dialog, actions]
  )
}
