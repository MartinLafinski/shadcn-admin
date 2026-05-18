import { useCallback } from 'react'
import { type Row } from '@tanstack/react-table'
import { Trash2, SquarePenIcon, EllipsisIcon } from 'lucide-react'
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
  useSwitchPrejobMutation,
  useBatchLockPrejobsMutation,
  useBatchPausePrejobsMutation,
} from '@/features/prejobs/api/prejobs'
import {
  enableLabels,
  lockedLabels,
  pausedLabels,
} from '@/features/prejobs/data/labels'
import { type PrejobItemData } from '@/features/prejobs/data/schemas'
import { usePrejobsActions } from '../prejobs-provider'

interface PrejobsRowActionsProps {
  row: Row<PrejobItemData>
}

export function PrejobsRowActions({ row }: PrejobsRowActionsProps) {
  const { setOpen, setCurrentRow } = usePrejobsActions()
  const switchMutation = useSwitchPrejobMutation()
  const lockMutation = useBatchLockPrejobsMutation()
  const pauseMutation = useBatchPausePrejobsMutation()

  const handleEdit = useCallback(() => {
    setCurrentRow(row.original)
    setOpen('update')
  }, [row.original, setCurrentRow, setOpen])

  const handleDelete = useCallback(() => {
    setCurrentRow(row.original)
    setOpen('delete')
  }, [row.original, setCurrentRow, setOpen])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <EllipsisIcon className='h-4 w-4' />
          <span className='sr-only'>打开操作菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={handleEdit}>
          编辑
          <DropdownMenuShortcut>
            <SquarePenIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {renderToggleSubMenu(
          '可用',
          enableLabels,
          row.original.prejob_enabled,
          (v) =>
            handleToggle(
              switchMutation,
              {
                prejobId: row.original.prejob_id,
                data: { prejob_enabled: v },
              },
              `预备作业 ${row.original.prejob_name} 状态切换成功`,
              `预备作业 ${row.original.prejob_name} 状态切换失败`
            )
        )}
        {renderToggleSubMenu(
          '锁定',
          lockedLabels,
          row.original.prejob_locked,
          (v) =>
            handleToggle(
              lockMutation,
              {
                prejob_ids: [row.original.prejob_id],
                prejob_locked: v,
              },
              `预备作业 ${row.original.prejob_name} ${v ? '锁定' : '解锁'}成功`,
              `预备作业 ${row.original.prejob_name} 锁定操作失败`
            )
        )}
        {renderToggleSubMenu(
          '运转',
          pausedLabels,
          row.original.prejob_paused,
          (v) =>
            handleToggle(
              pauseMutation,
              {
                prejob_ids: [row.original.prejob_id],
                prejob_paused: v,
              },
              `预备作业 ${row.original.prejob_name} ${v ? '暂停' : '恢复'}成功`,
              `预备作业 ${row.original.prejob_name} 暂停操作失败`
            )
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete}>
          <span className='text-red-600'>删除</span>
          <DropdownMenuShortcut>
            <Trash2 size={16} className='text-red-600' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
