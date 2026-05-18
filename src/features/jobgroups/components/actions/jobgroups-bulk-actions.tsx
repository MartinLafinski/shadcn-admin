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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import {
  useBatchSwitchJobGroupsMutation,
  useBatchLockJobGroupsMutation,
  useBatchPauseJobGroupsMutation,
  useBatchExportJobGroupsMutation,
  useBatchDeleteJobGroupsMutation,
} from '../../api/jobgroups'
import { enableLabels, lockedLabels, pausedLabels } from '../../data/labels'
import { type JobGroupItemData } from '../../data/schemas'

const BulkActionDropdown = ({
  icon: Icon,
  label,
  options,
  onAction,
}: {
  icon: any
  label: string
  options: typeof enableLabels
  onAction: (value: any) => void
}) => (
  <DropdownMenu>
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            aria-label={label}
            title={label}
          >
            <Icon />
            <span className='sr-only'>{label}</span>
          </Button>
        </DropdownMenuTrigger>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
    <DropdownMenuContent sideOffset={14}>
      {options.map((item) => (
        <DropdownMenuItem
          key={item.value.toString()}
          onClick={() => onAction(item.value)}
          className={item.className}
        >
          {item.icon && <item.icon className={item.className} />}
          {item.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

type Props<TData> = { table: Table<TData> }

export function JobGroupsBulkActions<TData>({ table }: Props<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const switchMutation = useBatchSwitchJobGroupsMutation()
  const lockMutation = useBatchLockJobGroupsMutation()
  const pauseMutation = useBatchPauseJobGroupsMutation()
  const exportMutation = useBatchExportJobGroupsMutation()
  const deleteMutation = useBatchDeleteJobGroupsMutation()

  const handleBulkAction = async <T,>(
    mutation: { mutateAsync: (v: T) => Promise<any> },
    data: Omit<T, 'jobgroup_ids'>,
    loadingMsg: string,
    successMsgPrefix: string,
    errorMsg: string
  ) => {
    const selected = selectedRows.map((r) => r.original as JobGroupItemData)
    const ids = selected.map((g) => g.jobgroup_id)
    toast.promise(
      mutation
        .mutateAsync({ jobgroup_ids: ids, ...data } as any)
        .then(() => table.resetRowSelection())
        .catch((e: any) => {
          console.error(errorMsg, e)
          throw e
        }),
      {
        loading: loadingMsg,
        success: `${successMsgPrefix} ${selected.length} 条数据`,
        error: errorMsg,
      }
    )
  }

  const handleDelete = async () => {
    const ids = selectedRows.map(
      (r) => (r.original as JobGroupItemData).jobgroup_id
    )
    await deleteMutation
      .mutateAsync(ids)
      .then(() => {
        table.resetRowSelection()
        setShowDeleteConfirm(false)
        toast.success(`成功删除了 ${ids.length} 条数据`)
      })
      .catch((e) => {
        console.error('作业分组批量删除失败', e)
        toast.error('作业分组批量删除失败')
      })
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='作业分组'>
        <BulkActionDropdown
          icon={CircleArrowUp}
          label='更新可用性'
          options={enableLabels}
          onAction={(v) =>
            handleBulkAction(
              switchMutation,
              { jobgroup_enabled: v },
              `正在更新作业分组${v ? '启用' : '禁用'}状态...`,
              '成功更新了',
              '作业分组批量更新状态失败'
            )
          }
        />
        <BulkActionDropdown
          icon={LockIcon}
          label='锁定/解锁'
          options={lockedLabels}
          onAction={(v) =>
            handleBulkAction(
              lockMutation,
              { jobgroup_locked: v },
              `正在进行作业分组 ${v ? '锁定' : '解锁'} 操作...`,
              '成功对',
              '作业分组批量锁定/解锁失败'
            )
          }
        />
        <BulkActionDropdown
          icon={SquarePlayIcon}
          label='暂停/恢复'
          options={pausedLabels}
          onAction={(v) =>
            handleBulkAction(
              pauseMutation,
              { jobgroup_paused: v },
              `正在进行作业分组 ${v ? '暂停' : '恢复'} 操作...`,
              '成功对',
              '作业分组批量暂停/恢复失败'
            )
          }
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={() =>
                handleBulkAction(
                  exportMutation,
                  {},
                  '正在导出作业分组...',
                  '成功导出',
                  '作业分组批量导出失败'
                )
              }
              aria-label='导出作业分组'
            >
              <Download />
              <span className='sr-only'>导出作业分组</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>导出作业分组</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='删除所选作业分组'
            >
              <Trash2 />
              <span className='sr-only'>删除所选作业分组</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选作业分组</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>
      <ConfirmDialog
        destructive
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        handleConfirm={handleDelete}
        className='max-w-md'
        title='批量删除作业分组？'
        desc={
          <>
            您即将永久删除选中的 <strong>{selectedRows.length}</strong>{' '}
            个作业分组！
            <br />
            此操作无法撤销。
          </>
        }
        confirmText='删除'
        cancelBtnText='取消'
      />
    </>
  )
}
