import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useBlackwords } from '../blackwords-provider'
import { useDeleteBlackwordMutation } from '@/features/blackwords/api/blackwords'
import { toast } from 'sonner'

export function BlackwordsDeleteDialog() {
  const { blackwordToDelete, setBlackwordToDelete, setIsDeleteDialogOpen } = useBlackwords()
  const { mutateAsync, isPending } = useDeleteBlackwordMutation()

  const handleConfirm = async () => {
    if (!blackwordToDelete) return
    
    try {
      await mutateAsync({ blackwordsId: blackwordToDelete })
      toast.success('敏感词删除成功')
      setBlackwordToDelete(null)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error('删除敏感词失败: ' + (error as Error).message)
    }
  }

  if (!blackwordToDelete) {
    return null
  }

  return (
    <Dialog open={!!blackwordToDelete} onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            您确定要删除这个敏感词吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            setBlackwordToDelete(null)
            setIsDeleteDialogOpen(false)
          }}>
            取消
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? '删除中...' : '删除'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}