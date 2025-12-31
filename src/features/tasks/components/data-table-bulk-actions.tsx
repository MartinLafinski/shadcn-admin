import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, CircleArrowUp, ArrowUpDown, Download } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
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
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { priorities, statuses } from '../data/data'
import { type Task } from '../data/schema'
import { TasksMultiDeleteDialog } from './tasks-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

/**
 * 任务数据表格的批量操作组件
 * 提供批量更新状态、优先级、导出和删除等功能
 * 
 * @template TData - 表格数据类型
 * @param {DataTableBulkActionsProps<TData>} props - 组件属性
 * @param {Table<TData>} props.table - TanStack表格实例
 * 
 * 使用说明:
 * 1. 通过 table.getFilteredSelectedRowModel() 获取选中的行数据
 * 2. 支持批量更新任务状态、优先级
 * 3. 支持批量导出任务
 * 4. 支持批量删除任务（带确认对话框）
 */
export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  // 控制删除确认对话框的显示状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // 获取当前选中的行数据
  const selectedRows = table.getFilteredSelectedRowModel().rows

  /**
   * 批量更新任务状态的处理函数
   * 
   * @param {string} status - 新的状态值
   * 
   * 开发者提示: 
   * - 可在此方法中替换模拟API调用(sleep)为真实的服务端请求
   * - 在实际项目中，应处理API响应和错误情况
   */
  const handleBulkStatusChange = (status: string) => {
    const selectedTasks = selectedRows.map((row) => row.original as Task)
    toast.promise(sleep(2000), {
      loading: 'Updating status...',
      success: () => {
        table.resetRowSelection()
        return `Status updated to "${status}" for ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}.`
      },
      error: 'Error',
    })
    table.resetRowSelection()
  }

  /**
   * 批量更新任务优先级的处理函数
   * 
   * @param {string} priority - 新的优先级值
   * 
   * 开发者提示:
   * - 可在此方法中替换模拟API调用(sleep)为真实的服务端请求
   * - 在实际项目中，应处理API响应和错误情况
   */
  const handleBulkPriorityChange = (priority: string) => {
    const selectedTasks = selectedRows.map((row) => row.original as Task)
    toast.promise(sleep(2000), {
      loading: 'Updating priority...',
      success: () => {
        table.resetRowSelection()
        return `Priority updated to "${priority}" for ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}.`
      },
      error: 'Error',
    })
    table.resetRowSelection()
  }

  /**
   * 批量导出任务的处理函数
   * 
   * @example 
   * 实际项目中可以替换为:
   * 1. 生成CSV文件并下载
   * 2. 导出为PDF格式
   * 3. 发送到邮件或其他服务
   * 
   * 开发者提示:
   * - 可在此方法中替换模拟API调用(sleep)为真实的导出逻辑
   * - 可以根据需要修改导出格式和处理逻辑
   */
  const handleBulkExport = () => {
    const selectedTasks = selectedRows.map((row) => row.original as Task)
    toast.promise(sleep(2000), {
      loading: 'Exporting tasks...',
      success: () => {
        table.resetRowSelection()
        return `Exported ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''} to CSV.`
      },
      error: 'Error',
    })
    table.resetRowSelection()
  }

  return (
    <>
      {/* 批量操作工具栏，传入表格实例和实体名称 */}
      <BulkActionsToolbar table={table} entityName='task'>

        {/* 批量更新状态的下拉菜单 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='Update status'
                  title='Update status'
                >
                  <CircleArrowUp />
                  <span className='sr-only'>Update status</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update status</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                defaultValue={status.value}
                onClick={() => handleBulkStatusChange(status.value)}
                // 开发者提示: 如需添加快捷键，可以在此处添加
              >
                {status.icon && (
                  <status.icon className='size-4 text-muted-foreground' />
                )}
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 批量更新优先级的下拉菜单 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='Update priority'
                  title='Update priority'
                >
                  <ArrowUpDown />
                  <span className='sr-only'>Update priority</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update priority</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {priorities.map((priority) => (
              <DropdownMenuItem
                key={priority.value}
                defaultValue={priority.value}
                onClick={() => handleBulkPriorityChange(priority.value)}
                // 开发者提示: 如需添加快捷键，可以在此处添加
              >
                {priority.icon && (
                  <priority.icon className='size-4 text-muted-foreground' />
                )}
                {priority.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 批量导出按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkExport()}
              className='size-8'
              aria-label='Export tasks'
              title='Export tasks'
            >
              <Download />
              <span className='sr-only'>Export tasks</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export tasks</p>
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
              aria-label='Delete selected tasks'
              title='Delete selected tasks'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected tasks</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected tasks</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      {/* 批量删除确认对话框 */}
      <TasksMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
