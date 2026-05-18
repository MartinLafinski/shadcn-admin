import { useNavigate } from '@tanstack/react-router'
import { PlusIcon, UploadIcon, RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useExportParamFormsMutation } from '../../api/param-forms'
import { useParamFormsActions } from '../param-forms-provider'

export function ParamFormsPrimaryActions() {
  const navigate = useNavigate()
  const { setOpen } = useParamFormsActions()
  const exportMutation = useExportParamFormsMutation()

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
        <span>同步要素包</span>
      </Button>
      <Button
        variant='default'
        className='space-x-1'
        onClick={() => navigate({ to: '/param-forms/create' })}
      >
        <PlusIcon className='h-4 w-4' />
        <span>创建要素包</span>
      </Button>
    </div>
  )
}
