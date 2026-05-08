// 引入依赖
import React, { useState, useEffect, useRef } from 'react'
// 路由
import { getRouteApi } from '@tanstack/react-router'
// 表格相关
import {
  type Column,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
// 分页数据结构
import { type PaginationInfoData } from '@/config/pagination'
// 图标
import {
  Table as TableIcon,
  LayoutGrid,
  CheckSquare,
  Square,
} from 'lucide-react'
// 可用性标签
import {
  enableLabels,
  lockedLabels,
  pausedLabels,
  limitedLabels,
} from '@/lib/labels'
import { getPinningStyles, type PinningStyles } from '@/lib/ui-helper'
// 样式工具函数
import { cn } from '@/lib/utils.ts'
// 搜索参数
import { usePrevious } from '@/hooks/use-previous'
// Button 控件
import { Button } from '@/components/ui/button'
// Switch 控件
import { Switch } from '@/components/ui/switch'
// 表格控件
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
// 自定义分页和工具控件
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
// 网站数据结构
import { type WebsiteData } from '@/features/websites/data/schemas'
// 批量操作控件
import { WebsiteTableBulkActions } from './actions/websites-bulk-actions'
// 网站表格数据列
import { websitesColumns } from './websites-columns'
// 网站数据同步
import { useWebsitesSearch, useWebsitesActions } from './websites-provider'
// 网站表格行组件
import { WebsiteTableRow } from './websites-table-row'

// 定义搜索参数记录类型
type SearchRecord = Record<string, unknown>
const route = getRouteApi('/_authenticated/websites/')
// 默认网站每页数量
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_WEBSITE_PAGE_SIZE || 50
)

/**
 * 网站数据表格组件
 *
 * 此组件用于展示网站列表数据，支持排序、过滤、搜索和分页功能
 * 主要功能包括：
 * - 显示网站基本信息（名称、标识、URL等）
 * - 支持按网站名称/标识/URL搜索
 * - 支持按启用状态过滤
 * - 支持列排序和分页
 * - 响应式设计，适配移动端
 */
interface DataTableProps {
  /**
   * 网站数据列表
   * 类型为 WebsiteData 数组，包含网站的基本信息
   */
  data: WebsiteData[] | undefined
  /**
   * 分页信息
   * 类型为 PaginationInfoData，包含分页信息（当前页、总页数、每页数量等）
   */
  pager?: PaginationInfoData
  /**
   * 首次加载状态
   * 当为 true 时显示"加载中..."（首次加载且无缓存数据）
   */
  isLoading?: boolean
  /**
   * 数据获取状态
   * 当为 true 时显示加载指示器（包括后台刷新、invalidateQueries等所有数据获取场景）
   */
  isFetching?: boolean
}

// 定义固定列 ID
const pinnedLeftIds = [
  'select',
  'website_id',
  'website_name',
  'website_status_mini',
]
const pinnedRightIds = ['website_status', 'website_enabled', 'actions']

/**
 * 网站数据表格组件
 *
 * 使用 TanStack Table 实现的可交互数据表格
 * 包含工具栏（搜索和过滤）、表格主体和分页组件
 */
