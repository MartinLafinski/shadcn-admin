import { Suspense, lazy } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteParamModelRegisterMutation } from '@/features/param-model-register/api/param-model-register'
import {
  useParamModelRegistersDialog,
  useParamModelRegistersActions,
} from './param-model-register-provider'

const ParamModelRegisterCreateDrawer = lazy(() =>
  import('./drawers/param-model-register-create-drawer').then((m) => ({
    default: m.ParamModelRegisterCreateDrawer,
  }))
)
const ParamModelRegisterUpdateDrawer = lazy(() =>
  import('./drawers/param-model-register-update-drawer').then((m) => ({
    default: m.ParamModelRegisterUpdateDrawer,
  }))
)
const ParamModelRegisterSyncDialog = lazy(() =>
  import('./dialogs/param-model-register-sync-dialog').then((m) => ({
    default: m.ParamModelRegisterSyncDialog,
  }))
)
const ParamModelRegisterViewDialog = lazy(() =>
  import('./dialogs/param-model-register-view-dialog').then((m) => ({
    default: m.ParamModelRegisterViewDialog,
  }))
)

export function ParamModelRegisterDialogs() {
  const { open, currentRow } = useParamModelRegistersDialog()
  const { setOpen, setCurrentRow } = useParamModelRegistersActions()

  const deleteMutation = useDeleteParamModelRegisterMutation()
  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({
        registerId: currentRow?.register_id || 0,
      })
      .then(() => {
        toast.success(
          `参数模型集 ${currentRow?.register_name || currentRow?.register_slug} 删除成功`
        )
      })
      .catch((error) => {
        console.error(
          `参数模型集 ${currentRow?.register_name || currentRow?.register_slug} 删除失败:`,
          error
        )
        toast.error(
          `参数模型集 ${currentRow?.register_name || currentRow?.register_slug} 删除失败`
        )
      })
      .finally(() => {
        setOpen(null)
        setTimeout(() => {
          setCurrentRow(null)
        }, 500)
      })
  }

  return (
    <Suspense fallback={null}>
      {open === 'create' && (
        <ParamModelRegisterCreateDrawer
          key='pmr-create'
          open={open === 'create'}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {open === 'sync' && (
        <ParamModelRegisterSyncDialog
          key='pmr-sync'
          open={open === 'sync'}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {currentRow && (
        <>
          {open === 'update' && (
            <ParamModelRegisterUpdateDrawer
              key={`pmr-update-${currentRow.register_id}`}
              open={open === 'update'}
              onOpenChange={(v) => {
                if (!v) {
                  setOpen(null)
                  setTimeout(() => {
                    setCurrentRow(null)
                  }, 500)
                }
              }}
              currentRow={currentRow}
            />
          )}

          {open === 'view' && (
            <ParamModelRegisterViewDialog
              key='pmr-view-info'
              open
              registerId={currentRow.register_id}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}

          {open === 'delete' && (
            <ConfirmDialog
              key='pmr-delete'
              destructive
              open
              onOpenChange={(v) => {
                if (!v) {
                  setOpen(null)
                  setTimeout(() => {
                    setCurrentRow(null)
                  }, 500)
                }
              }}
              title='删除参数模型集'
              desc={
                <>
                  确定要删除参数模型集{' '}
                  <strong>
                    {currentRow.register_name || currentRow.register_slug}
                  </strong>{' '}
                  吗？此操作不可撤销。
                </>
              }
              confirmText='删除'
              handleConfirm={handleDelete}
            />
          )}
        </>
      )}
    </Suspense>
  )
}
