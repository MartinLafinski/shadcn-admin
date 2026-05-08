// 引入依赖
import React, { useEffect, useState } from 'react'
// 获取当前路由信息
import { useSearch } from '@tanstack/react-router'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 敏感词数据结构
import { type BlackwordItemData } from '../data/schemas'

/**
 * 敏感词管理对话框类型枚举
 * 定义了敏感词管理功能中可能打开的各种对话框类型
 *
 * 类型说明：
 * - 'create': 创建敏感词对话框 - 用于添加新的敏感词记录
 * - 'update': 更新敏感词对话框 - 用于修改现有的敏感词信息
 * - 'delete': 删除敏感词对话框 - 用于确认删除敏感词操作
 * - 'export': 导入敏感词对话框 - 用于批量导入敏感词数据
 * - 'info': 敏感词信息对话框 - 用于查看敏感词详情
 * - 'config': 敏感词配置对话框 - 用于编辑敏感词的配置信息
 */
type BlackwordsDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'info'
  | 'config'

/**
 * 敏感词搜索参数类型定义
 */
type BlackwordSearchParams = {
  // 搜索关键词
  blackwords_keyword?: string
  // 敏感词启用状态过滤
  blackwords_enabled?: boolean
  // 页码
  page?: number
  // 页容量
  size?: number
}

/**
 * 敏感词管理上下文类型定义
 * 用于管理敏感词列表中的对话框状态和当前选中的数据行
 */
type BlackwordsContextType = {
  // 当前打开的对话框类型，可为创建、更新、删除或导入，null表示无对话框打开
  open: BlackwordsDialogType | null
  // 设置对话框打开状态的方法
  setOpen: (str: BlackwordsDialogType | null) => void
  // 当前操作的数据行，null表示没有选中任何行
  currentRow: BlackwordItemData | null
  // 设置当前操作数据行的方法
  setCurrentRow: React.Dispatch<React.SetStateAction<BlackwordItemData | null>>
  // 搜索参数状态
  searchParams: BlackwordSearchParams
  // 设置搜索参数的方法
  setSearchParams: React.Dispatch<React.SetStateAction<BlackwordSearchParams>>
}

// 创建敏感词管理上下文，初始值为null
const BlackwordsContext = React.createContext<BlackwordsContextType | null>(
  null
)

/**
 * 敏感词管理上下文提供者组件
 * 为子组件提供敏感词管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 */
export function BlackwordsProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: BlackwordSearchParams
}) {
  // 使用自定义hook管理对话框打开状态，初始为null（关闭状态）
  const [open, setOpen] = useDialogState<BlackwordsDialogType>(null)
  // 管理当前操作的数据行，初始为null（未选中任何行）
  const [currentRow, setCurrentRow] = useState<BlackwordItemData | null>(null)
  // 管理搜索参数状态
  const [searchParams, setSearchParams] =
    useState<BlackwordSearchParams>(initialSearchParams)

  // 监听 URL 的 search 参数变化，同步到 state
  const search = useSearch({ from: '/_authenticated/blackwords/' })
  useEffect(() => {
    setSearchParams({
      blackwords_keyword: search.blackwords_keyword,
      blackwords_enabled: search.blackwords_enabled,
      page: search.page,
      size: search.size,
    })
  }, [
    search.blackwords_keyword,
    search.blackwords_enabled,
    search.page,
    search.size,
  ])

  return (
    <BlackwordsContext
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
    </BlackwordsContext>
  )
}

/**
 * 自定义Hook，用于在组件中访问敏感词管理上下文
 *
 * @returns 敏感词管理上下文对象，包含对话框状态和当前选中行数据
 *
 * @throws 当Hook在BlackwordsProvider组件外部使用时抛出错误
 */
export const useBlackwords = () => {
  const blackwordsContext = React.useContext(BlackwordsContext)

  if (!blackwordsContext) {
    throw new Error('useBlackwords has to be used within <BlackwordsContext>')
  }

  return blackwordsContext
}
