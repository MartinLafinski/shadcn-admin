// import { showSubmittedData } from '@/lib/show-submitted-data'
// 操作结果提示框
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useDeleteBlackwordMutation } from '@/features/blackwords/api/blackwords.ts'
import { useBlackwords } from './blackwords-provider'
import { BlackwordsInfoDialog } from './dialogs/blackwords-info-dialog.tsx'
import { BlackwordConfigDrawer } from './drawers/blackwords-config-drawer'
import { BlackwordCreateDrawer } from './drawers/blackwords-create-drawer'
import { BlackwordUpdateDrawer } from './drawers/blackwords-update-drawer'

export function BlackwordsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useBlackwords()

  const deleteMutation = useDeleteBlackwordMutation()
  const handleDelete = async () => {
    await deleteMutation
      .mutateAsync({
        blackwordsId: currentRow?.blackwords_id || 0,
      })
      .then((_) => {
        toast.success(`敏感词 ${currentRow?.blackwords_name} 删除成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error(`敏感词 ${currentRow?.blackwords_name} 删除失败:`, error) // 记录错误日志
        toast.error(`敏感词 ${currentRow?.blackwords_name} 删除失败`) // 操作失败提示
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
      <BlackwordCreateDrawer
        key='blackword-create'
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
          <BlackwordUpdateDrawer
            key={`blackword-update-${currentRow.blackwords_id}`}
            open={open === 'update'}
            onOpenChange={() => {
              setOpen('update')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <BlackwordConfigDrawer
            key={`blackword-config-${currentRow.blackwords_id}`}
            open={open === 'config'}
            onOpenChange={() => {
              setOpen('config')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <BlackwordsInfoDialog
            key='blackword-config-info'
            open={open === 'info'}
            readme={currentRow.blackwords_readme}
            collection={currentRow.blackwords_collection}
            blackwordName={currentRow.blackwords_name}
            onOpenChange={() => {
              setOpen(null)
              setCurrentRow(null)
              // setTimeout(() => {
              //   setCurrentRow(null)
              // }, 500)
            }}
          />

          <ConfirmDialog
            key='blackword-delete'
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
            title={`删除此敏感词 [${currentRow.blackwords_name}] ?`}
            desc={
              <>
                您即将删除 ID 为 <strong>{currentRow.blackwords_id}</strong>{' '}
                的敏感词！
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
