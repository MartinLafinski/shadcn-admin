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
import { WebsitesRowActions } from './actions/websites-row-actions.tsx'
// 操作结果提示框
import { toast } from "sonner"
// 网站状态
import { useWebsites } from './websites-provider'
// 网站可用性API调用
import { useSwitchWebsiteMutation } from '@/features/websites/api/websites'
// 网站数据结构
import { WebsiteData } from '@/features/websites/data/schemas'


/**
 * 网站列表表格列定义
 * 
 * 定义了网站管理页面表格的所有列，包括：
 * - 选择列：支持全选和单选
 * - 基础信息列：ID、名称、标识、URL
 * - 状态列：启用/禁用开关
 * - 时间列：创建时间和更新时间
 * - 操作列：配置说明查看和行操作
 * 
 * 使用 TanStack Table 的 ColumnDef 类型定义
 */
export const websitesColumns: ColumnDef<WebsiteData>[] = [
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
   * 网站ID列 - 显示网站的唯一标识符
   * 居中显示，便于快速识别
   */
  {
    accessorKey: 'website_id',
    header: '网站ID',
    cell: ({ row }) => (
        <div className="text-center">{row.getValue('website_id')}</div>
    ),
  },
  /**
   * 网站名称列 - 显示网站的显示名称
   * 使用 capitalize 类名将首字母大写
   */
  {
    accessorKey: 'website_name',
    header: '网站名称',
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue('website_name')}</div>
    ),
  },
  /**
   * 网站标识列 - 显示网站的URL友好标识符
   */
  {
    accessorKey: 'website_slug',
    header: '网站标识',
    cell: ({ row }) => <div>{row.getValue('website_slug')}</div>,
  },
  /**
   * 网站URL列 - 显示网站的访问地址
   * 如果存在URL则渲染为可点击的链接，否则显示占位符
   */
  {
    accessorKey: 'website_url',
    header: 'URL',
    cell: ({ row }) => {
      const url = row.getValue('website_url') as string
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
   * 网站启用状态列 - 控制网站的启用/禁用状态
   * 包含一个开关组件，点击可切换状态并发送API请求
   * 支持过滤功能，可筛选启用/禁用的网站
   */
  {
    id: 'website_enabled',
    accessorKey: 'website_enabled',
    header: '可用',
    cell: ({ row }) => {
      const website = row.original // 获取当前行的原始数据
      const switchMutation = useSwitchWebsiteMutation() // 使用网站状态切换的mutation

      /**
       * 处理开关状态变化的异步函数
       * 发送API请求切换网站状态并显示操作结果
       */
      const handleToggle = async (website_enabled: boolean) => {
        await switchMutation.mutateAsync({
          websiteId: website.website_id,
          data: {
            website_enabled: website_enabled
          },
        })
        .then((res) => {
          toast.success(`网站 ${res.website_name} 状态切换成功`) // 操作成功提示
        })
        .catch((error) => {
          console.error(`网站 ${website.website_name} 状态切换失败:`, error) // 记录错误日志
          toast.error(`网站 ${website.website_name} 状态切换失败`) // 操作失败提示
        })
      }

      return (
        <Switch
          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
          checked={row.getValue('website_enabled')}
          onCheckedChange={handleToggle}
        />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id)) // 自定义过滤函数
    },
  },
  /**
   * 创建时间列 - 显示网站创建时间
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
   * 更新时间列 - 显示网站最后更新时间
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
   * 配置说明列 - 提供查看网站配置和说明的入口
   * 点击信息图标按钮可以打开配置信息对话框
   */
  {
    id: 'info',
    enableHiding: false, // 信息列不允许隐藏
    header: '配置说明',
    cell: ({ row }) => {
      const website = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useWebsites() // 使用网站上下文状态
      return (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            setCurrentRow(website) // 设置当前选中的行数据
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
    cell: ({ row }) => <WebsitesRowActions row={row} />,
  },
]