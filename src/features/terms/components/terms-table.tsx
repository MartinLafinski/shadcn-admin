import { useState, useEffect, useRef, useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
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
  type ColumnPinningState,
} from '@tanstack/react-table'
import { type PaginationInfoData } from '@/config/pagination'
import {
  Table as TableIcon,
  LayoutGrid,
  CheckSquare,
  Square,
} from 'lucide-react'
import { enableLabels } from '@/lib/labels'
import { getPinningStyles } from '@/lib/ui-helper'
import { cn } from '@/lib/utils'
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
import { type TermData } from '@/features/terms/data/schemas'
import { TermsTableBulkActions } from './actions/terms-bulk-actions'
import { termsColumns } from './terms-columns'
import { useTermsSearch, useTermsActions } from './terms-provider'
import { TermTableRow } from './terms-table-row'

type SearchRecord = Record<string, unknown>
const route = getRouteApi('/_authenticated/terms/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_TERM_PAGE_SIZE || 50
)

interface DataTableProps {
  data: TermData[] | undefined
  pager?: PaginationInfoData
  isLoading?: boolean
  isFetching?: boolean
}

const TermsTableComponent = ({
  data = [],
  pager = undefined,
  isLoading = false,
  isFetching = false,
}: DataTableProps) => {
  const { searchParams } = useTermsSearch()
  const { setSearchParams } = useTermsActions()

  const pinnedLeftIds = useMemo(() => ['select', 'term_id', 'term_name'], [])
  const pinnedRightIds = useMemo(() => ['term_enabled', 'actions'], [])
  const [columnPinning] = useState<ColumnPinningState>({
    left: pinnedLeftIds,
    right: pinnedRightIds,
  })

  const [viewMode, setViewMode] = useState<'table' | 'card'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200 ? 'card' : 'table'
    }
    return 'table'
  })

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

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState('')

  function pinningStyles(column: Column<TermData>) {
    return getPinningStyles(column, pinnedLeftIds, pinnedRightIds)
  }

  const table = useReactTable({
    data,
    columns: termsColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: stablePager?.total ?? 0,
    pageCount: stablePager?.pages ?? 0,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _, filterValue) => {
      const searchKeys = ['term_name', 'term_slug']
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
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4',
        'relative'
      )}
    >
      {isFetching && !isLoading && (
        <div className='absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-md bg-muted/80 px-3 py-1.5 text-sm backdrop-blur-sm'>
          <div className='h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent' />
          <span className='text-muted-foreground'>刷新中...</span>
        </div>
      )}

      <DataTableToolbar
        table={table}
        searchPlaceholder='过滤 术语库名称/标识...'
        filters={[
          {
            columnId: 'term_enabled',
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
        storageKey='terms-column-vis'
      />

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
                    colSpan={termsColumns.length}
                    className='h-24 text-center'
                  >
                    <div className='flex items-center justify-center gap-2'>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                      <span className='text-muted-foreground'>加载中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table
                  .getRowModel()
                  .rows.map((row, rowIdx) => (
                    <TermTableRow
                      key={row.id}
                      row={row}
                      rowIdx={rowIdx}
                      isSelected={row.getIsSelected()}
                      getPinningStyles={pinningStyles}
                    />
                  ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={termsColumns.length}
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

      <DataTablePagination table={table} className='mt-auto' />
      <TermsTableBulkActions table={table} />
    </div>
  )
}

export const TermsTable = TermsTableComponent
