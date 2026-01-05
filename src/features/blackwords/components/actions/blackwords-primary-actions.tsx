// 图标
import { Download, Plus, RefreshCcwIcon } from 'lucide-react'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 敏感词状态
import { useBlackwords } from '../blackwords-provider.tsx'
// 同步敏感词API调用
import { useSyncBlackwordsMutation, useExportBlackwordsMutation } from '../../api/blackwords.ts'
// 操作结果提示框
import { toast } from "sonner"

/**
 * 敏感词管理页面的主要操作按钮组件
 * 包含导出数据、同步敏感词和创建新敏感词三个功能按钮
 */
export function BlackwordsPrimaryActions() {
  const { setOpen } = useBlackwords()
  // 初始化敏感词同步/导出mutation，用于触发后端同步操作
  const syncBlackwordMutation = useSyncBlackwordsMutation()
  const exportBlackwordMutation = useExportBlackwordsMutation()

  /**
   * 处理敏感词同步操作
   * 调用API同步敏感词数据，成功时显示成功提示，失败时显示错误信息
   */
  const onSync = async () => {
    // 开始同步操作，显示加载状态
    await syncBlackwordMutation.mutateAsync()
      .then(() => {
        // 同步成功时的处理
        toast.success('敏感词同步成功')
      })
      .catch((error) => {
        // 同步失败时的处理
        console.error('敏感词同步失败:', error)
        toast.error('敏感词同步失败')
      })
  }

  /**
   * 处理敏感词导出操作
   * 调用API导出敏感词数据，成功时显示成功提示，失败时显示错误信息
   */
  const onExport = async () => {
    // 开始同步操作，显示加载状态
    await exportBlackwordMutation.mutateAsync()
      .then(() => {
        // 同步成功时的处理
        toast.success('敏感词导出成功')
      })
      .catch((error) => {
        // 同步失败时的处理
        console.error('敏感词导出失败:', error)
        toast.error('敏感词导出失败')
      })
  }

  return (
    <div className='flex gap-2'>
      {/* 导出数据按钮 - 触发导入弹窗，但按钮显示为"导出数据"，可能需要确认文案是否正确 */}
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => onExport()}
        disabled={exportBlackwordMutation.isPending} // 在同步过程中禁用按钮，避免重复操作
      >
        <span>导出数据</span> <Download size={18} />
      </Button>
      {/* 同步敏感词按钮 - 触发敏感词数据同步操作 */}
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => onSync()}
        disabled={syncBlackwordMutation.isPending} // 在同步过程中禁用按钮，避免重复操作
      >
        <span>同步敏感词</span> <RefreshCcwIcon size={18} />
      </Button>
      {/* 创建新敏感词按钮 - 打开创建敏感词的表单弹窗 */}
      <Button 
        className='space-x-1' 
        onClick={() => setOpen('create')}
      >
        <span>创建新敏感词</span> <Plus size={18} />
      </Button>
    </div>
  )
}