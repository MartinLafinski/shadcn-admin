// import { showSubmittedData } from '@/lib/show-submitted-data'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { WebsiteUpdateDrawer } from './drawers/websites-update-drawer.tsx'
import { WebsiteCreateDrawer} from "./drawers/websites-create-drawer.tsx"
import { WebsiteConfigDrawer} from "./drawers/websites-config-drawer.tsx"
import { useWebsites } from './websites-provider'
import { WebsitesInfoDialog } from './dialogs/websites-info-dialog.tsx'
import { useDeleteWebsiteMutation } from "@/features/websites/api/websites.ts"
// 操作结果提示框
import { toast } from "sonner"

export function WebsitesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useWebsites()

  const deleteMutation = useDeleteWebsiteMutation()
  const handleDelete = async () => {
    await deleteMutation.mutateAsync({
      websiteId: currentRow?.website_id || 0,
    }).then((_) => {
      toast.success(`网站 ${currentRow?.website_name} 删除成功`) // 操作成功提示
    }).catch((error) => {
      console.error(`网站 ${currentRow?.website_name} 删除失败:`, error) // 记录错误日志
      toast.error(`网站 ${currentRow?.website_name} 删除失败`) // 操作失败提示
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
      <WebsiteCreateDrawer
        key='website-create'
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
          <WebsiteUpdateDrawer
            key={`website-update-${currentRow.website_id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <WebsiteConfigDrawer
            key={`website-config-${currentRow.website_id}`}
            open={open === 'config'}
            onOpenChange={() => {
              setOpen('config')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <WebsitesInfoDialog
            key='website-config-info'
            open={open === 'configInfo'}
            readme={currentRow.website_readme}
            config={currentRow.website_config}
            websiteName={currentRow.website_name}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
              // setTimeout(() => {
              //   setCurrentRow(null)
              // }, 500)
            }}
          />

          <ConfirmDialog
            key='website-delete'
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
            title={`删除此网站 [${currentRow.website_name}] ?`}
            desc={
              <>
                您即将删除 ID 为 <strong>{currentRow.website_id}</strong> 的网站！<br />
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
