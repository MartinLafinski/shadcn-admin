// import { showSubmittedData } from '@/lib/show-submitted-data'
// 操作结果提示框
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteTemplateMutation } from '@/features/templates/api/templates.ts'
import { TemplatesInfoDialog } from './dialogs/templates-info-dialog.tsx'
import { TemplateConfigDrawer } from './drawers/templates-config-drawer.tsx'
import { TemplateCreateDrawer } from './drawers/templates-create-drawer.tsx'
import { TemplateUpdateDrawer } from './drawers/templates-update-drawer.tsx'
import { useTemplates } from './templates-provider'

export function TemplatesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useTemplates()

  const deleteMutation = useDeleteTemplateMutation()
  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({
        templateId: currentRow?.template_id || 0,
      })
      .then((_) => {
        toast.success(`模板 ${currentRow?.template_name} 删除成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error(`模板 ${currentRow?.template_name} 删除失败:`, error) // 记录错误日志
        toast.error(`模板 ${currentRow?.template_name} 删除失败`) // 操作失败提示
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
      <TemplateCreateDrawer
        key='template-create'
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
          <TemplateUpdateDrawer
            key={`template-update-${currentRow.template_id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <TemplateConfigDrawer
            key={`template-config-${currentRow.template_id}`}
            open={open === 'config'}
            onOpenChange={() => {
              setOpen('config')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <TemplatesInfoDialog
            key='template-config-info'
            open={open === 'configInfo'}
            readme={currentRow.template_readme}
            content={currentRow.template_content || ''}
            templateName={currentRow.template_name}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
              // setTimeout(() => {
              //   setCurrentRow(null)
              // }, 500)
            }}
          />

          <ConfirmDialog
            key='template-delete'
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
            title={`删除此模板 [${currentRow.template_name}] ?`}
            desc={
              <>
                您即将删除 ID 为 <strong>{currentRow.template_id}</strong>{' '}
                的模板！
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
