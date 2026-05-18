import { type ColumnDef } from '@tanstack/react-table'
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
import { DictionaryMiniItemCell } from '@/components/smart/cells/dictionary-mini-item-cell'
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
import { type DictionaryData } from '@/features/dictionaries/data/schemas'
import { DictionariesRowActions } from './actions/dictionaries-row-actions'
import { DictionaryEnabledSwitch } from './cells/dictionary-enabled-switch'
import { useDictionariesActions } from './dictionaries-provider'

const DISPLAYED_KEYS = 10

export const dictionariesColumns: ColumnDef<DictionaryData>[] = [
  {
    id: 'select',
    header: ({ table }) => <EntitySelectHeader table={table} />,
    cell: ({ row }) => <EntitySelectCell row={row} />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    id: 'dictionary_id',
    accessorKey: 'dictionary_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('dictionary_id')} />,
    enableHiding: false,
    size: 60,
  },
  {
    id: 'dictionary_name',
    accessorKey: 'dictionary_name',
    header: '属性字典',
    cell: ({ row }) => {
      const { setOpen, setCurrentRow } = useDictionariesActions()
      return (
        <DictionaryMiniItemCell
          entity={
            row.original as {
              dictionary_name: string
              dictionary_slug: string
              dictionary_enabled: boolean
            }
          }
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('view')
          }}
        />
      )
    },
    enableHiding: false,
    size: 200,
  },
  {
    id: 'dict_collection',
    accessorKey: 'dict_collection',
    header: '属性集合',
    cell: ({ row }) => {
      const collection = row.getValue('dict_collection') as
        | Record<string, unknown>
        | undefined
      const count = collection ? Object.keys(collection).length : 0
      return (
        <span className='rounded-md bg-amber-100 p-1.5 pb-1 text-sm text-amber-800 tabular-nums dark:bg-amber-900 dark:text-amber-100'>
          {count} 项
        </span>
      )
    },
    size: 80,
    meta: { className: 'text-center' },
  },
  {
    id: 'dict_keys',
    accessorKey: 'dict_collection',
    header: '属性键',
    cell: ({ row }) => {
      const collection = row.getValue('dict_collection') as
        | Record<string, unknown>
        | undefined
      if (!collection) return <span className='text-muted-foreground'>-</span>
      const keys = Object.keys(collection)
      if (keys.length === 0)
        return <span className='text-muted-foreground'>-</span>
      return (
        <div className='flex flex-wrap gap-1'>
          {keys.slice(0, DISPLAYED_KEYS).map((key, idx) => (
            <span key={idx} className='rounded bg-muted px-1.5 py-0.5 text-xs'>
              {key}
            </span>
          ))}
          {keys.length > DISPLAYED_KEYS && (
            <span className='text-xs text-muted-foreground'>
              +{keys.length - DISPLAYED_KEYS}
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
    id: 'dictionary_enabled',
    accessorKey: 'dictionary_enabled',
    header: '开关',
    cell: ({ row }) => <DictionaryEnabledSwitch dictionary={row.original} />,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    enableHiding: false,
    size: 60,
  },
  {
    id: 'actions',
    enableHiding: false,
    header: '操作',
    cell: ({ row }) => <DictionariesRowActions row={row} />,
    size: 54,
  },
]
