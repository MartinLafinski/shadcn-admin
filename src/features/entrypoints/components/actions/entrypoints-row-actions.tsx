// 引入依赖
import { type JSX } from 'react'
// 表格
import { type Row } from '@tanstack/react-table'
// 图标
import {
  Trash2,
  SquarePenIcon,
  EllipsisIcon,
  Calendar as CalendarIcon,
  Wrench,
  Settings2Icon,
} from 'lucide-react'
// 可用性标签
import { enableLabels, lockedLabels, pausedLabels } from '@/lib/labels'
// 统一处理状态切换操作
import { handleToggle } from '@/lib/ui-helper'
// 下拉菜单子控件
import { renderToggleSubMenu } from '@/lib/ui-tools'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 下拉菜单控件
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
// 入口点API操作
import {
  useSwitchEntrypointMutation,
  useBatchLockEntrypointsMutation,
  useBatchPauseEntrypointsMutation,
} from '@/features/entrypoints/api/entrypoints.ts'
// 入口点数据格式
import { EntrypointItemSchema } from '../../data/schemas.ts'
// 入口点状态
import { useEntrypointsActions } from '../entrypoints-provider.tsx'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function EntrypointsRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>): JSX.Element {
  const entrypointItem = EntrypointItemSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useEntrypointsActions()

  const switchMutation = useSwitchEntrypointMutation()
  const lockMutation = useBatchLockEntrypointsMutation()
  const pauseMutation = useBatchPauseEntrypointsMutation()

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
        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(entrypointItem)
            setOpen('update')
          }}
        >
          编辑
          <DropdownMenuShortcut>
            <SquarePenIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(entrypointItem)
            setOpen('config')
          }}
        >
          配置
          <DropdownMenuShortcut>
            <Settings2Icon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(entrypointItem)
            setOpen('period')
          }}
        >
          更新日期区间
          <DropdownMenuShortcut>
            <CalendarIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(entrypointItem)
            setOpen('createPrejob')
          }}
        >
          创建预备作业
          <DropdownMenuShortcut>
            <Wrench size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {renderToggleSubMenu(
          '可用',
          enableLabels,
          entrypointItem.entrypoint_enabled,
          (enabled) =>
            handleToggle(
              switchMutation,
              {
                entrypointId: entrypointItem.entrypoint_id,
                data: { entrypoint_enabled: enabled },
              },
              `入口点 ${entrypointItem.entrypoint_name} 状态切换成功`,
              `入口点 ${entrypointItem.entrypoint_name} 状态切换失败`
            )
        )}

        {renderToggleSubMenu(
          '锁定',
          lockedLabels,
          entrypointItem.entrypoint_locked,
          (locked) =>
            handleToggle(
              lockMutation,
              {
                entrypoint_ids: [entrypointItem.entrypoint_id],
                entrypoint_locked: locked,
              },
              `入口点 ${entrypointItem.entrypoint_name} ${locked ? '锁定' : '解锁'}成功`,
              `入口点 ${entrypointItem.entrypoint_name} ${locked ? '锁定' : '解锁'}失败`
            )
        )}

        {renderToggleSubMenu(
          '运转',
          pausedLabels,
          entrypointItem.entrypoint_paused,
          (paused) =>
            handleToggle(
              pauseMutation,
              {
                entrypoint_ids: [entrypointItem.entrypoint_id],
                entrypoint_paused: paused,
              },
              `入口点 ${entrypointItem.entrypoint_name} ${paused ? '暂停' : '恢复'}成功`,
              `入口点 ${entrypointItem.entrypoint_name} ${paused ? '暂停' : '恢复'}失败`
            )
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            setCurrentRow(entrypointItem)
            setOpen('delete')
          }}
        >
          <span className='text-red-600'>删除</span>
          <DropdownMenuShortcut>
            <Trash2 size={16} className='text-red-600' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
