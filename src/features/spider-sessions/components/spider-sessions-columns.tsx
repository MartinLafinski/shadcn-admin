import type { ColumnDef } from '@tanstack/react-table'
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
import { EntityEnabledStatusCell } from '@/components/smart/cells/entity-enabled-status-cell'
import { EntityExpiredCell } from '@/components/smart/cells/entity-expired-cell'
import { EntityIdCell } from '@/components/smart/cells/entity-id-cell'
import { EntityInheritStatusCell } from '@/components/smart/cells/entity-inherit-status-cell'
import { EntityLimitedCell } from '@/components/smart/cells/entity-limited-cell'
import { EntityLockedCell } from '@/components/smart/cells/entity-locked-cell'
import { EntityPausedCell } from '@/components/smart/cells/entity-paused-cell'
import { EntityPoolIdCell } from '@/components/smart/cells/entity-pool-id-cell'
import { EntitySelectCell } from '@/components/smart/cells/entity-select-cell'
import { EntitySelectHeader } from '@/components/smart/cells/entity-select-header'
import { EntitySelfStatusCell } from '@/components/smart/cells/entity-self-status-cell'
import { EntitySpiderTaskBarCell } from '@/components/smart/cells/entity-spider-task-bar-cell'
import { EntitySpiderTaskBarHeader } from '@/components/smart/cells/entity-spider-task-bar-header'
import { EntitySpiderTasksPieCell } from '@/components/smart/cells/entity-spider-tasks-pie-cell'
import { SpiderSessionMiniItemCell } from '@/components/smart/cells/spider-session-mini-item-cell'
// URL单元格
import { UrlCell } from '@/components/smart/cells/url-cell'
import { WebsiteMiniItemCell } from '@/components/smart/cells/website-mini-item-cell'
import type { SpiderSessionItemData } from '../data/schemas'
import { SpiderSessionsRowActions } from './actions/spider-sessions-row-actions'
import { SpiderSessionEnabledSwitch } from './cells/spider-session-enabled-switch'
import { useSpiderSessionsActions } from './spider-sessions-provider'

export const spiderSessionsColumns: ColumnDef<SpiderSessionItemData>[] = [
  {
    id: 'select',
    header: ({ table }) => <EntitySelectHeader table={table} />,
    cell: ({ row }) => <EntitySelectCell row={row} />,
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    id: 'session_id',
    accessorKey: 'session_id',
    header: 'ID',
    cell: ({ row }) => <EntityIdCell value={row.getValue('session_id')} />,
    enableHiding: false,
    size: 60,
  },

  {
    id: 'session_name',
    accessorKey: 'session_name',
    header: '会话',
    cell: ({ row }) => {
      const session = row.original
      const { setOpen, setCurrentRow } = useSpiderSessionsActions()
      return (
        <SpiderSessionMiniItemCell
          session={session}
          onClick={() => {
            setCurrentRow(session)
            setOpen('configInfo')
          }}
        />
      )
    },
    enableHiding: false,
    size: 200,
  },
  {
    id: 'session_status_mini',
    accessorKey: 'session_status_mini',
    header: '聚合状态',
    cell: ({ row }) => <EntityInheritStatusCell entity={row.original} />,
    enableHiding: false,
    size: 40,
  },

  {
    id: 'website_id',
    accessorKey: 'website_id',
    header: '网站',
    cell: ({ row }) => {
      const spiderSession = row.original
      const { setOpen, setCurrentRow } = useSpiderSessionsActions()
      return (
        <WebsiteMiniItemCell
          website={row.original.website}
          asLink={true}
          onClick={() => {
            setCurrentRow(spiderSession) // 设置当前选中的行数据
            setOpen('viewWebsite') // 打开查看网站信息对话框
          }}
        />
      )
    },
    size: 120,
  },
  {
    id: 'session_pool_id',
    accessorKey: 'session_pool_id',
    header: '会话池',
    cell: ({ row }) => (
      <EntityPoolIdCell value={row.getValue('session_pool_id')} />
    ),
    size: 70,
    meta: {
      className: 'text-center',
    },
  },
  {
    id: 'session_weight',
    accessorKey: 'session_weight',
    header: '权重',
    size: 60,
    cell: ({ getValue }) => (
      <code className='rounded-lg bg-stone-200 px-1.5 py-0.5 text-sm tabular-nums dark:bg-stone-700'>
        {(getValue() as number) || 0}
      </code>
    ),
    meta: {
      className: 'text-center border-r-1',
    },
  },
  {
    id: 'session_spider_task_pie',
    accessorKey: 'session_spider_task_pie',
    header: '在线/上限',
    cell: ({ row }) => (
      <EntitySpiderTasksPieCell
        workingSpiders={row.original.working_spider_task_count}
        maxSpiders={row.original.session_max_spider_task_count}
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
  //
  // {
  //   id: 'expired_at',
  //   accessorKey: 'expired_at',
  //   header: '时效',
  //   cell: ({ row }) => (
  //     <EntityExpiredCell entity_type='session' entity={row.original} />
  //   ),
  //   size: 40,
  // },
  {
    id: 'session_expired',
    accessorKey: 'session_expired',
    header: '时效',
    cell: ({ row }) => (
      <EntityExpiredCell entity_type='session' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
  },
  {
    id: 'session_enabled_status',
    accessorKey: 'session_enabled_status',
    header: '可用',
    cell: ({ row }) => (
      <EntityEnabledStatusCell entity_type='session' entity={row.original} />
    ),
    size: 40,
  },
  {
    id: 'session_locked',
    accessorKey: 'session_locked',
    header: '锁定',
    cell: ({ row }) => (
      <EntityLockedCell entity_type='session' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
  },
  {
    id: 'session_paused',
    accessorKey: 'session_paused',
    header: '运转',
    cell: ({ row }) => (
      <EntityPausedCell entity_type='session' entity={row.original} />
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    size: 40,
  },
  {
    id: 'session_limited',
    accessorKey: 'session_limited',
    header: '未限',
    cell: ({ row }) => (
      <EntityLimitedCell entity_type='session' entity={row.original} />
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
    id: 'session_user_agent',
    accessorKey: 'session_user_agent',
    header: 'UserAgent',
    cell: ({ row }) => {
      const on_success = row.getValue('session_user_agent') as string
      return <span>{on_success}</span>
    },
    size: 240,
  },
  {
    accessorKey: 'session_proxy',
    header: '代理',
    cell: ({ row }) => <UrlCell url={row.getValue('session_proxy')} />,
    size: 240,
    maxSize: 320,
  },
  {
    id: 'expired_at',
    accessorKey: 'expired_at',
    header: '过期时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('expired_at')} />,
    meta: {
      className: 'text-center border-r-1',
    },
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('created_at')} />,
    meta: {
      className: 'text-center',
    },
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: '更新时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('updated_at')} />,
  },
  {
    id: 'session_status',
    accessorKey: 'session_status',
    header: '自身状态',
    cell: ({ row }) => (
      <EntitySelfStatusCell entity_type='session' entity={row.original} />
    ),
    enableHiding: false,
    size: 50,
  },
  {
    id: 'session_enabled',
    accessorKey: 'session_enabled',
    header: '开关',
    cell: ({ row }) => <SpiderSessionEnabledSwitch session={row.original} />,
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
    cell: ({ row }) => <SpiderSessionsRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
    size: 54,
    maxSize: 54,
  },
]
