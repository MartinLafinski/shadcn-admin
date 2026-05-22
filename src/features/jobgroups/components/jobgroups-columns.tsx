import type { ColumnDef, Row } from '@tanstack/react-table'
import { ListTodo } from 'lucide-react'
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
import { EntityEnabledStatusCell } from '@/components/smart/cells/entity-enabled-status-cell'
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
import { EntityInheritStatusCell } from '@/components/smart/cells/entity-inherit-status-cell'
import { EntityItemCountCell } from '@/components/smart/cells/entity-items-count-cell'
import { EntityLimitedCell } from '@/components/smart/cells/entity-limited-cell'
import { EntityLockedCell } from '@/components/smart/cells/entity-locked-cell'
import { EntityPausedCell } from '@/components/smart/cells/entity-paused-cell'
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
import { EntitySelfStatusCell } from '@/components/smart/cells/entity-self-status-cell'
import { EntitySpiderTaskBarCell } from '@/components/smart/cells/entity-spider-task-bar-cell'
import { EntitySpiderTaskBarHeader } from '@/components/smart/cells/entity-spider-task-bar-header'
import { EntitySpiderTasksPieCell } from '@/components/smart/cells/entity-spider-tasks-pie-cell'
import { JobGroupMiniItemCell } from '@/components/smart/cells/jobgroup-mini-item-cell'
import type { JobGroupItemData } from '../data/schemas'
import { JobGroupsRowActions } from './actions/jobgroups-row-actions'
import { JobGroupEnabledSwitch } from './cells/jobgroup-enabled-switch'
import { useJobGroupsActions } from './jobgroups-provider'

export const jobGroupsColumns: ColumnDef<JobGroupItemData>[] = [
  {
    id: 'select',
    header: ({ table }) => <EntitySelectHeader table={table} />,
    cell: ({ row }) => <EntitySelectCell row={row} />,
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'jobgroup_id',
    accessorKey: 'jobgroup_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('jobgroup_id')} />,
    enableHiding: false,
    size: 60,
  },
  {
    id: 'jobgroup_name',
    accessorKey: 'jobgroup_name',
    header: '作业分组',
    cell: ({ row }) => {
      const group = row.original
      const { setOpen, setCurrentRow } = useJobGroupsActions()
      return (
        <JobGroupMiniItemCell
          group={group}
          isPrimary={true}
          onClick={() => {
            setCurrentRow(group)
            setOpen('configInfo')
          }}
        />
      )
    },
    enableHiding: false,
    size: 200,
  },
  {
    id: 'jobgroup_status_mini',
    accessorKey: 'jobgroup_status_mini',
    header: '聚合状态',
    cell: ({ row }) => <EntityInheritStatusCell entity={row.original} />,
    enableHiding: false,
    size: 40,
  },
  {
    id: 'prejob_count',
    accessorKey: 'prejob_count',
    header: '预备作业',
    cell: ({ row }) => (
      <EntityItemCountCell
        count={row.getValue('prejob_count')}
        to='/prejobs'
        searchParams={{ jobgroup_id: row.original.jobgroup_id }}
        icon={ListTodo}
        className='bg-green-100 text-green-900 dark:bg-green-300/70'
      />
    ),
    size: 60,
    meta: {
      className: 'border-r-1',
    },
  },
  {
    id: 'jobgroup_spider_task_pie',
    accessorKey: 'jobgroup_spider_task_pie',
    header: '在线/上限',
    cell: ({ row }) => (
      <EntitySpiderTasksPieCell
        workingSpiders={row.original.working_spider_task_count}
        maxSpiders={row.original.jobgroup_max_spider_task_count}
      />
    ),
    size: 60,
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
    id: 'jobgroup_enabled_status',
    accessorKey: 'jobgroup_enabled_status',
    header: '可用',
    cell: ({ row }) => (
      <EntityEnabledStatusCell entity_type='jobgroup' entity={row.original} />
    ),
    size: 40,
  },
  {
    id: 'jobgroup_locked',
    accessorKey: 'jobgroup_locked',
    header: '锁定',
    cell: ({ row }) => (
      <EntityLockedCell entity_type='jobgroup' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
  },
  {
    id: 'jobgroup_paused',
    accessorKey: 'jobgroup_paused',
    header: '运转',
    cell: ({ row }) => (
      <EntityPausedCell entity_type='jobgroup' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
  },
  {
    id: 'jobgroup_limited',
    accessorKey: 'jobgroup_limited',
    header: '未限',
    cell: ({ row }) => (
      <EntityLimitedCell entity_type='jobgroup' entity={row.original} />
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
    id: 'jobgroup_status',
    accessorKey: 'jobgroup_status',
    header: '自身状态',
    cell: ({ row }) => (
      <EntitySelfStatusCell entity_type='jobgroup' entity={row.original} />
    ),
    enableHiding: false,
    size: 50,
  },
  {
    id: 'jobgroup_enabled',
    accessorKey: 'jobgroup_enabled',
    header: '开关',
    cell: ({ row }) => <JobGroupEnabledSwitch jobGroup={row.original} />,
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
    cell: ({ row }) => (
      <JobGroupsRowActions row={row as Row<JobGroupItemData>} />
    ),
    size: 54,
    maxSize: 54,
    enableSorting: false,
    enableHiding: false,
  },
]
