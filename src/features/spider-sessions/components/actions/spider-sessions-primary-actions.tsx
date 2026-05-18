import { Download, Plus, RefreshCcwIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button.tsx'
import { useExportSpiderSessionsMutation } from '../../api/spider-sessions.ts'
import { useSpiderSessions } from '../spider-sessions-provider.tsx'

export function SpiderSessionsPrimaryActions() {
  const { setOpen } = useSpiderSessions()
  const exportMutation = useExportSpiderSessionsMutation()

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1 bg-lime-600 text-white hover:bg-lime-700/80 hover:text-white dark:bg-lime-700'
        onClick={async () => {
          await exportMutation
            .mutateAsync()
            .then(() => toast.success('爬虫会话导出成功'))
            .catch(() => toast.error('爬虫会话导出失败'))
        }}
        disabled={exportMutation.isPending}
      >
        <span>导出数据</span> <Download size={18} />
      </Button>
      <Button
        variant='outline'
        className='space-x-1 bg-sky-600 text-white hover:bg-sky-700/80 hover:text-white dark:bg-sky-700'
        onClick={() => setOpen('sync')}
      >
        <span>同步爬虫会话</span> <RefreshCcwIcon size={18} />
      </Button>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建新爬虫会话</span> <Plus size={18} />
      </Button>
    </div>
  )
}
