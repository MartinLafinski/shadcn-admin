import { Suspense, lazy } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteIndustryMutation } from '@/features/industries/api/industries.ts'
import {
  useIndustriesDialog,
  useIndustriesActions,
} from './industries-provider'

const IndustryConfigDrawer = lazy(() =>
  import('./drawers/industries-config-drawer').then((m) => ({
    default: m.IndustryConfigDrawer,
  }))
)
const IndustryCreateDrawer = lazy(() =>
  import('./drawers/industries-create-drawer').then((m) => ({
    default: m.IndustryCreateDrawer,
  }))
)
const IndustryUpdateDrawer = lazy(() =>
  import('./drawers/industries-update-drawer').then((m) => ({
    default: m.IndustryUpdateDrawer,
  }))
)
const IndustriesSyncDialog = lazy(() =>
  import('./dialogs/industries-sync-dialog.tsx').then((m) => ({
    default: m.IndustriesSyncDialog,
  }))
)
const IndustriesViewDialog = lazy(() =>
  import('./dialogs/industries-view-dialog.tsx').then((m) => ({
    default: m.IndustriesViewDialog,
  }))
)

export function IndustriesDialogs() {
  const { open, currentRow } = useIndustriesDialog()
  const { setOpen, setCurrentRow } = useIndustriesActions()

  const deleteMutation = useDeleteIndustryMutation()
  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({
        industryId: currentRow?.industry_id || 0,
      })
      .then((_) => {
        toast.success(`行业 ${currentRow?.industry_name} 删除成功`)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(`行业 ${currentRow?.industry_name} 删除失败:`, error)
        toast.error(`行业 ${currentRow?.industry_name} 删除失败`)
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
        <IndustryCreateDrawer
          key='industry-create'
          open={open === 'create'}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {open === 'sync' && (
        <IndustriesSyncDialog
          key='industry-sync'
          open={open === 'sync'}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {currentRow && (
        <>
          {open === 'update' && (
            <IndustryUpdateDrawer
              key={`industry-update-${currentRow.industry_id}`}
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
            <IndustryConfigDrawer
              key={`industry-config-${currentRow.industry_id}`}
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
            <IndustriesViewDialog
              key='industry-view-info'
              open
              industryId={currentRow.industry_id}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}

          {open === 'delete' && (
            <ConfirmDialog
              key='industry-delete'
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
              handleConfirm={() => {
                handleDelete()
              }}
              className='max-w-md'
              title={`删除此行业 [${currentRow.industry_name}] ?`}
              desc={
                <>
                  您即将删除 ID 为 <strong>{currentRow.industry_id}</strong>{' '}
                  的行业！
                  <br />
                  此操作无法撤销。
                </>
              }
              confirmText='删除'
              cancelBtnText='取消'
            />
          )}
        </>
      )}
    </Suspense>
  )
}
