import type { ColumnDef, Row } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
import { EntityEnabledStatusCell } from '@/components/smart/cells/entity-enabled-status-cell'
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
import { EntityInheritStatusCell } from '@/components/smart/cells/entity-inherit-status-cell'
import { EntityLimitedCell } from '@/components/smart/cells/entity-limited-cell'
import { EntityLockedCell } from '@/components/smart/cells/entity-locked-cell'
import { EntityPausedCell } from '@/components/smart/cells/entity-paused-cell'
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
import { EntitySelfStatusCell } from '@/components/smart/cells/entity-self-status-cell'
import { EntitySpiderTaskBarCell } from '@/components/smart/cells/entity-spider-task-bar-cell'
import { EntitySpiderTaskBarHeader } from '@/components/smart/cells/entity-spider-task-bar-header'
import { EntrypointMiniItemCell } from '@/components/smart/cells/entrypoint-mini-item-cell'
import { PrejobMiniItemCell } from '@/components/smart/cells/prejob-mini-item-cell'
import { WebsiteMiniItemCell } from '@/components/smart/cells/website-mini-item-cell'
import { levelLabels } from '../data/labels'
import type { PrejobItemData } from '../data/schemas'
import { PrejobsRowActions } from './actions/prejobs-row-actions'
import { PrejobEnabledSwitch } from './cells/prejob-enabled-switch'
import { usePrejobsActions } from './prejobs-provider'

export const prejobsColumns: ColumnDef<PrejobItemData>[] = [
  {
    id: 'select',
    header: ({ table }) => <EntitySelectHeader table={table} />,
    cell: ({ row }) => <EntitySelectCell row={row} />,
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'prejob_id',
    accessorKey: 'prejob_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('prejob_id')} />,
    enableHiding: false,
    size: 60,
  },
  {
    id: 'prejob_name',
    accessorKey: 'prejob_name',
    header: '预备作业',
    cell: ({ row }) => {
      const { setOpen, setCurrentRow } = usePrejobsActions()
      return (
        <PrejobMiniItemCell
          entity={row.original}
          onClick={() => {
            setCurrentRow(row.original)
            setOpen('configInfo')
          }}
        />
      )
    },
    enableHiding: false,
    size: 200,
  },
  {
    id: 'website',
    accessorKey: 'entrypoint',
    header: '网站',
    cell: ({ row }) => (
      <WebsiteMiniItemCell
        website={row.original.entrypoint?.website || null}
        asLink={true}
      />
    ),
    size: 120,
  },
  {
    id: 'entrypoint',
    accessorKey: 'entrypoint',
    header: '入口点',
    cell: ({ row }) =>
      row.original.entrypoint ? (
        <EntrypointMiniItemCell entrypoint={row.original.entrypoint} />
      ) : (
        <span>-</span>
      ),
    size: 120,
  },
  {
    id: 'prejob_status_mini',
    accessorKey: 'prejob_status_mini',
    header: '聚合状态',
    cell: ({ row }) => <EntityInheritStatusCell entity={row.original} />,
    enableHiding: false,
    size: 40,
  },
  {
    id: '爬虫任务分布',
    accessorKey: '爬虫任务分布',
    header: () => <EntitySpiderTaskBarHeader />,
    cell: ({ row }) => <EntitySpiderTaskBarCell taskCounter={row.original} />,
    size: 150,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'prejob_level',
    accessorKey: 'prejob_level',
    header: '优先级',
    cell: ({ row }) => {
      const level = row.getValue('prejob_level') as string
      const label = levelLabels.find((l) => l.value === level)
      return label ? (
        <Badge variant='ghost' className={label.className}>
          {label.label} <label.icon className='ml-1 h-3 w-3' />
        </Badge>
      ) : (
        <span>-</span>
      )
    },
    size: 80,
  },
  {
    id: 'prejob_enabled_status',
    accessorKey: 'prejob_enabled_status',
    header: '可用',
    cell: ({ row }) => (
      <EntityEnabledStatusCell entity_type='prejob' entity={row.original} />
    ),
    size: 40,
  },
  {
    id: 'prejob_locked',
    accessorKey: 'prejob_locked',
    header: '锁定',
    cell: ({ row }) => (
      <EntityLockedCell entity_type='prejob' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
  },
  {
    id: 'prejob_paused',
    accessorKey: 'prejob_paused',
    header: '运转',
    cell: ({ row }) => (
      <EntityPausedCell entity_type='prejob' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
  },
  {
    id: 'prejob_limited',
    accessorKey: 'prejob_limited',
    header: '未限',
    cell: ({ row }) => (
      <EntityLimitedCell entity_type='prejob' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('created_at')} />,
    size: 140,
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: '更新时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('updated_at')} />,
    size: 140,
  },
  {
    id: 'prejob_status',
    accessorKey: 'prejob_status',
    header: '自身状态',
    cell: ({ row }) => (
      <EntitySelfStatusCell entity_type='prejob' entity={row.original} />
    ),
    enableHiding: false,
    size: 50,
  },
  {
    id: 'prejob_enabled',
    accessorKey: 'prejob_enabled',
    header: '开关',
    cell: ({ row }) => <PrejobEnabledSwitch prejob={row.original} />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
    size: 60,
    maxSize: 60,
  },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => <PrejobsRowActions row={row as Row<PrejobItemData>} />,
    size: 54,
    maxSize: 54,
    enableSorting: false,
    enableHiding: false,
  },
]
