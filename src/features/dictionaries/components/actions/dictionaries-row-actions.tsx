import { useCallback } from 'react'
import { type Row } from '@tanstack/react-table'
import {
  MoreHorizontalIcon,
  Settings2Icon,
  SquarePenIcon,
  Trash2,
} from 'lucide-react'
import { enableLabels } from '@/lib/labels'
import { handleToggle } from '@/lib/ui-helper'
import { renderToggleSubMenu } from '@/lib/ui-tools'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSwitchDictionaryMutation } from '@/features/dictionaries/api/dictionaries'
import { type DictionaryData } from '@/features/dictionaries/data/schemas'
import { useDictionariesActions } from '../dictionaries-provider'

interface DictionariesRowActionsProps {
  row: Row<DictionaryData>
}

export function DictionariesRowActions({ row }: DictionariesRowActionsProps) {
  const { setOpen, setCurrentRow } = useDictionariesActions()
  const switchMutation = useSwitchDictionaryMutation()

  const handleEdit = useCallback(() => {
    setCurrentRow(row.original)
    setOpen('update')
  }, [row.original, setCurrentRow, setOpen])
  const handleConfig = useCallback(() => {
    setCurrentRow(row.original)
    setOpen('config')
  }, [row.original, setCurrentRow, setOpen])
  const handleDelete = useCallback(() => {
    setCurrentRow(row.original)
    setOpen('delete')
  }, [row.original, setCurrentRow, setOpen])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>打开菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={handleEdit}>
          编辑
          <DropdownMenuShortcut>
            <SquarePenIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleConfig}>
          配置
          <DropdownMenuShortcut>
            <Settings2Icon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {renderToggleSubMenu(
          '可用',
          enableLabels,
          row.original.dictionary_enabled,
          (status) =>
            handleToggle(
              switchMutation,
              {
                id: row.original.dictionary_id,
                data: { dictionary_enabled: status },
              },
              `属性字典 ${row.original.dictionary_name} 状态切换成功`,
              `属性字典 ${row.original.dictionary_name} 状态切换失败`
            )
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='!text-red-600'>
          <span className='text-red-600'>删除</span>
          <DropdownMenuShortcut>
            <Trash2 size={16} className='text-red-600' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
