// 引入依赖
import { useState, useEffect, useRef, memo } from 'react'
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
import { getPinningStyles } from '@/lib/ui-helper'
// 样式工具函数
import { cn } from '@/lib/utils.ts'
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
// 行业数据结构
import { type IndustryData } from '@/features/industries/data/schemas'
// 批量操作控件
import { IndustryTableBulkActions } from './actions/industries-bulk-actions'
// 行业表格数据列
import { industriesColumns } from './industries-columns'
// 行业数据同步
import { useIndustries } from './industries-provider'
// 批量操作控件
// 行业表格行组件
import { IndustriesTableRow } from './industries-table-row'

// 定义搜索参数记录类型
type SearchRecord = Record<string, unknown>
const route = getRouteApi('/_authenticated/industries/')
// 默认行业每页数量
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_INDUSTRY_PAGE_SIZE || 50
)

/**
 * 行业数据表格组件
 *
 * 此组件用于展示行业列表数据，支持排序、过滤、搜索和分页功能
 */
interface DataTableProps {
  /**
   * 行业数据列表
   * 类型为 IndustryData 数组，包含行业的基本信息
   */
  data: IndustryData[] | undefined
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

/**
 * 行业数据表格组件
 *
 * 使用 TanStack Table 实现的可交互数据表格
 * 包含工具栏（搜索和过滤）、表格主体和分页组件
 */
export const IndustriesTable = memo(IndustriesTableComponent)

function IndustriesTableComponent({
  data = [],
  pager = undefined,
  isLoading = false,
  isFetching = false,
}: DataTableProps) {
  // 从 context 获取搜索参数
  const { searchParams, setSearchParams } = useIndustries()

  // 列固定状态
  const pinnedLeftIds = ['select', 'industry_id', 'industry']
  const pinnedRightIds = ['actions']
  const [columnPinning] = useState({
    left: pinnedLeftIds,
    right: pinnedRightIds,
  })

  // 视图模式：'table' 为表格视图，'card' 为卡片视图
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

  // 监听 searchParams.page 的变化
  useEffect(() => {
    // 如果是内部分页操作触发的，跳过
    if (isPaginationChangeRef.current) {
      isPaginationChangeRef.current = false
      return
    }

    const newPageIndex = (searchParams?.page ?? 1) - 1
    // 只有当 page 真正变化时才更新
    if (newPageIndex !== pagination.pageIndex || newPageIndex === 0) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: newPageIndex,
        pageSize: searchParams?.size ?? DEFAULT_PAGE_SIZE,
      }))
    }
  }, [searchParams?.page, searchParams?.size])

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

  // =============================================
  // 工具函数：生成固定列的样式
  // 使用共享的 getPinningStyles 工具函数
  // =============================================

  function getPinningStylesForColumn(column: Column<IndustryData>) {
    return getPinningStyles(column, pinnedLeftIds, pinnedRightIds)
  }

  // 创建 TanStack Table 实例
  const table = useReactTable({
    data, // 表格数据源
    columns: industriesColumns, // 列定义，从外部导入
    // 启用核心行模型（基础渲染功能）
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: stablePager?.total ?? 0,
    pageCount: stablePager?.pages ?? 0,
    // 启用排序模型（排序功能）
    getSortedRowModel: getSortedRowModel(),
    // 启用过滤模型（过滤功能）
    getFilteredRowModel: getFilteredRowModel(),
    // 全局过滤函数：实现跨多列的 OR 搜索逻辑
    globalFilterFn: (row, _, filterValue) => {
      const searchKeys = ['industry_name', 'industry_slug']
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

      // 调用 navigate 更新 URL
      navigate({
        search: (prev) => ({
          ...(prev as SearchRecord),
          ['page']: nextPage <= 1 ? undefined : nextPage,
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
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4',
        'relative'
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
      <DataTableToolbar
        table={table}
        searchPlaceholder='过滤 行业名称/标识...'
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
        storageKey='industries-column-vis'
      />

      {/* 表格容器，添加边框和圆角 */}
      {viewMode === 'table' ? (
        <div className='rounded-md border'>
          <Table>
            {/* 表格头部 */}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const {
                      style,
                      isPinned,
                      isLastLeftPinned,
                      isFirstRightPinned,
                    } = getPinningStylesForColumn(header.column)
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
                          metaClassName,
                        ].join(' ')}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            {/* 表格主体 */}
            <TableBody>
              {/* 如果正在加载，显示加载指示器 */}
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={industriesColumns.length}
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
                    <IndustriesTableRow
                      key={row.id}
                      row={row}
                      rowIdx={rowIdx}
                      isSelected={row.getIsSelected()}
                      getPinningStyles={getPinningStylesForColumn}
                    />
                  ))
              ) : (
                /* 当没有数据时，显示"无结果"提示 */
                <TableRow>
                  <TableCell
                    colSpan={industriesColumns.length}
                    className='h-24 text-center'
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
      <IndustryTableBulkActions table={table} />
    </div>
  )
}
