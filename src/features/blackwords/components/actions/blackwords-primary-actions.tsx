import { Button } from '@/components/ui/button'
import { PlusCircledIcon } from '@radix-ui/react-icons'
import { useBlackwords } from '../blackwords-provider'

export function BlackwordsPrimaryActions() {
  const { setIsCreateDialogOpen } = useBlackwords()

  return (
    <Button 
      className="h-8 gap-1" 
      onClick={() => setIsCreateDialogOpen(true)}
    >
      <PlusCircledIcon className="h-3.5 w-3.5" />
      <span>新建敏感词</span>
    </Button>
  )
}