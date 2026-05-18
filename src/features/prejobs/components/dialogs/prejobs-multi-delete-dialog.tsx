'use client'
import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useBatchDeletePrejobsMutation } from '@/features/prejobs/api/prejobs'
import type { PrejobItemData } from '@/features/prejobs/data/schemas.ts'

type PrejobsMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
}

const CONFIRM_WORD = 'DELETE'

export function PrejobsMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: PrejobsMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const deleteMutation = useBatchDeletePrejobsMutation()
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const selectedPrejobIds = selectedRows.map(
    (row) => (row.original as PrejobItemData).prejob_id
  )

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`请输入 "${CONFIRM_WORD}" 以确认`)
      return
    }

    onOpenChange(false)

    await deleteMutation
      .mutateAsync(selectedPrejobIds)
      .then(() => {
        setValue('')
        table.resetRowSelection()
        toast.success('批量删除预备作业成功')
      })
      .catch((error) => {
        setValue('')
        console.error('批量删除预备作业失败:', error)
        toast.error('批量删除预备作业失败')
      })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除 {selectedRows.length} 个预备作业
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            您确定要删除选中的预备作业吗？
            <br />
            此操作无法撤销。
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <p>
              <span className=''>输入 </span>
              <span className='text-red-600'>"{CONFIRM_WORD}"</span>
              <span className=''> 以确认:</span>
            </p>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`输入 ${CONFIRM_WORD}`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告!</AlertTitle>
            <AlertDescription>请谨慎操作，此操作无法撤销。</AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      cancelBtnText='取消'
      destructive
    />
  )
}
