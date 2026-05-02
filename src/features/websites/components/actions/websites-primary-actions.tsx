// 图标
import { Download, Plus, RefreshCcwIcon } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 导出网站API调用
import { useExportWebsitesMutation } from '../../api/websites.ts'
// 网站状态
import { useWebsitesActions } from '../websites-provider.tsx'

/**
 * 网站管理页面的主要操作按钮组件
 * 包含导出数据、同步网站和创建新网站三个功能按钮
 */
export function WebsitesPrimaryActions() {
  const { setOpen } = useWebsitesActions()
  const exportWebsiteMutation = useExportWebsitesMutation()

  /**
   * 处理网站导出操作
   * 调用API导出网站数据，成功时显示成功提示，失败时显示错误信息
   */
  const onExport = async () => {
    // 开始同步操作，显示加载状态
    await exportWebsiteMutation
      .mutateAsync()
      .then(() => {
        // 同步成功时的处理
        toast.success('网站导出成功')
      })
      .catch((error) => {
        // 同步失败时的处理
        console.error('网站导出失败:', error)
        toast.error('网站导出失败')
      })
  }

  return (
    <div className='flex gap-2'>
      {/* 导出数据按钮 - 触发导入弹窗，但按钮显示为"导出数据"，可能需要确认文案是否正确 */}
      <Button
        variant='outline'
        className='space-x-1 bg-lime-600 text-white hover:bg-lime-700/80 hover:text-white dark:bg-lime-700'
        onClick={() => onExport()}
        disabled={exportWebsiteMutation.isPending} // 在同步过程中禁用按钮，避免重复操作
      >
        <span>导出数据</span> <Download size={18} />
      </Button>
      {/* 同步网站按钮 - 打开同步对话框 */}
      <Button
        variant='outline'
        className='space-x-1 bg-sky-600 text-white hover:bg-sky-700/80 hover:text-white dark:bg-sky-700'
        onClick={() => setOpen('sync')}
      >
        <span>同步网站</span> <RefreshCcwIcon size={18} />
      </Button>
      {/* 创建新网站按钮 - 打开创建网站的表单弹窗 */}
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建新网站</span> <Plus size={18} />
      </Button>
    </div>
  )
}
