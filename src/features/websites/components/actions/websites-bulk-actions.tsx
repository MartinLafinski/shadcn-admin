// 引入依赖
import { useState } from 'react'
// 表格
import { type Table } from '@tanstack/react-table'
// 图标
import {
  Trash2,
  CircleArrowUp,
  Download,
  LockIcon,
  SquarePlayIcon,
} from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 可用性标签
import { enableLabels, lockedLabels, pausedLabels } from '@/lib/labels'
// 按钮控件
import { Button } from '@/components/ui/button'
// 下拉框控件
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
// 工具提示控件
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
// 批量操作工具栏
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
// 批量更新API调用
import {
  useBatchSwitchWebsitesMutation,
  useBatchExportWebsitesMutation,
  useBatchPauseWebsitesMutation,
  useBatchLockWebsitesMutation,
} from '@/features/websites/api/websites'
// 数据结构
import { type WebsiteItemData } from '../../data/schemas'
// 批量删除对话框
import { WebsitesMultiDeleteDialog } from '../dialogs/websites-multi-delete-dialog'

/**
 * 网站表格批量操作组件的属性类型定义
 *
 * @template TData - 表格数据项的类型，支持泛型以适应不同数据结构
 * @property {Table<TData>} table - TanStack Table实例，用于获取选中行、重置选择等操作
 *
 * 开发者说明:
 * - 使用泛型TData使组件具有更好的类型安全性和复用性
 * - table参数提供了对表格状态和操作的访问，如获取选中行(getFilteredSelectedRowModel)、重置选择(resetRowSelection)等
 */
type WebsiteTableBulkActionsProps<TData> = {
  table: Table<TData>
}

/**
 * 批量操作下拉菜单组件
 */
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

/**
 * 网站数据表格的批量操作组件
 * 提供批量更新状态、优先级、导出和删除等功能
 *
 * @template TData - 表格数据类型
 * @param {WebsiteTableBulkActionsProps<TData>} props - 组件属性
 * @param {Table<TData>} props.table - TanStack表格实例
 *
 * 使用说明:
 * 1. 通过 table.getFilteredSelectedRowModel() 获取选中的行数据
 * 2. 支持批量更新网站状态、优先级
 * 3. 支持批量导出网站
 * 4. 支持批量删除网站（带确认对话框）
 */
export function WebsiteTableBulkActions<TData>({
  table,
}: WebsiteTableBulkActionsProps<TData>) {
  // 控制删除确认对话框的显示状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // 获取当前选中的行数据
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const switchMutation = useBatchSwitchWebsitesMutation()
  const exportMutation = useBatchExportWebsitesMutation()
  const pauseMutation = useBatchPauseWebsitesMutation()
  const lockMutation = useBatchLockWebsitesMutation()

  /**
   * 统一处理批量操作
   */
  const handleBulkAction = async <T,>(
    mutation: { mutateAsync: (variables: T) => Promise<any> },
    data: Omit<T, 'website_ids'>,
    loadingMsg: string,
    successMsgPrefix: string,
    errorMsg: string
  ) => {
    const selectedWebsites = selectedRows.map(
      (row) => row.original as WebsiteItemData
    )
    const selectedWebsiteIds = selectedWebsites.map(
      (website) => website.website_id
    )

    toast.promise(
      mutation
        .mutateAsync({
          website_ids: selectedWebsiteIds,
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
        success: `${successMsgPrefix} ${selectedWebsites.length} 条数据`,
        error: errorMsg,
      }
    )
  }

  return (
    <>
      {/* 批量操作工具栏，传入表格实例和实体名称 */}
      <BulkActionsToolbar table={table} entityName='网站'>
        {/* 批量更新状态 */}
        <BulkActionDropdown
          icon={CircleArrowUp}
          label='更新可用性'
          options={enableLabels}
          onAction={(status) =>
            handleBulkAction(
              switchMutation,
              { website_enabled: status },
              `正在更新网站${status ? '启用' : '禁用'}状态...`,
              `成功更新了`,
              '网站批量更新状态失败'
            )
          }
        />

        {/* 批量锁定/解锁 */}
        <BulkActionDropdown
          icon={LockIcon}
          label='锁定/解锁'
          options={lockedLabels}
          onAction={(locked) =>
            handleBulkAction(
              lockMutation,
              { website_locked: locked },
              `正在进行网站 ${locked ? '锁定' : '解锁'} 操作...`,
              `成功对`,
              '网站批量锁定/解锁失败'
            )
          }
        />

        {/* 批量暂停/恢复 */}
        <BulkActionDropdown
          icon={SquarePlayIcon}
          label='暂停/恢复'
          options={pausedLabels}
          onAction={(paused) =>
            handleBulkAction(
              pauseMutation,
              { website_paused: paused },
              `正在进行网站 ${paused ? '暂停' : '恢复'} 操作...`,
              `成功对`,
              '网站批量暂停/恢复失败'
            )
          }
        />

        {/* 批量导出按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() =>
                handleBulkAction(
                  exportMutation,
                  {},
                  '正在导出网站...',
                  '成功导出',
                  '网站批量导出失败'
                )
              }
              className='size-8'
              aria-label='导出网站'
              title='导出网站'
            >
              <Download />
              <span className='sr-only'>导出网站</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>导出网站</p>
          </TooltipContent>
        </Tooltip>

        {/* 批量删除按钮，点击后显示确认对话框 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='删除所选网站'
              title='删除所选网站'
            >
              <Trash2 />
              <span className='sr-only'>删除所选网站</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选网站</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      {/* 批量删除确认对话框 */}
      <WebsitesMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
