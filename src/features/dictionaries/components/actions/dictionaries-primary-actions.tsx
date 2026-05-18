import { PlusIcon, UploadIcon, RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExportDictionariesMutation } from '@/features/dictionaries/api/dictionaries'
import { useDictionariesActions } from '../dictionaries-provider'

export function DictionariesPrimaryActions() {
  const { setOpen } = useDictionariesActions()
  const exportMutation = useExportDictionariesMutation()

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1 bg-lime-600 text-white hover:bg-lime-700/80 hover:text-white dark:bg-lime-700'
        onClick={() => exportMutation.mutate()}
        disabled={exportMutation.isPending}
      >
        <UploadIcon className='h-4 w-4' />
        <span>导出数据</span>
      </Button>
      <Button
        variant='outline'
        className='space-x-1 bg-sky-600 text-white hover:bg-sky-700/80 hover:text-white dark:bg-sky-700'
        onClick={() => setOpen('sync')}
      >
        <RefreshCwIcon className='h-4 w-4' />
        <span>同步字典</span>
      </Button>
      <Button
        variant='default'
        className='space-x-1'
        onClick={() => setOpen('create')}
      >
        <PlusIcon className='h-4 w-4' />
        <span>添加属性字典</span>
      </Button>
    </div>
  )
}
