import { useCallback, useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { TriangleAlertIcon } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { useBatchDeleteParamFormsMutation } from '../../api/param-forms'
import type { ParamFormItemData } from '../../data/schemas'

interface ParamFormsMultiDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<ParamFormItemData>
}

export default function ParamFormsMultiDeleteDialog({
  open,
  onOpenChange,
  table,
}: ParamFormsMultiDeleteDialogProps) {
  const batchDeleteMutation = useBatchDeleteParamFormsMutation()
  const [confirmText, setConfirmText] = useState('')
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const paramFormIds = selectedRows.map((row) => row.original.param_form_id)

  const handleDelete = useCallback(async () => {
    try {
      await batchDeleteMutation.mutateAsync({
        param_form_ids: paramFormIds,
      })
      toast.success(`已删除 ${paramFormIds.length} 个参数要素`)
      table.resetRowSelection()
      onOpenChange(false)
      setConfirmText('')
    } catch {
      toast.error('批量删除失败')
    }
  }, [paramFormIds, batchDeleteMutation, onOpenChange, table])

  const valid = confirmText === 'DELETE'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className='flex items-center gap-2'>
            <TriangleAlertIcon className='h-5 w-5 text-destructive' />
            <AlertDialogTitle>确认批量删除</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            确定要删除选中的 {selectedRows.length}{' '}
            个参数要素吗？此操作不可撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>
            请输入 <span className='font-bold'>DELETE</span> 以确认：
          </p>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='DELETE'
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setConfirmText('')
            }}
          >
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={!valid || batchDeleteMutation.isPending}
            className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
          >
            {batchDeleteMutation.isPending ? '删除中...' : '确认删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
