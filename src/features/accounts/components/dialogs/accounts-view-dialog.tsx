import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  activeLabels,
  superuserLabels,
  verifiedLabels,
} from '../../data/labels'
import { type AccountData } from '../../data/schemas'

interface AccountsViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: AccountData | null
}

export function AccountsViewDialog({
  open,
  onOpenChange,
  account,
}: AccountsViewDialogProps) {
  if (!account) return null

  const ActiveTrueIcon = activeLabels.true.icon
  const ActiveFalseIcon = activeLabels.false.icon
  const SuperuserTrueIcon = superuserLabels.true.icon
  const SuperuserFalseIcon = superuserLabels.false.icon
  const VerifiedTrueIcon = verifiedLabels.true.icon
  const VerifiedFalseIcon = verifiedLabels.false.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            用户详情
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>用户 ID</span>
            <code className='text-sm'>{account.user_id}</code>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>用户名</span>
            <span className='text-sm font-medium'>{account.username}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>邮箱</span>
            <span className='text-sm'>{account.email}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>状态</span>
            <Badge
              variant='outline'
              className={
                account.is_active
                  ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400'
                  : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400'
              }
            >
              {account.is_active ? (
                <ActiveTrueIcon className='mr-1 h-3.5 w-3.5' />
              ) : (
                <ActiveFalseIcon className='mr-1 h-3.5 w-3.5' />
              )}
              {account.is_active
                ? activeLabels.true.label
                : activeLabels.false.label}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>角色</span>
            <Badge
              variant='outline'
              className={
                account.is_superuser
                  ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400'
                  : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400'
              }
            >
              {account.is_superuser ? (
                <SuperuserTrueIcon className='mr-1 h-3.5 w-3.5' />
              ) : (
                <SuperuserFalseIcon className='mr-1 h-3.5 w-3.5' />
              )}
              {account.is_superuser
                ? superuserLabels.true.label
                : superuserLabels.false.label}
            </Badge>
          </div>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-muted-foreground'>验证状态</span>
            <Badge
              variant='outline'
              className={
                account.is_verified
                  ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-400'
                  : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400'
              }
            >
              {account.is_verified ? (
                <VerifiedTrueIcon className='mr-1 h-3.5 w-3.5' />
              ) : (
                <VerifiedFalseIcon className='mr-1 h-3.5 w-3.5' />
              )}
              {account.is_verified
                ? verifiedLabels.true.label
                : verifiedLabels.false.label}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
