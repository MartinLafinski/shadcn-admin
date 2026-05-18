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
  useBatchSwitchEntrypointsMutation,
  useBatchExportEntrypointsMutation,
  useBatchLockEntrypointsMutation,
  useBatchPauseEntrypointsMutation,
} from '@/features/entrypoints/api/entrypoints'
// 数据结构
import { type EntrypointItemData } from '../../data/schemas'
// 批量删除对话框
import { EntrypointsMultiDeleteDialog } from '../dialogs/entrypoints-multi-delete-dialog'

/**
 * 入口点表格批量操作组件的属性类型定义
 *
 * @template TData - 表格数据项的类型，支持泛型以适应不同数据结构
 * @property {Table<TData>} table - TanStack Table实例，用于获取选中行、重置选择等操作
 *
 * 开发者说明:
 * - 使用泛型TData使组件具有更好的类型安全性和复用性
 * - table参数提供了对表格状态和操作的访问，如获取选中行(getFilteredSelectedRowModel)、重置选择(resetRowSelection)等
 */
type EntrypointsTableBulkActionsProps<TData> = {
  table: Table<TData>
}

/**
 * 入口点数据表格的批量操作组件
 * 提供批量更新状态、优先级、导出和删除等功能
 *
 * @template TData - 表格数据类型
 * @param {EntrypointsTableBulkActionsProps<TData>} props - 组件属性
 * @param {Table<TData>} props.table - TanStack表格实例
 *
 * 使用说明:
 * 1. 通过 table.getFilteredSelectedRowModel() 获取选中的行数据
 * 2. 支持批量更新入口点状态、优先级
 * 3. 支持批量导出入口点
 * 4. 支持批量删除入口点（带确认对话框）
 */
