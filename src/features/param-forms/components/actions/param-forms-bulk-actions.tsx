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
  useBatchSwitchParamFormsMutation,
  useBatchExportParamFormsMutation,
} from '../../api/param-forms'
import type { ParamFormItemData } from '../../data/schemas'
import ParamFormsMultiDeleteDialog from '../dialogs/param-forms-multi-delete-dialog'

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

type ParamFormsBulkActionsProps = {
  table: Table<ParamFormItemData>
}

export function ParamFormsBulkActions({ table }: ParamFormsBulkActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const switchMutation = useBatchSwitchParamFormsMutation()
  const exportMutation = useBatchExportParamFormsMutation()

  const ids = selectedRows.map((row) => row.original.param_form_id)

  const handleBulkSwitch = async (enabled: boolean) => {
    try {
      await switchMutation.mutateAsync({
        param_form_ids: ids,
        param_form_enabled: enabled,
      })
      toast.success(
        `已批量${enabled ? '启用' : '禁用'} ${ids.length} 个参数要素`
      )
      table.resetRowSelection()
    } catch {
      toast.error(`批量${enabled ? '启用' : '禁用'}失败`)
    }
  }

  const handleExport = () => {
    if (ids.length === 0) return
    exportMutation.mutate(
      { param_form_ids: ids },
      {
        onError: (error) => {
          console.error('批量导出失败:', error)
          toast.error('批量导出失败')
        },
      }
    )
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='参数要素'>
        <BulkActionDropdown
          icon={CircleArrowUp}
          label='更新可用性'
          options={enableLabels}
          onAction={handleBulkSwitch}
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleExport}
              className='size-8'
              aria-label='导出所选'
              title='导出所选'
            >
              <Download className='h-4 w-4' />
              <span className='sr-only'>导出所选</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>导出所选参数要素</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='删除所选'
            >
              <Trash2 />
              <span className='sr-only'>删除所选</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选参数要素</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ParamFormsMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
