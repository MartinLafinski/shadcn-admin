// 图标
import { InfoIcon } from 'lucide-react'
// 表格列
import { ColumnDef } from '@tanstack/react-table'
// 按钮控件
import { Button } from "@/components/ui/button.tsx"
// 开关控件
import { Switch } from '@/components/ui/switch'
// 复选框控件
import { Checkbox } from "@/components/ui/checkbox.tsx"
// 自定义时间控件
import { SmartDatetime } from "@/components/smart/datetime.tsx"
// 自定义行操作控件
import { EntrypointsRowActions } from './actions/entrypoints-row-actions.tsx'
// 操作结果提示框
import { toast } from "sonner"
// 入口点状态
import { useEntrypoints } from './entrypoints-provider'
// 入口点可用性API调用
import { useSwitchEntrypointMutation } from '@/features/entrypoints/api/entrypoints'
// 入口点数据结构
import { EntrypointData } from '@/features/entrypoints/data/schemas'
// 网站数据结构
import { WebsiteItemData } from '@/features/websites/data/schemas'


/**
 * 入口点列表表格列定义
 * 
 * 定义了入口点管理页面表格的所有列，包括：
 * - 选择列：支持全选和单选
 * - 基础信息列：ID、名称、标识、URL
 * - 状态列：启用/禁用开关
 * - 时间列：创建时间和更新时间
 * - 操作列：配置说明查看和行操作
 * 
 * 使用 TanStack Table 的 ColumnDef 类型定义
 */
export const entrypointsColumns: ColumnDef<EntrypointData>[] = [
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
   * 入口点ID列 - 显示入口点的唯一标识符
   * 居中显示，便于快速识别
   */
  {
    accessorKey: 'entrypoint_id',
    header: '入口点ID',
    cell: ({ row }) => (
        <div className="text-center">{row.getValue('entrypoint_id')}</div>
    ),
  },
  /**
   * 入口点名称列 - 显示入口点的显示名称
   * 使用 capitalize 类名将首字母大写
   */
  {
    accessorKey: 'entrypoint_name',
    header: '入口点名称',
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue('entrypoint_name')}</div>
    ),
  },
  /**
   * 入口点标识列 - 显示入口点的URL友好标识符
   */
  {
    accessorKey: 'entrypoint_slug',
    header: '入口点标识',
    cell: ({ row }) => <div>{row.getValue('entrypoint_slug')}</div>,
  },
  /**
   * 网站列 - 显示网站名称
   */
  {
    accessorKey: 'website',
    header: '所属网站',
    cell: ({ row }) => {
      const website = row.getValue('website') as WebsiteItemData | null
      const entrypoint = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useEntrypoints() // 使用入口点上下文状态
      if (!website) {
        return (<span>-</span>)
      }
      return (
        <>
          <span>[ {website?.website_name || '-'} ]</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setCurrentRow(entrypoint) // 设置当前选中的行数据
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
   * 入口点URL列 - 显示入口点的访问地址
   * 如果存在URL则渲染为可点击的链接，否则显示占位符
   */
  {
    accessorKey: 'entrypoint_url',
    header: 'URL',
    cell: ({ row }) => {
      const url = row.getValue('entrypoint_url') as string
      return url ? (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {url}
        </a>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
  },
  /**
   * 入口点启用状态列 - 控制入口点的启用/禁用状态
   * 包含一个开关组件，点击可切换状态并发送API请求
   * 支持过滤功能，可筛选启用/禁用的入口点
   */
  {
    id: 'entrypoint_enabled',
    accessorKey: 'entrypoint_enabled',
    header: '可用',
    cell: ({ row }) => {
      const entrypoint = row.original // 获取当前行的原始数据
      const switchMutation = useSwitchEntrypointMutation() // 使用入口点状态切换的mutation

      /**
       * 处理开关状态变化的异步函数
       * 发送API请求切换入口点状态并显示操作结果
       */
      const handleToggle = async (entrypoint_enabled: boolean) => {
        await switchMutation.mutateAsync({
          entrypointId: entrypoint.entrypoint_id,
          data: {
            entrypoint_enabled: entrypoint_enabled
          },
        })
        .then((res) => {
          toast.success(`入口点 ${res.entrypoint_name} 状态切换成功`) // 操作成功提示
        })
        .catch((error) => {
          console.error(`入口点 ${entrypoint.entrypoint_name} 状态切换失败:`, error) // 记录错误日志
          toast.error(`入口点 ${entrypoint.entrypoint_name} 状态切换失败`) // 操作失败提示
        })
      }

      return (
        <Switch
          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
          checked={row.getValue('entrypoint_enabled')}
          onCheckedChange={handleToggle}
        />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id)) // 自定义过滤函数
    },
  },
  /**
   * 起始时间列 - 显示入口点最近起始时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'begin_at',
    header: '起始时间',
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
   * 结束时间列 - 显示入口点最近结束时间
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
   * 创建时间列 - 显示入口点创建时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => {
      const createdAt = row.getValue('created_at') as string
      return createdAt ? (
          <SmartDatetime date={createdAt} timezone="Asia/Shanghai" />
      ) : (
          <span className="text-gray-400">-</span> // 如果没有时间则显示占位符
      )
    },
  },
  /**
   * 更新时间列 - 显示入口点最后更新时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'updated_at',
    header: '更新时间',
    cell: ({ row }) => {
      const updatedAt = row.getValue('updated_at') as string
      return updatedAt ? (
          <SmartDatetime date={updatedAt} timezone="Asia/Shanghai" />
      ) : (
          <span className="text-gray-400">-</span> // 如果没有时间则显示占位符
      )
    },
  },
  /**
   * 配置说明列 - 提供查看入口点配置和说明的入口
   * 点击信息图标按钮可以打开配置信息对话框
   */
  {
    id: 'info',
    enableHiding: false, // 信息列不允许隐藏
    header: '集合说明',
    cell: ({ row }) => {
      const entrypoint = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useEntrypoints() // 使用入口点上下文状态
      return (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            setCurrentRow(entrypoint) // 设置当前选中的行数据
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
   * 如编辑、删除等操作
   */
  {
    id: 'actions',
    enableHiding: false, // 操作列不允许隐藏
    cell: ({ row }) => <EntrypointsRowActions row={row} />,
  },
]