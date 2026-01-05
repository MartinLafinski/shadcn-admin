// 图标
import { Download, Plus, RefreshCcwIcon } from 'lucide-react'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 入口点状态
import { useEntrypoints } from '../entrypoints-provider.tsx'
// 同步入口点API调用
import { useSyncEntrypointsMutation, useExportEntrypointsMutation } from '../../api/entrypoints.ts'
// 操作结果提示框
import { toast } from "sonner"

/**
 * 入口点管理页面的主要操作按钮组件
 * 包含导出数据、同步入口点和创建新入口点三个功能按钮
 */
export function EntrypointsPrimaryActions() {
  const { setOpen } = useEntrypoints()
  // 初始化入口点同步/导出mutation，用于触发后端同步操作
  const syncEntrypointMutation = useSyncEntrypointsMutation()
  const exportEntrypointMutation = useExportEntrypointsMutation()

  /**
   * 处理入口点同步操作
   * 调用API同步入口点数据，成功时显示成功提示，失败时显示错误信息
   */
  const onSync = async () => {
    // 开始同步操作，显示加载状态
    await syncEntrypointMutation.mutateAsync()
      .then(() => {
        // 同步成功时的处理
        toast.success('入口点同步成功')
      })
      .catch((error) => {
        // 同步失败时的处理
        console.error('入口点同步失败:', error)
        toast.error('入口点同步失败')
      })
  }

  /**
   * 处理入口点导出操作
   * 调用API导出入口点数据，成功时显示成功提示，失败时显示错误信息
   */
  const onExport = async () => {
    // 开始同步操作，显示加载状态
    await exportEntrypointMutation.mutateAsync()
      .then(() => {
        // 同步成功时的处理
        toast.success('入口点导出成功')
      })
      .catch((error) => {
        // 同步失败时的处理
        console.error('入口点导出失败:', error)
        toast.error('入口点导出失败')
      })
  }

  return (
    <div className='flex gap-2'>
      {/* 导出数据按钮 - 触发导入弹窗，但按钮显示为"导出数据"，可能需要确认文案是否正确 */}
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => onExport()}
        disabled={exportEntrypointMutation.isPending} // 在同步过程中禁用按钮，避免重复操作
      >
        <span>导出数据</span> <Download size={18} />
      </Button>
      {/* 同步入口点按钮 - 触发入口点数据同步操作 */}
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => onSync()}
        disabled={syncEntrypointMutation.isPending} // 在同步过程中禁用按钮，避免重复操作
      >
        <span>同步入口点</span> <RefreshCcwIcon size={18} />
      </Button>
      {/* 创建新入口点按钮 - 打开创建入口点的表单弹窗 */}
      <Button 
        className='space-x-1' 
        onClick={() => setOpen('create')}
      >
        <span>创建新入口点</span> <Plus size={18} />
      </Button>
    </div>
  )
}