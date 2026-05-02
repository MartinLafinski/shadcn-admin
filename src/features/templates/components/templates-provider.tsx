// 引入依赖
import React, { useState, useEffect } from 'react'
// 获取当前url搜索信息
import { useSearch } from '@tanstack/react-router'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 模板数据结构
import { type TemplateItemData } from '../data/schemas'

/**
 * 模板管理对话框类型枚举
 * 定义了模板管理功能中可能打开的各种对话框类型
 *
 * 类型说明：
 * - 'create': 创建模板对话框 - 用于添加新的模板记录
 * - 'update': 更新模板对话框 - 用于修改现有的模板信息
 * - 'delete': 删除模板对话框 - 用于确认删除模板操作
 * - 'export': 导入模板对话框 - 用于批量导入模板数据
 * - 'configInfo': 模板配置信息对话框 - 用于查看模板配置详情
 * - 'config': 模板配置对话框 - 用于编辑模板的配置信息
 */
type TemplatesDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'configInfo'
  | 'config'

/**
 * 模板搜索参数类型定义
 */
type TemplateSearchParams = {
  // 搜索关键词
  template_keyword?: string
  // 模板启用状态过滤
  template_enabled?: boolean
  // 页码
  page?: number
  // 页容量
  size?: number
}

/**
 * 模板管理上下文类型定义
 * 用于管理模板列表中的对话框状态和当前选中的数据行
 */
type TemplatesContextType = {
  // 当前打开的对话框类型，可为创建、更新、删除或导入，null表示无对话框打开
  open: TemplatesDialogType | null
  // 设置对话框打开状态的方法
  setOpen: (str: TemplatesDialogType | null) => void
  // 当前操作的数据行，null表示没有选中任何行
  currentRow: TemplateItemData | null
  // 设置当前操作数据行的方法
  setCurrentRow: React.Dispatch<React.SetStateAction<TemplateItemData | null>>
  // 搜索参数状态
  searchParams: TemplateSearchParams
  // 设置搜索参数的方法
  setSearchParams: React.Dispatch<React.SetStateAction<TemplateSearchParams>>
}

// 创建模板管理上下文，初始值为null
const TemplatesContext = React.createContext<TemplatesContextType | null>(null)

/**
 * 模板管理上下文提供者组件
 * 为子组件提供模板管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 */
export function TemplatesProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: TemplateSearchParams
}) {
  // 使用自定义hook管理对话框打开状态，初始为null（关闭状态）
  const [open, setOpen] = useDialogState<TemplatesDialogType>(null)
  // 管理当前操作的数据行，初始为null（未选中任何行）
  const [currentRow, setCurrentRow] = useState<TemplateItemData | null>(null)
  // 管理搜索参数状态
  const [searchParams, setSearchParams] =
    useState<TemplateSearchParams>(initialSearchParams)

  // 监听 URL 的 search 参数变化，同步到 state
  const search = useSearch({ from: '/_authenticated/templates/' })
  useEffect(() => {
    setSearchParams({
      template_keyword: search.template_keyword,
      template_enabled: search.template_enabled,
      page: search.page,
      size: search.size,
    })
  }, [
    search.template_keyword,
    search.template_enabled,
    search.page,
    search.size,
  ])

  return (
    <TemplatesContext
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
    </TemplatesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于在组件中访问模板管理上下文
 *
 * @returns 模板管理上下文对象，包含对话框状态和当前选中行数据
 *
 * @throws 当Hook在TemplatesProvider组件外部使用时抛出错误
 */
export const useTemplates = () => {
  const templatesContext = React.useContext(TemplatesContext)

  if (!templatesContext) {
    throw new Error('useTemplates has to be used within <TemplatesContext>')
  }

  return templatesContext
}
