// 引入依赖
import React, { useState, useEffect } from 'react'
// 获取当前URL参数信息
import { useSearch } from '@tanstack/react-router'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 准任务数据结构
import { type PreTaskItemData } from '../data/schemas'

/**
 * 准任务管理对话框类型枚举
 * 定义了准任务管理功能中可能打开的各种对话框类型
 *
 * 类型说明：
 * - 'reset': 重置准任务对话框 - 用于确认重置准任务操作
 * - 'clear': 清空准任务对话框 - 用于确认清空准任务操作
 * - 'configInfo': 准任务配置信息对话框 - 用于查看准任务配置详情
 * - 'viewWebsite': 查看网站对话框 - 用于查看关联的网站信息
 * - 'viewEntrypoint': 查看入口点对话框 - 用于查看关联的入口点信息
 */
type PreTasksDialogType =
  | 'reset'
  | 'clear'
  | 'view'
  | 'viewWebsite'
  | 'viewEntrypoint'

/**
 * 准任务搜索参数类型定义
 */
type PreTaskSearchParams = {
  // 网站ID过滤
  website_id?: number
  // 页码
  page?: number
  // 页容量
  size?: number
}

/**
 * 准任务管理上下文类型定义
 * 用于管理准任务列表中的对话框状态和当前选中的数据行
 */
type PreTasksContextType = {
  // 当前打开的对话框类型，可为重置、清空或查看详情，null表示无对话框打开
  open: PreTasksDialogType | null
  // 设置对话框打开状态的方法
  setOpen: (str: PreTasksDialogType | null) => void
  // 当前操作的数据行，null表示没有选中任何行
  currentRow: PreTaskItemData | null
  // 设置当前操作数据行的方法
  setCurrentRow: React.Dispatch<React.SetStateAction<PreTaskItemData | null>>
  // 搜索参数状态
  searchParams: PreTaskSearchParams
  // 设置搜索参数的方法
  setSearchParams: React.Dispatch<React.SetStateAction<PreTaskSearchParams>>
}

// 创建准任务管理上下文，初始值为null
const PreTasksContext = React.createContext<PreTasksContextType | null>(null)

/**
 * 准任务管理上下文提供者组件
 * 为子组件提供准任务管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 * @param initialSearchParams - 初始搜索参数，默认为{}
 */
export function PreTasksProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: PreTaskSearchParams
}) {
  // 使用自定义hook管理对话框打开状态，初始为null（关闭状态）
  const [open, setOpen] = useDialogState<PreTasksDialogType>(null)
  // 管理当前操作的数据行，初始为null（未选中任何行）
  const [currentRow, setCurrentRow] = useState<PreTaskItemData | null>(null)
  // 管理搜索参数状态
  const [searchParams, setSearchParams] =
    useState<PreTaskSearchParams>(initialSearchParams)

  // 监听 URL 的 search 参数变化，同步到 state
  const search = useSearch({ from: '/_authenticated/pre-tasks/' })
  useEffect(() => {
    setSearchParams({
      website_id: search.website_id,
      page: search.page,
      size: search.size,
    })
  }, [search.website_id, search.page, search.size])

  return (
    <PreTasksContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        searchParams,
        setSearchParams,
      }}
    >
      {children}
    </PreTasksContext>
  )
}

/**
 * 自定义Hook，用于在组件中访问准任务管理上下文
 *
 * @returns 准任务管理上下文对象，包含对话框状态和当前选中行数据
 *
 * @throws 当Hook在PreTasksProvider组件外部使用时抛出错误
 */
export const usePreTasks = () => {
  const preTasksContext = React.useContext(PreTasksContext)

  if (!preTasksContext) {
    throw new Error('usePreTasks has to be used within <PreTasksProvider>')
  }

  return preTasksContext
}
