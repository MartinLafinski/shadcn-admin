import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import { useAccounts } from '../accounts-provider.tsx'

export function AccountsPrimaryActions() {
  const { setOpen } = useAccounts()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>创建用户</span> <Plus size={18} />
      </Button>
    </div>
  )
}
