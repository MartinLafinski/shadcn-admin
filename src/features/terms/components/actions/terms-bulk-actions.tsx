import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, CircleArrowUp, Download } from 'lucide-react'
import { toast } from 'sonner'
import { enableLabels } from '@/lib/labels'
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
  useBatchSwitchTermsMutation,
  useBatchExportTermsMutation,
} from '@/features/terms/api/terms'
import { type TermData } from '../../data/schemas'
import { TermsMultiDeleteDialog } from '../dialogs/terms-multi-delete-dialog'

const BulkActionDropdown = ({
  icon: Icon,
  label,
  options,
  onAction,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  options: typeof enableLabels
  onAction: (value: unknown) => void
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
            <Icon className='h-4 w-4' />
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

interface TermsTableBulkActionsProps {
  table: Table<TermData>
}

export function TermsTableBulkActions({ table }: TermsTableBulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const switchMutation = useBatchSwitchTermsMutation()
  const exportMutation = useBatchExportTermsMutation()

  const handleBulkAction = async <T,>(
    mutation: { mutateAsync: (variables: T) => Promise<unknown> },
    data: Omit<T, 'term_ids'>,
    loadingMsg: string,
    successMsgPrefix: string,
    errorMsg: string
  ) => {
    const selectedIds = selectedRows.map((row) => row.original.term_id)

    toast.promise(
      mutation
        .mutateAsync({
          term_ids: selectedIds,
          ...data,
        } as unknown as T)
        .then(() => {
          table.resetRowSelection()
        })
        .catch((error: unknown) => {
          console.error(errorMsg, error)
          throw error
        }),
      {
        loading: loadingMsg,
        success: `${successMsgPrefix} ${selectedRows.length} 条数据`,
        error: errorMsg,
      }
    )
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='术语库'>
        <BulkActionDropdown
          icon={CircleArrowUp}
          label='更新可用性'
          options={enableLabels}
          onAction={(value) =>
            handleBulkAction(
              switchMutation,
              { term_enabled: value as boolean },
              `正在更新术语库${value ? '启用' : '禁用'}状态...`,
              `成功更新了`,
              '术语库批量更新状态失败'
            )
          }
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() =>
                handleBulkAction(
                  exportMutation,
                  {} as Record<string, never>,
                  '正在导出术语库...',
                  '成功导出',
                  '术语库批量导出失败'
                )
              }
              className='size-8'
              aria-label='导出术语库'
              title='导出术语库'
            >
              <Download className='h-4 w-4' />
              <span className='sr-only'>导出术语库</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>导出术语库</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='删除所选术语库'
              title='删除所选术语库'
            >
              <Trash2 className='h-4 w-4' />
              <span className='sr-only'>删除所选术语库</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选术语库</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <TermsMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        selectedRows={table.getFilteredSelectedRowModel().rows}
      />
    </>
  )
}
