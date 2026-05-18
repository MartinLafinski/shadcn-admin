import { Suspense, lazy } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteTermMutation } from '@/features/terms/api/terms.ts'
import { useTermsDialog, useTermsActions } from './terms-provider'

const TermConfigDrawer = lazy(() =>
  import('./drawers/terms-config-drawer').then((m) => ({
    default: m.TermConfigDrawer,
  }))
)
const TermCreateDrawer = lazy(() =>
  import('./drawers/terms-create-drawer').then((m) => ({
    default: m.TermCreateDrawer,
  }))
)
const TermUpdateDrawer = lazy(() =>
  import('./drawers/terms-update-drawer').then((m) => ({
    default: m.TermUpdateDrawer,
  }))
)
const TermsSyncDialog = lazy(() =>
  import('./dialogs/terms-sync-dialog').then((m) => ({
    default: m.TermsSyncDialog,
  }))
)
const TermsViewDialog = lazy(() =>
  import('./dialogs/terms-view-dialog').then((m) => ({
    default: m.TermsViewDialog,
  }))
)

export function TermsDialogs() {
  const { open, currentRow } = useTermsDialog()
  const { setOpen, setCurrentRow } = useTermsActions()

  const deleteMutation = useDeleteTermMutation()
  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({
        termId: currentRow?.term_id || 0,
      })
      .then((_) => {
        toast.success(`术语库 ${currentRow?.term_name} 删除成功`)
      })
      .catch((error) => {
        console.error(`术语库 ${currentRow?.term_name} 删除失败:`, error)
        toast.error(`术语库 ${currentRow?.term_name} 删除失败`)
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
        <TermCreateDrawer
          key='term-create'
          open={open === 'create'}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {open === 'sync' && (
        <TermsSyncDialog
          key='term-sync'
          open={open === 'sync'}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {currentRow && (
        <>
          {open === 'update' && (
            <TermUpdateDrawer
              key={`term-update-${currentRow.term_id}`}
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

          {open === 'config' && (
            <TermConfigDrawer
              key={`term-config-${currentRow.term_id}`}
              open={open === 'config'}
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
            <TermsViewDialog
              key='term-view-info'
              open
              termId={currentRow.term_id}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}

          {open === 'delete' && (
            <ConfirmDialog
              key='term-delete'
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
              title='删除术语库'
              desc={
                <>
                  确定要删除术语库 <strong>{currentRow.term_name}</strong>{' '}
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
