import { type JSX } from 'react'
import { type Row } from '@tanstack/react-table'
import { Trash2, SquarePenIcon, EllipsisIcon } from 'lucide-react'
import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { AccountSchema } from '../../data/schemas.ts'
import { useAccounts } from '../accounts-provider.tsx'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function AccountsRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>): JSX.Element {
  const account = AccountSchema.parse(row.original)
  const { setOpen, setCurrentRow } = useAccounts()

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
          >
            <EllipsisIcon className='h-4 w-4' />
            <span className='sr-only'>打开操作菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(account)
              setOpen('update')
            }}
          >
            编辑
            <DropdownMenuShortcut>
              <SquarePenIcon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(account)
              setOpen('delete')
            }}
          >
            <span className='text-red-600'>删除</span>
            <DropdownMenuShortcut>
              <Trash2 size={16} className='text-red-600' />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
