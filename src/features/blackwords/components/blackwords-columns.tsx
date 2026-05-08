// 图标
// 表格列
import { type ColumnDef } from '@tanstack/react-table'
import { InfoIcon } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 徽标控件
import { Badge } from '@/components/ui/badge'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 复选框控件
import { Checkbox } from '@/components/ui/checkbox'
// 开关控件
import { Switch } from '@/components/ui/switch'
// 自定义时间控件
import { DatetimeCell } from '@/components/smart/cells/datetime-cell'
// 敏感词可用性API调用
import { useSwitchBlackwordMutation } from '@/features/blackwords/api/blackwords'
// 敏感词数据结构
import { type BlackwordData } from '@/features/blackwords/data/schemas'
// 自定义行操作控件
import { BlackwordsRowActions } from './actions/blackwords-row-actions'
// 敏感词状态
import { useBlackwords } from './blackwords-provider.tsx'

export const blackwordsColumns: ColumnDef<BlackwordData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => {
          table.toggleAllRowsSelected(!!value)
        }}
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
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: 'blackwords_id',
    header: 'ID',
    size: 60,
  },
  {
    accessorKey: 'blackwords_name',
    header: '敏感词名称',
    cell: ({ row }) => (
      <div className='font-semibold'>{row.getValue('blackwords_name')}</div>
    ),
    size: 100,
  },
  {
    accessorKey: 'blackwords_slug',
    header: '标识符',
    size: 100,
  },
  {
    accessorKey: 'blackwords_collection',
    header: '敏感词集合',
    cell: ({ row }) => {
      const collection = row.original.blackwords_collection
      const displayItems =
        collection && collection.length > 0 ? collection.slice(0, 3) : []
      const remainingCount =
        collection && collection.length > 3 ? collection.length - 3 : 0

      return (
        <div className='flex max-w-xs flex-wrap gap-1'>
          {displayItems.map((item: string, index: number) => (
            <Badge key={index} variant='outline' className='text-xs'>
              {item}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge
              variant='outline'
              className='bg-blue-500 text-xs text-white dark:bg-blue-600'
            >
              +{remainingCount}
            </Badge>
          )}
          {collection && collection.length === 0 && '- '}
        </div>
      )
      // const collection = row.original.blackwords_collection
      // return (
      //   <div className="max-w-xs truncate">
      //     {collection && collection.length > 0 ?
      //       collection.slice(0, 3).join(', ') + (collection.length > 3 ?
      //         `...(+${collection.length - 3})`
      //         : ''
      //       )
      //       :
      //       '无'
      //     }
      //   </div>
      // )
    },
  },
  {
    accessorKey: 'blackwords_enabled',
    header: '可用',
    cell: ({ row }) => {
      const blackword = row.original
      const { mutateAsync } = useSwitchBlackwordMutation()

      const handleToggle = async (enabled: boolean) => {
        try {
          await mutateAsync({
            blackwordsId: blackword.blackwords_id,
            data: {
              blackwords_enabled: enabled,
            },
          })
          toast.success(`敏感词已${enabled ? '启用' : '禁用'}`)
        } catch (error) {
          console.error(
            `敏感词 ${blackword.blackwords_name} 状态切换失败:`,
            error
          ) // 记录错误日志
          toast.error(`敏感词 ${blackword.blackwords_name} 状态切换失败`)
        }
      }

      return (
        <div className='flex items-center'>
          <Switch
            checked={blackword.blackwords_enabled}
            onCheckedChange={handleToggle}
            className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500'
          />
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id)) // 自定义过滤函数
    },
    size: 60,
    maxSize: 60,
  },
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
  {
    id: 'info',
    enableHiding: false, // 信息列不允许隐藏
    header: '配置说明',
    cell: ({ row }) => {
      const blackwords = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useBlackwords() // 使用网站上下文状态
      return (
        <Button
          variant='ghost'
          size='icon'
          onClick={() => {
            setCurrentRow(blackwords) // 设置当前选中的行数据
            setOpen('info') // 打开配置信息对话框
          }}
        >
          <InfoIcon className='h-4 w-4' />
        </Button>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <BlackwordsRowActions row={row} />,
    size: 54,
    maxSize: 54,
  },
]
