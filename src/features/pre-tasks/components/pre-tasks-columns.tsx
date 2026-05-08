// 图标
// 表格列
import { type ColumnDef } from '@tanstack/react-table'
import { InfoIcon } from 'lucide-react'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 复选框控件
import { Checkbox } from '@/components/ui/checkbox.tsx'
// 自定义时间控件
import { SmartDatetime } from '@/components/smart/datetime.tsx'
// 入口点数据结构
import { type EntrypointItemData } from '@/features/entrypoints/data/schemas'
// 准任务数据结构
import { type PreTaskData } from '@/features/pre-tasks/data/schemas'
// 网站数据结构
import { type WebsiteItemData } from '@/features/websites/data/schemas'
// 准任务状态
import { usePreTasks } from './pre-tasks-provider'

/**
 * 准任务列表表格列定义
 *
 * 定义了准任务管理页面表格的所有列，包括：
 * - 选择列：支持全选和单选
 * - 基础信息列：准任务ID、爬虫类型
 * - 关联信息列：网站、入口点
 * - 时间列：触发时间、采集结束时间
 * - 其他列：优先级
 * - 操作列：信息查看
 *
 * 使用 TanStack Table 的 ColumnDef 类型定义
 */
export const preTasksColumns: ColumnDef<PreTaskData>[] = [
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
   * 准任务ID列 - 显示准任务的唯一标识符
   * 居中显示，便于快速识别
   */
  {
    accessorKey: 'pre_task_id',
    header: '准任务ID',
    cell: ({ row }) => (
      <div className='text-left'>{row.getValue('pre_task_id')}</div>
    ),
  },
  // /**
  //  * 爬虫类型列 - 显示爬虫类型
  //  */
  // {
  //   accessorKey: 'spider_type',
  //   header: '爬虫类型',
  //   cell: ({ row }) => (
  //     <Badge variant='outline'>{row.getValue('spider_type')}</Badge>
  //   ),
  // },
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
      const preTask = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = usePreTasks() // 使用准任务上下文状态
      if (!website) {
        return <span>-</span>
      }
      return (
        <>
          <span>[ {website?.website_name || websiteSlug} ]</span>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              setCurrentRow(preTask) // 设置当前选中的行数据
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
      const preTask = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = usePreTasks() // 使用准任务上下文状态
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
              setCurrentRow(preTask) // 设置当前选中的行数据
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
   * 信息列 - 提供查看准任务详细信息的入口
   * 点击信息图标按钮可以打开详细信息对话框
   */
  {
    id: 'info',
    enableHiding: false, // 信息列不允许隐藏
    header: '详情',
    cell: ({ row }) => {
      const preTask = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = usePreTasks() // 使用准任务上下文状态
      return (
        <Button
          variant='ghost'
          size='icon'
          onClick={() => {
            setCurrentRow(preTask) // 设置当前选中的行数据
            setOpen('view') // 打开配置信息对话框
          }}
        >
          <InfoIcon className='h-4 w-4' />
        </Button>
      )
    },
  },
  /**
   * 触发时间列 - 显示准任务何时之后才能被触发
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
   * 采集结束时间列 - 显示准任务采集结束时间
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
   * 最小可用间隔列 - 显示最小可用时间间隔（秒）
   */
  {
    accessorKey: 'min_available_interval',
    header: '最小间隔(秒)',
    cell: ({ row }) => <div>{row.getValue('min_available_interval')}</div>,
  },
  // /**
  //  * 优先级列 - 显示准任务的优先级
  //  */
  // {
  //   accessorKey: 'priority',
  //   header: '优先级',
  //   cell: ({ row }) => (
  //     <div>{row.getValue('priority')}</div>
  //   ),
  // },
]
