import { useCallback } from 'react'
import { type Row } from '@tanstack/react-table'
import {
  Trash2,
  SquarePenIcon,
  Settings2Icon,
  EllipsisIcon,
} from 'lucide-react'
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
  useSwitchSpiderSessionMutation,
  useBatchLockSpiderSessionsMutation,
  useBatchPauseSpiderSessionsMutation,
} from '@/features/spider-sessions/api/spider-sessions'
import {
  enableLabels,
  lockedLabels,
  pausedLabels,
} from '@/features/spider-sessions/data/labels'
import { type SpiderSessionItemData } from '@/features/spider-sessions/data/schemas'
import { useSpiderSessionsActions } from '../spider-sessions-provider'

interface SpiderSessionsRowActionsProps {
  row: Row<SpiderSessionItemData>
}

export function SpiderSessionsRowActions({
  row,
}: SpiderSessionsRowActionsProps) {
  const { setOpen, setCurrentRow } = useSpiderSessionsActions()
  const switchMutation = useSwitchSpiderSessionMutation()
  const lockMutation = useBatchLockSpiderSessionsMutation()
  const pauseMutation = useBatchPauseSpiderSessionsMutation()

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
          row.original.session_enabled,
          (enabled) =>
            handleToggle(
              switchMutation,
              {
                id: row.original.session_id,
                data: { session_enabled: enabled },
              },
              `爬虫会话 ${row.original.session_name} 状态切换成功`,
              `爬虫会话 ${row.original.session_name} 状态切换失败`
            )
        )}
        {renderToggleSubMenu(
          '锁定',
          lockedLabels,
          row.original.session_locked,
          (locked) =>
            handleToggle(
              lockMutation,
              {
                session_ids: [row.original.session_id],
                session_locked: locked,
              },
              `爬虫会话 ${row.original.session_name} ${locked ? '锁定' : '解锁'}成功`,
              `爬虫会话 ${row.original.session_name} 锁定操作失败`
            )
        )}
        {renderToggleSubMenu(
          '运转',
          pausedLabels,
          row.original.session_paused,
          (paused) =>
            handleToggle(
              pauseMutation,
              {
                session_ids: [row.original.session_id],
                session_paused: paused,
              },
              `爬虫会话 ${row.original.session_name} ${paused ? '暂停' : '恢复'}成功`,
              `爬虫会话 ${row.original.session_name} 暂停操作失败`
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
