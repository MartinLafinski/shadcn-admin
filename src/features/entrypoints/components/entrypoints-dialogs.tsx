// import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { EntrypointUpdateDrawer } from './drawers/entrypoints-update-drawer.tsx'
import { EntrypointCreateDrawer} from "./drawers/entrypoints-create-drawer.tsx"
import { EntrypointConfigDrawer} from "./drawers/entrypoints-config-drawer.tsx"
import { useEntrypoints } from './entrypoints-provider'
import { EntrypointsInfoDialog } from './dialogs/entrypoints-info-dialog.tsx'
import { useDeleteEntrypointMutation } from "@/features/entrypoints/api/entrypoints"
import { WebsitesViewDialog } from '@/features/websites/components/dialogs/websites-view-dialog'
// 操作结果提示框
import { toast } from "sonner"

export function EntrypointsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useEntrypoints()

  const deleteMutation = useDeleteEntrypointMutation()
  const handleDelete = async () => {
    await deleteMutation.mutateAsync({
      entrypointId: currentRow?.entrypoint_id || 0,
    }).then((_) => {
      toast.success(`入口点 ${currentRow?.entrypoint_name} 删除成功`) // 操作成功提示
    }).catch((error) => {
      console.error(`入口点 ${currentRow?.entrypoint_name} 删除失败:`, error) // 记录错误日志
      toast.error(`入口点 ${currentRow?.entrypoint_name} 删除失败`) // 操作失败提示
    }).finally(() => {
      setOpen(null)
      setTimeout(() => {
        setCurrentRow(null)
      }, 500)
      // showSubmittedData(
      //   currentRow,
      //   '提示的数据：'
      // )
    })
  }

  return (
    <>
      <EntrypointCreateDrawer
        key='entrypoint-create'
        open={open === 'create'}
        onOpenChange={() => setOpen('create')}
      />

      {/*<TasksImportDialog*/}
      {/*  key='tasks-import'*/}
      {/*  open={open === 'import'}*/}
      {/*  onOpenChange={() => setOpen('import')}*/}
      {/*/>*/}

      {currentRow && (
        <>
          <EntrypointUpdateDrawer
            key={`entrypoint-update-${currentRow.entrypoint_id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <EntrypointConfigDrawer
            key={`entrypoint-config-${currentRow.entrypoint_id}`}
            open={open === 'config'}
            onOpenChange={() => {
              setOpen('config')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <EntrypointsInfoDialog
            key='entrypoint-config-info'
            open={open === 'configInfo'}
            readme={currentRow.entrypoint_readme}
            config={currentRow.entrypoint_config}
            entrypointName={currentRow.entrypoint_name}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
              // setTimeout(() => {
              //   setCurrentRow(null)
              // }, 500)
            }}
          />
          <WebsitesViewDialog
            key='website-view-info'
            open={open === 'viewWebsite'}
            website={currentRow.website}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
            }}
          />

          <ConfirmDialog
            key='entrypoint-delete'
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
            title={`删除此入口点 [${currentRow.entrypoint_name}] ?`}
            desc={
              <>
                您即将删除 ID 为 <strong>{currentRow.entrypoint_id}</strong> 的入口点！<br />
                此操作无法撤销。
              </>
            }
            confirmText='删除'
            cancelBtnText='取消'
          />
        </>
      )}
    </>
  )
}