// 图标
import { Download, Plus, RefreshCcwIcon } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 导出行业API调用
import { useExportIndustriesMutation } from '../../api/industries.ts'
// 行业状态
import { useIndustriesActions } from '../industries-provider.tsx'

/**
 * 行业管理页面的主要操作按钮组件
 * 包含导出数据、同步行业和创建新行业三个功能按钮
 */
export function IndustriesPrimaryActions() {
  const { setOpen } = useIndustriesActions()
  const exportIndustryMutation = useExportIndustriesMutation()

  /**
   * 处理行业导出操作
   * 调用API导出行业数据，成功时显示成功提示，失败时显示错误信息
   */
  const onExport = async () => {
    // 开始同步操作，显示加载状态
    await exportIndustryMutation
      .mutateAsync()
      .then(() => {
        // 同步成功时的处理
        toast.success('行业导出成功')
      })
      .catch((error) => {
        // 同步失败时的处理
        console.error('行业导出失败:', error)
        toast.error('行业导出失败')
      })
  }

  return (
    <div className='flex gap-2'>
      {/* 导出数据按钮 */}
      <Button
        variant='outline'
        className='space-x-1 bg-lime-600 text-white hover:bg-lime-700/80 hover:text-white dark:bg-lime-700'
        onClick={() => onExport()}
        disabled={exportIndustryMutation.isPending}
      >
        <span>导出数据</span> <Download size={18} />
      </Button>
      {/* 同步行业按钮 */}
      <Button
        variant='outline'
        className='space-x-1 bg-sky-600 text-white hover:bg-sky-700/80 hover:text-white dark:bg-sky-700'
        onClick={() => setOpen('sync')}
      >
        <span>同步行业</span> <RefreshCcwIcon size={18} />
      </Button>
      {/* 创建新行业按钮 */}
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建新行业</span> <Plus size={18} />
      </Button>
    </div>
  )
}
