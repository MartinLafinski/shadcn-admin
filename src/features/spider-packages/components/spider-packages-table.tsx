import React, { useState, useEffect, useRef } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
} from '@tanstack/react-table'
import { type PaginationInfoData } from '@/config/pagination'
import {
  Table as TableIcon,
  LayoutGrid,
  CheckSquare,
  Square,
} from 'lucide-react'
import {
  getPinningStyles as calcPinningStyles,
  type PinningStyles,
} from '@/lib/ui-helper'
import { cn } from '@/lib/utils.ts'
import { usePrevious } from '@/hooks/use-previous'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import { enableLabels } from '@/features/spider-packages/data/labels'
import { type SpiderPackageItemData } from '@/features/spider-packages/data/schemas'
import { SpiderPackagesBulkActions } from './actions/spider-packages-bulk-actions'
import { spiderPackagesColumns } from './spider-packages-columns'
import {
  useSpiderPackagesSearch,
  useSpiderPackagesActions,
} from './spider-packages-provider'
import { SpiderPackagesTableRow } from './spider-packages-table-row'

type SearchRecord = Record<string, unknown>
const route = getRouteApi('/_authenticated/spider-packages/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_SPIDER_PACKAGE_PAGE_SIZE || 50
)

const pinnedLeftIds = ['select', 'spider_package_id', 'spider_package_name']
const pinnedRightIds = ['spider_package_enabled', 'actions']

interface DataTableProps {
  data: SpiderPackageItemData[] | undefined
  pager?: PaginationInfoData
  isLoading?: boolean
  isFetching?: boolean
}

export function SpiderPackagesTable({
  data = [],
  pager = undefined,
  isLoading = false,
  isFetching = false,
}: DataTableProps) {
  const { searchParams } = useSpiderPackagesSearch()
  const { setSearchParams } = useSpiderPackagesActions()
  const navigate = route.useNavigate()

  const isPaginationChangeRef = useRef(false)

  const [pagination, setPagination] = useState({
    pageIndex: (searchParams?.page ?? 1) - 1,
    pageSize: searchParams?.size ?? DEFAULT_PAGE_SIZE,
  })

  const prevPager = usePrevious(pager)
  const stablePager = pager ?? prevPager

  useEffect(() => {
    if (isPaginationChangeRef.current) {
      isPaginationChangeRef.current = false
      return
    }
    const newPageIndex = (searchParams?.page ?? 1) - 1
    if (newPageIndex !== pagination.pageIndex || newPageIndex === 0) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: newPageIndex,
        pageSize: searchParams?.size ?? DEFAULT_PAGE_SIZE,
      }))
    }
  }, [searchParams?.page, searchParams?.size])

  const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200 ? 'card' : 'table'
    }
    return 'table'
  })

  const columns = React.useMemo(() => spiderPackagesColumns, [])

  const [columnPinning] = useState({
    left: pinnedLeftIds,
    right: pinnedRightIds,
  })

  function getPinningStyles(
    column: Column<SpiderPackageItemData>
  ): PinningStyles {
    return calcPinningStyles(column, pinnedLeftIds, pinnedRightIds)
  }

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: stablePager?.total ?? 0,
    pageCount: stablePager?.pages ?? 0,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _, filterValue) => {
      const searchKeys = ['spider_package_name', 'spider_package_slug']
      if (!filterValue) return true
      return searchKeys.some((key) => {
        const value = row.getValue(key)
        return value
          ?.toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      })
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater
      setPagination(newPagination)
      isPaginationChangeRef.current = true
      setSearchParams((prev) => ({
        ...prev,
        page: newPagination.pageIndex + 1,
        size: newPagination.pageSize,
      }))
      const nextPage = newPagination.pageIndex + 1
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
    },
    state: {
      columnPinning,
      pagination,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  return (
    <div className={cn('flex flex-1 flex-col gap-4', 'relative')}>
      {isFetching && !isLoading && (
        <div className='absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-md bg-muted/80 px-3 py-1.5 text-sm backdrop-blur-sm'>
          <div className='h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent' />
          <span className='text-muted-foreground'>刷新中...</span>
        </div>
      )}

      <DataTableToolbar
        table={table}
        searchPlaceholder='过滤 爬虫包名称/标识...'
        filters={[
          {
            columnId: 'spider_package_enabled',
            title: '可用',
            options: enableLabels,
          },
        ]}
        rightActions={
          <div className='mr-4 flex items-center space-x-4'>
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

      <SpiderPackagesBulkActions table={table} />

      {viewMode === 'table' ? (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const {
                      style,
                      isPinned,
                      isLastLeftPinned,
                      isFirstRightPinned,
                    } = getPinningStyles(header.column)
                    const metaClassName =
                      header.column.columnDef.meta?.className || ''
                    return (
                      <TableHead
                        key={header.id}
                        style={style}
                        className={[
                          'bg-background whitespace-nowrap',
                          isPinned ? 'sticky z-20' : 'relative',
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
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={spiderPackagesColumns.length}
                    className='h-24 text-center'
                  >
                    加载中...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={spiderPackagesColumns.length}
                    className='h-24 text-center'
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                table
                  .getRowModel()
                  .rows.map((r, idx) => (
                    <SpiderPackagesTableRow
                      key={r.id}
                      row={r}
                      rowIdx={idx}
                      isSelected={r.getIsSelected()}
                      getPinningStyles={getPinningStyles}
                    />
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {isLoading ? (
            <div className='col-span-full flex h-24 items-center justify-center'>
              <div className='flex items-center justify-center gap-2'>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                <span className='text-muted-foreground'>加载中...</span>
              </div>
            </div>
          ) : table.getRowModel().rows.length ? (
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
              暂无数据
            </div>
          )}
        </div>
      )}

      <DataTablePagination table={table} />
    </div>
  )
}
