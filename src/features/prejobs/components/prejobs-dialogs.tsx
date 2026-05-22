import { lazy, Suspense } from 'react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeletePrejobMutation } from '@/features/prejobs/api/prejobs.ts'
import { PrejobsInfoDialog } from './dialogs/prejobs-info-dialog.tsx'
import { PrejobsViewDialog } from './dialogs/prejobs-view-dialog.tsx'
import { PrejobConfigDrawer } from './drawers/prejobs-config-drawer.tsx'
import { PrejobCreateDrawer } from './drawers/prejobs-create-drawer.tsx'
import { PrejobUpdateDrawer } from './drawers/prejobs-update-drawer.tsx'
import { usePrejobs } from './prejobs-provider'

const WebsitesViewDialog = lazy(() =>
  import('@/features/websites/components/dialogs/websites-view-dialog').then(
    (m) => ({ default: m.WebsitesViewDialog })
  )
)

const EntrypointsViewDialog = lazy(() =>
  import('@/features/entrypoints/components/dialogs/entrypoints-view-dialog').then(
    (m) => ({ default: m.EntrypointsViewDialog })
  )
)

const IndustriesViewDialog = lazy(() =>
  import('@/features/industries/components/dialogs/industries-view-dialog').then(
    (m) => ({ default: m.IndustriesViewDialog })
  )
)

const JobGroupsInfoDialog = lazy(() =>
  import('@/features/jobgroups/components/dialogs/jobgroups-info-dialog').then(
    (m) => ({ default: m.JobGroupsInfoDialog })
  )
)

// 懒加载重型组件
const PrejobsSyncDialog = lazy(() =>
  import('./dialogs/prejobs-sync-dialog.tsx').then((m) => ({
    default: m.PrejobsSyncDialog,
  }))
)

export function PrejobsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePrejobs()

  const deleteMutation = useDeletePrejobMutation()
  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({
        prejobId: currentRow?.prejob_id || 0,
      })
      .then((_) => {
        toast.success(`预备作业 ${currentRow?.prejob_name} 删除成功`)
      })
      .catch((error) => {
        console.error(`预备作业 ${currentRow?.prejob_name} 删除失败:`, error)
        toast.error(`预备作业 ${currentRow?.prejob_name} 删除失败`)
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
      <PrejobCreateDrawer
        key='prejob-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      <PrejobsSyncDialog
        key='prejob-sync'
        open={open === 'sync'}
        onOpenChange={() => setOpen(null)}
      />

      {currentRow && (
        <>
          <WebsitesViewDialog
            key='website-view-info'
            open={open === 'viewWebsite'}
            websiteId={currentRow.entrypoint?.website_id ?? 0}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />

          <EntrypointsViewDialog
            key='entrypoint-view-info'
            open={open === 'viewEntrypoint'}
            entrypointId={currentRow.entrypoint_id ?? 0}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />

          <IndustriesViewDialog
            key='industry-view-info'
            open={open === 'viewIndustry'}
            industryId={currentRow.entrypoint?.industry_id ?? 0}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />

          <JobGroupsInfoDialog
            key='jobgroup-view-info'
            open={open === 'viewJobGroup'}
            jobgroupId={currentRow.jobgroup?.jobgroup_id ?? 0}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />

          <PrejobUpdateDrawer
            key={`prejob-update-${currentRow.prejob_id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <PrejobConfigDrawer
            key={`prejob-config-${currentRow.prejob_id}`}
            open={open === 'config'}
            onOpenChange={() => {
              setOpen('config')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <PrejobsInfoDialog
            key='prejob-config-info'
            open={open === 'configInfo'}
            prejobId={currentRow.prejob_id}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />

          <PrejobsViewDialog
            key='prejob-view'
            open={open === 'view'}
            prejob={currentRow}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />

          <ConfirmDialog
            key='prejob-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            handleConfirm={() => {
              handleDelete()
            }}
            className='max-w-md'
            title={`删除此预备作业 [${currentRow.prejob_name}] ?`}
            desc={
              <>
                您即将删除 ID 为 <strong>{currentRow.prejob_id}</strong>{' '}
                的预备作业！
                <br />
                此操作无法撤销。
              </>
            }
            confirmText='删除'
            cancelBtnText='取消'
          />
        </>
      )}
    </Suspense>
  )
}
