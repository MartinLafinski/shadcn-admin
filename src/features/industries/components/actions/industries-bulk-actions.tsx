// 引入依赖
import { useState } from 'react'
// 表格
import { type Table } from '@tanstack/react-table'
// 图标
import { Trash2, Download } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 按钮控件
import { Button } from '@/components/ui/button'
// 工具提示控件
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
// 批量操作工具栏
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
// 批量导出API调用
import { useBatchExportIndustriesMutation } from '@/features/industries/api/industries'
// 数据结构
import { type IndustryItemData } from '../../data/schemas'
// 批量删除对话框
import { IndustriesMultiDeleteDialog } from '../dialogs/industries-multi-delete-dialog'

/**
 * 行业表格批量操作组件的属性类型定义
 *
 * @template TData - 表格数据项的类型，支持泛型以适应不同数据结构
 * @property {Table<TData>} table - TanStack Table实例，用于获取选中行、重置选择等操作
 */
type IndustryTableBulkActionsProps<TData> = {
  table: Table<TData>
}

/**
 * 行业数据表格的批量操作组件
 * 提供批量导出和删除等功能
 *
 * @template TData - 表格数据类型
 * @param {IndustryTableBulkActionsProps<TData>} props - 组件属性
 * @param {Table<TData>} props.table - TanStack表格实例
 */
export function IndustryTableBulkActions<TData>({
  table,
}: IndustryTableBulkActionsProps<TData>) {
  // 控制删除确认对话框的显示状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // 获取当前选中的行数据
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const exportMutation = useBatchExportIndustriesMutation()

  /**
   * 批量导出行业数据的处理函数
   *
   * 功能说明:
   * 1. 获取当前选中的行业数据
   * 2. 提取行业ID列表
   * 3. 调用API进行批量导出操作
   * 4. 显示操作进度和结果提示
   * 5. 操作完成后重置表格选择状态
   */
  const handleBulkExport = async () => {
    // 从表格选中行中提取行业数据
    const selectedIndustries = selectedRows.map(
      (row) => row.original as IndustryItemData
    )
    // 提取行业ID数组，用于API调用
    const selectedIndustryIds = selectedIndustries.map(
      (industry) => industry.industry_id
    )
    // 导出成功后的处理
    toast.promise(
      // 发起批量导出API请求
      exportMutation
        .mutateAsync({
          industry_ids: selectedIndustryIds,
        })
        .then(() => {
          // 操作成功后重置表格选择状态
          table.resetRowSelection()
        })
        .catch((error) => {
          // 在捕获错误后，需要确保loading状态被取消
          console.error('行业批量导出失败:', error)
          throw error // 重新抛出错误，让toast能正确处理
        }),
      {
        loading: '正在导出行业...',
        success: `成功导出 ${selectedIndustries.length} 条行业数据`,
        error: '行业批量导出失败',
      }
    )
  }

  return (
    <>
      {/* 批量操作工具栏，传入表格实例和实体名称 */}
      <BulkActionsToolbar table={table} entityName='行业'>
        {/* 批量导出按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkExport()}
              className='size-8'
              aria-label='导出行业'
              title='导出行业'
            >
              <Download />
              <span className='sr-only'>导出行业</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>导出行业</p>
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
              aria-label='删除所选行业'
              title='删除所选行业'
            >
              <Trash2 />
              <span className='sr-only'>删除所选行业</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选行业</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      {/* 批量删除确认对话框 */}
      <IndustriesMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
