// 引入依赖
import React, { useState, useEffect } from 'react'
// 获取当前URL参数信息
import { useSearch } from '@tanstack/react-router'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 任务数据结构
import { type JobItemData } from '../data/schemas'

/**
 * 任务管理对话框类型枚举
 * 定义了任务管理功能中可能打开的各种对话框类型
 *
 * 类型说明：
 * - 'create': 创建任务对话框 - 用于添加新的任务记录
 * - 'delete': 删除任务对话框 - 用于确认删除任务操作
 * - 'export': 导入任务对话框 - 用于批量导入任务数据
 * - 'configInfo': 任务配置信息对话框 - 用于查看任务配置详情
 * - 'viewWebsite': 查看网站对话框 - 用于查看关联的网站信息
 * - 'viewEntrypoint': 查看入口点对话框 - 用于查看关联的入口点信息
 */
type JobsDialogType =
  | 'create'
  | 'delete'
  | 'export'
  | 'view'
  | 'viewWebsite'
  | 'viewEntrypoint'

/**
 * 任务搜索参数类型定义
 */
type JobSearchParams = {
  // 日期过滤
  day?: string
  // 网站ID过滤
  website_id?: number
  // 入口点ID过滤
  entrypoint_id?: number
  // 任务结果状态过滤
  status?: string
  // 页码
  page?: number
  // 页容量
  size?: number
}

/**
 * 任务管理上下文类型定义
 * 用于管理任务列表中的对话框状态和当前选中的数据行
 */
type JobsContextType = {
  // 当前打开的对话框类型，可为创建、删除、导入或查看详情，null表示无对话框打开
  open: JobsDialogType | null
  // 设置对话框打开状态的方法
  setOpen: (str: JobsDialogType | null) => void
  // 当前操作的数据行，null表示没有选中任何行
  currentRow: JobItemData | null
  // 设置当前操作数据行的方法
  setCurrentRow: React.Dispatch<React.SetStateAction<JobItemData | null>>
  // 搜索参数状态
  searchParams: JobSearchParams
  // 设置搜索参数的方法
  setSearchParams: React.Dispatch<React.SetStateAction<JobSearchParams>>
}

// 创建任务管理上下文，初始值为null
const JobsContext = React.createContext<JobsContextType | null>(null)

/**
 * 任务管理上下文提供者组件
 * 为子组件提供任务管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 * @param initialSearchParams - 初始搜索参数，默认为{}
 */
export function JobsProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: JobSearchParams
}) {
  // 使用自定义hook管理对话框打开状态，初始为null（关闭状态）
  const [open, setOpen] = useDialogState<JobsDialogType>(null)
  // 管理当前操作的数据行，初始为null（未选中任何行）
  const [currentRow, setCurrentRow] = useState<JobItemData | null>(null)
  // 管理搜索参数状态
  const [searchParams, setSearchParams] =
    useState<JobSearchParams>(initialSearchParams)

  // 监听 URL 的 search 参数变化，同步到 state
  const search = useSearch({ from: '/_authenticated/jobs/' })
  useEffect(() => {
    setSearchParams({
      day: search.day,
      website_id: search.website_id,
      entrypoint_id: search.entrypoint_id,
      status: search.status,
      page: search.page,
      size: search.size,
    })
  }, [
    search.day,
    search.website_id,
    search.entrypoint_id,
    search.status,
    search.page,
    search.size,
  ])

  return (
    <JobsContext
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
    </JobsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于在组件中访问任务管理上下文
 *
 * @returns 任务管理上下文对象，包含对话框状态和当前选中行数据
 *
 * @throws 当Hook在JobsProvider组件外部使用时抛出错误
 */
export const useJobs = () => {
  const jobsContext = React.useContext(JobsContext)

  if (!jobsContext) {
    throw new Error('useJobs has to be used within <JobsProvider>')
  }

  return jobsContext
}