const WebsitesTableComponent = ({
  data = [],
  pager = undefined,
  isLoading = false,
  isFetching = false,
}: DataTableProps) => {
  // 表格状态管理
  // 从 context 获取搜索参数
  const { searchParams } = useWebsitesSearch()
  const { setSearchParams } = useWebsitesActions()
  // const search = route.useSearch()

  // 记忆化列定义，虽然 websitesColumns 是外部常量，但包裹 useMemo 是最佳实践
  const columns = React.useMemo(() => websitesColumns, [])

  // 视图模式：'table' 为表格视图，'card' 为卡片视图
  // 根据页面初始宽度决定默认视图模式：宽度小于1200时采用卡片呈现，否则采用表格呈现
  const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200 ? 'card' : 'table'
    }
    return 'table'
  })

  const navigate = route.useNavigate()

  // 用 ref 标记是否是内部的分页操作
  const isPaginationChangeRef = useRef(false)

  // 使用 searchParams 作为分页状态的来源，而不是 pager
  const [pagination, setPagination] = useState({
    pageIndex: (searchParams?.page ?? 1) - 1,
    pageSize: searchParams?.size ?? DEFAULT_PAGE_SIZE,
  })

  // 保持上一次的 pager 值，避免在请求期间闪烁
  const prevPager = usePrevious(pager)
  const stablePager = pager ?? prevPager

  // 【关键】添加一个 useEffect，仅监听 searchParams.page 的变化
  // 当外部（如搜索按钮）强制修改 page 时，同步到 pagination state
  useEffect(() => {
    // 如果是内部分页操作触发的，跳过
    if (isPaginationChangeRef.current) {
      isPaginationChangeRef.current = false
      return
    }

    const newPageIndex = (searchParams?.page ?? 1) - 1
    // 只有当 page 真正变化时才更新（避免不必要的重渲染）
    if (newPageIndex !== pagination.pageIndex || newPageIndex === 0) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: newPageIndex,
        pageSize: searchParams?.size ?? DEFAULT_PAGE_SIZE,
      }))
    }
  }, [searchParams?.page, searchParams?.size]) // 只监听 page，不监听其他

  // 列固定状态
  const [columnPinning] = useState({
    left: pinnedLeftIds,
    right: pinnedRightIds,
  })

  // 排序状态：跟踪当前的排序列和排序方向
  const [sorting, setSorting] = useState<SortingState>([])
  // 列过滤状态：跟踪当前应用的过滤条件
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  // 列可见性状态：跟踪哪些列当前是可见的
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  // 行选择状态：跟踪当前选中的行
  const [rowSelection, setRowSelection] = useState({})
  // 全局过滤状态：用于跨多列的 OR 搜索
  const [globalFilter, setGlobalFilter] = useState('')
  // 固定列样式计算函数
  const pinningStyles = React.useCallback(
    (column: Column<WebsiteData>): PinningStyles => {
      return getPinningStyles(column, pinnedLeftIds, pinnedRightIds)
    },
    [pinnedLeftIds, pinnedRightIds]
  )

  // 创建 TanStack Table 实例
  // 通过配置各种模型和状态来实现数据表格的功能
  const table = useReactTable({
    data, // 表格数据源
    columns, // 使用记忆化后的列定义
    // 启用核心行模型（基础渲染功能）
    getCoreRowModel: getCoreRowModel(),
    // 启用分页模型（分页功能）
    // getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: stablePager?.total ?? 0,
    pageCount: stablePager?.pages ?? 0,
    // 启用排序模型（排序功能）
    getSortedRowModel: getSortedRowModel(),
    // 启用过滤模型（过滤功能）
    getFilteredRowModel: getFilteredRowModel(),
    // 全局过滤函数：实现跨多列的 OR 搜索逻辑
    globalFilterFn: (row, _, filterValue) => {
      const searchKeys = ['website_name', 'website_slug', 'website_url']
      if (!filterValue) return true
      // OR 逻辑：只要任一列匹配就返回 true
      return searchKeys.some((key) => {
        const value = row.getValue(key)
        return value
          ?.toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      })
    },
    // 设置状态变更处理函数
    // onColumnPinningChange: setColumnPinning,
    onSortingChange: setSorting, // 排序状态变更时的回调
    onColumnFiltersChange: setColumnFilters, // 过滤状态变更时的回调
    onColumnVisibilityChange: setColumnVisibility, // 列可见性变更时的回调
    onRowSelectionChange: setRowSelection, // 行选择状态变更时的回调
    onGlobalFilterChange: setGlobalFilter, // 全局过滤状态变更时的回调
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater
      setPagination(newPagination)

      // 标记这是内部分页操作
      isPaginationChangeRef.current = true

      // 更新 URL 参数
      setSearchParams((prev) => ({
        ...prev,
        page: newPagination.pageIndex + 1,
        size: newPagination.pageSize,
      }))

      const nextPage = newPagination.pageIndex + 1

      // 关键：调用 navigate 更新 URL
      navigate({
        search: (prev) => ({
          ...(prev as SearchRecord),
          ['page']: nextPage <= 1 ? undefined : nextPage, // 如果是默认页则从 URL 移除
          ['size']:
            newPagination.pageSize === DEFAULT_PAGE_SIZE
              ? undefined
              : newPagination.pageSize,
        }),
      })
    }, // 分页状态变更时的回调

    // 将当前状态传递给表格实例
    state: {
      columnPinning, // 当前固定状态
      pagination, // 当前分页状态
      sorting, // 当前排序状态
      columnFilters, // 当前过滤状态
      columnVisibility, // 当前列可见性状态
      rowSelection, // 当前行选择状态
      globalFilter, // 当前全局过滤状态
    },
  })

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // 在移动端，当工具栏可见时添加底部边距
        'flex flex-1 flex-col gap-4', // 主容器样式：弹性布局，占据剩余空间，列方向，间距4
        'relative' // 相对定位，用于放置刷新指示器
      )}
    >
      {/* 数据刷新指示器 - 居中显示在顶部 */}
      {isFetching && !isLoading && (
        <div className='absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-md bg-muted/80 px-3 py-1.5 text-sm backdrop-blur-sm'>
          <div className='h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent' />
          <span className='text-muted-foreground'>刷新中...</span>
        </div>
      )}

      {/* 数据表格工具栏 */}
      {/* 包含搜索框和过滤器，允许用户搜索网站名称/标识/URL，以及按启用状态过滤 */}
      <DataTableToolbar
        table={table} // 传递表格实例给工具栏组件
        // 不指定 searchKey 则使用全局过滤（支持跨多列 OR 搜索）
        // searchKey={["website_name", "website_slug", "website_url"]}
        // 搜索框占位符文本
        searchPlaceholder='过滤 网站名称/标识/URL...'
        // 定义过滤器配置
        filters={[
          {
            columnId: 'website_enabled', // 对应列的ID
            title: '可用', // 过滤器标题
            options: enableLabels, // 过滤选项，从外部导入的启用状态标签
          },
          {
            columnId: 'website_locked',
            title: '锁定',
            options: lockedLabels,
          },
          {
            columnId: 'website_paused',
            title: '运转',
            options: pausedLabels,
          },
          {
            columnId: 'website_limited',
            title: '未限',
            options: limitedLabels,
          },
        ]}
        // 右侧控件：视图切换 switch 和全选/全不选按钮
        rightActions={
          <div className='mr-4 flex items-center space-x-4'>
            {/* 视图切换 switch */}
            <div className='flex items-center space-x-2'>
              <TableIcon className='h-4 w-4 text-muted-foreground' />
              <Switch
                checked={viewMode === 'card'}
                onCheckedChange={(checked) =>
                  setViewMode(checked ? 'card' : 'table')
                }
              />
              <LayoutGrid className='h-4 w-4 text-muted-foreground' />
            </div>
            {/* 全选/全不选按钮 */}
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                const isAllSelected = table.getIsAllRowsSelected()
                if (isAllSelected) {
                  table.resetRowSelection()
                } else {
                  table.toggleAllRowsSelected()
                }
              }}
              className='h-8 px-2'
            >
              {table.getIsAllRowsSelected() || table.getIsSomeRowsSelected() ? (
                <CheckSquare className='h-4 w-4' />
              ) : (
                <Square className='h-4 w-4' />
              )}
              全选
            </Button>
          </div>
        }
      />

      {/* 表格容器，添加边框和圆角 */}
      {viewMode === 'table' ? (
        <div className='rounded-md border'>
          <Table>
            {/* 表格头部 - 显示列标题 */}
            <TableHeader>
              {/* 遍历表头组，通常是单个组 */}
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {/* 遍历每个表头单元格 */}
                  {headerGroup.headers.map((header) => {
                    // const isSticky = header.column.columnDef.meta?.isSticky as boolean
                    const {
                      style,
                      isPinned,
                      isLastLeftPinned,
                      isFirstRightPinned,
                    } = pinningStyles(header.column)
                    const metaClassName =
                      header.column.columnDef.meta?.className || ''
                    return (
                      <TableHead
                        key={header.id}
                        style={style}
                        className={[
                          'bg-background whitespace-nowrap',
                          isPinned ? `sticky z-20` : 'relative',
                          isLastLeftPinned
                            ? 'after:absolute after:top-0 after:right-0 after:bottom-0 after:z-[25] after:w-0.5 after:bg-slate-200 dark:after:bg-slate-700'
                            : '',
                          isFirstRightPinned
                            ? 'after:absolute after:top-0 after:bottom-0 after:left-0 after:z-[25] after:w-0.5 after:bg-slate-200 dark:after:bg-slate-700'
                            : '',
                          // isLastLeftPinned
                          //   ? 'border-r-2 border-slate-200 dark:border-slate-700 shadow-sm'
                          //   : '',
                          // isFirstRightPinned
                          //   ? 'border-l-2 border-slate-200 dark:border-slate-700 shadow-sm'
                          //   : '',
                          metaClassName,
                        ].join(' ')}
                        // className={cn(
                        //   isSticky && 'sticky right-0 bg-background z-10 shadow-[inset_-1px_0_0_0_hsl(var(--border))]'
                        // )}
                      >
                        {/* 如果是占位符单元格则不渲染内容 */}
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header, // 渲染列定义中的头部组件
                              header.getContext() // 传递上下文给头部组件
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            {/* 表格主体 - 显示数据行 */}
            <TableBody>
              {/* 如果正在加载，显示加载指示器 */}
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={websitesColumns.length}
                    className='h-24 text-center'
                  >
                    <div className='flex items-center justify-center gap-2'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                      <span className='text-muted-foreground'>加载中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                /* 如果有数据则渲染行 */
                table
                  .getRowModel()
                  .rows.map((row, rowIdx) => (
                    <WebsiteTableRow
                      key={row.id}
                      row={row}
                      rowIdx={rowIdx}
                      isSelected={row.getIsSelected()}
                      getPinningStyles={pinningStyles}
                    />
                  ))
              ) : (
                /* 当没有数据时，显示"无结果"提示 */
                <TableRow>
                  {/* 当没有数据时，显示"无结果"提示，横跨所有列 */}
                  <TableCell
                    colSpan={websitesColumns.length} // 横跨列数等于列定义的长度
                    className='h-24 text-center' // 居中显示，高度24
                  >
                    无结果
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        /* 卡片视图 */
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {isLoading ? (
            <div className='col-span-full flex h-24 items-center justify-center'>
              <div className='flex items-center justify-center gap-2'>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                <span className='text-muted-foreground'>加载中...</span>
              </div>
            </div>
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                className='rounded-lg border bg-background p-4 shadow-sm transition-shadow hover:shadow-md'
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    className='flex justify-between border-b py-2 last:border-b-0'
                  >
                    <span className='text-sm font-medium text-gray-500'>
                      {typeof cell.column?.columnDef?.header === 'string'
                        ? cell.column.columnDef.header
                        : '功能'}
                      :
                    </span>
                    <span className='text-sm text-slate-900 dark:text-slate-300'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className='col-span-full flex h-24 items-center justify-center text-center'>
              无结果
            </div>
          )}
        </div>
      )}

      {/* 分页组件，自动定位到容器底部 */}
      <DataTablePagination table={table} className='mt-auto' />
      <WebsiteTableBulkActions table={table} />
    </div>
  )
}

/**
 * 网站数据表格组件 (记忆化版本)
 */
export const WebsitesTable = React.memo(WebsitesTableComponent)
