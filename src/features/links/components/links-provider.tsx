// 引入依赖
import React, { useState, useEffect } from 'react'
// 获取当前url搜索信息
import { useSearch } from '@tanstack/react-router'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 友链数据结构
import { type LinkItemData } from '../data/schemas'

/**
 * 友链管理对话框类型枚举
 * 定义了友链管理功能中可能打开的各种对话框类型
 *
 * 类型说明：
 * - 'create': 创建友链对话框 - 用于添加新的友链记录
 * - 'update': 更新友链对话框 - 用于修改现有的友链信息
 * - 'delete': 删除友链对话框 - 用于确认删除友链操作
 * - 'export': 导入友链对话框 - 用于批量导入友链数据
 * - 'configInfo': 友链配置信息对话框 - 用于查看友链配置详情
 * - 'config': 友链配置对话框 - 用于编辑友链的配置信息
 */
type LinksDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'configInfo'
  | 'config'

/**
 * 友链搜索参数类型定义
 */
type LinkSearchParams = {
  // 搜索关键词
  links_keyword?: string
  // 友链启用状态过滤
  links_enabled?: boolean
  // 页码
  page?: number
  // 页容量
  size?: number
}

/**
 * 友链管理上下文类型定义
 * 用于管理友链列表中的对话框状态和当前选中的数据行
 */
type LinksContextType = {
  // 当前打开的对话框类型，可为创建、更新、删除或导入，null表示无对话框打开
  open: LinksDialogType | null
  // 设置对话框打开状态的方法
  setOpen: (str: LinksDialogType | null) => void
  // 当前操作的数据行，null表示没有选中任何行
  currentRow: LinkItemData | null
  // 设置当前操作数据行的方法
  setCurrentRow: React.Dispatch<React.SetStateAction<LinkItemData | null>>
  // 搜索参数状态
  searchParams: LinkSearchParams
  // 设置搜索参数的方法
  setSearchParams: React.Dispatch<React.SetStateAction<LinkSearchParams>>
}

// 创建友链管理上下文，初始值为null
const LinksContext = React.createContext<LinksContextType | null>(null)

/**
 * 友链管理上下文提供者组件
 * 为子组件提供友链管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 */
export function LinksProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: LinkSearchParams
}) {
  // 使用自定义hook管理对话框打开状态，初始为null（关闭状态）
  const [open, setOpen] = useDialogState<LinksDialogType>(null)
  // 管理当前操作的数据行，初始为null（未选中任何行）
  const [currentRow, setCurrentRow] = useState<LinkItemData | null>(null)
  // 管理搜索参数状态
  const [searchParams, setSearchParams] =
    useState<LinkSearchParams>(initialSearchParams)

  // 监听 URL 的 search 参数变化，同步到 state
  const search = useSearch({ from: '/_authenticated/links/' })
  useEffect(() => {
    setSearchParams({
      links_keyword: search.links_keyword,
      links_enabled: search.links_enabled,
      page: search.page,
      size: search.size,
    })
  }, [search.links_keyword, search.links_enabled, search.page, search.size])

  return (
    <LinksContext
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
    </LinksContext>
  )
}

/**
 * 自定义Hook，用于在组件中访问友链管理上下文
 *
 * @returns 友链管理上下文对象，包含对话框状态和当前选中行数据
 *
 * @throws 当Hook在LinksProvider组件外部使用时抛出错误
 */
export const useLinks = () => {
  const linksContext = React.useContext(LinksContext)

  if (!linksContext) {
    throw new Error('useLinks has to be used within <LinksContext>')
  }

  return linksContext
}
