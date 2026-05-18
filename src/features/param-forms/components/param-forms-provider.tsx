// 引入依赖
import React, { useState, useEffect } from 'react'
// 获取当前路由信息
import { useSearch } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
// 参数要素数据结构
import type { ParamFormItemData } from '../data/schemas'

/**
 * 参数要素对话框类型定义
 */
export type ParamFormsDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'config'
  | 'view'
  | 'sync'

/**
 * 参数要素搜索参数类型定义
 */
type ParamFormsSearchParams = {
  // 搜索关键词
  keyword?: string
  // 启用状态过滤
  enabled?: boolean
  // 参数类型过滤
  param_type?: string
  // 页码
  page?: number
  // 页容量
  size?: number
}

/**
 * 参数要素搜索状态上下文类型定义
 */
type ParamFormsSearchContextType = {
  // 搜索参数状态
  searchParams: ParamFormsSearchParams
}

type ParamFormsDialogContextType = {
  // 当前打开的对话框类型，可为创建、更新、配置或删除，null表示无对话框打开
  open: ParamFormsDialogType | null
  // 当前操作的数据行，undefined表示没有选中任何行
  currentRow: ParamFormItemData | null
}

/**
 * 参数要素操作上下文类型定义
 */
type ParamFormsActionsContextType = {
  // 设置对话框打开状态的方法
  setOpen: (str: ParamFormsDialogType | null) => void
  // 设置当前操作数据行的方法
  setCurrentRow: React.Dispatch<React.SetStateAction<ParamFormItemData | null>>
  // 设置搜索参数的方法
  setSearchParams: React.Dispatch<React.SetStateAction<ParamFormsSearchParams>>
}

// 创建参数要素搜索上下文
const ParamFormsSearchContext =
  React.createContext<ParamFormsSearchContextType | null>(null)
// 创建参数要素对话框上下文
const ParamFormsDialogContext =
  React.createContext<ParamFormsDialogContextType | null>(null)
// 创建参数要素操作上下文
const ParamFormsActionsContext =
  React.createContext<ParamFormsActionsContextType | null>(null)

/**
 * 参数要素管理上下文提供者组件
 * 为子组件提供参数要素管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 * @param initialSearchParams - 初始搜索参数，默认为{}
 */
export function ParamFormsProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: ParamFormsSearchParams
}) {
  // 管理对话框打开状态，初始为null（关闭状态）
  const [open, setOpen] = useDialogState<ParamFormsDialogType>(null)
  // 管理当前操作的数据行，初始为null（未选中任何行）
  const [currentRow, setCurrentRow] = useState<ParamFormItemData | null>(null)
  // 管理搜索参数状态
  const [searchParams, setSearchParams] =
    useState<ParamFormsSearchParams>(initialSearchParams)

  // 监听 URL 的 search 参数变化，同步到 state
  const search = useSearch({ from: '/_authenticated/param-forms/' })
  useEffect(() => {
    setSearchParams({
      keyword: search.keyword,
      enabled: search.enabled,
      param_type: search.param_type,
      page: search.page,
      size: search.size,
    })
  }, [
    search.keyword,
    search.enabled,
    search.param_type,
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
    <ParamFormsSearchContext.Provider value={searchState}>
      <ParamFormsDialogContext.Provider value={dialogState}>
        <ParamFormsActionsContext.Provider value={actions}>
          {children}
        </ParamFormsActionsContext.Provider>
      </ParamFormsDialogContext.Provider>
    </ParamFormsSearchContext.Provider>
  )
}

/**
 * 自定义Hook，用于访问参数要素搜索状态
 */
export const useParamFormsSearch = () => {
  const context = React.useContext(ParamFormsSearchContext)
  if (!context) {
    throw new Error(
      'useParamFormsSearch has to be used within <ParamFormsProvider>'
    )
  }
  return context
}

/**
 * 自定义Hook，用于访问参数要素对话框状态
 */
export const useParamFormsDialog = () => {
  const context = React.useContext(ParamFormsDialogContext)
  if (!context) {
    throw new Error(
      'useParamFormsDialog has to be used within <ParamFormsProvider>'
    )
  }
  return context
}

/**
 * 自定义Hook，用于访问参数要素管理操作方法
 */
export const useParamFormsActions = () => {
  const context = React.useContext(ParamFormsActionsContext)
  if (!context) {
    throw new Error(
      'useParamFormsActions has to be used within <ParamFormsProvider>'
    )
  }
  return context
}

/**
 * 自定义Hook，用于在组件中访问参数要素管理上下文 (保持兼容性)
 * 注意：同时消费状态和方法会导致组件在状态变化时重渲染
 */
export const useParamForms = () => {
  const search = useParamFormsSearch()
  const dialog = useParamFormsDialog()
  const actions = useParamFormsActions()

  return React.useMemo(
    () => ({ ...search, ...dialog, ...actions }),
    [search, dialog, actions]
  )
}
