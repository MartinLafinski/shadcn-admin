import { Suspense, lazy } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteParamFormMutation } from '@/features/param-forms/api/param-forms'
import {
  useParamFormsDialog,
  useParamFormsActions,
} from './param-forms-provider'

const ParamFormConfigDrawer = lazy(() =>
  import('./drawers/param-forms-config-drawer').then((m) => ({
    default: m.ParamFormConfigDrawer,
  }))
)
const ParamFormsSyncDialog = lazy(() =>
  import('./dialogs/param-forms-sync-dialog').then((m) => ({
    default: m.ParamFormsSyncDialog,
  }))
)
const ParamFormsViewDialog = lazy(() =>
  import('./dialogs/param-forms-view-dialog').then((m) => ({
    default: m.ParamFormsViewDialog,
  }))
)

export function ParamFormsDialogs() {
  const { open, currentRow } = useParamFormsDialog()
  const { setOpen, setCurrentRow } = useParamFormsActions()

  const deleteMutation = useDeleteParamFormMutation()
  const handleDelete = async () => {
    if (!currentRow?.param_form_id) return
    await deleteMutation
      .mutateAsync(currentRow.param_form_id)
      .then(() =>
        toast.success(`参数要素 ${currentRow?.param_form_name} 删除成功`)
      )
      .catch((error) => {
        console.error(
          `参数要素 ${currentRow?.param_form_name} 删除失败:`,
          error
        )
        toast.error(`参数要素 ${currentRow?.param_form_name} 删除失败`)
      })
      .finally(() => {
        setOpen(null)
        setTimeout(() => setCurrentRow(null), 500)
      })
  }

  return (
    <Suspense fallback={null}>
      {open === 'sync' && (
        <ParamFormsSyncDialog
          key='pf-sync'
          open={open === 'sync'}
          onOpenChange={() => setOpen(null)}
        />
      )}
      {currentRow && (
        <>
          {open === 'config' && (
            <ParamFormConfigDrawer
              key={`pf-config-${currentRow.param_form_id}`}
              open={open === 'config'}
              onOpenChange={(v) => {
                if (!v) {
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                }
              }}
              currentRow={currentRow}
            />
          )}
          {open === 'view' && (
            <ParamFormsViewDialog
              key='pf-view-info'
              open
              paramFormId={currentRow.param_form_id}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}
          {open === 'delete' && (
            <ConfirmDialog
              key='pf-delete'
              destructive
              open
              onOpenChange={(v) => {
                if (!v) {
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                }
              }}
              title='删除参数要素'
              desc={
                <>
                  确定要删除参数要素{' '}
                  <strong>{currentRow.param_form_name}</strong>{' '}
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
