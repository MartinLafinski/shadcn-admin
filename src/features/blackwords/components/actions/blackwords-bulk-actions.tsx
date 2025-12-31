import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { useBlackwords } from '../blackwords-provider'
import { useBatchDeleteBlackwordsMutation, useBatchSwitchBlackwordsMutation } from '@/features/blackwords/api/blackwords'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Table } from '@tanstack/react-table'

interface BlackwordsBulkActionsProps {
  table: Table<any>
}

export function BlackwordsBulkActions({ table }: BlackwordsBulkActionsProps) {
  const { setSelectedBlackwords } = useBlackwords()
  const { mutateAsync: batchDelete, isPending: isDeleting } = useBatchDeleteBlackwordsMutation()
  const { mutateAsync: batchSwitch, isPending: isSwitching } = useBatchSwitchBlackwordsMutation()

  const [isProcessing, setIsProcessing] = useState(false)

  // 获取选中的行数据
  const selectedRows = table.getSelectedRowModel().rows;
  const selectedBlackwordIds = selectedRows.map(row => row.original.blackwords_id);

  const handleDeleteSelected = async () => {
    if (selectedBlackwordIds.length === 0) return
    
    setIsProcessing(true)
    try {
      await batchDelete(selectedBlackwordIds)
      toast.success(`${selectedBlackwordIds.length} 个敏感词删除成功`)
      table.toggleAllRowsSelected(false) // 清空选中项
      setSelectedBlackwords([]) // 清空context中的选中项
    } catch (error) {
      toast.error('批量删除失败: ' + (error as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleToggleEnabled = async (enabled: boolean) => {
    if (selectedBlackwordIds.length === 0) return
    
    setIsProcessing(true)
    try {
      await batchSwitch({
        blackwords_ids: selectedBlackwordIds,
        blackwords_enabled: enabled
      })
      toast.success(`${selectedBlackwordIds.length} 个敏感词${enabled ? '启用' : '禁用'}成功`)
      table.toggleAllRowsSelected(false) // 操作完成后清空选中
      setSelectedBlackwords([]) // 清空context中的选中项
    } catch (error) {
      toast.error(`批量${enabled ? '启用' : '禁用'}失败: ` + (error as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!table.getIsSomeRowsSelected()) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        已选 {selectedBlackwordIds.length} 项
      </span>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 gap-1"
        onClick={() => {
          table.toggleAllRowsSelected(false)
          setSelectedBlackwords([])
        }}
      >
        取消选择
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <MixerHorizontalIcon className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              批量操作
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onClick={() => handleToggleEnabled(true)} disabled={isProcessing || isSwitching}>
            启用
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleEnabled(false)} disabled={isProcessing || isSwitching}>
            禁用
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDeleteSelected} disabled={isProcessing || isDeleting}>
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}