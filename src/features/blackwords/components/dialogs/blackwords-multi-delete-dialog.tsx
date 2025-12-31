import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBlackwords } from '../blackwords-provider'
import { useBatchDeleteBlackwordsMutation } from '@/features/blackwords/api/blackwords'
import { toast } from 'sonner'

export function BlackwordsMultiDeleteDialog() {
  const { setIsDeleteDialogOpen } = useBlackwords()
  const { mutateAsync, isPending } = useBatchDeleteBlackwordsMutation()

  // 由于现在使用table来管理选中状态，这个对话框可能需要重新设计
  // 这里暂时保留以兼容现有结构，实际删除操作在bulk-actions中
  return null
}