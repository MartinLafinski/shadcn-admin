import { lazy, Suspense } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteSpiderSessionMutation } from '@/features/spider-sessions/api/spider-sessions'
import {
  useSpiderSessionsDialog,
  useSpiderSessionsActions,
} from './spider-sessions-provider'

const Create = lazy(() =>
  import('./drawers/spider-sessions-create-drawer.tsx').then((m) => ({
    default: m.SpiderSessionCreateDrawer,
  }))
)
const Update = lazy(() =>
  import('./drawers/spider-sessions-update-drawer.tsx').then((m) => ({
    default: m.SpiderSessionUpdateDrawer,
  }))
)
const Config = lazy(() =>
  import('./drawers/spider-sessions-config-drawer.tsx').then((m) => ({
    default: m.SpiderSessionConfigDrawer,
  }))
)
const Sync = lazy(() =>
  import('./dialogs/spider-sessions-sync-dialog.tsx').then((m) => ({
    default: m.SpiderSessionsSyncDialog,
  }))
)
const Info = lazy(() =>
  import('./dialogs/spider-sessions-info-dialog.tsx').then((m) => ({
    default: m.SpiderSessionsInfoDialog,
  }))
)
const WebsitesViewDialog = lazy(() =>
  import('@/features/websites/components/dialogs/websites-view-dialog').then(
    (m) => ({ default: m.WebsitesViewDialog })
  )
)

export function SpiderSessionsDialogs() {
  const { open, currentRow } = useSpiderSessionsDialog()
  const { setOpen, setCurrentRow } = useSpiderSessionsActions()
  const dm = useDeleteSpiderSessionMutation()

  const hd = async () => {
    await dm
      .mutateAsync({ id: currentRow?.session_id || 0 })
      .then(() =>
        toast.success(`爬虫会话 ${currentRow?.session_name} 删除成功`)
      )
      .catch(() => toast.error(`爬虫会话 ${currentRow?.session_name} 删除失败`))
      .finally(() => {
        setOpen(null)
        setTimeout(() => setCurrentRow(null), 500)
      })
  }

  return (
    <Suspense fallback={null}>
      {open === 'create' && (
        <Create open={open === 'create'} onOpenChange={() => setOpen(null)} />
      )}
      {open === 'sync' && (
        <Sync open={open === 'sync'} onOpenChange={() => setOpen(null)} />
      )}
      {currentRow && (
        <>
          {open === 'update' && (
            <Update
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
            <Config
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
            <Info
              open={open === 'configInfo'}
              sessionId={currentRow.session_id}
              onOpenChange={() => {
                setOpen(null)
                setCurrentRow(null)
              }}
            />
          )}
          {open === 'viewWebsite' && (
            <WebsitesViewDialog
              open={open === 'viewWebsite'}
              websiteId={currentRow.website_id ?? 0}
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
              handleConfirm={hd}
              className='max-w-md'
              title={`删除此爬虫会话 [${currentRow.session_name}] ?`}
              desc={
                <>
                  您即将删除 ID 为 <strong>{currentRow.session_id}</strong>{' '}
                  的爬虫会话！
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
