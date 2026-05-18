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
  useSwitchJobGroupMutation,
  useBatchLockJobGroupsMutation,
  useBatchPauseJobGroupsMutation,
} from '../../api/jobgroups'
import { enableLabels, lockedLabels, pausedLabels } from '../../data/labels'
import { type JobGroupItemData } from '../../data/schemas'
import { useJobGroupsActions } from '../jobgroups-provider'

interface JobGroupsRowActionsProps {
  row: Row<JobGroupItemData>
}

export function JobGroupsRowActions({ row }: JobGroupsRowActionsProps) {
  const { setOpen, setCurrentRow } = useJobGroupsActions()
  const switchMutation = useSwitchJobGroupMutation()
  const lockMutation = useBatchLockJobGroupsMutation()
  const pauseMutation = useBatchPauseJobGroupsMutation()

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
          row.original.jobgroup_enabled,
          (v) =>
            handleToggle(
              switchMutation,
              { id: row.original.jobgroup_id, data: { jobgroup_enabled: v } },
              `作业分组 ${row.original.jobgroup_name} 状态切换成功`,
              `作业分组 ${row.original.jobgroup_name} 状态切换失败`
            )
        )}
        {renderToggleSubMenu(
          '锁定',
          lockedLabels,
          row.original.jobgroup_locked,
          (v) =>
            handleToggle(
              lockMutation,
              {
                jobgroup_ids: [row.original.jobgroup_id],
                jobgroup_locked: v,
              },
              `作业分组 ${row.original.jobgroup_name} ${v ? '锁定' : '解锁'}成功`,
              `作业分组 ${row.original.jobgroup_name} 锁定操作失败`
            )
        )}
        {renderToggleSubMenu(
          '运转',
          pausedLabels,
          row.original.jobgroup_paused,
          (v) =>
            handleToggle(
              pauseMutation,
              {
                jobgroup_ids: [row.original.jobgroup_id],
                jobgroup_paused: v,
              },
              `作业分组 ${row.original.jobgroup_name} ${v ? '暂停' : '恢复'}成功`,
              `作业分组 ${row.original.jobgroup_name} 暂停操作失败`
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
