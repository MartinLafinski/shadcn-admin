// 引入依赖
import { useState } from 'react'
// 表格
import { type Table } from '@tanstack/react-table'
// 图标
import { Trash2, CircleArrowUp, Download } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
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
import { useBatchSwitchWebsitesMutation, useBatchExportWebsitesMutation } from '@/features/websites/api/websites'
// 可用性标签
import { enableLabels } from '../../data/labels'
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


  /**
   * 批量更新网站状态的处理函数
   * 
   * 功能说明:
   * 1. 获取当前选中的网站数据
   * 2. 提取网站ID列表
   * 3. 调用API批量更新网站状态（启用/禁用）
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
    // 从表格选中行中提取网站数据
    const selectedWebsites = selectedRows.map((row) => row.original as WebsiteItemData)
    // 提取网站ID数组，用于API调用
    const selectedWebsiteIds = selectedWebsites.map((website) => website.website_id)
    // 显示操作进度和结果提示
    toast.promise(
      switchMutation.mutateAsync({
        website_ids: selectedWebsiteIds,
        website_enabled: status
      }).then(() => {
        // 操作成功后重置表格选择状态
        table.resetRowSelection()
      }).catch((error) => {
        // 在捕获错误后，需要确保loading状态被取消
        console.error('网站批量导出失败:', error)
        throw error // 重新抛出错误，让toast能正确处理
      }), {
        loading: `正在更新网站${status ? '启用' : '禁用'}状态...`,
        success: `成功更新了 ${selectedWebsites.length} 条网站的可用状态为 ${status ? '启用' : '禁用'}`,
        error: '网站批量更新状态失败',
      })
  }


  /**
   * 批量导出网站数据的处理函数
   * 
   * 功能说明:
   * 1. 获取当前选中的网站数据
   * 2. 提取网站ID列表
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
    // 从表格选中行中提取网站数据
    const selectedWebsites = selectedRows.map((row) => row.original as WebsiteItemData)
    // 提取网站ID数组，用于API调用
    const selectedWebsiteIds = selectedWebsites.map((website) => website.website_id)
    // 导出成功后的处理
    toast.promise(
      // 发起批量导出API请求
      exportMutation.mutateAsync({
        website_ids: selectedWebsiteIds,
      }).then(()=>{
        // 操作成功后重置表格选择状态
        table.resetRowSelection()
      }).catch((error) => {
        // 在捕获错误后，需要确保loading状态被取消
        console.error('网站批量导出失败:', error)
        throw error // 重新抛出错误，让toast能正确处理
      }), {
        loading: '正在导出网站...',
        success: `成功导出 ${selectedWebsites.length} 条网站数据`,
        error: '网站批量导出失败',
      })
  }

  return (
    <>
      {/* 批量操作工具栏，传入表格实例和实体名称 */}
      <BulkActionsToolbar table={table} entityName='网站'>

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
                // 开发者提示: 如需添加快捷键，可以在此处添加
              >
                {item.icon && (
                  <item.icon className='size-4 text-muted-foreground' />
                )}
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
