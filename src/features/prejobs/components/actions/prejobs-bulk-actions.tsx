import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import {
  Trash2,
  CircleArrowUp,
  Download,
  LockIcon,
  SquarePlayIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import {
  useBatchSwitchPrejobsMutation,
  useBatchExportPrejobsMutation,
  useBatchLockPrejobsMutation,
  useBatchPausePrejobsMutation,
} from '@/features/prejobs/api/prejobs'
import {
  enableLabels,
  lockedLabels,
  pausedLabels,
} from '@/features/prejobs/data/labels'
import { type PrejobItemData } from '@/features/prejobs/data/schemas'
import { PrejobsMultiDeleteDialog } from '../dialogs/prejobs-multi-delete-dialog'

type PrejobTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function PrejobTableBulkActions<TData>({
  table,
}: PrejobTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const switchMutation = useBatchSwitchPrejobsMutation()
  const exportMutation = useBatchExportPrejobsMutation()
  const lockMutation = useBatchLockPrejobsMutation()
  const pauseMutation = useBatchPausePrejobsMutation()

  /**
   * 批量更新预备作业状态的处理函数
   */
  const handleBulkStatusChange = async (status: boolean) => {
    const selectedPrejobs = selectedRows.map(
      (row) => row.original as PrejobItemData
    )
    const selectedPrejobIds = selectedPrejobs.map((prejob) => prejob.prejob_id)

    toast.promise(
      switchMutation
        .mutateAsync({
          prejob_ids: selectedPrejobIds,
          prejob_enabled: status,
        })
        .then(() => {
          table.resetRowSelection()
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('预备作业批量导出失败:', error)
          throw error
        }),
      {
        loading: `正在更新预备作业${status ? '启用' : '禁用'}状态...`,
        success: `成功更新了 ${selectedPrejobs.length} 条预备作业的可用状态为 ${status ? '启用' : '禁用'}`,
        error: '预备作业批量更新状态失败',
      }
    )
  }

  /**
   * 批量锁定/解锁预备作业的处理函数
   */
  const handleBulkLockedChange = async (locked: boolean) => {
    const selectedPrejobs = selectedRows.map(
      (row) => row.original as PrejobItemData
    )
    const selectedPrejobIds = selectedPrejobs.map((prejob) => prejob.prejob_id)

    toast.promise(
      lockMutation
        .mutateAsync({
          prejob_ids: selectedPrejobIds,
          prejob_locked: locked,
        })
        .then(() => {
          table.resetRowSelection()
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('预备作业批量锁定/解锁失败:', error)
          throw error
        }),
      {
        loading: `正在进行预备作业 ${locked ? '锁定' : '解锁'} 操作...`,
        success: `成功对 ${selectedPrejobs.length} 个预备作业 ${locked ? '锁定' : '解锁'}`,
        error: '预备作业批量锁定/解锁失败',
      }
    )
  }

  /**
   * 批量暂停/恢复预备作业的处理函数
   */
  const handleBulkPausedChange = async (paused: boolean) => {
    const selectedPrejobs = selectedRows.map(
      (row) => row.original as PrejobItemData
    )
    const selectedPrejobIds = selectedPrejobs.map((prejob) => prejob.prejob_id)

    toast.promise(
      pauseMutation
        .mutateAsync({
          prejob_ids: selectedPrejobIds,
          prejob_paused: paused,
        })
        .then(() => {
          table.resetRowSelection()
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('预备作业批量暂停/恢复失败:', error)
          throw error
        }),
      {
        loading: `正在进行预备作业 ${paused ? '暂停' : '恢复'} 操作...`,
        success: `成功对 ${selectedPrejobs.length} 个预备作业 ${paused ? '暂停' : '恢复'}`,
        error: '预备作业批量暂停/恢复失败',
      }
    )
  }

  /**
   * 批量导出预备作业数据的处理函数
   */
  const handleBulkExport = async () => {
    const selectedPrejobs = selectedRows.map(
      (row) => row.original as PrejobItemData
    )
    const selectedPrejobIds = selectedPrejobs.map((prejob) => prejob.prejob_id)

    toast.promise(
      exportMutation
        .mutateAsync({
          prejob_ids: selectedPrejobIds,
        })
        .then(() => {
          table.resetRowSelection()
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('预备作业批量导出失败:', error)
          throw error
        }),
      {
        loading: '正在导出预备作业...',
        success: `成功导出 ${selectedPrejobs.length} 条预备作业数据`,
        error: '预备作业批量导出失败',
      }
    )
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='预备作业'>
        {/* 批量更新状态的下拉菜单 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='更新可用性'
                  title='更新可用性'
                >
                  <CircleArrowUp />
                  <span className='sr-only'>更新可用性</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>更新可用性</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {enableLabels.map((item) => (
              <DropdownMenuItem
                key={item.value.toString()}
                defaultValue={item.value.toString()}
                onClick={() => handleBulkStatusChange(item.value)}
                className={item.className}
              >
                {item.icon && <item.icon className={item.className} />}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 批量锁定/解锁的下拉菜单 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='锁定/解锁'
                  title='锁定/解锁'
                >
                  <LockIcon />
                  <span className='sr-only'>锁定/解锁</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>锁定/解锁</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {lockedLabels.map((item) => (
              <DropdownMenuItem
                key={item.value.toString()}
                defaultValue={item.value.toString()}
                onClick={() => handleBulkLockedChange(item.value)}
                className={item.className}
              >
                {item.icon && <item.icon className={item.className} />}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 批量暂停/恢复的下拉菜单 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='暂停/恢复'
                  title='暂停/恢复'
                >
                  <SquarePlayIcon />
                  <span className='sr-only'>暂停/恢复</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>暂停/恢复</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {pausedLabels.map((item) => (
              <DropdownMenuItem
                key={item.value.toString()}
                defaultValue={item.value.toString()}
                onClick={() => handleBulkPausedChange(item.value)}
                className={item.className}
              >
                {item.icon && <item.icon className={item.className} />}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 批量导出按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkExport()}
              className='size-8'
              aria-label='导出预备作业'
              title='导出预备作业'
            >
              <Download />
              <span className='sr-only'>导出预备作业</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>导出预备作业</p>
          </TooltipContent>
        </Tooltip>

        {/* 批量删除按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='删除所选预备作业'
              title='删除所选预备作业'
            >
              <Trash2 />
              <span className='sr-only'>删除所选预备作业</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选预备作业</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <PrejobsMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
