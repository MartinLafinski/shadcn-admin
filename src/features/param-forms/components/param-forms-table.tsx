import React, { useEffect, useRef, useState } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  type Column,
  type ColumnFiltersState,
  type ColumnPinningState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type PaginationInfoData } from '@/config/pagination'
import { CheckSquare, Square } from 'lucide-react'
import { enableLabels } from '@/lib/labels'
import { getPinningStyles, type PinningStyles } from '@/lib/ui-helper'
import { cn } from '@/lib/utils'
import { usePrevious } from '@/hooks/use-previous'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
import type { ParamFormItemData } from '../data/schemas'
import { ParamFormsBulkActions } from './actions/param-forms-bulk-actions'
import { paramFormsColumns } from './param-forms-columns'
import {
  useParamFormsActions,
  useParamFormsSearch,
} from './param-forms-provider'
import { ParamFormsTableRow } from './param-forms-table-row'

type SearchRecord = Record<string, unknown>
const route = getRouteApi('/_authenticated/param-forms/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_PARAMFORM_PAGE_SIZE || 20
)

interface ParamFormsTableProps {
  data: ParamFormItemData[] | undefined
  pager: PaginationInfoData | undefined
  isLoading: boolean
  isFetching: boolean
}

function ParamFormsTableComponent({
  data = [],
  pager,
  isLoading,
}: ParamFormsTableProps) {
  const { searchParams } = useParamFormsSearch()
  const { setSearchParams } = useParamFormsActions()
  const navigate = route.useNavigate()

  const isPaginationChangeRef = useRef(false)

  const pinnedLeftIds = React.useMemo(
    () => ['select', 'param_form_id', 'param_form_name'],
    []
  )
  const pinnedRightIds = React.useMemo(
    () => ['param_form_enabled', 'actions'],
    []
  )
  const [columnPinning] = useState<ColumnPinningState>({
    left: pinnedLeftIds,
    right: pinnedRightIds,
  })

  const [pagination, setPagination] = useState({
    pageIndex: (searchParams?.page ?? 1) - 1,
    pageSize: searchParams?.size ?? DEFAULT_PAGE_SIZE,
  })

  const prevPager = usePrevious(pager)
  const stablePager = pager ?? prevPager

  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')

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

  function pinningStyles(column: Column<ParamFormItemData>): PinningStyles {
    return getPinningStyles(column, pinnedLeftIds, pinnedRightIds)
  }

  const table = useReactTable({
    data,
    columns: paramFormsColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    rowCount: stablePager?.total ?? 0,
    pageCount: stablePager?.pages ?? -1,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _, filterValue) => {
      const searchText = String(filterValue).toLowerCase()
      const name = String(row.getValue('param_form_name') ?? '').toLowerCase()
      const slug = String(row.getValue('param_form_slug') ?? '').toLowerCase()
      return name.includes(searchText) || slug.includes(searchText)
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
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
      rowSelection,
      globalFilter,
      columnFilters,
      columnVisibility,
    },
  })

  if (isLoading) {
    return (
      <div className='space-y-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className='h-10 w-full' />
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='过滤 表单名称/标识...'
        filters={[
          {
            columnId: 'param_form_enabled',
            title: '可用',
            options: enableLabels,
          },
        ]}
        rightActions={
          <div className='mr-4 flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                const isAllSelected = table.getIsAllRowsSelected()
                if (isAllSelected) table.resetRowSelection()
                else table.toggleAllRowsSelected()
              }}
              className='h-8 px-2'
            >
              {table.getIsAllRowsSelected() || table.getIsSomeRowsSelected() ? (
                <CheckSquare className='mr-1 h-4 w-4' />
              ) : (
                <Square className='mr-1 h-4 w-4' />
              )}
              全选
            </Button>
          </div>
        }
      />

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
                  return (
                    <TableHead
                      key={header.id}
                      style={style}
                      className={cn(
                        'bg-background whitespace-nowrap',
                        isPinned ? `sticky z-20` : 'relative',
                        isLastLeftPinned &&
                          'after:absolute after:top-0 after:right-0 after:bottom-0 after:z-[25] after:w-0.5 after:bg-slate-200 dark:after:bg-slate-700',
                        isFirstRightPinned &&
                          'after:absolute after:top-0 after:bottom-0 after:left-0 after:z-[25] after:w-0.5 after:bg-slate-200 dark:after:bg-slate-700'
                      )}
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
            {table.getRowModel().rows.length ? (
              table
                .getRowModel()
                .rows.map((row, rowIdx) => (
                  <ParamFormsTableRow
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
                  colSpan={paramFormsColumns.length}
                  className='h-24 text-center'
                >
                  暂无数据
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} className='mt-auto' />
      <ParamFormsBulkActions table={table} />
    </div>
  )
}

export const ParamFormsTable = React.memo(ParamFormsTableComponent)
