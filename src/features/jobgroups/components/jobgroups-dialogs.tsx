import { lazy, Suspense } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteJobGroupMutation } from '@/features/jobgroups/api/jobgroups'
import { useJobGroupsDialog, useJobGroupsActions } from './jobgroups-provider'

const JobGroupCreateDrawer = lazy(() =>
  import('./drawers/jobgroups-create-drawer.tsx').then((m) => ({
    default: m.JobGroupCreateDrawer,
  }))
)
const JobGroupUpdateDrawer = lazy(() =>
  import('./drawers/jobgroups-update-drawer.tsx').then((m) => ({
    default: m.JobGroupUpdateDrawer,
  }))
)
const JobGroupConfigDrawer = lazy(() =>
  import('./drawers/jobgroups-config-drawer.tsx').then((m) => ({
    default: m.JobGroupConfigDrawer,
  }))
)
const JobGroupsSyncDialog = lazy(() =>
  import('./dialogs/jobgroups-sync-dialog.tsx').then((m) => ({
    default: m.JobGroupsSyncDialog,
  }))
)
const JobGroupsInfoDialog = lazy(() =>
  import('./dialogs/jobgroups-info-dialog.tsx').then((m) => ({
    default: m.JobGroupsInfoDialog,
  }))
)

export function JobGroupsDialogs() {
  const { open, currentRow } = useJobGroupsDialog()
  const { setOpen, setCurrentRow } = useJobGroupsActions()
  const deleteMutation = useDeleteJobGroupMutation()

  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({ id: currentRow?.jobgroup_id || 0 })
      .then(() =>
        toast.success(`作业分组 ${currentRow?.jobgroup_name} 删除成功`)
      )
      .catch(() =>
        toast.error(`作业分组 ${currentRow?.jobgroup_name} 删除失败`)
      )
      .finally(() => {
        setOpen(null)
        setTimeout(() => setCurrentRow(null), 500)
      })
  }

  return (
    <Suspense fallback={null}>
      {open === 'create' && (
        <JobGroupCreateDrawer
          open={open === 'create'}
          onOpenChange={() => setOpen(null)}
        />
      )}
      {open === 'sync' && (
        <JobGroupsSyncDialog
          open={open === 'sync'}
          onOpenChange={() => setOpen(null)}
        />
      )}
      {currentRow && (
        <>
          {open === 'update' && (
            <JobGroupUpdateDrawer
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
            <JobGroupConfigDrawer
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
            <JobGroupsInfoDialog
              open={open === 'configInfo'}
              jobgroupId={currentRow.jobgroup_id}
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
              title={`删除此作业分组 [${currentRow.jobgroup_name}] ?`}
              desc={
                <>
                  您即将删除 ID 为 <strong>{currentRow.jobgroup_id}</strong>{' '}
                  的作业分组！
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
