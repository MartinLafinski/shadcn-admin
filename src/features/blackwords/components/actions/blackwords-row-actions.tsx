import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { useBlackwords } from '../blackwords-provider'
import { BlackwordData } from '@/features/blackwords/data/schemas'

interface BlackwordsRowActionsProps {
  blackword: BlackwordData
}

export function BlackwordsRowActions({ blackword }: BlackwordsRowActionsProps) {
  const { setIsEditDialogOpen, setIsDeleteDialogOpen, setBlackwordToEdit, setBlackwordToDelete } = useBlackwords()

  const handleEdit = () => {
    setBlackwordToEdit(blackword.blackwords_id)
    setIsEditDialogOpen(true)
  }

  const handleDelete = () => {
    setBlackwordToDelete(blackword.blackwords_id)
    setIsDeleteDialogOpen(true)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open menu"
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={handleEdit}>编辑</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete}>删除</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}