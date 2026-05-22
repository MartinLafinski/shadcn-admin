import { lazy, Suspense } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteSpiderPackageMutation } from '@/features/spider-packages/api/spider-packages'
import {
  useSpiderPackagesDialog,
  useSpiderPackagesActions,
} from './spider-packages-provider'

const WebsitesViewDialog = lazy(() =>
  import('@/features/websites/components/dialogs/websites-view-dialog').then(
    (m) => ({ default: m.WebsitesViewDialog })
  )
)

const SpiderPackageCreateDrawer = lazy(() =>
  import('./drawers/spider-packages-create-drawer.tsx').then((m) => ({
    default: m.SpiderPackageCreateDrawer,
  }))
)
const SpiderPackageUpdateDrawer = lazy(() =>
  import('./drawers/spider-packages-update-drawer.tsx').then((m) => ({
    default: m.SpiderPackageUpdateDrawer,
  }))
)
const SpiderPackageConfigDrawer = lazy(() =>
  import('./drawers/spider-packages-config-drawer.tsx').then((m) => ({
    default: m.SpiderPackageConfigDrawer,
  }))
)
const SpiderPackagesInfoDialog = lazy(() =>
  import('./dialogs/spider-packages-info-dialog.tsx').then((m) => ({
    default: m.SpiderPackagesInfoDialog,
  }))
)
const SpiderPackagesReleasesDialog = lazy(() =>
  import('./dialogs/spider-packages-releases-dialog.tsx').then((m) => ({
    default: m.SpiderPackagesReleasesDialog,
  }))
)

export function SpiderPackagesDialogs() {
  const { open, currentRow } = useSpiderPackagesDialog()
  const { setOpen, setCurrentRow } = useSpiderPackagesActions()
  const deleteMutation = useDeleteSpiderPackageMutation()

  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({
        spiderPackageId: currentRow?.spider_package_id || 0,
      })
      .then(() => {
        toast.success(`爬虫包 ${currentRow?.spider_package_name} 删除成功`)
      })
      .catch(() => {
        toast.error(`爬虫包 ${currentRow?.spider_package_name} 删除失败`)
      })
      .finally(() => {
        setOpen(null)
        setTimeout(() => setCurrentRow(null), 500)
      })
  }

  return (
    <Suspense fallback={null}>
      {open === 'create' && (
        <SpiderPackageCreateDrawer
          open={open === 'create'}
          onOpenChange={() => setOpen(null)}
        />
      )}

      {currentRow && (
        <>
          {open === 'viewWebsite' && (
            <WebsitesViewDialog
              key='website-view-info'
              open
              websiteId={currentRow.website_id ?? 0}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}

          {open === 'update' && (
            <SpiderPackageUpdateDrawer
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
            <SpiderPackageConfigDrawer
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

          {open === 'configInfo' && (
            <SpiderPackagesInfoDialog
              open={open === 'configInfo'}
              spiderPackageId={currentRow.spider_package_id}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}

          {open === 'releases' && (
            <SpiderPackagesReleasesDialog
              open={open === 'releases'}
              spiderPackageId={currentRow.spider_package_id}
              spiderPackageName={currentRow.spider_package_name}
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
              onOpenChange={(v) => {
                if (!v) {
                  setOpen(null)
                  setTimeout(() => setCurrentRow(null), 500)
                }
              }}
              handleConfirm={handleDelete}
              className='max-w-md'
              title={`删除此爬虫包 [${currentRow.spider_package_name}] ?`}
              desc={
                <>
                  您即将删除 ID 为{' '}
                  <strong>{currentRow.spider_package_id}</strong> 的爬虫包！
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
