import { Suspense, lazy } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteDictionaryMutation } from '@/features/dictionaries/api/dictionaries'
import {
  useDictionariesDialog,
  useDictionariesActions,
} from './dictionaries-provider'

const DictionaryConfigDrawer = lazy(() =>
  import('./drawers/dictionaries-config-drawer').then((m) => ({
    default: m.DictionaryConfigDrawer,
  }))
)
const DictionaryCreateDrawer = lazy(() =>
  import('./drawers/dictionaries-create-drawer').then((m) => ({
    default: m.DictionaryCreateDrawer,
  }))
)
const DictionaryUpdateDrawer = lazy(() =>
  import('./drawers/dictionaries-update-drawer').then((m) => ({
    default: m.DictionaryUpdateDrawer,
  }))
)
const DictionariesSyncDialog = lazy(() =>
  import('./dialogs/dictionaries-sync-dialog').then((m) => ({
    default: m.DictionariesSyncDialog,
  }))
)
const DictionariesViewDialog = lazy(() =>
  import('./dialogs/dictionaries-view-dialog').then((m) => ({
    default: m.DictionariesViewDialog,
  }))
)

export function DictionariesDialogs() {
  const { open, currentRow } = useDictionariesDialog()
  const { setOpen, setCurrentRow } = useDictionariesActions()

  const deleteMutation = useDeleteDictionaryMutation()
  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({ id: currentRow?.dictionary_id || 0 })
      .then(() =>
        toast.success(`属性字典 ${currentRow?.dictionary_name} 删除成功`)
      )
      .catch((error) => {
        console.error(
          `属性字典 ${currentRow?.dictionary_name} 删除失败:`,
          error
        )
        toast.error(`属性字典 ${currentRow?.dictionary_name} 删除失败`)
      })
      .finally(() => {
        setOpen(null)
        setTimeout(() => setCurrentRow(null), 500)
      })
  }

  return (
    <Suspense fallback={null}>
      {open === 'create' && (
        <DictionaryCreateDrawer
          key='dict-create'
          open={open === 'create'}
          onOpenChange={() => setOpen(null)}
        />
      )}
      {open === 'sync' && (
        <DictionariesSyncDialog
          key='dict-sync'
          open={open === 'sync'}
          onOpenChange={() => setOpen(null)}
        />
      )}
      {currentRow && (
        <>
          {open === 'update' && (
            <DictionaryUpdateDrawer
              key={`dict-update-${currentRow.dictionary_id}`}
              open={open === 'update'}
              onOpenChange={(v) => {
                if (!v) {
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                }
              }}
              currentRow={currentRow}
            />
          )}
          {open === 'config' && (
            <DictionaryConfigDrawer
              key={`dict-config-${currentRow.dictionary_id}`}
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
            <DictionariesViewDialog
              key='dict-view-info'
              open
              dictionaryId={currentRow.dictionary_id}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}
          {open === 'delete' && (
            <ConfirmDialog
              key='dict-delete'
              destructive
              open
              onOpenChange={(v) => {
                if (!v) {
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                }
              }}
              title='删除属性字典'
              desc={
                <>
                  确定要删除属性字典{' '}
                  <strong>{currentRow.dictionary_name}</strong>{' '}
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
