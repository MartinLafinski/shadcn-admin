import { usePreTasks } from './pre-tasks-provider'
import { WebsitesViewDialog } from '@/features/websites/components/dialogs/websites-view-dialog.tsx'
import { EntrypointsViewDialog } from '@/features/entrypoints/components/dialogs/entrypoints-view-dialog.tsx'
import { PreTasksViewDialog } from './dialogs/pre-tasks-view-dialog'

export function PreTasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePreTasks()

  return (
    <>

      {currentRow && currentRow.entrypoint?.website && (
        <>
          <WebsitesViewDialog
            key='website-view-info'
            open={open === 'viewWebsite'}
            website={{
              ...currentRow?.entrypoint?.website,
              created_at: currentRow?.entrypoint?.website?.created_at || "",
              updated_at: currentRow?.entrypoint?.website?.updated_at || "",
              updated_by: currentRow?.entrypoint?.website?.updated_by || "",
              website_readme: currentRow?.entrypoint?.website?.website_readme || ""
            }}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />

          <EntrypointsViewDialog
            key='entrypoint-view-info'
            open={open === 'viewEntrypoint'}
            entrypoint={{
              entrypoint_id: currentRow?.entrypoint?.entrypoint_id || 0,
              created_at: currentRow?.entrypoint?.created_at || "",
              updated_at: currentRow?.entrypoint?.updated_at || "",
              updated_by: currentRow?.entrypoint?.updated_by || "",
              entrypoint_enabled: currentRow?.entrypoint?.entrypoint_enabled || false,
              website_id: currentRow?.entrypoint?.website_id || null,
              website: currentRow?.entrypoint?.website ? {
                ...currentRow.entrypoint.website,
                created_at: currentRow?.entrypoint?.website?.created_at || "",
                updated_at: currentRow?.entrypoint?.website?.updated_at || "",
                updated_by: currentRow?.entrypoint?.website?.updated_by || "",
                website_readme: currentRow?.entrypoint?.website?.website_readme || ""
              } : null,
              entrypoint_name: currentRow?.entrypoint?.entrypoint_name || "",
              entrypoint_slug: currentRow?.entrypoint?.entrypoint_slug || "",
              entrypoint_config: currentRow?.entrypoint?.entrypoint_config || {},
              entrypoint_readme: currentRow?.entrypoint?.entrypoint_readme || "",
              entrypoint_url: currentRow?.entrypoint?.entrypoint_url || undefined,
              // 添加缺失的属性
              begin_at: currentRow?.entrypoint?.begin_at || null,
              end_at: currentRow?.entrypoint?.end_at || null,
              min_available_interval: currentRow?.entrypoint?.min_available_interval || 0,
              triggered_at: currentRow?.entrypoint?.triggered_at || null
            }}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />

          <PreTasksViewDialog
            key='pre-task-view-info'
            open={open === 'view'}
            preTask={currentRow}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />

        </>
      )}

    </>
  )
}