export function EntrypointsTableBulkActions<TData>({
  table,
}: EntrypointsTableBulkActionsProps<TData>) {
  // 控制删除确认对话框的显示状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  // 获取当前选中的行数据
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const switchMutation = useBatchSwitchEntrypointsMutation()
  const exportMutation = useBatchExportEntrypointsMutation()
  const lockMutation = useBatchLockEntrypointsMutation()
  const pauseMutation = useBatchPauseEntrypointsMutation()

  /**
   * 批量更新入口点状态的处理函数
   *
   * 功能说明:
   * 1. 获取当前选中的入口点数据
   * 2. 提取入口点ID列表
   * 3. 调用API批量更新入口点状态（启用/禁用）
   * 4. 显示操作进度和结果提示
   * 5. 操作完成后重置表格选择状态
   *
   * 参数说明:
   * @param {boolean} status - 目标状态，true为启用，false为禁用
   *
   * 错误处理:
   * - 捕获并记录API调用异常
   * - 向用户显示错误提示信息
   *
   * 用户体验优化:
   * - 使用toast.promise显示操作状态（加载中、成功、失败）
   * - 添加1秒延时以确保用户能看清提示信息
   * - 操作完成后自动清除选中状态
   *
   * 开发者提示:
   * - 可在此方法中添加更多验证逻辑，如检查选中数据是否为空
   * - 可以根据实际API响应结果调整成功提示信息
   * - 如需支持其他状态更新，可扩展此函数或创建类似函数
   */
  const handleBulkStatusChange = async (status: boolean) => {
    // 从表格选中行中提取入口点数据
    const selectedEntrypoints = selectedRows.map(
      (row) => row.original as EntrypointItemData
    )
    // 提取入口点ID数组，用于API调用
    const selectedEntrypointIds = selectedEntrypoints.map(
      (entrypoint) => entrypoint.entrypoint_id
    )
    // 显示操作进度和结果提示
    toast.promise(
      switchMutation
        .mutateAsync({
          entrypoint_ids: selectedEntrypointIds,
          entrypoint_enabled: status,
        })
        .then(() => {
          // 操作成功后重置表格选择状态
          table.resetRowSelection()
        })
        .catch((error) => {
          // 在捕获错误后，需要确保loading状态被取消
          console.error('入口点批量导出失败:', error)
          throw error // 重新抛出错误，让toast能正确处理
        }),
      {
        loading: `正在更新入口点${status ? '启用' : '禁用'}状态...`,
        success: `成功更新了 ${selectedEntrypoints.length} 条入口点的可用状态为 ${status ? '启用' : '禁用'}`,
        error: '入口点批量更新状态失败',
      }
    )
  }

  const handleBulkLockedChange = async (locked: boolean) => {
    // 从表格选中行中提取入口点数据
    const selectedEntrypoints = selectedRows.map(
      (row) => row.original as EntrypointItemData
    )
    // 提取入口点ID数组，用于API调用
    const selectedEntrypointIds = selectedEntrypoints.map(
      (entrypoint) => entrypoint.entrypoint_id
    )

    // 显示操作进度和结果提示
    toast.promise(
      lockMutation
        .mutateAsync({
          entrypoint_ids: selectedEntrypointIds,
          entrypoint_locked: locked,
        })
        .then(() => {
          // 操作成功后重置表格选择状态
          table.resetRowSelection()
        })
        .catch((error) => {
          // 在捕获错误后，需要确保loading状态被取消
          console.error('入口点批量锁定/解锁失败:', error)
          throw error // 重新抛出错误，让toast能正确处理
        }),
      {
        loading: `正在进行入口点 ${locked ? '锁定' : '解锁'} 操作...`,
        success: `成功对 ${selectedEntrypoints.length} 个入口点 ${locked ? '锁定' : '解锁'}`,
        error: '入口点批量锁定/解锁失败',
      }
    )
  }

  const handleBulkPausedChange = async (paused: boolean) => {
    // 从表格选中行中提取入口点数据
    const selectedEntrypoints = selectedRows.map(
      (row) => row.original as EntrypointItemData
    )
    // 提取入口点ID数组，用于API调用
    const selectedEntrypointIds = selectedEntrypoints.map(
      (entrypoint) => entrypoint.entrypoint_id
    )

    // 显示操作进度和结果提示
    toast.promise(
      pauseMutation
        .mutateAsync({
          entrypoint_ids: selectedEntrypointIds,
          entrypoint_paused: paused,
        })
        .then(() => {
          // 操作成功后重置表格选择状态
          table.resetRowSelection()
        })
        .catch((error) => {
          // 在捕获错误后，需要确保loading状态被取消
          console.error('入口点批量暂停/恢复失败:', error)
          throw error // 重新抛出错误，让toast能正确处理
        }),
      {
        loading: `正在进行入口点 ${paused ? '暂停' : '恢复'} 操作...`,
        success: `成功对 ${selectedEntrypoints.length} 个入口点 ${paused ? '暂停' : '恢复'}`,
        error: '入口点批量暂停/恢复失败',
      }
    )
  }

  /**
   * 批量导出入口点数据的处理函数
   *
   * 功能说明:
   * 1. 获取当前选中的入口点数据
   * 2. 提取入口点ID列表
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
   * - 添加1秒延时以确保用户能看清提示信息
   * - 操作完成后自动清除选中状态
   *
   * 开发者提示:
   * - 可在此方法中添加更多验证逻辑，如检查选中数据是否为空
   * - 可以根据实际API响应结果调整成功提示信息
   * - 如需支持不同导出格式，可在API调用中添加格式参数
   */
  const handleBulkExport = async () => {
    // 从表格选中行中提取入口点数据
    const selectedEntrypoints = selectedRows.map(
      (row) => row.original as EntrypointItemData
    )
    // 提取入口点ID数组，用于API调用
    const selectedEntrypointIds = selectedEntrypoints.map(
      (entrypoint) => entrypoint.entrypoint_id
    )
    // 导出成功后的处理
    toast.promise(
      // 发起批量导出API请求
      exportMutation
        .mutateAsync({
          entrypoint_ids: selectedEntrypointIds,
        })
        .then(() => {
          // 操作成功后重置表格选择状态
          table.resetRowSelection()
        })
        .catch((error) => {
          // 在捕获错误后，需要确保loading状态被取消
          console.error('入口点批量导出失败:', error)
          throw error // 重新抛出错误，让toast能正确处理
        }),
      {
        loading: '正在导出入口点...',
        success: `成功导出 ${selectedEntrypoints.length} 条入口点数据`,
        error: '入口点批量导出失败',
      }
    )
  }

  return (
    <>
      {/* 批量操作工具栏，传入表格实例和实体名称 */}
      <BulkActionsToolbar table={table} entityName='入口点'>
        {/* 批量更新状态的下拉菜单 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='更新可用性'
                  title='更新可用性'
                >
                  <CircleArrowUp />
                  <span className='sr-only'>更新可用性</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>更新可用性</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {enableLabels.map((item) => (
              <DropdownMenuItem
                key={item.value.toString()}
                defaultValue={item.value.toString()}
                onClick={() => handleBulkStatusChange(item.value)}
                className={item.className}
                // 开发者提示: 如需添加快捷键，可以在此处添加
              >
                {item.icon && <item.icon className={item.className} />}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 批量锁定/解锁的下拉菜单 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='锁定/解锁'
                  title='锁定/解锁'
                >
                  <LockIcon />
                  <span className='sr-only'>锁定/解锁</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>锁定/解锁</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {lockedLabels.map((item) => (
              <DropdownMenuItem
                key={item.value.toString()}
                defaultValue={item.value.toString()}
                onClick={() => handleBulkLockedChange(item.value)}
                className={item.className}
                // 开发者提示: 如需添加快捷键，可以在此处添加
              >
                {item.icon && <item.icon className={item.className} />}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 批量暂停/恢复的下拉菜单 */}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='暂停/恢复'
                  title='暂停/恢复'
                >
                  <SquarePlayIcon />
                  <span className='sr-only'>暂停/恢复</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>暂停/恢复</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {pausedLabels.map((item) => (
              <DropdownMenuItem
                key={item.value.toString()}
                defaultValue={item.value.toString()}
                onClick={() => handleBulkPausedChange(item.value)}
                className={item.className}
                // 开发者提示: 如需添加快捷键，可以在此处添加
              >
                {item.icon && <item.icon className={item.className} />}
                {item.label}
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
              aria-label='导出入口点'
              title='导出入口点'
            >
              <Download />
              <span className='sr-only'>导出入口点</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>导出入口点</p>
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
              aria-label='删除所选入口点'
              title='删除所选入口点'
            >
              <Trash2 />
              <span className='sr-only'>删除所选入口点</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>删除所选入口点</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      {/* 批量删除确认对话框 */}
      <EntrypointsMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
