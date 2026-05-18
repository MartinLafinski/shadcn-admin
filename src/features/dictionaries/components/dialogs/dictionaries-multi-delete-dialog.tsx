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
import { useBatchDeleteDictionariesMutation } from '../../api/dictionaries'
import { type DictionaryData } from '../../data/schemas'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedRows: Row<DictionaryData>[]
}

export function DictionariesMultiDeleteDialog({
  open,
  onOpenChange,
  selectedRows,
}: Props) {
  const [confirmText, setConfirmText] = useState('')
  const batchDeleteMutation = useBatchDeleteDictionariesMutation()
  useEffect(() => {
    if (open) setConfirmText('')
  }, [open])

  const handleDelete = async () => {
    const ids = selectedRows.map((row) => row.original.dictionary_id)
    await batchDeleteMutation
      .mutateAsync(ids)
      .then(() => {
        const names = selectedRows
          .map((r) => r.original.dictionary_name)
          .join(', ')
        toast.success(`属性字典 ${names} 删除成功`)
        onOpenChange(false)
      })
      .catch((error) => {
        console.error('批量删除属性字典失败:', error)
        toast.error('批量删除属性字典失败')
      })
  }

  const count = selectedRows.length
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>批量删除属性字典</DialogTitle>
          <DialogDescription>
            确定要删除选中的 {count} 个属性字典吗？此操作不可撤销。
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
