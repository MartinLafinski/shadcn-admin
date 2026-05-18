import { useCallback } from 'react'
import { type Row } from '@tanstack/react-table'
import {
  MoreHorizontalIcon,
  EyeIcon,
  SquarePenIcon,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type ParamModelRegisterData } from '@/features/param-model-register/data/schemas'
import { useParamModelRegistersActions } from '../param-model-register-provider'

interface ParamModelRegisterRowActionsProps {
  row: Row<ParamModelRegisterData>
}

export function ParamModelRegisterRowActions({
  row,
}: ParamModelRegisterRowActionsProps) {
  const { setOpen, setCurrentRow } = useParamModelRegistersActions()

  const handleView = useCallback(() => {
    setCurrentRow(row.original)
    setOpen('view')
  }, [row.original, setCurrentRow, setOpen])

  const handleEdit = useCallback(() => {
    setCurrentRow(row.original)
    setOpen('update')
  }, [row.original, setCurrentRow, setOpen])

  const handleDelete = useCallback(() => {
    setCurrentRow(row.original)
    setOpen('delete')
  }, [row.original, setCurrentRow, setOpen])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <MoreHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>打开菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[120px]'>
        <DropdownMenuItem onClick={handleView}>
          查看
          <DropdownMenuShortcut>
            <EyeIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          编辑
          <DropdownMenuShortcut>
            <SquarePenIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='!text-red-500'>
          <span className='text-red-600'>删除</span>
          <DropdownMenuShortcut>
            <Trash2 size={16} className='text-red-600' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
