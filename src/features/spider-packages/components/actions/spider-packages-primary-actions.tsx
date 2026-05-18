import { Download, Plus, RefreshCcwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import {
  useSyncSpiderPackagesMutation,
  useExportSpiderPackagesMutation,
} from '../../api/spider-packages.ts'
import { useSpiderPackages } from '../spider-packages-provider.tsx'

export function SpiderPackagesPrimaryActions() {
  const { setOpen } = useSpiderPackages()
  const syncMutation = useSyncSpiderPackagesMutation()
  const exportMutation = useExportSpiderPackagesMutation()

  const onSync = async () => {
    await syncMutation
      .mutateAsync()
      .then(() => toast.success('爬虫包同步成功'))
      .catch(() => {
        toast.error('爬虫包同步失败')
      })
  }

  const onExport = async () => {
    await exportMutation
      .mutateAsync()
      .then(() => toast.success('爬虫包导出成功'))
      .catch(() => {
        toast.error('爬虫包导出失败')
      })
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
        onClick={() => onSync()}
        disabled={syncMutation.isPending}
      >
        <span>同步爬虫包</span> <RefreshCcwIcon size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建新爬虫包</span> <Plus size={18} />
      </Button>
    </div>
  )
}
