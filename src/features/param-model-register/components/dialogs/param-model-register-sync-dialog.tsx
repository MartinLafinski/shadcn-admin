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
        toast.success('注册条目同步成功')
      })
      .catch((error) => {
        console.error('注册条目同步失败:', error)
        toast.error('注册条目同步失败')
      })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>同步注册条目</DialogTitle>
          <DialogDescription>
            确定要同步所有注册条目数据吗？此操作将从数据源重新获取注册条目配置。
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
