// 图标
import { Download, Plus, RefreshCcwIcon } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 同步模板API调用
import {
  useSyncTemplatesMutation,
  useExportTemplatesMutation,
} from '../../api/templates.ts'
// 模板状态
import { useTemplates } from '../templates-provider.tsx'

/**
 * 模板管理页面的主要操作按钮组件
 * 包含导出数据、同步模板和创建新模板三个功能按钮
 */
export function TemplatesPrimaryActions() {
  const { setOpen } = useTemplates()
  // 初始化模板同步/导出mutation，用于触发后端同步操作
  const syncTemplateMutation = useSyncTemplatesMutation()
  const exportTemplateMutation = useExportTemplatesMutation()

  /**
   * 处理模板同步操作
   * 调用API同步模板数据，成功时显示成功提示，失败时显示错误信息
   */
  const onSync = async () => {
    // 开始同步操作，显示加载状态
    await syncTemplateMutation
      .mutateAsync()
      .then(() => {
        // 同步成功时的处理
        toast.success('模板同步成功')
      })
      .catch((error) => {
        // 同步失败时的处理
        console.error('模板同步失败:', error)
        toast.error('模板同步失败')
      })
  }

  /**
   * 处理模板导出操作
   * 调用API导出模板数据，成功时显示成功提示，失败时显示错误信息
   */
  const onExport = async () => {
    // 开始同步操作，显示加载状态
    await exportTemplateMutation
      .mutateAsync()
      .then(() => {
        // 同步成功时的处理
        toast.success('模板导出成功')
      })
      .catch((error) => {
        // 同步失败时的处理
        console.error('模板导出失败:', error)
        toast.error('模板导出失败')
      })
  }

  return (
    <div className='flex gap-2'>
      {/* 导出数据按钮 - 触发导入弹窗，但按钮显示为"导出数据"，可能需要确认文案是否正确 */}
      <Button
        variant='outline'
        className='space-x-1 bg-lime-600 text-white hover:bg-lime-700/80 hover:text-white dark:bg-lime-700'
        onClick={() => onExport()}
        disabled={exportTemplateMutation.isPending} // 在同步过程中禁用按钮，避免重复操作
      >
        <span>导出数据</span> <Download size={18} />
      </Button>
      {/* 同步模板按钮 - 触发模板数据同步操作 */}
      <Button
        variant='outline'
        className='space-x-1 bg-sky-600 text-white hover:bg-sky-700/80 hover:text-white dark:bg-sky-700'
        onClick={() => onSync()}
        disabled={syncTemplateMutation.isPending} // 在同步过程中禁用按钮，避免重复操作
      >
        <span>同步模板</span> <RefreshCcwIcon size={18} />
      </Button>
      {/* 创建新模板按钮 - 打开创建模板的表单弹窗 */}
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建新模板</span> <Plus size={18} />
      </Button>
    </div>
  )
}
