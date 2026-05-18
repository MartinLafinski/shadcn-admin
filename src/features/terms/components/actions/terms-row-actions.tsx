import { useCallback } from 'react'
import { type Row } from '@tanstack/react-table'
import {
  MoreHorizontalIcon,
  Trash2,
  SquarePenIcon,
  Settings2Icon,
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
import {
  useSwitchTermMutation,
  useDeleteTermMutation,
} from '@/features/terms/api/terms'
import { type TermData } from '@/features/terms/data/schemas'
import { useTermsActions } from '../terms-provider'

interface TermsRowActionsProps {
  row: Row<TermData>
}

export function TermsRowActions({ row }: TermsRowActionsProps) {
  const { setOpen, setCurrentRow } = useTermsActions()
  const switchMutation = useSwitchTermMutation()
  const deleteMutation = useDeleteTermMutation()

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

  if (deleteMutation.isPending) {
    return null
  }

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
          row.original.term_enabled,
          (status) =>
            handleToggle(
              switchMutation,
              { termId: row.original.term_id, data: { term_enabled: status } },
              `术语库 ${row.original.term_name} 状态切换成功`,
              `术语库 ${row.original.term_name} 状态切换失败`
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
