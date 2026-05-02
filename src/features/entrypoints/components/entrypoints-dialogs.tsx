import React, { lazy, Suspense, useCallback } from 'react'
// 操作结果提示框
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteEntrypointMutation } from '@/features/entrypoints/api/entrypoints'
import {
  useEntrypointsDialog,
  useEntrypointsActions,
} from './entrypoints-provider'

// 懒加载重型组件
const EntrypointUpdateDrawer = lazy(() =>
  import('./drawers/entrypoints-update-drawer.tsx').then((m) => ({
    default: m.EntrypointUpdateDrawer,
  }))
)
const EntrypointCreateDrawer = lazy(() =>
  import('./drawers/entrypoints-create-drawer.tsx').then((m) => ({
    default: m.EntrypointCreateDrawer,
  }))
)
const EntrypointConfigDrawer = lazy(() =>
  import('./drawers/entrypoints-config-drawer.tsx').then((m) => ({
    default: m.EntrypointConfigDrawer,
  }))
)
const EntrypointsInfoDialog = lazy(() =>
  import('./dialogs/entrypoints-info-dialog.tsx').then((m) => ({
    default: m.EntrypointsInfoDialog,
  }))
)
const EntrypointsConfigEditDialog = lazy(() =>
  import('./dialogs/entrypoints-config-edit-dialog.tsx').then((m) => ({
    default: m.EntrypointsConfigEditDialog,
  }))
)
const EntrypointsPeriodEditDialog = lazy(() =>
  import('./dialogs/entrypoints-period-edit-dialog.tsx').then((m) => ({
    default: m.EntrypointsPeriodEditDialog,
  }))
)
const EntrypointsCreatePrejobDialog = lazy(() =>
  import('./dialogs/entrypoints-create-prejob-dialog.tsx').then((m) => ({
    default: m.EntrypointsCreatePrejobDialog,
  }))
)
const EntrypointsSyncDialog = lazy(() =>
  import('./dialogs/entrypoints-sync-dialog.tsx').then((m) => ({
    default: m.EntrypointsSyncDialog,
  }))
)
const WebsitesViewDialog = lazy(() =>
  import('@/features/websites/components/dialogs/websites-view-dialog').then(
    (m) => ({ default: m.WebsitesViewDialog })
  )
)
const IndustriesViewDialog = lazy(() =>
  import('@/features/industries/components/dialogs/industries-view-dialog').then(
    (m) => ({ default: m.IndustriesViewDialog })
  )
)

export function EntrypointsDialogs() {
  const { open, currentRow } = useEntrypointsDialog()
  const { setOpen, setCurrentRow } = useEntrypointsActions()

  const deleteMutation = useDeleteEntrypointMutation()

  const handleDelete = useCallback(async () => {
    if (!currentRow) return
    await deleteMutation
      .mutateAsync({
        entrypointId: currentRow.entrypoint_id,
      })
      .then((_) => {
        toast.success(`入口点 ${currentRow.entrypoint_name} 删除成功`)
      })
      .catch((error) => {
        console.error(`入口点 ${currentRow.entrypoint_name} 删除失败:`, error)
        toast.error(`入口点 ${currentRow.entrypoint_name} 删除失败`)
      })
      .finally(() => {
        setOpen(null)
        setTimeout(() => {
          setCurrentRow(null)
        }, 500)
      })
  }, [currentRow, deleteMutation, setOpen, setCurrentRow])

  return (
    <Suspense fallback={null}>
      {open === 'create' && (
        <EntrypointCreateDrawer
          open={open === 'create'}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {open === 'sync' && (
        <EntrypointsSyncDialog
          open={open === 'sync'}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {currentRow && (
        <>
          {open === 'update' && (
            <EntrypointUpdateDrawer
              open={open === 'update'}
              onOpenChange={(val) => {
                if (!val) {
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                }
              }}
              currentRow={currentRow}
            />
          )}

          {open === 'config' && (
            <EntrypointConfigDrawer
              open={open === 'config'}
              onOpenChange={(val) => {
                if (!val) {
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                }
              }}
              currentRow={currentRow}
            />
          )}

          {open === 'configSpider' && (
            <EntrypointsConfigEditDialog
              open={open === 'configSpider'}
              onOpenChange={(val) => {
                if (!val) {
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                }
              }}
              currentRow={currentRow}
            />
          )}

          {open === 'period' && (
            <EntrypointsPeriodEditDialog
              open={open === 'period'}
              onOpenChange={(val) => {
                if (!val) {
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                }
              }}
              currentRow={currentRow}
            />
          )}

          {open === 'createPrejob' && (
            <EntrypointsCreatePrejobDialog
              open={open === 'createPrejob'}
              onOpenChange={(val) => {
                if (!val) {
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                }
              }}
              currentRow={currentRow}
            />
          )}

          {open === 'configInfo' && (
            <EntrypointsInfoDialog
              open={open === 'configInfo'}
              readme={currentRow.entrypoint_readme}
              config={currentRow.entrypoint_config}
              entrypointName={currentRow.entrypoint_name}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}

          {open === 'viewWebsite' && (
            <WebsitesViewDialog
              open={open === 'viewWebsite'}
              website={currentRow.website}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}

          {open === 'viewIndustry' && (
            <IndustriesViewDialog
              open={open === 'viewIndustry'}
              industry={currentRow.industry}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}

          {open === 'delete' && (
            <ConfirmDialog
              destructive
              open={open === 'delete'}
              onOpenChange={(val) => {
                if (!val) {
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                }
              }}
              handleConfirm={handleDelete}
              className='max-w-md'
              title={`删除此入口点 [${currentRow.entrypoint_name}] ?`}
              desc={
                <>
                  您即将删除 ID 为 <strong>{currentRow.entrypoint_id}</strong>{' '}
                  的入口点！
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
