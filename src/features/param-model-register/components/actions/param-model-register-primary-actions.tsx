import { PlusIcon, RefreshCwIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useParamModelRegistersActions } from '../param-model-register-provider'

export function ParamModelRegisterPrimaryActions() {
  const { setOpen } = useParamModelRegistersActions()

  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('sync')}
      >
        <RefreshCwIcon className='h-4 w-4' />
        <span>同步</span>
      </Button>
      <Button
        variant='default'
        className='space-x-1'
        onClick={() => setOpen('create')}
      >
        <PlusIcon className='h-4 w-4' />
        <span>添加</span>
      </Button>
    </div>
  )
}
