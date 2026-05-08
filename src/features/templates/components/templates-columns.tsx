// 图标
// 表格列
import { type ColumnDef } from '@tanstack/react-table'
import { InfoIcon } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 复选框控件
import { Checkbox } from '@/components/ui/checkbox.tsx'
// 开关控件
import { Switch } from '@/components/ui/switch'
// 自定义时间控件
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
// 模板可用性API调用
import { useSwitchTemplateMutation } from '@/features/templates/api/templates'
// 模板数据结构
import { type TemplateData } from '@/features/templates/data/schemas'
// 自定义行操作控件
import { TemplatesRowActions } from './actions/templates-row-actions.tsx'
// 模板状态
import { useTemplates } from './templates-provider'

/**
 * 模板列表表格列定义
 *
 * 定义了模板管理页面表格的所有列，包括：
 * - 选择列：支持全选和单选
 * - 基础信息列：ID、名称、标识
 * - 状态列：启用/禁用开关
 * - 时间列：创建时间和更新时间
 * - 操作列：配置说明查看和行操作
 *
 * 使用 TanStack Table 的 ColumnDef 类型定义
 */
export const templatesColumns: ColumnDef<TemplateData>[] = [
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
    size: 40,
  },
  /**
   * 模板ID列 - 显示模板的唯一标识符
   * 居中显示，便于快速识别
   */
  {
    accessorKey: 'template_id',
    header: '模板ID',
    cell: ({ row }) => <div className=''>{row.getValue('template_id')}</div>,
    size: 60,
  },
  /**
   * 模板名称列 - 显示模板的显示名称
   * 使用 capitalize 类名将首字母大写
   */
  {
    accessorKey: 'template_name',
    header: '模板名称',
    cell: ({ row }) => (
      <div className='font-semibold'>{row.getValue('template_name')}</div>
    ),
    size: 100,
  },
  /**
   * 模板标识列 - 显示模板的URL友好标识符
   */
  {
    accessorKey: 'template_slug',
    header: '模板标识',
    cell: ({ row }) => <div>{row.getValue('template_slug')}</div>,
    size: 100,
  },
  /**
   * 模板启用状态列 - 控制模板的启用/禁用状态
   * 包含一个开关组件，点击可切换状态并发送API请求
   * 支持过滤功能，可筛选启用/禁用的模板
   */
  {
    id: 'template_enabled',
    accessorKey: 'template_enabled',
    header: '可用',
    cell: ({ row }) => {
      const template = row.original // 获取当前行的原始数据
      const switchMutation = useSwitchTemplateMutation() // 使用模板状态切换的mutation

      /**
       * 处理开关状态变化的异步函数
       * 发送API请求切换模板状态并显示操作结果
       */
      const handleToggle = async (template_enabled: boolean) => {
        await switchMutation
          .mutateAsync({
            templateId: template.template_id,
            data: {
              template_enabled: template_enabled,
            },
          })
          .then((res) => {
            toast.success(`模板 ${res.template_name} 状态切换成功`) // 操作成功提示
          })
          .catch((error) => {
            console.error(`模板 ${template.template_name} 状态切换失败:`, error) // 记录错误日志
            toast.error(`模板 ${template.template_name} 状态切换失败`) // 操作失败提示
          })
      }

      return (
        <Switch
          className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500'
          checked={row.getValue('template_enabled')}
          onCheckedChange={handleToggle}
        />
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id)) // 自定义过滤函数
    },
    size: 60,
    maxSize: 60,
  },
  /**
   * 创建时间列 - 显示模板创建时间
   * 使用 SmartDatetime 组件格式化时间，并设置为上海时区
   */
  {
    accessorKey: 'created_at',
    header: '创建时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('created_at')} />,
  },
  {
    accessorKey: 'updated_at',
    header: '更新时间',
    cell: ({ row }) => <DatetimeCell value={row.getValue('updated_at')} />,
  },
  /**
   * 配置说明列 - 提供查看模板配置和说明的入口
   * 点击信息图标按钮可以打开配置信息对话框
   */
  {
    id: 'info',
    enableHiding: false, // 信息列不允许隐藏
    header: '内容/说明',
    cell: ({ row }) => {
      const template = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useTemplates() // 使用模板上下文状态
      return (
        <Button
          variant='ghost'
          size='icon'
          onClick={() => {
            setCurrentRow(template) // 设置当前选中的行数据
            setOpen('configInfo') // 打开配置信息对话框
          }}
        >
          <InfoIcon className='h-4 w-4' />
        </Button>
      )
    },
  },
  /**
   * 操作列 - 包含行级别的操作按钮
   * 如编辑、删除等操作
   */
  {
    id: 'actions',
    enableHiding: false, // 操作列不允许隐藏
    cell: ({ row }) => <TemplatesRowActions row={row} />,
    size: 54,
    maxSize: 54,
  },
]
