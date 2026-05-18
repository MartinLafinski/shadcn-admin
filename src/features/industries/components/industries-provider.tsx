// 引入依赖
import React, { useState, useEffect } from 'react'
// 获取当前路由信息
import { useSearch } from '@tanstack/react-router'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 行业数据结构
import { type IndustryItemData } from '../data/schemas'

/**
 * 行业管理对话框类型枚举
 * 定义了行业管理功能中可能打开的各种对话框类型
 *
 * 类型说明：
 * - 'create': 创建行业对话框 - 用于添加新的行业记录
 * - 'update': 更新行业对话框 - 用于修改现有的行业信息
 * - 'delete': 删除行业对话框 - 用于确认删除行业操作
 * - 'export': 导入行业对话框 - 用于批量导入行业数据
 * - 'config': 行业配置对话框 - 用于编辑行业的配置信息
 * - 'view': 查看行业对话框 - 用于查看行业详细信息
 */
type IndustriesDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'config'
  | 'view'
  | 'sync'

/**
 * 行业搜索参数类型定义
 */
type IndustrySearchParams = {
  // 搜索关键词
  industry_keyword?: string
  // 页码
  page?: number
  // 页容量
  size?: number
}

/**
 * 行业管理搜索上下文类型定义
 */
type IndustriesSearchContextType = {
  searchParams: IndustrySearchParams
}

/**
 * 行业管理对话框上下文类型定义
 */
type IndustriesDialogContextType = {
  open: IndustriesDialogType | null
  currentRow: IndustryItemData | null
}

/**
 * 行业管理操作上下文类型定义
 */
type IndustriesActionsContextType = {
  setOpen: (str: IndustriesDialogType | null) => void
  setCurrentRow: React.Dispatch<React.SetStateAction<IndustryItemData | null>>
  setSearchParams: React.Dispatch<React.SetStateAction<IndustrySearchParams>>
}

// 创建行业管理搜索上下文
const IndustriesSearchContext =
  React.createContext<IndustriesSearchContextType | null>(null)
// 创建行业管理对话框上下文
const IndustriesDialogContext =
  React.createContext<IndustriesDialogContextType | null>(null)
// 创建行业管理操作上下文
const IndustriesActionsContext =
  React.createContext<IndustriesActionsContextType | null>(null)

/**
 * 行业管理上下文提供者组件
 * 为子组件提供行业管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 * @param initialSearchParams - 初始搜索参数，默认为{}
 */
export function IndustriesProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: IndustrySearchParams
}) {
  // 使用自定义hook管理对话框打开状态，初始为null（关闭状态）
  const [open, setOpen] = useDialogState<IndustriesDialogType>(null)
  // 管理当前操作的数据行，初始为null（未选中任何行）
  const [currentRow, setCurrentRow] = useState<IndustryItemData | null>(null)
  // 管理搜索参数状态
  const [searchParams, setSearchParams] =
    useState<IndustrySearchParams>(initialSearchParams)

  // 监听 URL 的 search 参数变化，同步到 state
  const search = useSearch({ from: '/_authenticated/industries/' })
  useEffect(() => {
    setSearchParams({
      industry_keyword: search.industry_keyword,
      page: search.page,
      size: search.size,
    })
  }, [search.industry_keyword, search.page, search.size])

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
    <IndustriesSearchContext.Provider value={searchState}>
      <IndustriesDialogContext.Provider value={dialogState}>
        <IndustriesActionsContext.Provider value={actions}>
          {children}
        </IndustriesActionsContext.Provider>
      </IndustriesDialogContext.Provider>
    </IndustriesSearchContext.Provider>
  )
}

/**
 * 自定义Hook，用于在组件中访问行业搜索状态
 */
export const useIndustriesSearch = () => {
  const context = React.useContext(IndustriesSearchContext)
  if (!context) {
    throw new Error(
      'useIndustriesSearch has to be used within <IndustriesProvider>'
    )
  }
  return context
}

/**
 * 自定义Hook，用于在组件中访问行业对话框状态
 */
export const useIndustriesDialog = () => {
  const context = React.useContext(IndustriesDialogContext)
  if (!context) {
    throw new Error(
      'useIndustriesDialog has to be used within <IndustriesProvider>'
    )
  }
  return context
}

/**
 * 自定义Hook，用于在组件中访问行业管理操作方法
 */
export const useIndustriesActions = () => {
  const context = React.useContext(IndustriesActionsContext)
  if (!context) {
    throw new Error(
      'useIndustriesActions has to be used within <IndustriesProvider>'
    )
  }
  return context
}

/**
 * 自定义Hook，用于在组件中访问行业管理上下文 (保持兼容性)
 * 注意：同时消费状态和方法会导致组件在状态变化时重渲染
 */
export const useIndustries = () => {
  const search = useIndustriesSearch()
  const dialog = useIndustriesDialog()
  const actions = useIndustriesActions()

  return React.useMemo(
    () => ({ ...search, ...dialog, ...actions }),
    [search, dialog, actions]
  )
}
