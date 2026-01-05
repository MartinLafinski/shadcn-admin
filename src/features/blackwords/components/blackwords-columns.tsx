// 图标
import { InfoIcon } from 'lucide-react'
// 表格列
import { ColumnDef } from '@tanstack/react-table'
// 复选框控件
import { Checkbox } from '@/components/ui/checkbox'
// 按钮控件
import { Button } from "@/components/ui/button.tsx"
// 开关控件
import { Switch } from '@/components/ui/switch'
// 徽标控件
import { Badge } from '@/components/ui/badge'
// 自定义时间控件
import { SmartDatetime } from "@/components/smart/datetime.tsx"
// 自定义行操作控件
import { BlackwordsRowActions } from './actions/blackwords-row-actions'
// 敏感词状态
import { useBlackwords } from "./blackwords-provider.tsx"
// 敏感词数据结构
import { BlackwordData } from '@/features/blackwords/data/schemas'
// 敏感词可用性API调用
import { useSwitchBlackwordMutation } from '@/features/blackwords/api/blackwords'
// 操作结果提示框
import { toast } from 'sonner'

export const blackwordsColumns: ColumnDef<BlackwordData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => {
          table.toggleAllRowsSelected(!!value)
        }}
        aria-label="全选"
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="行选择"
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'blackwords_id',
    header: 'ID',
  },
  {
    accessorKey: 'blackwords_name',
    header: '敏感词名称',
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue('blackwords_name')}</div>
    ),
  },
  {
    accessorKey: 'blackwords_slug',
    header: '标识符',
  },
  {
    accessorKey: 'blackwords_collection',
    header: '敏感词集合',
    cell: ({ row }) => {
      const collection = row.original.blackwords_collection
      const displayItems = collection && collection.length > 0 ? collection.slice(0, 3) : []
      const remainingCount = collection && collection.length > 3 ? collection.length - 3 : 0

      return (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {displayItems.map((item: string, index: number) => (
            <Badge key={index} variant="outline" className="text-xs">
              {item}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" className="bg-blue-500 text-white dark:bg-blue-600 text-xs">
              +{remainingCount}
            </Badge>
          )}
          {collection && collection.length === 0 && (
            '- '
          )}
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
              blackwords_enabled: enabled
            }
          })
          toast.success(`敏感词已${enabled ? '启用' : '禁用'}`)
        } catch (error) {
          console.error(`敏感词 ${blackword.blackwords_name} 状态切换失败:`, error) // 记录错误日志
          toast.error(`敏感词 ${blackword.blackwords_name} 状态切换失败`)
        }
      }
      
      return (
        <div className="flex items-center">
          <Switch
            checked={blackword.blackwords_enabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
          />
          {/*<span className="ml-2">*/}
          {/*  <Badge variant={blackword.blackwords_enabled ? "default" : "secondary"}>*/}
          {/*    {blackword.blackwords_enabled ? '启用' : '禁用'}*/}
          {/*  </Badge>*/}
          {/*</span>*/}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id)) // 自定义过滤函数
    },
  },
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
  {
    id: 'info',
    enableHiding: false, // 信息列不允许隐藏
    header: '配置说明',
    cell: ({ row }) => {
      const blackwords = row.original // 获取当前行的原始数据
      const { setOpen, setCurrentRow } = useBlackwords() // 使用网站上下文状态
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setCurrentRow(blackwords) // 设置当前选中的行数据
            setOpen('info') // 打开配置信息对话框
          }}
        >
          <InfoIcon className="h-4 w-4" />
        </Button>
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <BlackwordsRowActions row={row} />,
  },
]