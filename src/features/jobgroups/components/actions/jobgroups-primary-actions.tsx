import { Download, Plus, RefreshCcwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { useExportJobGroupsMutation } from '../../api/jobgroups.ts'
import { useJobGroups } from '../jobgroups-provider.tsx'

export function JobGroupsPrimaryActions() {
  const { setOpen } = useJobGroups()
  const exportMutation = useExportJobGroupsMutation()

  const onExport = async () => {
    await exportMutation
      .mutateAsync()
      .then(() => toast.success('作业分组导出成功'))
      .catch(() => toast.error('作业分组导出失败'))
  }

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1 bg-lime-600 text-white hover:bg-lime-700/80 hover:text-white dark:bg-lime-700'
        onClick={() => onExport()}
        disabled={exportMutation.isPending}
      >
        <span>导出数据</span> <Download size={18} />
      </Button>
      <Button
        variant='outline'
        className='space-x-1 bg-sky-600 text-white hover:bg-sky-700/80 hover:text-white dark:bg-sky-700'
        onClick={() => setOpen('sync')}
      >
        <span>同步作业分组</span> <RefreshCcwIcon size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建新作业分组</span> <Plus size={18} />
      </Button>
    </div>
  )
}
