// 图标
import { InfoIcon } from 'lucide-react'
// 表格列
import { ColumnDef } from '@tanstack/react-table'
// 按钮控件
import { Button } from "@/components/ui/button.tsx"
// 复选框控件
import { Checkbox } from "@/components/ui/checkbox.tsx"
// 自定义时间控件
import { SmartDatetime } from "@/components/smart/datetime.tsx"
// // 自定义行操作控件
// import { JobsRowActions } from './actions/jobs-row-actions.tsx'
// 操作结果提示框
import { toast } from "sonner"
// 任务状态
import { useJobs } from './jobs-provider'
// 任务取消API调用
import { useCancelJobMutation, useCompleteJobMutation, useEnsureJobMutation } from '@/features/jobs/api/jobs'
// 任务数据结构
import { JobData } from '@/features/jobs/data/schemas'
// 入口点数据结构
import { EntrypointItemData } from '@/features/jobs/data/schemas'
// 网站数据结构
import { WebsiteItemData } from '@/features/jobs/data/schemas'


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
    enableHiding: false,  // 选择列不允许隐藏
  },
  /**
   * 任务ID列 - 显示任务的唯一标识符
   * 居中显示，便于快速识别
   */
  {
    accessorKey: 'task_id',
    header: '任务ID',
    cell: ({ row }) => (
        <div className="text-center">{row.getValue('task_id') || '-'}</div>
    ),
  },
  /**
   * 任务名称列 - 显示任务的显示名称
   */
  {
    accessorKey: 'task_name',
    header: '任务名称',
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue('task_name') || '-'}</div>
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
        return (<span>-</span>)
      }
      return (
        <>
          <span>[ {website?.website_name || websiteSlug || '-'} ]</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCurrentRow(job) // 设置当前选中的行数据
              setOpen('viewWebsite') // 打开配置信息对话框
            }}
          >
            <InfoIcon className="h-4 w-4" />
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
        return (<span>-</span>)
      }
      return (
        <>
          <span>[ {entrypoint?.entrypoint_name || '-'} ]</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCurrentRow(job) // 设置当前选中的行数据
              setOpen('viewEntrypoint') // 打开配置信息对话框
            }}
          >
            <InfoIcon className="h-4 w-4" />
          </Button>
        </>
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
        <span className="text-gray-400">-</span>
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
        <div>{nodeAddress}</div>
      ) : (
        <span className="text-gray-400">-</span>
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
      return uid ? (
        <div>{uid}</div>
      ) : (
        <span className="text-gray-400">-</span>
      )
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
        <div>{address}</div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  /**
   * 任务结果状态列 - 显示任务的执行结果状态
   * 支持过滤功能，可筛选不同状态的任务
   * 提供快速操作按钮：确认、完成、取消
   */
  {
    id: 'task_result_status',
    accessorKey: 'task_result_status',
    header: '状态',
    cell: ({ row }) => {
      const job = row.original // 获取当前行的原始数据
      const taskResultStatus = row.getValue('task_result_status') as string | null
      const ensureMutation = useEnsureJobMutation() // 使用任务确认的mutation
      const completeMutation = useCompleteJobMutation() // 使用任务完成的mutation
      const cancelMutation = useCancelJobMutation() // 使用任务取消的mutation

      /**
       * 处理确认任务的异步函数
       * 发送API请求确认任务并显示操作结果
       */
      const handleEnsure = async () => {
        await ensureMutation.mutateAsync({
          taskId: job.task_id!,
          data: {
            uid: null,
            address: null
          },
        })
        .then((res) => {
          toast.success(`任务 ${res.task_id} 确认成功`) // 操作成功提示
        })
        .catch((error) => {
          console.error(`任务 ${job.task_id} 确认失败:`, error) // 记录错误日志
          toast.error(`任务 ${job.task_id} 确认失败`) // 操作失败提示
        })
      }

      /**
       * 处理完成任务的异步函数
       * 发送API请求完成任务并显示操作结果
       */
      const handleComplete = async () => {
        await completeMutation.mutateAsync({
          taskId: job.task_id!,
          data: {
            end_at: null
          },
        })
        .then((res) => {
          toast.success(`任务 ${res.task_id} 完成成功`) // 操作成功提示
        })
        .catch((error) => {
          console.error(`任务 ${job.task_id} 完成失败:`, error) // 记录错误日志
          toast.error(`任务 ${job.task_id} 完成失败`) // 操作失败提示
        })
      }

      /**
       * 处理取消任务的异步函数
       * 发送API请求取消任务并显示操作结果
       */
      const handleCancel = async () => {
        await cancelMutation.mutateAsync(job.task_id!)
        .then(() => {
          toast.success(`任务 ${job.task_id} 取消成功`) // 操作成功提示
        })
        .catch((error) => {
          console.error(`任务 ${job.task_id} 取消失败:`, error) // 记录错误日志
          toast.error(`任务 ${job.task_id} 取消失败`) // 操作失败提示
        })
      }

      // 根据状态显示不同的样式和操作按钮
      const getStatusBadge = (status: string | null) => {
        switch (status) {
          case 'running':
            return (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  运行中
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleComplete}
                  disabled={completeMutation.isPending}
                >
                  完成
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                >
                  取消
                </Button>
              </div>
            )
          case 'completed':
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                已完成
              </span>
            )
          case 'canceled':
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                已取消
              </span>
            )
          default:
            return (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  待确认
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEnsure}
                  disabled={ensureMutation.isPending}
                >
                  确认
                </Button>
              </div>
            )
        }
      }

      return getStatusBadge(taskResultStatus)
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id)) // 自定义过滤函数
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
          <SmartDatetime date={createAt} timezone="Asia/Shanghai" />
      ) : (
          <span className="text-gray-400">-</span> // 如果没有时间则显示占位符
      )
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
          <SmartDatetime date={beginAt} timezone="Asia/Shanghai" />
      ) : (
          <span className="text-gray-400">-</span> // 如果没有时间则显示占位符
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
          <SmartDatetime date={endAt} timezone="Asia/Shanghai" />
      ) : (
          <span className="text-gray-400">-</span> // 如果没有时间则显示占位符
      )
    },
  },
  /**
   * 优先级列 - 显示任务优先级
   */
  {
    accessorKey: 'priority',
    header: '优先级',
    cell: ({ row }) => {
      const priority = row.getValue('priority') as number
      return (
        <div className="text-center">{priority}</div>
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
          variant="ghost" 
          size="icon" 
          onClick={() => {
            setCurrentRow(job) // 设置当前选中的行数据
            setOpen('configInfo') // 打开配置信息对话框
          }}
        >
          <InfoIcon className="h-4 w-4" />
        </Button>
      )
    }
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