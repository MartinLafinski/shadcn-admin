// 图标
import { Download, Plus, RefreshCcwIcon } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 导出入口点API调用
import { useExportEntrypointsMutation } from '../../api/entrypoints.ts'
// 入口点状态
import { useEntrypoints } from '../entrypoints-provider.tsx'

/**
 * 入口点管理页面的主要操作按钮组件
 * 包含导出数据、同步入口点和创建新入口点三个功能按钮
 */
export function EntrypointsPrimaryActions() {
  const { setOpen } = useEntrypoints()
  // 初始化入口点导出mutation，用于触发后端导出操作
  const exportEntrypointMutation = useExportEntrypointsMutation()

  /**
   * 处理入口点导出操作
   * 调用API导出入口点数据，成功时显示成功提示，失败时显示错误信息
   */
  const onExport = async () => {
    // 开始导出操作，显示加载状态
    await exportEntrypointMutation
      .mutateAsync()
      .then(() => {
        // 导出成功时的处理
        toast.success('入口点导出成功')
      })
      .catch((error) => {
        // 导出失败时的处理
        console.error('入口点导出失败:', error)
        toast.error('入口点导出失败')
      })
  }

  return (
    <div className='flex gap-2'>
      {/* 导出数据按钮 - 触发导出操作 */}
      <Button
        variant='outline'
        className='space-x-1 bg-lime-600 text-white hover:bg-lime-700/80 hover:text-white dark:bg-lime-700'
        onClick={() => onExport()}
        disabled={exportEntrypointMutation.isPending} // 在导出过程中禁用按钮，避免重复操作
      >
        <span>导出数据</span> <Download size={18} />
      </Button>
      {/* 同步入口点按钮 - 打开同步配置对话框 */}
      <Button
        variant='outline'
        className='space-x-1 bg-sky-600 text-white hover:bg-sky-700/80 hover:text-white dark:bg-sky-700'
        onClick={() => setOpen('sync')}
      >
        <span>同步入口点</span> <RefreshCcwIcon size={18} />
      </Button>
      {/* 创建新入口点按钮 - 打开创建入口点的表单弹窗 */}
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建新入口点</span> <Plus size={18} />
      </Button>
    </div>
  )
}
