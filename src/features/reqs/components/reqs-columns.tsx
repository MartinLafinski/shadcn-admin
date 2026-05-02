// 图标
// 表格列
import { ColumnDef } from '@tanstack/react-table'
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
import { reqResultTypeDict } from '@/features/reqs/data/labels'
// 请求数据结构
import { ReqData } from '@/features/reqs/data/schemas'
// 请求状态
import { useReqs } from './reqs-provider'

/**
 * 请求列表表格列定义
 *
 * 定义了请求管理页面表格的所有列，包括：
 * - 选择列：支持全选和单选
 * - 基础信息列：请求ID、任务ID、标题
 * - 请求信息列：URL、HTTP方法
 * - 状态列：请求结果状态
 * - 时间列：发布日期、发生时间
 * - 错误信息列：异常类型、异常消息
 * - 弃用信息列：弃用类型、弃用消息
 * - 操作列：信息查看
 *
 * 使用 TanStack Table 的 ColumnDef 类型定义
 */
export const reqsColumns: ColumnDef<ReqData>[] = [
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
   * 请求ID列 - 显示请求的唯一标识符
   * 居中显示，便于快速识别
   */
  {
    accessorKey: 'req_id',
    header: '请求ID',
    cell: ({ row }) => (
      <div className='text-center'>{row.getValue('req_id') || '-'}</div>
    ),
  },
  /**
   * 任务ID列 - 显示关联的任务ID
   */
  {
    accessorKey: 'task_id',
    header: '任务ID',
    cell: ({ row }) => (
      <div className='text-center'>{row.getValue('task_id') || '-'}</div>
    ),
  },
  /**
   * 标题列 - 显示请求的标题
   */
  {
    accessorKey: 'title',
    header: '标题',
    cell: ({ row }) => {
      const req = row.original // 获取当前行的原始数据
      const url = req.url as string
      const title = (row.getValue('title') as string) || '-'
      return (
        <div className='flex flex-col'>
          <div className='font-semibold'>{title}</div>
          {url ? (
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='block max-w-sm cursor-pointer truncate text-sm text-blue-600 hover:text-blue-800 hover:underline'
              title={url}
            >
              {url}
            </a>
          ) : (
            <span className='text-gray-400'>-</span>
          )}
        </div>
      )
    },
  },
  // /**
  //  * URL列 - 显示请求的URL，可点击
  //  */
  // {
  //   accessorKey: 'url',
  //   header: 'URL',
  //   cell: ({ row }) => {
  //     const url = row.getValue('url') as string
  //     return url ? (
  //       <a
  //         href={url}
  //         target="_blank"
  //         rel="noopener noreferrer"
  //         className="max-w-xs truncate text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer block"
  //         title={url}
  //       >
  //         {url}
  //       </a>
  //     ) : (
  //       <span className="text-gray-400">-</span>
  //     )
  //   },
  //   enableHiding: true,  // 添加此行以允许隐藏该列
  // },
  /**
   * 信息列 - 提供查看请求详细信息的入口
   * 点击信息图标按钮可以打开详细信息对话框
   */
  {
    id: 'info',
    enableHiding: false, // 信息列不允许隐藏
    header: '详情',
    cell: ({ row }) => {
      const req = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useReqs() // 使用请求上下文状态
      return (
        <Button
          variant='ghost'
          size='icon'
          onClick={() => {
            setCurrentRow(req) // 设置当前选中的行数据
            setOpen('view') // 打开配置信息对话框
          }}
        >
          <InfoIcon className='h-4 w-4' />
        </Button>
      )
    },
  },
  /**
   * HTTP方法列 - 显示请求的HTTP方法
   */
  {
    accessorKey: 'method',
    header: 'HTTP方法',
    cell: ({ row }) => {
      const method = row.getValue('method') as string
      return method ? (
        <Badge variant='outline'>{method}</Badge>
      ) : (
        <span className='text-gray-400'>-</span>
      )
    },
  },
  /**
   * 结果类型 - 显示请求的结果类型
   */
  {
    accessorKey: 'result_type',
    header: '结果类型',
    cell: ({ row }) => {
      const req = row.original // 获取当前行的原始数据
      const resultTypeValue = req.succeed
        ? 'succeed'
        : req.exp_type
          ? 'failed'
          : req.discard_type
            ? 'discarded'
            : undefined
      const resultType = reqResultTypeDict[resultTypeValue || 'succeed']
      return (
        <Badge variant='outline' className={cn('mr-2', resultType.className)}>
          {<resultType.icon className='size-8' />}
          {resultType.label}
        </Badge>
      )
    },
  },
  /**
   * 结果分类 - 显示请求结果分类
   */
  {
    accessorKey: 'result_category',
    header: '结果分类',
    cell: ({ row }) => {
      const req = row.original // 获取当前行的原始数据
      // if (req.succeed) {
      //   return (
      //     <span className="text-gray-400">{req.page_type as string}</span>
      //   )
      // }
      const expType = req.exp_type as string
      const discardType = req.discard_type as string
      const pageType = req.page_type as string

      if (expType) {
        return <Badge variant='destructive'>{expType}</Badge>
      }

      if (discardType) {
        return (
          <Badge variant='secondary' className='text-amber-600'>
            {discardType}
          </Badge>
        )
      }

      if (pageType) {
        return (
          <Badge className='bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'>
            {pageType}
          </Badge>
        )
      }
      return <span className='text-gray-400'>-</span>
    },
  },

  // /**
  //  * 请求结果状态列 - 显示请求的执行结果状态
  //  * 支持过滤功能，可筛选不同状态的请求
  //  */
  // {
  //   id: 'succeed',
  //   accessorKey: 'succeed',
  //   header: '结果状态',
  //   cell: ({ row }) => {
  //     const succeed = row.getValue('succeed') as boolean
  //     const resultType = succeed ? 'succeed' : (row.getValue('exp_type') ? 'failed' : (row.getValue('discard_type') ? 'discarded' : undefined))
  //     const resultTypeDetail = !!resultType ? reqResultTypeDict[resultType] : {
  //       value: undefined,
  //       label: '未知',
  //       icon: InfoIcon,
  //       className: 'bg-gray-600 text-white',
  //     }
  //
  //     return (
  //       <div className='flex space-x-2'>
  //         <Badge variant='outline' className={cn('capitalize', resultTypeDetail.className)}>
  //           {resultTypeDetail.label}
  //         </Badge>
  //       </div>
  //     )
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id)) // 自定义过滤函数
  //   },
  // },

  // /**
  //  * 异常类型列 - 显示请求失败的异常类型
  //  */
  // {
  //   accessorKey: 'exp_type',
  //   header: '异常类型',
  //   cell: ({ row }) => {
  //     const expType = row.getValue('exp_type') as string
  //     return expType ? (
  //       <Badge variant='destructive'>{expType}</Badge>
  //     ) : (
  //       <span className="text-gray-400">-</span>
  //     )
  //   },
  // },
  // /**
  //  * 异常消息列 - 显示请求失败的异常消息
  //  */
  // {
  //   accessorKey: 'exp_msg',
  //   header: '异常消息',
  //   cell: ({ row }) => {
  //     const expMsg = row.getValue('exp_msg') as string
  //     return expMsg ? (
  //       <div className="max-w-xs truncate text-sm text-red-600" title={expMsg}>
  //         {expMsg}
  //       </div>
  //     ) : (
  //       <span className="text-gray-400">-</span>
  //     )
  //   },
  // },
  // /**
  //  * 弃用类型列 - 显示请求被弃用的类型
  //  */
  // {
  //   accessorKey: 'discard_type',
  //   header: '弃用类型',
  //   cell: ({ row }) => {
  //     const discardType = row.getValue('discard_type') as string
  //     return discardType ? (
  //       <Badge variant='secondary'>{discardType}</Badge>
  //     ) : (
  //       <span className="text-gray-400">-</span>
  //     )
  //   },
  // },
  /**
   * 弃用消息列 - 显示请求被弃用的消息
   */
  {
    accessorKey: 'msg',
    header: '详情',
    cell: ({ row }) => {
      const req = row.original // 获取当前行的原始数据
      const discardMsg = req.discard_msg as string
      const expMsg = req.exp_msg as string
      const msg = expMsg || discardMsg
      return msg ? (
        <div className='max-w-sm text-sm whitespace-pre-wrap text-amber-600'>
          {msg}
        </div>
      ) : (
        <span className='text-gray-400'>-</span>
      )
    },
  },
  /**
   * 发布日期列 - 显示请求的发布日期
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'published_at',
    header: '发布日期',
    cell: ({ row }) => {
      const publishedAt = row.getValue('published_at') as string
      return publishedAt ? (
        <SmartDatetime date={publishedAt} timezone='Asia/Shanghai' />
      ) : (
        <span className='text-gray-400'>-</span> // 如果没有时间则显示占位符
      )
    },
  },
  /**
   * 发生时间列 - 显示请求的发生时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'occurred_at',
    header: '发生时间',
    cell: ({ row }) => {
      const occurredAt = row.getValue('occurred_at') as string
      return occurredAt ? (
        <SmartDatetime date={occurredAt} timezone='Asia/Shanghai' />
      ) : (
        <span className='text-gray-400'>-</span> // 如果没有时间则显示占位符
      )
    },
  },
]
