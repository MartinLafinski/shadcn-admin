import type { ColumnDef } from '@tanstack/react-table'
import { SquareCodeIcon, FormInputIcon } from 'lucide-react'
import { CounterCell } from '@/components/smart/cells/counter-cell'
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
import { ParamFormMiniItemCell } from '@/components/smart/cells/param-form-mini-item-cell'
import { ParamTypeCell } from '@/components/smart/cells/param-type-cell'
import type { ParamFormItemData } from '../data/schemas'
import { ParamFormsRowActions } from './actions/param-forms-row-actions'
import { ParamFormEnabledSwitch } from './cells/param-form-enabled-switch'

export const paramFormsColumns: ColumnDef<ParamFormItemData>[] = [
  {
    id: 'select',
    header: ({ table }) => <EntitySelectHeader table={table} />,
    cell: ({ row }) => <EntitySelectCell row={row} />,
    size: 40,
    enableHiding: false,
  },
  {
    id: 'param_form_id',
    accessorKey: 'param_form_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('param_form_id')} />,
    size: 70,
  },
  {
    id: 'param_form_name',
    accessorKey: 'param_form_name',
    header: '参数要素包',
    cell: ({ row }) => (
      <ParamFormMiniItemCell
        entity={row.original}
        isPrimary={true}
        asLink={true}
      />
    ),
    size: 220,
  },
  {
    id: 'param_json_schema_items',
    accessorKey: 'param_json_schema',
    header: 'JSON 项数',
    cell: ({ row }) => {
      const schema = row.original.param_json_schema
      const count =
        schema && typeof schema === 'object' ? Object.keys(schema).length : 0
      return (
        <CounterCell
          count={count}
          icon={SquareCodeIcon}
          className='bg-amber-100 text-amber-950 dark:bg-amber-200/70'
        />
      )
    },
    size: 100,
  },
  {
    id: 'param_ui_schema_items',
    accessorKey: 'param_ui_schema',
    header: 'UI 项数',
    cell: ({ row }) => {
      const ui = row.original.param_ui_schema
      const count = ui && typeof ui === 'object' ? Object.keys(ui).length : 0
      return (
        <CounterCell
          count={count}
          icon={FormInputIcon}
          className='bg-pink-100 text-pink-950 dark:bg-pink-200/70'
        />
      )
    },
    size: 100,
  },
  {
    id: 'param_type',
    accessorKey: 'param_type',
    header: '参数类型',
    cell: ({ row }) => <ParamTypeCell value={row.getValue('param_type')} />,
    size: 130,
    meta: {
      className: 'border-r-1',
    },
  },

  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('created_at')} />,
    size: 160,
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: '更新时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('updated_at')} />,
    size: 160,
  },
  {
    id: 'param_form_enabled',
    accessorKey: 'param_form_enabled',
    header: '开关',
    cell: ({ row }) => <ParamFormEnabledSwitch row={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 60,
    maxSize: 60,
  },
  {
    id: 'actions',
    cell: ({ row }) => <ParamFormsRowActions row={row.original} />,
    size: 54,
    maxSize: 54,
    enableHiding: false,
  },
]
