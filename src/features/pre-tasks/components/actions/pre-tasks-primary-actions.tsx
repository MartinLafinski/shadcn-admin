// 图标
import { Download, Trash2, RotateCcw } from 'lucide-react'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 准任务API调用
import { useResetAllPreTasksMutation, useClearAllPreTasksMutation, useExportPreTasksMutation } from '../../api/pre-tasks.ts'
// 操作结果提示框
import { toast } from "sonner"
// 确认对话框
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

/**
 * 准任务管理页面的主要操作按钮组件
 * 包含导出全部准任务、重置所有准任务、清空所有准任务三个功能按钮
 */
export function PreTasksPrimaryActions() {
  // 初始化准任务导出/重置/清空mutation，用于触发后端操作
  const exportAllMutation = useExportPreTasksMutation()
  const resetAllMutation = useResetAllPreTasksMutation()
  const clearAllMutation = useClearAllPreTasksMutation()
  
  // 确认对话框状态
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  /**
   * 处理导出全部准任务操作
   * 调用API导出所有准任务数据，成功时显示成功提示，失败时显示错误信息
   */
  const onExportAll = async () => {
    // 开始导出操作，显示加载状态
    await exportAllMutation.mutateAsync()
      .then(() => {
        // 导出成功时的处理
        toast.success('准任务导出成功')
      })
      .catch((error) => {
        // 导出失败时的处理
        console.error('准任务导出失败:', error)
        toast.error('准任务导出失败')
      })
  }

  /**
   * 处理重置所有准任务操作
   * 调用API重置所有准任务，成功时显示成功提示，失败时显示错误信息
   */
  const onResetAll = async () => {
    setResetDialogOpen(false)
    // 开始重置操作
    await resetAllMutation.mutateAsync()
      .then(() => {
        // 重置成功时的处理
        toast.success('所有准任务重置成功')
      })
      .catch((error) => {
        // 重置失败时的处理
        console.error('准任务重置失败:', error)
        toast.error('准任务重置失败')
      })
  }

  /**
   * 处理清空所有准任务操作
   * 调用API清空所有准任务，成功时显示成功提示，失败时显示错误信息
   */
  const onClearAll = async () => {
    setClearDialogOpen(false)
    // 开始清空操作
    await clearAllMutation.mutateAsync()
      .then(() => {
        // 清空成功时的处理
        toast.success('所有准任务清空成功')
      })
      .catch((error) => {
        // 清空失败时的处理
        console.error('准任务清空失败:', error)
        toast.error('准任务清空失败')
      })
  }

  return (
    <>
      <div className='flex gap-2'>
        {/* 导出全部准任务按钮 - 触发导出所有准任务操作 */}
        <Button
          className='space-x-1  bg-lime-600 text-white dark:bg-lime-700 hover:bg-lime-700/80 hover:text-white'
          onClick={() => onExportAll()}
          disabled={exportAllMutation.isPending} // 在导出过程中禁用按钮，避免重复操作
        >
          <span>导出全部</span> <Download size={18} />
        </Button>

        {/* 重置所有准任务按钮 - 触发重置所有准任务操作 */}
        <Button
          variant='secondary'
          className='space-x-1 bg-orange-500 text-white dark:bg-orange-600 hover:bg-orange-600/80'
          onClick={() => setResetDialogOpen(true)}
          disabled={resetAllMutation.isPending} // 在重置过程中禁用按钮，避免重复操作
        >
          <span>重置所有</span> <RotateCcw size={18} />
        </Button>
        
        {/* 清空所有准任务按钮 - 触发清空所有准任务操作 */}
        <Button
          variant='destructive'
          className='space-x-1'
          onClick={() => setClearDialogOpen(true)}
          disabled={clearAllMutation.isPending} // 在清空过程中禁用按钮，避免重复操作
        >
          <span>清空所有</span> <Trash2 size={18} />
        </Button>
      </div>

      {/* 重置确认对话框 */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重置所有准任务？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将重置所有准任务的状态，但不会删除准任务数据。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={onResetAll}>确认重置</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 清空确认对话框 */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空所有准任务？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除所有准任务数据，此操作不可撤销。请谨慎操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={onClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}