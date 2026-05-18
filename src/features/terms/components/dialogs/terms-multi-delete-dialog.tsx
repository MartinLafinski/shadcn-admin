import { useState, useEffect } from 'react'
import { type Row } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useBatchDeleteTermsMutation } from '../../api/terms'
import { type TermData } from '../../data/schemas'

interface TermsMultiDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRows: Row<TermData>[]
}

export function TermsMultiDeleteDialog({
  open,
  onOpenChange,
  selectedRows,
}: TermsMultiDeleteDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const batchDeleteMutation = useBatchDeleteTermsMutation()

  useEffect(() => {
    if (open) {
      setConfirmText('')
    }
  }, [open])

  const handleDelete = async () => {
    const ids = selectedRows.map((row) => row.original.term_id)
    await batchDeleteMutation
      .mutateAsync(ids)
      .then(() => {
        const names = selectedRows
          .map((row) => row.original.term_name)
          .join(', ')
        toast.success(`术语库 ${names} 删除成功`)
        onOpenChange(false)
      })
      .catch((error) => {
        console.error('批量删除术语库失败:', error)
        toast.error('批量删除术语库失败')
      })
  }

  const count = selectedRows.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批量删除术语库</DialogTitle>
          <DialogDescription>
            确定要删除选中的 {count} 个术语库吗？此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-2'>
          <Label>
            请输入 <span className='font-bold text-destructive'>DELETE</span>{' '}
            确认
          </Label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder='DELETE'
          />
        </div>
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>取消</Button>
          </DialogClose>
          <Button
            variant='destructive'
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE' || batchDeleteMutation.isPending}
          >
            {batchDeleteMutation.isPending ? '删除中...' : '确认删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
