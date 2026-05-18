import { Download, Plus, RefreshCcwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { useExportPrejobsMutation } from '../../api/prejobs.ts'
import { usePrejobs } from '../prejobs-provider.tsx'

export function PrejobsPrimaryActions() {
  const { setOpen } = usePrejobs()
  const exportPrejobMutation = useExportPrejobsMutation()

  const onExport = async () => {
    await exportPrejobMutation
      .mutateAsync()
      .then(() => {
        toast.success('预备作业导出成功')
      })
      .catch((error) => {
        console.error('预备作业导出失败:', error)
        toast.error('预备作业导出失败')
      })
  }

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1 bg-lime-600 text-white hover:bg-lime-700/80 hover:text-white dark:bg-lime-700'
        onClick={() => onExport()}
        disabled={exportPrejobMutation.isPending}
      >
        <span>导出数据</span> <Download size={18} />
      </Button>
      <Button
        variant='outline'
        className='space-x-1 bg-sky-600 text-white hover:bg-sky-700/80 hover:text-white dark:bg-sky-700'
        onClick={() => setOpen('sync')}
      >
        <span>同步预备作业</span> <RefreshCcwIcon size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建新预备作业</span> <Plus size={18} />
      </Button>
    </div>
  )
}
