// 图标
// 表格列
import { type ColumnDef } from '@tanstack/react-table'
import { InfoIcon } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { Badge } from '@/components/ui/badge.tsx'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 复选框控件
import { Checkbox } from '@/components/ui/checkbox.tsx'
// 自定义时间控件
import { SmartDatetime } from '@/components/smart/datetime.tsx'
// 状态结构
import { taskStatusDetailDict } from '@/features/jobs/data/labels'
// 任务数据结构
import { type JobData } from '@/features/jobs/data/schemas'
// 入口点数据结构
import { type EntrypointItemData } from '@/features/jobs/data/schemas'
// 网站数据结构
import { type WebsiteItemData } from '@/features/jobs/data/schemas'
// // 自定义行操作控件
// import { JobsRowActions } from './actions/jobs-row-actions.tsx'
// 任务状态
import { useJobs } from './jobs-provider'

/**
 * 任务列表表格列定义
 *
 * 定义了任务管理页面表格的所有列，包括：
 * - 选择列：支持全选和单选
 * - 基础信息列：任务ID、任务名称、任务标识
 * - 关联信息列：网站、入口点、节点
 * - 状态列：任务结果状态
 * - 时间列：创建时间、采集开始时间、采集结束时间
 * - 操作列：信息查看和行操作
 *
 * 使用 TanStack Table 的 ColumnDef 类型定义
 */
