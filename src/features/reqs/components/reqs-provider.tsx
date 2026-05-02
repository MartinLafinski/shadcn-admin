// 引入依赖
import React, { useState, useEffect } from 'react'
// 获取当前URL参数信息
import { useSearch } from '@tanstack/react-router'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 任务数据结构
import { type JobItemData } from '@/features/jobs/data/schemas'
// 请求数据结构
import { type ReqItemData } from '../data/schemas'

/**
 * 请求管理对话框类型枚举
 * 定义了请求管理功能中可能打开的各种对话框类型
 *
 * 类型说明：
 * - 'view': 查看请求详情对话框 - 用于查看请求的详细信息
 * - 'viewJob': 查看任务详情对话框 - 用于查看任务的详细信息
 */
type ReqsDialogType = 'view' | 'viewJob'

/**
 * 请求搜索参数类型定义
 */
type ReqSearchParams = {
  // 日期过滤
  day?: string
  // 网站ID过滤
  website_id?: number
  // 入口点ID过滤
  entrypoint_id?: number
  // 任务ID过滤
  task_id?: number
  // 请求结果类型过滤
  result_type?: string
  // 结果分类过滤
  result_category?: string
  // 页码
  page?: number
  // 页容量
  size?: number
}

/**
 * 请求管理上下文类型定义
 * 用于管理请求列表中的对话框状态和当前选中的数据行
 */
type ReqsContextType = {
  // 当前打开的对话框类型，可为查看详情，null表示无对话框打开
  open: ReqsDialogType | null
  // 设置对话框打开状态的方法
  setOpen: (str: ReqsDialogType | null) => void
  // 当前操作的数据行，null表示没有选中任何行
  currentRow: ReqItemData | null
  // 设置当前操作数据行的方法
  setCurrentRow: React.Dispatch<React.SetStateAction<ReqItemData | null>>
  // 当前选中的任务数据，null表示没有选中任何任务
  currentJob: JobItemData | null
  // 设置当前选中任务数据的方法
  setCurrentJob: React.Dispatch<React.SetStateAction<JobItemData | null>>
  // 搜索参数状态
  searchParams: ReqSearchParams
  // 设置搜索参数的方法
  setSearchParams: React.Dispatch<React.SetStateAction<ReqSearchParams>>
}

// 创建请求管理上下文，初始值为null
const ReqsContext = React.createContext<ReqsContextType | null>(null)

/**
 * 请求管理上下文提供者组件
 * 为子组件提供请求管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 * @param initialSearchParams - 初始搜索参数，默认为{}
 */
export function ReqsProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: ReqSearchParams
}) {
  // 使用自定义hook管理对话框打开状态，初始为null（关闭状态）
  const [open, setOpen] = useDialogState<ReqsDialogType>(null)
  // 管理当前操作的数据行，初始为null（未选中任何行）
  const [currentRow, setCurrentRow] = useState<ReqItemData | null>(null)
  // 管理当前选中的任务数据，初始为null（未选中任何任务）
  const [currentJob, setCurrentJob] = useState<JobItemData | null>(null)
  // 管理搜索参数状态
  const [searchParams, setSearchParams] =
    useState<ReqSearchParams>(initialSearchParams)

  // 监听 URL 的 search 参数变化，同步到 state
  const search = useSearch({ from: '/_authenticated/reqs/' })
  useEffect(() => {
    setSearchParams({
      day: search.day,
      website_id: search.website_id,
      entrypoint_id: search.entrypoint_id,
      task_id: search.task_id,
      result_type: search.result_type,
      result_category: search.result_category,
      page: search.page,
      size: search.size,
    })
  }, [
    search.task_id,
    search.result_type,
    search.result_category,
    search.page,
    search.size,
  ])

  return (
    <ReqsContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        currentJob,
        setCurrentJob,
        searchParams,
        setSearchParams,
      }}
    >
      {children}
    </ReqsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于在组件中访问请求管理上下文
 *
 * @returns 请求管理上下文对象，包含对话框状态和当前选中行数据
 *
 * @throws 当Hook在ReqsProvider组件外部使用时抛出错误
 */
export const useReqs = () => {
  const reqsContext = React.useContext(ReqsContext)

  if (!reqsContext) {
    throw new Error('useReqs has to be used within <ReqsProvider>')
  }

  return reqsContext
}
