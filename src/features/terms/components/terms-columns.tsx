import { type ColumnDef } from '@tanstack/react-table'
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
import { TermMiniItemCell } from '@/components/smart/cells/term-mini-item-cell'
import { type TermData } from '@/features/terms/data/schemas'
import { TermsRowActions } from './actions/terms-row-actions'
import { TermEnabledSwitch } from './cells/term-enabled-switch'
import { useTermsActions } from './terms-provider'

const DISPLAYED_TERMS = 10

export const termsColumns: ColumnDef<TermData>[] = [
  {
    id: 'select',
    header: ({ table }) => <EntitySelectHeader table={table} />,
    cell: ({ row }) => <EntitySelectCell row={row} />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    id: 'term_id',
    accessorKey: 'term_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('term_id')} />,
    enableHiding: false,
    size: 60,
  },
  {
    id: 'term_name',
    accessorKey: 'term_name',
    header: '术语库',
    cell: ({ row }) => {
      const { setOpen, setCurrentRow } = useTermsActions()
      return (
        <TermMiniItemCell
          entity={row.original}
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('view')
          }}
        />
      )
    },
    enableHiding: false,
    size: 120,
  },
  {
    id: 'term_count',
    accessorKey: 'term_collection',
    header: '术语数量',
    cell: ({ row }) => {
      const collection = row.getValue('term_collection') as string[]
      return (
        <span className='rounded-md bg-fuchsia-100 p-1.5 pb-1 text-sm text-fuchsia-800 tabular-nums dark:bg-fuchsia-900 dark:text-fuchsia-100'>
          {collection?.length ?? 0} 条
        </span>
      )
    },
    meta: { className: 'text-center' },
    size: 80,
  },
  {
    id: 'term_collection',
    accessorKey: 'term_collection',
    header: '术语集合',
    cell: ({ row }) => {
      const collection = row.getValue('term_collection') as string[]
      if (!collection || collection.length === 0) {
        return <span className='text-muted-foreground'>-</span>
      }
      return (
        <div className='flex flex-wrap gap-1'>
          {collection.slice(0, DISPLAYED_TERMS).map((item, idx) => (
            <span key={idx} className='rounded bg-muted px-1.5 py-0.5 text-xs'>
              {item}
            </span>
          ))}
          {collection.length > DISPLAYED_TERMS && (
            <span className='text-xs text-muted-foreground'>
              +{collection.length - DISPLAYED_TERMS}
            </span>
          )}
        </div>
      )
    },
    size: 420,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('created_at')} />,
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: '更新时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('updated_at')} />,
  },
  {
    id: 'term_enabled',
    accessorKey: 'term_enabled',
    header: '开关',
    cell: ({ row }) => <TermEnabledSwitch term={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    size: 60,
  },
  {
    id: 'actions',
    enableHiding: false,
    header: '操作',
    cell: ({ row }) => <TermsRowActions row={row} />,
    size: 54,
  },
]
