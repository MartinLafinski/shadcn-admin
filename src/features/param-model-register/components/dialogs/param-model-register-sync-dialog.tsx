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
import { useSyncParamModelRegistersMutation } from '../../api/param-model-register'

interface ParamModelRegisterSyncDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ParamModelRegisterSyncDialog({
  open,
  onOpenChange,
}: ParamModelRegisterSyncDialogProps) {
  const syncMutation = useSyncParamModelRegistersMutation()

  const handleSync = async () => {
    await syncMutation
      .mutateAsync()
      .then(() => {
        toast.success('参数模型集同步成功')
      })
      .catch((error) => {
        console.error('参数模型集同步失败:', error)
        toast.error('参数模型集同步失败')
      })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>同步参数模型集</DialogTitle>
          <DialogDescription>
            确定要同步所有参数模型集数据吗？此操作将从数据源重新获取参数模型集配置。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className='gap-2'>
          <DialogClose asChild>
            <Button variant='outline'>取消</Button>
          </DialogClose>
          <Button onClick={handleSync} disabled={syncMutation.isPending}>
            {syncMutation.isPending ? '同步中...' : '确认同步'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
