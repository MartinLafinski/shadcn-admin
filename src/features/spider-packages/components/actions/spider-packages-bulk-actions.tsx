import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, CircleArrowUp, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import {
  useBatchSwitchSpiderPackagesMutation,
  useBatchExportSpiderPackagesMutation,
  useBatchDeleteSpiderPackagesMutation,
} from '../../api/spider-packages'
import { enableLabels } from '../../data/labels'
import { type SpiderPackageItemData } from '../../data/schemas'

const BulkActionDropdown = ({
  icon: Icon,
  label,
  options,
  onAction,
}: {
  icon: any
  label: string
  options: typeof enableLabels
  onAction: (value: any) => void
}) => (
  <DropdownMenu>
    <Tooltip>
      <TooltipTrigger asChild>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            size='icon'
            className='size-8'
            aria-label={label}
            title={label}
          >
            <Icon />
            <span className='sr-only'>{label}</span>
          </Button>
        </DropdownMenuTrigger>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
    <DropdownMenuContent sideOffset={14}>
      {options.map((item) => (
        <DropdownMenuItem
          key={item.value.toString()}
          onClick={() => onAction(item.value)}
          className={item.className}
        >
          {item.icon && <item.icon className={item.className} />}
          {item.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
)

type SpiderPackagesBulkActionsProps<TData> = {
  table: Table<TData>
}

export function SpiderPackagesBulkActions<TData>({
  table,
}: SpiderPackagesBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const switchMutation = useBatchSwitchSpiderPackagesMutation()
  const exportMutation = useBatchExportSpiderPackagesMutation()
  const deleteMutation = useBatchDeleteSpiderPackagesMutation()

  const handleBulkAction = async <T,>(
    mutation: { mutateAsync: (variables: T) => Promise<any> },
    data: Omit<T, 'spider_package_ids'>,
    loadingMsg: string,
    successMsgPrefix: string,
    errorMsg: string
  ) => {
    const selectedPackages = selectedRows.map(
      (row) => row.original as SpiderPackageItemData
    )
    const selectedPackageIds = selectedPackages.map(
      (pkg) => pkg.spider_package_id
    )

    toast.promise(
      mutation
        .mutateAsync({
          spider_package_ids: selectedPackageIds,
          ...data,
        } as any)
        .then(() => {
          table.resetRowSelection()
        })
        .catch((error: any) => {
          console.error(errorMsg, error)
          throw error
        }),
      {
        loading: loadingMsg,
        success: `${successMsgPrefix} ${selectedPackages.length} 条数据`,
        error: errorMsg,
      }
    )
  }

  const handleDelete = async () => {
    const selectedPackageIds = selectedRows.map(
      (row) => (row.original as SpiderPackageItemData).spider_package_id
    )
    await deleteMutation
      .mutateAsync(selectedPackageIds)
      .then(() => {
        table.resetRowSelection()
        setShowDeleteConfirm(false)
        toast.success(`成功删除了 ${selectedPackageIds.length} 条数据`)
      })
      .catch((error) => {
        console.error('爬虫包批量删除失败', error)
        toast.error('爬虫包批量删除失败')
      })
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='爬虫包'>
        <BulkActionDropdown
          icon={CircleArrowUp}
          label='更新可用性'
          options={enableLabels}
          onAction={(status) =>
            handleBulkAction(
              switchMutation,
              { spider_package_enabled: status },
              `正在更新爬虫包${status ? '启用' : '禁用'}状态...`,
              '成功更新了',
              '爬虫包批量更新状态失败'
            )
          }
        />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() =>
                handleBulkAction(
                  exportMutation,
                  {},
                  '正在导出爬虫包...',
                  '成功导出',
                  '爬虫包批量导出失败'
                )
              }
              className='size-8'
              aria-label='导出爬虫包'
              title='导出爬虫包'
            >
              <Download />
              <span className='sr-only'>导出爬虫包</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>导出爬虫包</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='删除所选爬虫包'
              title='删除所选爬虫包'
            >
              <Trash2 />
              <span className='sr-only'>删除所选爬虫包</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选爬虫包</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ConfirmDialog
        destructive
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        handleConfirm={handleDelete}
        className='max-w-md'
        title={`批量删除爬虫包？`}
        desc={
          <>
            您即将永久删除选中的 <strong>{selectedRows.length}</strong>{' '}
            个爬虫包！
            <br />
            此操作无法撤销。
          </>
        }
        confirmText='删除'
        cancelBtnText='取消'
      />
    </>
  )
}
