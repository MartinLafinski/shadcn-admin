// 引入依赖
import { useState, useEffect } from 'react'
// 样式工具函数
import { cn } from "@/lib/utils.ts"
// 表格相关
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  // getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
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
import {
  DataTablePagination,
  DataTableToolbar,
} from '@/components/data-table'
// 可用性标签
import { enableLabels } from "@/features/blackwords/data/labels"
// 批量操作控件
import { BlackwordsBulkActions } from './actions/blackwords-bulk-actions'
// 敏感词表格数据列
import { blackwordsColumns } from './blackwords-columns'
// 敏感词数据结构
import { type BlackwordData } from '@/features/blackwords/data/schemas'
// 分页数据结构
import { type PaginationInfoData } from '@/config/pagination'
// 敏感词数据同步
import { useBlackwords } from './blackwords-provider'

/**
 * 敏感词数据表格组件
 * 
 * 此组件用于展示敏感词列表数据，支持排序、过滤、搜索和分页功能
 * 主要功能包括：
 * - 显示敏感词基本信息（名称、标识、集合等）
 * - 支持按敏感词名称/标识搜索
 * - 支持按启用状态过滤
 * - 支持列排序和分页
 * - 响应式设计，适配移动端
 */
interface DataTableProps {
  /**
   * 敏感词数据列表
   * 类型为 BlackwordData 数组，包含敏感词的基本信息
   */
  data: BlackwordData[] | undefined
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
 * 敏感词数据表格组件
 * 
 * 使用 TanStack Table 实现的可交互数据表格
 * 包含工具栏（搜索和过滤）、表格主体和分页组件
 */
export function BlackwordsTable({ data = [], pager = undefined, isLoading = false, isFetching = false }: DataTableProps) {
  // 表格状态管理
  // 从 context 获取搜索参数
  const { searchParams, setSearchParams } = useBlackwords()
  // 分页状态
  // const [pagination, setPagination] = useState({
  //   pageIndex: (searchParams?.page ?? 1) - 1,
  //   pageSize: searchParams?.size ?? 10,
  // })
  const [pagination, setPagination] = useState({
    pageIndex: (pager?.page ?? 1) - 1,
    pageSize: pager?.size ?? 10,
  })

  // 当分页信息变化时，更新表格状态
  useEffect(() => {
    setPagination({
      pageIndex: (pager?.page ?? 1) - 1,
      pageSize: pager?.size ?? 10,
    })
  }, [pager?.page, pager?.size])

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


  // 创建 TanStack Table 实例
  // 通过配置各种模型和状态来实现数据表格的功能
  const table = useReactTable({
    data, // 表格数据源
    columns: blackwordsColumns, // 列定义，从外部导入
    // 启用核心行模型（基础渲染功能）
    getCoreRowModel: getCoreRowModel(),
    // 启用分页模型（分页功能）
    // getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    rowCount: pager?.total ?? 0,
    pageCount: pager?.pages ?? 0,
    // 启用排序模型（排序功能）
    getSortedRowModel: getSortedRowModel(),
    // 启用过滤模型（过滤功能）
    getFilteredRowModel: getFilteredRowModel(),
    // 全局过滤函数：实现跨多列的 OR 搜索逻辑
    globalFilterFn: (row, _, filterValue) => {
      const searchKeys = ['blackwords_name', 'blackwords_slug']
      if (!filterValue) return true
      // OR 逻辑：只要任一列匹配就返回 true
      return searchKeys.some((key) => {
        const value = row.getValue(key)
        return value?.toString().toLowerCase().includes(filterValue.toLowerCase())
      })
    },
    // 设置状态变更处理函数
    onSortingChange: setSorting, // 排序状态变更时的回调
    onColumnFiltersChange: setColumnFilters, // 过滤状态变更时的回调
    onColumnVisibilityChange: setColumnVisibility, // 列可见性变更时的回调
    onRowSelectionChange: setRowSelection, // 行选择状态变更时的回调
    onGlobalFilterChange: setGlobalFilter, // 全局过滤状态变更时的回调
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      setPagination(newPagination)
      
      // 更新 URL 参数
      setSearchParams({
        blackwords_keyword: searchParams.blackwords_keyword || undefined,
        blackwords_enabled: searchParams.blackwords_enabled,
        page: newPagination.pageIndex + 1,
        size: newPagination.pageSize,
      })
    }, // 分页状态变更时的回调
    
    // 将当前状态传递给表格实例
    state: {
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
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-md bg-muted/80 px-3 py-1.5 text-sm backdrop-blur-sm">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">刷新中...</span>
        </div>
      )}

      {/* 数据表格工具栏 */}
      {/* 包含搜索框和过滤器，允许用户搜索敏感词名称/标识，以及按启用状态过滤 */}
      <DataTableToolbar
        table={table} // 传递表格实例给工具栏组件
        // 不指定 searchKey 则使用全局过滤（支持跨多列 OR 搜索）
        // searchKey={["blackwords_name", "blackwords_slug"]}
        // 搜索框占位符文本
        searchPlaceholder='过滤 敏感词名称/标识...'
        // 定义过滤器配置
        filters={[
          {
            columnId: 'blackwords_enabled', // 对应列的ID
            title: '可用', // 过滤器标题
            options: enableLabels, // 过滤选项，从外部导入的启用状态标签
          },
        ]}
      />

      {/* 表格容器，添加边框和圆角 */}
      <div className="rounded-md border">
        <Table>
          {/* 表格头部 - 显示列标题 */}
          <TableHeader>
            {/* 遍历表头组，通常是单个组 */}
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {/* 遍历每个表头单元格 */}
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                  colSpan={blackwordsColumns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-muted-foreground">加载中...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              /* 如果有数据则渲染行 */
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  // 如果行被选中，添加"selected"状态
                  data-state={row.getIsSelected() && "selected"}
                >
                  {/* 渲染行中可见的单元格 */}
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {/* 渲染单元格内容 */}
                      {flexRender(
                        cell.column.columnDef.cell, // 渲染列定义中的单元格组件
                        cell.getContext() // 传递上下文给单元格组件
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              /* 当没有数据时，显示"无结果"提示 */
              <TableRow>
                {/* 当没有数据时，显示"无结果"提示，横跨所有列 */}
                <TableCell
                  colSpan={blackwordsColumns.length} // 横跨列数等于列定义的长度
                  className="h-24 text-center" // 居中显示，高度24
                >
                  无结果
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* 分页组件，自动定位到容器底部 */}
      <DataTablePagination table={table} className='mt-auto' />
      <BlackwordsBulkActions table={table} />
    </div>
  )
}