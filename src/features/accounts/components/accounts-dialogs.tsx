import React, { Suspense, useState } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteAccountMutation } from '@/features/accounts/api/accounts.ts'
import { useAccounts } from './accounts-provider'
import { AccountsViewDialog } from './dialogs/accounts-view-dialog.tsx'

const AccountsCreateDrawer = React.lazy(() =>
  import('./drawers/accounts-create-drawer').then((m) => ({
    default: m.AccountsCreateDrawer,
  }))
)
const AccountsUpdateDrawer = React.lazy(() =>
  import('./drawers/accounts-update-drawer').then((m) => ({
    default: m.AccountsUpdateDrawer,
  }))
)

export function AccountsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAccounts()

  const [createKey, setCreateKey] = useState(0)

  const deleteMutation = useDeleteAccountMutation()
  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({
        accountId: currentRow?.user_id || 0,
      })
      .then(() => {
        toast.success(`用户 ${currentRow?.username} 删除成功`)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`用户 ${currentRow?.username} 删除失败:`, error)
        toast.error(`用户 ${currentRow?.username} 删除失败`)
      })
      .finally(() => {
        setOpen(null)
        setTimeout(() => {
          setCurrentRow(null)
        }, 500)
      })
  }

  return (
    <>
      <Suspense fallback={null}>
        <AccountsCreateDrawer
          key={`account-create-${createKey}`}
          open={open === 'create'}
          onOpenChange={() => {
            setCreateKey((k) => k + 1)
            setOpen('create')
          }}
        />
      </Suspense>

      {currentRow && (
        <>
          <Suspense fallback={null}>
            <AccountsUpdateDrawer
              key={`account-update-${currentRow.user_id}`}
              open={open === 'update'}
              onOpenChange={() => {
                setOpen('update')
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }}
              currentRow={currentRow}
            />
          </Suspense>

          <AccountsViewDialog
            key='account-view-info'
            open={open === 'view'}
            account={currentRow}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />

          <ConfirmDialog
            key='account-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              handleDelete()
            }}
            className='max-w-md'
            title={`删除此用户 [${currentRow.username}] ?`}
            desc={
              <>
                您即将删除 ID 为 <strong>{currentRow.user_id}</strong> 的用户！
                <br />
                此操作无法撤销。
              </>
            }
            confirmText='删除'
            cancelBtnText='取消'
          />
        </>
      )}
    </>
  )
}
