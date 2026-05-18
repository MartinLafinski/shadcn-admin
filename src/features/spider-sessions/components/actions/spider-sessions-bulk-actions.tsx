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
  useBatchSwitchSpiderSessionsMutation,
  useBatchLockSpiderSessionsMutation,
  useBatchPauseSpiderSessionsMutation,
  useBatchExportSpiderSessionsMutation,
  useBatchDeleteSpiderSessionsMutation,
} from '../../api/spider-sessions'
import { enableLabels, lockedLabels, pausedLabels } from '../../data/labels'
import { type SpiderSessionItemData } from '../../data/schemas'

const BulkActionDropdown = ({
  icon: Icon,
  label,
  options,
  onAction,
}: {
  icon: any
  label: string
  options: typeof enableLabels
  onAction: (v: any) => void
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
      {options.map((i) => (
        <DropdownMenuItem
          key={i.value.toString()}
          onClick={() => onAction(i.value)}
          className={i.className}
        >
          {i.icon && <i.icon className={i.className} />}
          {i.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

export function SpiderSessionsBulkActions<TData>({
  table,
}: {
  table: Table<TData>
}) {
  const [del, setDel] = useState(false)
  const rows = table.getFilteredSelectedRowModel().rows
  const sm = useBatchSwitchSpiderSessionsMutation()
  const lm = useBatchLockSpiderSessionsMutation()
  const pm = useBatchPauseSpiderSessionsMutation()
  const em = useBatchExportSpiderSessionsMutation()
  const dm = useBatchDeleteSpiderSessionsMutation()

  const bh = async <T,>(
    m: { mutateAsync: (v: T) => Promise<any> },
    d: Omit<T, 'session_ids'>,
    loading: string,
    ok: string,
    err: string
  ) => {
    const s = rows.map((r) => r.original as SpiderSessionItemData)
    const ids = s.map((g) => g.session_id)
    toast.promise(
      m
        .mutateAsync({ session_ids: ids, ...d } as any)
        .then(() => table.resetRowSelection())
        .catch((e: any) => {
          console.error(err, e)
          throw e
        }),
      { loading, success: `${ok} ${s.length} 条数据`, error: err }
    )
  }

  const hd = async () => {
    const ids = rows.map(
      (r) => (r.original as SpiderSessionItemData).session_id
    )
    await dm
      .mutateAsync(ids)
      .then(() => {
        table.resetRowSelection()
        setDel(false)
        toast.success(`成功删除了 ${ids.length} 条数据`)
      })
      .catch((e) => {
        console.error('批量删除失败', e)
        toast.error('批量删除失败')
      })
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='爬虫会话'>
        <BulkActionDropdown
          icon={CircleArrowUp}
          label='更新可用性'
          options={enableLabels}
          onAction={(v) =>
            bh(
              sm,
              { session_enabled: v },
              `正在更新爬虫会话${v ? '启用' : '禁用'}状态...`,
              '成功更新了',
              '批量更新状态失败'
            )
          }
        />
        <BulkActionDropdown
          icon={LockIcon}
          label='锁定/解锁'
          options={lockedLabels}
          onAction={(v) =>
            bh(
              lm,
              { session_locked: v },
              `正在进行爬虫会话 ${v ? '锁定' : '解锁'} 操作...`,
              '成功对',
              '批量锁定/解锁失败'
            )
          }
        />
        <BulkActionDropdown
          icon={SquarePlayIcon}
          label='暂停/恢复'
          options={pausedLabels}
          onAction={(v) =>
            bh(
              pm,
              { session_paused: v },
              `正在进行爬虫会话 ${v ? '暂停' : '恢复'} 操作...`,
              '成功对',
              '批量暂停/恢复失败'
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
                bh(em, {}, '正在导出爬虫会话...', '成功导出', '批量导出失败')
              }
              aria-label='导出爬虫会话'
            >
              <Download />
              <span className='sr-only'>导出爬虫会话</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>导出爬虫会话</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setDel(true)}
              className='size-8'
              aria-label='删除所选爬虫会话'
            >
              <Trash2 />
              <span className='sr-only'>删除所选爬虫会话</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选爬虫会话</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>
      <ConfirmDialog
        destructive
        open={del}
        onOpenChange={setDel}
        handleConfirm={hd}
        className='max-w-md'
        title='批量删除爬虫会话？'
        desc={
          <>
            您即将永久删除选中的 <strong>{rows.length}</strong> 个爬虫会话！
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
