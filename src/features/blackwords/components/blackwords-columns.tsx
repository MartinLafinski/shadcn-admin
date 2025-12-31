import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { BlackwordData } from '@/features/blackwords/data/schemas'
import { useSwitchBlackwordMutation } from '@/features/blackwords/api/blackwords'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { BlackwordsRowActions } from './actions/blackwords-row-actions'

export const blackwordsColumns: ColumnDef<BlackwordData>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(value) => {
          table.toggleAllRowsSelected(!!value)
        }}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
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
      return (
        <div className="max-w-xs truncate">
          {collection && collection.length > 0 ? collection.slice(0, 3).join(', ') + (collection.length > 3 ? `...(+${collection.length - 3})` : '') : '无'}
        </div>
      )
    },
  },
  {
    accessorKey: 'blackwords_enabled',
    header: '状态',
    cell: ({ row }) => {
      const blackword = row.original
      const { mutateAsync } = useSwitchBlackwordMutation()
      
      const handleToggle = async (enabled: boolean) => {
        try {
          await mutateAsync({
            blackwordsId: blackword.blackwords_id,
            data: { blackwords_enabled: enabled }
          })
          toast.success(`敏感词已${enabled ? '启用' : '禁用'}`)
        } catch (error) {
          toast.error(`操作失败: ${error}`)
        }
      }
      
      return (
        <div className="flex items-center">
          <Switch
            checked={blackword.blackwords_enabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-300"
          />
          <span className="ml-2">
            <Badge variant={blackword.blackwords_enabled ? "default" : "secondary"}>
              {blackword.blackwords_enabled ? '启用' : '禁用'}
            </Badge>
          </span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <BlackwordsRowActions blackword={row.original} />,
  },
]