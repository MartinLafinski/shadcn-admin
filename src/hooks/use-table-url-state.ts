import { useMemo, useState } from 'react'
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
} from '@tanstack/react-table'

/**
 * 表格 URL 状态管理 Hook
 * 用于将表格的分页、筛选等状态同步到 URL 参数中，实现状态的持久化和分享
 */

// 定义搜索参数记录类型
type SearchRecord = Record<string, unknown>

// 定义导航函数类型，用于更新 URL 参数
export type NavigateFn = (opts: {
  search:
    | true
    | SearchRecord
    | ((prev: SearchRecord) => Partial<SearchRecord> | SearchRecord)
  replace?: boolean // 是否替换当前历史记录而不是添加新记录
}) => void

// useTableUrlState 钩子的参数类型定义
type UseTableUrlStateParams = {
  // 当前 URL 搜索参数
  search: SearchRecord
  // 用于导航和更新 URL 的函数
  navigate: NavigateFn
  // 分页配置选项
  pagination?: {
    pageKey?: string // URL 中页码参数的键名，默认为 'page'
    pageSizeKey?: string // URL 中页面大小参数的键名，默认为 'size'
    defaultPage?: number // 默认页码，默认为 1
    defaultPageSize?: number // 默认页面大小，默认为 10
  }
  // 全局过滤器配置选项
  globalFilter?: {
    enabled?: boolean // 是否启用全局过滤器，默认为 true
    key?: string // URL 中全局过滤参数的键名，默认为 'filter'
    trim?: boolean // 是否自动去除过滤值两端空格，默认为 true
  }
  // 列过滤器配置数组，定义哪些列的状态需要同步到 URL
  columnFilters?: Array<
    | {
        columnId: string // 表格列的 ID
        searchKey: string // URL 中该列过滤参数的键名
        type?: 'string' // 过滤值类型，默认为 'string'
        // 自定义序列化和反序列化函数，用于处理特殊类型的过滤值
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
    | {
        columnId: string // 表格列的 ID
        searchKey: string // URL 中该列过滤参数的键名
        type: 'array' // 过滤值类型为数组
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
  >
}

// useTableUrlState 钩子的返回值类型定义
type UseTableUrlStateReturn = {
  // 全局过滤器相关
  globalFilter?: string // 当前全局过滤值
  onGlobalFilterChange?: OnChangeFn<string> // 更新全局过滤值的回调函数

  // 列过滤器相关
  columnFilters: ColumnFiltersState // 当前列过滤状态
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState> // 更新列过滤状态的回调函数

  // 分页相关
  pagination: PaginationState // 当前分页状态
  onPaginationChange: OnChangeFn<PaginationState> // 更新分页状态的回调函数

  // 辅助函数
  ensurePageInRange: (
    pageCount: number, // 总页数
    opts?: { resetTo?: 'first' | 'last' } // 重置选项，超出范围时跳转到首页或末页
  ) => void
}

/**
 * 表格 URL 状态管理 Hook
 * 将表格的分页、过滤状态与 URL 参数进行双向同步
 *
 * @param params - 配置参数
 * @returns 表格状态和更新函数
 */
export function useTableUrlState(
  params: UseTableUrlStateParams
): UseTableUrlStateReturn {
  const {
    search,
    navigate,
    pagination: paginationCfg,
    globalFilter: globalFilterCfg,
    columnFilters: columnFiltersCfg = [],
  } = params

  // 分页配置处理
  const pageKey = paginationCfg?.pageKey ?? ('page' as string)
  const pageSizeKey = paginationCfg?.pageSizeKey ?? ('size' as string)
  const defaultPage = paginationCfg?.defaultPage ?? 1
  const defaultPageSize = paginationCfg?.defaultPageSize ?? 10

  // 全局过滤配置处理
  const globalFilterKey = globalFilterCfg?.key ?? ('filter' as string)
  const globalFilterEnabled = globalFilterCfg?.enabled ?? true
  const trimGlobal = globalFilterCfg?.trim ?? true

  // 从 URL 参数构建初始列过滤状态
  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    const collected: ColumnFiltersState = []
    for (const cfg of columnFiltersCfg) {
      const raw = (search as SearchRecord)[cfg.searchKey]
      const deserialize = cfg.deserialize ?? ((v: unknown) => v)

      if (cfg.type === 'string') {
        // 处理字符串类型的过滤值
        const value = (deserialize(raw) as string) ?? ''
        if (typeof value === 'string' && value.trim() !== '') {
          collected.push({ id: cfg.columnId, value })
        }
      } else {
        // 默认处理数组类型的过滤值
        const value = (deserialize(raw) as unknown[]) ?? []
        if (Array.isArray(value) && value.length > 0) {
          collected.push({ id: cfg.columnId, value })
        }
      }
    }
    return collected
  }, [columnFiltersCfg, search])

  // 状态管理：列过滤
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters)

  // 计算当前分页状态
  const pagination: PaginationState = useMemo(() => {
    const rawPage = (search as SearchRecord)[pageKey]
    const rawPageSize = (search as SearchRecord)[pageSizeKey]
    const pageNum = typeof rawPage === 'number' ? rawPage : defaultPage
    const pageSizeNum =
      typeof rawPageSize === 'number' ? rawPageSize : defaultPageSize
    // React Table 使用 0 基索引，所以需要减 1
    return { pageIndex: Math.max(0, pageNum - 1), pageSize: pageSizeNum }
  }, [search, pageKey, pageSizeKey, defaultPage, defaultPageSize])

  // 更新分页状态的回调函数
  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater
    const nextPage = next.pageIndex + 1
    const nextPageSize = next.pageSize

    // 更新 URL 参数，如果值为默认值则清除参数
    navigate({
      search: (prev) => ({
        ...(prev as SearchRecord),
        [pageKey]: nextPage <= defaultPage ? undefined : nextPage,
        [pageSizeKey]:
          nextPageSize === defaultPageSize ? undefined : nextPageSize,
      }),
    })
  }

  // 状态管理：全局过滤
  const [globalFilter, setGlobalFilter] = useState<string | undefined>(() => {
    if (!globalFilterEnabled) return undefined
    const raw = (search as SearchRecord)[globalFilterKey]
    return typeof raw === 'string' ? raw : ''
  })

  // 更新全局过滤状态的回调函数
  const onGlobalFilterChange: OnChangeFn<string> | undefined =
    globalFilterEnabled
      ? (updater) => {
          const next =
            typeof updater === 'function'
              ? updater(globalFilter ?? '')
              : updater
          const value = trimGlobal ? next.trim() : next
          setGlobalFilter(value)
          // 重置页码为第一页，并更新全局过滤参数
          navigate({
            search: (prev) => ({
              ...(prev as SearchRecord),
              [pageKey]: undefined, // 重置页码
              [globalFilterKey]: value ? value : undefined, // 如果值为空则清除参数
            }),
          })
        }
      : undefined

  // 更新列过滤状态的回调函数
  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next =
      typeof updater === 'function' ? updater(columnFilters) : updater
    setColumnFilters(next)

    // 构建需要更新到 URL 的参数补丁
    const patch: Record<string, unknown> = {}

    for (const cfg of columnFiltersCfg) {
      const found = next.find((f) => f.id === cfg.columnId)
      const serialize = cfg.serialize ?? ((v: unknown) => v)

      if (cfg.type === 'string') {
        // 处理字符串类型的过滤值
        const value =
          typeof found?.value === 'string' ? (found.value as string) : ''
        patch[cfg.searchKey] =
          value.trim() !== '' ? serialize(value) : undefined
      } else {
        // 处理数组类型的过滤值
        const value = Array.isArray(found?.value)
          ? (found!.value as unknown[])
          : []
        patch[cfg.searchKey] = value.length > 0 ? serialize(value) : undefined
      }
    }

    // 更新 URL 参数，同时重置页码为第一页
    navigate({
      search: (prev) => ({
        ...(prev as SearchRecord),
        [pageKey]: undefined, // 重置页码
        ...patch, // 更新过滤参数
      }),
    })
  }

  /**
   * 确保当前页码在有效范围内
   * 当数据总数变化导致当前页码超出范围时，自动调整到有效页码
   */
  const ensurePageInRange = (
    pageCount: number,
    opts: { resetTo?: 'first' | 'last' } = { resetTo: 'first' }
  ) => {
    const currentPage = (search as SearchRecord)[pageKey]
    const pageNum = typeof currentPage === 'number' ? currentPage : defaultPage
    // 如果当前页码超出范围，则跳转到有效的页码
    if (pageCount > 0 && pageNum > pageCount) {
      navigate({
        replace: true, // 使用 replace 避免在历史记录中留下无效页面
        search: (prev) => ({
          ...(prev as SearchRecord),
          [pageKey]: opts.resetTo === 'last' ? pageCount : undefined,
        }),
      })
    }
  }

  // 返回所有状态和更新函数
  return {
    globalFilter: globalFilterEnabled ? (globalFilter ?? '') : undefined,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  }
}
