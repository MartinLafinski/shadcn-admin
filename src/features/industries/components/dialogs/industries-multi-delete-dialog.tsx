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
import { useBatchDeleteIndustriesMutation } from '@/features/industries/api/industries'
// 行业数据结构
import type { IndustryItemData } from '@/features/industries/data/schemas.ts'

/**
 * 行业批量删除对话框组件
 *
 * 功能说明：
 * - 提供批量删除行业的确认对话框
 * - 要求用户输入确认词以防止误操作
 * - 集成API调用和错误处理
 * - 与表格组件集成，获取选中行数据
 */
type IndustriesMultiDeleteDialogProps<TData> = {
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
 * 行业批量删除对话框组件
 *
 * @template TData - 表格数据的类型
 * @param {IndustriesMultiDeleteDialogProps<TData>} props - 组件属性
 * @returns {JSX.Element} 对话框组件
 */
export function IndustriesMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: IndustriesMultiDeleteDialogProps<TData>) {
  // 管理确认词输入状态
  const [value, setValue] = useState('')

  // 初始化批量删除API调用的mutation
  const deleteMutation = useBatchDeleteIndustriesMutation()

  // 获取表格中已选中的行
  const selectedRows = table.getFilteredSelectedRowModel().rows

  // 从选中的行中提取行业ID数组，用于API调用
  const selectedIndustryIds = selectedRows.map(
    (row) => (row.original as IndustryItemData).industry_id
  )

  /**
   * 处理删除操作
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
    await deleteMutation
      .mutateAsync(selectedIndustryIds)
      .then(() => {
        // 删除成功后重置输入框和表格选择状态
        setValue('')
        table.resetRowSelection()

        // 显示成功提示
        toast.success('批量删除行业成功')
      })
      .catch((error) => {
        // 操作失败时重置输入框
        setValue('')

        // 记录错误日志和显示错误提示
        // eslint-disable-next-line no-console
        console.error('批量删除行业失败:', error)
        toast.error('批量删除行业失败')
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
          删除 {selectedRows.length} 个行业
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            您确定要删除选中的行业吗？
            <br />
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
            <AlertDescription>请谨慎操作，此操作无法撤销。</AlertDescription>
          </Alert>
        </div>
      }
      confirmText='删除'
      cancelBtnText='取消'
      destructive
    />
  )
}