export const jobsColumns: ColumnDef<JobData>[] = [
  /**
   * 选择列 - 用于批量操作
   * 包含表头全选复选框和行选择复选框
   */
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='全选'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='行选择'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false, // 选择列不支持排序
    enableHiding: false, // 选择列不允许隐藏
  },
  /**
   * 任务ID列 - 显示任务的唯一标识符
   * 居中显示，便于快速识别
   */
  {
    accessorKey: 'task_id',
    header: '任务ID',
    cell: ({ row }) => (
      <div className='text-center'>{row.getValue('task_id') || '-'}</div>
    ),
  },
  /**
   * 任务名称列 - 显示任务的显示名称
   */
  {
    accessorKey: 'task_name',
    header: '任务名称',
    cell: ({ row }) => (
      <div className='font-semibold'>{row.getValue('task_name') || '-'}</div>
    ),
  },
  /**
   * 任务标识列 - 显示任务的URL友好标识符
   */
  {
    accessorKey: 'task_slug',
    header: '任务标识',
    cell: ({ row }) => <div>{row.getValue('task_slug') || '-'}</div>,
  },
  /**
   * 网站列 - 显示网站名称
   */
  {
    accessorKey: 'website_slug',
    header: '网站',
    cell: ({ row }) => {
      const websiteSlug = row.getValue('website_slug') as string
      const entrypoint = row.getValue('entrypoint') as EntrypointItemData
      const website = entrypoint?.website as WebsiteItemData | null
      const job = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useJobs() // 使用任务上下文状态
      if (!website) {
        return <span>-</span>
      }
      return (
        <>
          <span>[ {website?.website_name || websiteSlug || '-'} ]</span>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              setCurrentRow(job) // 设置当前选中的行数据
              setOpen('viewWebsite') // 打开配置信息对话框
            }}
          >
            <InfoIcon className='h-4 w-4' />
          </Button>
        </>
      )
    },
  },
  /**
   * 入口点列 - 显示入口点名称
   */
  {
    accessorKey: 'entrypoint',
    header: '入口点',
    cell: ({ row }) => {
      const entrypoint = row.getValue('entrypoint') as EntrypointItemData
      const job = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useJobs() // 使用任务上下文状态
      if (!entrypoint) {
        return <span>-</span>
      }
      return (
        <>
          <span>[ {entrypoint?.entrypoint_name || '-'} ]</span>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              setCurrentRow(job) // 设置当前选中的行数据
              setOpen('viewEntrypoint') // 打开配置信息对话框
            }}
          >
            <InfoIcon className='h-4 w-4' />
          </Button>
        </>
      )
    },
  },
  /**
   * 信息列 - 提供查看任务详细信息的入口
   * 点击信息图标按钮可以打开详细信息对话框
   */
  {
    id: 'info',
    enableHiding: false, // 信息列不允许隐藏
    header: '详情',
    cell: ({ row }) => {
      const job = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useJobs() // 使用任务上下文状态
      return (
        <Button
          variant='ghost'
          size='icon'
          onClick={() => {
            setCurrentRow(job) // 设置当前选中的行数据
            setOpen('view') // 打开配置信息对话框
          }}
        >
          <InfoIcon className='h-4 w-4' />
        </Button>
      )
    },
  },
  /**
   * 任务结果状态列 - 显示任务的执行结果状态
   * 支持过滤功能，可筛选不同状态的任务
   * 提供快速操作按钮：确认、完成、取消
   */
  {
    id: 'task_status',
    accessorKey: 'task_status',
    header: '状态',
    cell: ({ row }) => {
      // const job = row.original // 获取当前行的原始数据
      const taskStatus = row.getValue('task_status') as string | null
      const taskStatusDetail = taskStatus
        ? taskStatusDetailDict[taskStatus]
        : {
            value: undefined,
            label: '未知',
            icon: InfoIcon,
            className: 'bg-blue-600 text-white',
          }

      return (
        <div className='flex space-x-2'>
          <Badge
            variant='outline'
            className={cn('capitalize', taskStatusDetail.className)}
          >
            {taskStatusDetail.label}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id)) // 自定义过滤函数
    },
  },
  /**
   * 采集开始时间列 - 显示任务采集开始时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'begin_at',
    header: '开始时间',
    cell: ({ row }) => {
      const beginAt = row.getValue('begin_at') as string
      return beginAt ? (
        <SmartDatetime date={beginAt} timezone='Asia/Shanghai' />
      ) : (
        <span className='text-gray-400'>-</span> // 如果没有时间则显示占位符
      )
    },
  },
  /**
   * 采集结束时间列 - 显示任务采集结束时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'end_at',
    header: '结束时间',
    cell: ({ row }) => {
      const endAt = row.getValue('end_at') as string
      return endAt ? (
        <SmartDatetime date={endAt} timezone='Asia/Shanghai' />
      ) : (
        <span className='text-gray-400'>-</span> // 如果没有时间则显示占位符
      )
    },
  },

  /**
   * Actor ID列 - 显示执行任务的Actor ID
   */
  {
    accessorKey: 'uid',
    header: 'Actor ID',
    cell: ({ row }) => {
      const uid = row.getValue('uid') as string
      return uid ? <div>{uid}</div> : <span className='text-gray-400'>-</span>
    },
  },
  /**
   * Actor地址列 - 显示Actor的网络地址
   */
  {
    accessorKey: 'address',
    header: 'Actor地址',
    cell: ({ row }) => {
      const address = row.getValue('address') as string
      return address ? (
        <div>
          {address.split(':')[0]}:
          <span className='text-sky-500'>{address.split(':')[1]}</span>
        </div>
      ) : (
        <span className='text-gray-400'>-</span>
      )
    },
  },

  /**
   * 节点ID列 - 显示执行任务的节点ID
   */
  {
    accessorKey: 'node_id',
    header: '节点ID',
    cell: ({ row }) => {
      const nodeId = row.getValue('node_id') as string
      return nodeId ? (
        <div>{nodeId}</div>
      ) : (
        <span className='text-gray-400'>-</span>
      )
    },
  },
  /**
   * 节点地址列 - 显示节点的网络地址
   */
  {
    accessorKey: 'node_address',
    header: '节点地址',
    cell: ({ row }) => {
      const nodeAddress = row.getValue('node_address') as string
      return nodeAddress ? (
        <div>
          {nodeAddress.split(':')[0]}:
          <span className='text-sky-500'>{nodeAddress.split(':')[1]}</span>
        </div>
      ) : (
        <span className='text-gray-400'>-</span>
      )
    },
  },
  /**
   * 触发时间列 - 显示任务何时之后才能被触发
   */
  {
    accessorKey: 'triggered_at',
    header: '触发时间',
    cell: ({ row }) => {
      const triggeredAt = row.getValue('triggered_at') as string
      return triggeredAt ? (
        <SmartDatetime date={triggeredAt} timezone='Asia/Shanghai' />
      ) : (
        <span className='text-gray-400'>-</span> // 如果没有时间则显示占位符
      )
    },
  },

  /**
   * 创建时间列 - 显示任务创建时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'create_at',
    header: '创建时间',
    cell: ({ row }) => {
      const createAt = row.getValue('create_at') as string
      return createAt ? (
        <SmartDatetime date={createAt} timezone='Asia/Shanghai' />
      ) : (
        <span className='text-gray-400'>-</span> // 如果没有时间则显示占位符
      )
    },
  },
  /**
   * 操作列 - 包含行级别的操作按钮
   * 如取消等操作
   */
  // {
  //   id: 'actions',
  //   enableHiding: false, // 操作列不允许隐藏
  //   cell: ({ row }) => <JobsRowActions row={row} />,
  // },
]
