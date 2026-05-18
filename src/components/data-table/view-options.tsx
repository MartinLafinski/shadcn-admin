import { useEffect, useState } from 'react'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { MixerHorizontalIcon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

type DataTableViewOptionsProps<TData> = {
  table: Table<TData>
  storageKey?: string
}

export function DataTableViewOptions<TData>({
  table,
  storageKey,
}: DataTableViewOptionsProps<TData>) {
  const [open, setOpen] = useState(false)
  const [draftVisibility, setDraftVisibility] = useState<
    Record<string, boolean>
  >({})

  // 从 localStorage 恢复列显示设置
  useEffect(() => {
    if (!storageKey) return
    try {
      const saved = localStorage.getItem(storageKey)
      if (!saved) return
      const vis: Record<string, boolean> = JSON.parse(saved)
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== 'undefined' && column.getCanHide()
        )
        .forEach((column) => {
          if (
            vis[column.id] !== undefined &&
            vis[column.id] !== column.getIsVisible()
          ) {
            column.toggleVisibility(vis[column.id])
          }
        })
    } catch {
      // ignore parse errors
    }
  }, [storageKey])

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      const vis: Record<string, boolean> = {}
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== 'undefined' && column.getCanHide()
        )
        .forEach((column) => {
          vis[column.id] = column.getIsVisible()
        })
      setDraftVisibility(vis)
    }
    setOpen(isOpen)
  }

  const handleApply = () => {
    table
      .getAllColumns()
      .filter(
        (column) =>
          typeof column.accessorFn !== 'undefined' && column.getCanHide()
      )
      .forEach((column) => {
        const draftVisible = draftVisibility[column.id]
        if (
          draftVisible !== undefined &&
          draftVisible !== column.getIsVisible()
        ) {
          column.toggleVisibility(draftVisible)
        }
      })
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(draftVisibility))
    }
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='ms-auto hidden h-8 lg:flex'
        >
          <MixerHorizontalIcon className='size-4' />
          列显示
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[150px]'>
        <DropdownMenuLabel>切换列</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide()
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                key={column.id}
                className='capitalize'
                checked={draftVisibility[column.id] ?? column.getIsVisible()}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(value) =>
                  setDraftVisibility((prev) => ({
                    ...prev,
                    [column.id]: !!value,
                  }))
                }
              >
                {typeof column.columnDef.header === 'string'
                  ? column.columnDef.header
                  : column.id}
              </DropdownMenuCheckboxItem>
            )
          })}
        <DropdownMenuSeparator />
        <div className='px-2 pb-2'>
          <Button size='sm' className='w-full' onClick={handleApply}>
            确定
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
