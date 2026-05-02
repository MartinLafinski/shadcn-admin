// 表格
import { type Table } from '@tanstack/react-table'
// 图标
import { Download } from 'lucide-react'
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
import { useBatchExportPreTasksMutation } from '@/features/pre-tasks/api/pre-tasks'
// 数据结构
import { type PreTaskItemData } from '../../data/schemas'

/**
 * 准任务表格批量操作组件的属性类型定义
 *
 * @template TData - 表格数据项的类型，支持泛型以适应不同数据结构
 * @property {Table<TData>} table - TanStack Table实例，用于获取选中行、重置选择等操作
 *
 * 开发者说明:
 * - 使用泛型TData使组件具有更好的类型安全性和复用性
 * - table参数提供了对表格状态和操作的访问，如获取选中行(getFilteredSelectedRowModel)、重置选择(resetRowSelection)等
 */
type PreTasksTableBulkActionsProps<TData> = {
  table: Table<TData>
}

/**
 * 准任务数据表格的批量操作组件
 * 提供批量导出功能
 *
 * @template TData - 表格数据类型
 * @param {PreTasksTableBulkActionsProps<TData>} props - 组件属性
 * @param {Table<TData>} props.table - TanStack表格实例
 *
 * 使用说明:
 * 1. 通过 table.getFilteredSelectedRowModel() 获取选中的行数据
 * 2. 支持批量导出准任务
 */
export function PreTasksTableBulkActions<TData>({
  table,
}: PreTasksTableBulkActionsProps<TData>) {
  // 获取当前选中的行数据
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const exportMutation = useBatchExportPreTasksMutation()

  /**
   * 批量导出准任务数据的处理函数
   *
   * 功能说明:
   * 1. 获取当前选中的准任务数据
   * 2. 提取准任务ID列表
   * 3. 调用API进行批量导出操作
   * 4. 显示操作进度和结果提示
   * 5. 操作完成后重置表格选择状态
   *
   * 错误处理:
   * - 捕获并记录API调用异常
   * - 向用户显示错误提示信息
   *
   * 用户体验优化:
   * - 使用toast.promise显示操作状态（加载中、成功、失败）
   * - 操作完成后自动清除选中状态
   *
   * 开发者提示:
   * - 可在此方法中添加更多验证逻辑，如检查选中数据是否为空
   * - 可以根据实际API响应结果调整成功提示信息
   * - 如需支持不同导出格式，可在API调用中添加格式参数
   */
  const handleBulkExport = async () => {
    // 从表格选中行中提取准任务数据
    const selectedPreTasks = selectedRows.map(
      (row) => row.original as PreTaskItemData
    )
    // 提取准任务ID数组，用于API调用
    const selectedPreTaskIds = selectedPreTasks.map(
      (preTask) => preTask.pre_task_id
    )
    // 导出成功后的处理
    toast.promise(
      // 发起批量导出API请求
      exportMutation
        .mutateAsync({
          pre_task_ids: selectedPreTaskIds,
        })
        .then(() => {
          // 操作成功后重置表格选择状态
          table.resetRowSelection()
        })
        .catch((error) => {
          // 在捕获错误后，需要确保loading状态被取消
          console.error('准任务批量导出失败:', error)
          throw error // 重新抛出错误，让toast能正确处理
        }),
      {
        loading: '正在导出准任务...',
        success: `成功导出 ${selectedPreTasks.length} 条准任务数据`,
        error: '准任务批量导出失败',
      }
    )
  }

  return (
    <>
      {/* 批量操作工具栏，传入表格实例和实体名称 */}
      <BulkActionsToolbar table={table} entityName='准任务'>
        {/* 批量导出按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkExport()}
              className='size-8'
              aria-label='导出准任务'
              title='导出准任务'
            >
              <Download />
              <span className='sr-only'>导出准任务</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>导出准任务</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>
    </>
  )
}
