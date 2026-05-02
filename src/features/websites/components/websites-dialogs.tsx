import React, { Suspense, lazy } from 'react'
// 操作结果提示框
import { toast } from 'sonner'
// import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteWebsiteMutation } from '@/features/websites/api/websites.ts'
import { useWebsitesDialog, useWebsitesActions } from './websites-provider'

// 懒加载重型组件
const WebsiteUpdateDrawer = lazy(() =>
  import('./drawers/websites-update-drawer.tsx').then((module) => ({
    default: module.WebsiteUpdateDrawer,
  }))
)
const WebsiteCreateDrawer = lazy(() =>
  import('./drawers/websites-create-drawer.tsx').then((module) => ({
    default: module.WebsiteCreateDrawer,
  }))
)
const WebsiteConfigDrawer = lazy(() =>
  import('./drawers/websites-config-drawer.tsx').then((module) => ({
    default: module.WebsiteConfigDrawer,
  }))
)
const WebsitesInfoDialog = lazy(() =>
  import('./dialogs/websites-info-dialog.tsx').then((module) => ({
    default: module.WebsitesInfoDialog,
  }))
)
const WebsitesConfigEditDialog = lazy(() =>
  import('./dialogs/websites-config-edit-dialog.tsx').then((module) => ({
    default: module.WebsitesConfigEditDialog,
  }))
)
const WebsitesSyncDialog = lazy(() =>
  import('./dialogs/websites-sync-dialog.tsx').then((module) => ({
    default: module.WebsitesSyncDialog,
  }))
)

export function WebsitesDialogs() {
  const { open, currentRow } = useWebsitesDialog()
  const { setOpen, setCurrentRow } = useWebsitesActions()

  const deleteMutation = useDeleteWebsiteMutation()
  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({
        websiteId: currentRow?.website_id || 0,
      })
      .then((_) => {
        toast.success(`网站 ${currentRow?.website_name} 删除成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error(`网站 ${currentRow?.website_name} 删除失败:`, error) // 记录错误日志
        toast.error(`网站 ${currentRow?.website_name} 删除失败`) // 操作失败提示
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
        <WebsiteCreateDrawer
          key='website-create'
          open={open === 'create'}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {open === 'sync' && (
        <WebsitesSyncDialog
          key='website-sync'
          open={open === 'sync'}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {currentRow && (
        <>
          {open === 'update' && (
            <WebsiteUpdateDrawer
              key={`website-update-${currentRow.website_id}`}
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
            <WebsiteConfigDrawer
              key={`website-config-${currentRow.website_id}`}
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

          {open === 'editConfig' && (
            <WebsitesConfigEditDialog
              key={`website-config-edit-${currentRow.website_id}`}
              open={open === 'editConfig'}
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

          {open === 'configInfo' && (
            <WebsitesInfoDialog
              key='website-config-info'
              open={open === 'configInfo'}
              readme={currentRow.website_readme}
              config={currentRow.website_config}
              websiteName={currentRow.website_name}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}

          {open === 'delete' && (
            <ConfirmDialog
              key='website-delete'
              destructive
              open={open === 'delete'}
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
              title={`删除此网站 [${currentRow.website_name}] ?`}
              desc={
                <>
                  您即将删除 ID 为 <strong>{currentRow.website_id}</strong>{' '}
                  的网站！
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
