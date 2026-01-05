// 图标
import { Download, Plus, RefreshCcwIcon } from 'lucide-react'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 友链状态
import { useLinks } from '../links-provider.tsx'
// 同步友链API调用
import { useSyncLinksMutation, useExportLinksMutation } from '../../api/links.ts'
// 操作结果提示框
import { toast } from "sonner"

/**
 * 友链管理页面的主要操作按钮组件
 * 包含导出数据、同步友链和创建新友链三个功能按钮
 */
export function LinksPrimaryActions() {
  const { setOpen } = useLinks()
  // 初始化友链同步/导出mutation，用于触发后端同步操作
  const syncLinkMutation = useSyncLinksMutation()
  const exportLinkMutation = useExportLinksMutation()

  /**
   * 处理友链同步操作
   * 调用API同步友链数据，成功时显示成功提示，失败时显示错误信息
   */
  const onSync = async () => {
    // 开始同步操作，显示加载状态
    await syncLinkMutation.mutateAsync()
      .then(() => {
        // 同步成功时的处理
        toast.success('友链同步成功')
      })
      .catch((error) => {
        // 同步失败时的处理
        console.error('友链同步失败:', error)
        toast.error('友链同步失败')
      })
  }

  /**
   * 处理友链导出操作
   * 调用API导出友链数据，成功时显示成功提示，失败时显示错误信息
   */
  const onExport = async () => {
    // 开始同步操作，显示加载状态
    await exportLinkMutation.mutateAsync()
      .then(() => {
        // 同步成功时的处理
        toast.success('友链导出成功')
      })
      .catch((error) => {
        // 同步失败时的处理
        console.error('友链导出失败:', error)
        toast.error('友链导出失败')
      })
  }

  return (
    <div className='flex gap-2'>
      {/* 导出数据按钮 - 触发导入弹窗，但按钮显示为"导出数据"，可能需要确认文案是否正确 */}
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => onExport()}
        disabled={exportLinkMutation.isPending} // 在同步过程中禁用按钮，避免重复操作
      >
        <span>导出数据</span> <Download size={18} />
      </Button>
      {/* 同步友链按钮 - 触发友链数据同步操作 */}
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => onSync()}
        disabled={syncLinkMutation.isPending} // 在同步过程中禁用按钮，避免重复操作
      >
        <span>同步友链</span> <RefreshCcwIcon size={18} />
      </Button>
      {/* 创建新友链按钮 - 打开创建友链的表单弹窗 */}
      <Button 
        className='space-x-1' 
        onClick={() => setOpen('create')}
      >
        <span>创建新友链</span> <Plus size={18} />
      </Button>
    </div>
  )
}