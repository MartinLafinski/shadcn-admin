// import { showSubmittedData } from '@/lib/show-submitted-data'
// 操作结果提示框
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteLinkMutation } from '@/features/links/api/links.ts'
import { LinksInfoDialog } from './dialogs/links-info-dialog.tsx'
import { LinkConfigDrawer } from './drawers/links-config-drawer.tsx'
import { LinkCreateDrawer } from './drawers/links-create-drawer.tsx'
import { LinkUpdateDrawer } from './drawers/links-update-drawer.tsx'
import { useLinks } from './links-provider'

export function LinksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useLinks()

  const deleteMutation = useDeleteLinkMutation()
  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({
        linkId: currentRow?.links_id || 0,
      })
      .then((_) => {
        toast.success(`友链 ${currentRow?.links_name} 删除成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error(`友链 ${currentRow?.links_name} 删除失败:`, error) // 记录错误日志
        toast.error(`友链 ${currentRow?.links_name} 删除失败`) // 操作失败提示
      })
      .finally(() => {
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
      <LinkCreateDrawer
        key='link-create'
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
          <LinkUpdateDrawer
            key={`link-update-${currentRow.links_id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <LinkConfigDrawer
            key={`link-config-${currentRow.links_id}`}
            open={open === 'config'}
            onOpenChange={() => {
              setOpen('config')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <LinksInfoDialog
            key='link-config-info'
            open={open === 'configInfo'}
            readme={currentRow.links_readme}
            collection={currentRow.links_collection}
            linksName={currentRow.links_name}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
              // setTimeout(() => {
              //   setCurrentRow(null)
              // }, 500)
            }}
          />

          <ConfirmDialog
            key='link-delete'
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
            title={`删除此友链 [${currentRow.links_name}] ?`}
            desc={
              <>
                您即将删除 ID 为 <strong>{currentRow.links_id}</strong> 的友链！
                <br />
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
