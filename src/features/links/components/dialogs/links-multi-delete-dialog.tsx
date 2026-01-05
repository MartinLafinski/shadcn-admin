'use client'
// 引入依赖
import { useState } from 'react'
// 表格
import { type Table } from '@tanstack/react-table'
// 图标
import { AlertTriangle } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 警示框
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
// 输入框控件
import { Input } from '@/components/ui/input'
// 标签控件
import { Label } from '@/components/ui/label'
// 确认对话框
import { ConfirmDialog } from '@/components/confirm-dialog'
// 批量删除API调用
import { useBatchDeleteLinksMutation } from '@/features/links/api/links'
// 友链数据结构
import type { LinkItemData } from "@/features/links/data/schemas.ts"

/**
 * 友链批量删除对话框组件
 * 
 * 功能说明：
 * - 提供批量删除友链的确认对话框
 * - 要求用户输入确认词以防止误操作
 * - 集成API调用和错误处理
 * - 与表格组件集成，获取选中行数据
 * 
 * 使用说明：
 * - 需要传入table实例来获取选中的行数据
 * - 通过open和onOpenChange控制对话框的显示和隐藏
 * - 删除操作前需要用户输入"DELETE"确认
 */
type LinksMultiDeleteDialogProps<TData> = {
  /** 控制对话框是否打开 */
  open: boolean
  /** 对话框打开状态变化回调函数 */
  onOpenChange: (open: boolean) => void
  /** 表格实例，用于获取选中的行数据 */
  table: Table<TData>
}

/** 删除确认词，用户必须输入此词才能执行删除操作 */
const CONFIRM_WORD = 'DELETE'

/**
 * 友链批量删除对话框组件
 * 
 * @template TData - 表格数据的类型
 * @param {LinksMultiDeleteDialogProps<TData>} props - 组件属性
 * @returns {JSX.Element} 对话框组件
 */
export function LinksMultiDeleteDialog<TData>({
                                                   open,
                                                   onOpenChange,
                                                   table,
                                                 }: LinksMultiDeleteDialogProps<TData>) {
  // 管理确认词输入状态
  const [value, setValue] = useState('')
  
  // 初始化批量删除API调用的mutation
  const deleteMutation = useBatchDeleteLinksMutation()

  // 获取表格中已选中的行
  const selectedRows = table.getFilteredSelectedRowModel().rows
  
  // 从选中的行中提取友链ID数组，用于API调用
  // 注意：这里使用类型断言将行原始数据转换为LinkItemData类型
  const selectedLinkIds = selectedRows.map((row) => (row.original as LinkItemData).links_id)

  /**
   * 处理删除操作
   * 
   * 步骤：
   * 1. 验证用户输入的确认词
   * 2. 调用API进行批量删除
   * 3. 根据结果更新UI状态和显示提示信息
   */
  const handleDelete = async () => {
    // 验证用户输入是否为确认词
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`请输入 "${CONFIRM_WORD}" 以确认`)
      return
    }

    // 关闭对话框
    onOpenChange(false)

    // 执行批量删除操作
    await deleteMutation.mutateAsync(selectedLinkIds).then(() => {
      // 删除成功后重置输入框和表格选择状态
      setValue('')
      table.resetRowSelection()
      
      // 显示成功提示
      toast.success('批量删除友链成功')
    }).catch((error) => {
      // 操作失败时重置输入框
      setValue('')
      
      // 记录错误日志和显示错误提示
      console.error('批量删除友链失败:', error)
      toast.error('批量删除友链失败')
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== CONFIRM_WORD}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          删除 {selectedRows.length} 个友链
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            您确定要删除选中的任务吗？<br />
            此操作无法撤销。
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <p>
              <span className=''>输入 </span>
              <span className='text-red-600'>"{CONFIRM_WORD}"</span>
              <span className=''> 以确认:</span>
            </p>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`输入 ${CONFIRM_WORD}`}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>警告!</AlertTitle>
            <AlertDescription>
              请谨慎操作，此操作无法撤销。
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      cancelBtnText='取消'
      destructive
    />
  )
}