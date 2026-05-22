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
import { getPinningStyles, type PinningStyles } from '@/lib/ui-helper'
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
import {
  enableLabels,
  lockedLabels,
  pausedLabels,
  limitedLabels,
} from '@/features/jobgroups/data/labels'
import { type JobGroupItemData } from '@/features/jobgroups/data/schemas'
import { JobGroupsBulkActions } from './actions/jobgroups-bulk-actions'
import { jobGroupsColumns } from './jobgroups-columns'
import { useJobGroupsSearch, useJobGroupsActions } from './jobgroups-provider'
import { JobGroupsTableRow } from './jobgroups-table-row'

type SearchRecord = Record<string, unknown>
const route = getRouteApi('/_authenticated/jobgroups/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_JOBGROUP_PAGE_SIZE || 50
)
const pinnedLeft = [
  'select',
  'jobgroup_id',
  'jobgroup_name',
  'jobgroup_status_mini',
]
const pinnedRight = ['jobgroup_status', 'jobgroup_enabled', 'actions']

export function JobGroupsTable({
  data = [],
  pager,
  isLoading = false,
  isFetching = false,
}: {
  data: JobGroupItemData[] | undefined
  pager?: PaginationInfoData
  isLoading?: boolean
  isFetching?: boolean
}) {
  const { searchParams } = useJobGroupsSearch()
  const { setSearchParams } = useJobGroupsActions()
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
    const newIdx = (searchParams?.page ?? 1) - 1
    if (newIdx !== pagination.pageIndex || newIdx === 0)
      setPagination((prev) => ({
        ...prev,
        pageIndex: newIdx,
        pageSize: searchParams?.size ?? DEFAULT_PAGE_SIZE,
      }))
  }, [searchParams?.page, searchParams?.size])

  const [viewMode, setViewMode] = useState<'table' | 'card'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 1200 ? 'card' : 'table'
  )
  const columns = React.useMemo(() => jobGroupsColumns, [])
  const [columnPinning] = useState({ left: pinnedLeft, right: pinnedRight })

  function gps(column: Column<JobGroupItemData>): PinningStyles {
    return getPinningStyles(column, pinnedLeft, pinnedRight)
  }

  const [sorting, setSorting] = useState<SortingState>([])
  const [cf, setCf] = useState<ColumnFiltersState>([])
  const [cv, setCv] = useState<VisibilityState>({})
  const [rs, setRs] = useState({})
  const [gf, setGf] = useState('')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: stablePager?.total ?? 0,
    pageCount: stablePager?.pages ?? 0,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _, fv) => {
      const k = ['jobgroup_name', 'jobgroup_slug']
      if (!fv) return true
      return k.some((kk) =>
        row.getValue(kk)?.toString().toLowerCase().includes(fv.toLowerCase())
      )
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setCf,
    onColumnVisibilityChange: setCv,
    onRowSelectionChange: setRs,
    onGlobalFilterChange: setGf,
    onPaginationChange: (u) => {
      const np = typeof u === 'function' ? u(pagination) : u
      setPagination(np)
      isPaginationChangeRef.current = true
      setSearchParams((p) => ({
        ...p,
        page: np.pageIndex + 1,
        size: np.pageSize,
      }))
      const n = np.pageIndex + 1
      navigate({
        search: (prev) => ({
          ...(prev as SearchRecord),
          page: n <= 1 ? undefined : n,
          size: np.pageSize === DEFAULT_PAGE_SIZE ? undefined : np.pageSize,
        }),
      })
    },
    state: {
      columnPinning,
      pagination,
      sorting,
      columnFilters: cf,
      columnVisibility: cv,
      rowSelection: rs,
      globalFilter: gf,
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
        searchPlaceholder='过滤 作业分组名称/标识...'
        filters={[
          {
            columnId: 'jobgroup_enabled',
            title: '可用',
            options: enableLabels,
          },
          {
            columnId: 'jobgroup_locked',
            title: '锁定',
            options: lockedLabels,
          },
          {
            columnId: 'jobgroup_paused',
            title: '运转',
            options: pausedLabels,
          },
          {
            columnId: 'jobgroup_limited',
            title: '未限',
            options: limitedLabels,
          },
        ]}
        rightActions={
          <div className='mr-4 flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <TableIcon className='h-4 w-4 text-muted-foreground' />
              <Switch
                checked={viewMode === 'card'}
                onCheckedChange={(c) => setViewMode(c ? 'card' : 'table')}
              />
              <LayoutGrid className='h-4 w-4 text-muted-foreground' />
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                table.getIsAllRowsSelected()
                  ? table.resetRowSelection()
                  : table.toggleAllRowsSelected()
              }
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
      <JobGroupsBulkActions table={table} />
      {viewMode === 'table' ? (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((h) => {
                    const {
                      style,
                      isPinned,
                      isLastLeftPinned,
                      isFirstRightPinned,
                    } = gps(h.column)
                    const metaClassName =
                      h.column.columnDef.meta?.className || ''
                    return (
                      <TableHead
                        key={h.id}
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
                        {h.isPlaceholder
                          ? null
                          : flexRender(
                              h.column.columnDef.header,
                              h.getContext()
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
                    colSpan={jobGroupsColumns.length}
                    className='h-24 text-center'
                  >
                    加载中...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={jobGroupsColumns.length}
                    className='h-24 text-center'
                  >
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                table
                  .getRowModel()
                  .rows.map((r, idx) => (
                    <JobGroupsTableRow
                      key={r.id}
                      row={r}
                      rowIdx={idx}
                      isSelected={r.getIsSelected()}
                      getPinningStyles={gps}
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
              加载中...
            </div>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((r) => (
              <div
                key={r.id}
                className='rounded-lg border bg-background p-4 shadow-sm transition-shadow hover:shadow-md'
              >
                {r.getVisibleCells().map((c) => (
                  <div
                    key={c.id}
                    className='flex justify-between border-b py-2 last:border-b-0'
                  >
                    <span className='text-sm font-medium text-gray-500'>
                      {typeof c.column?.columnDef?.header === 'string'
                        ? c.column.columnDef.header
                        : '功能'}
                      :
                    </span>
                    <span className='text-sm text-slate-900 dark:text-slate-300'>
                      {flexRender(c.column.columnDef.cell, c.getContext())}
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
