import { useCallback } from 'react'
import { type Row } from '@tanstack/react-table'
import {
  SquarePenIcon,
  Settings2Icon,
  EllipsisIcon,
  Trash2,
} from 'lucide-react'
import { handleToggle } from '@/lib/ui-helper'
import { renderToggleSubMenu } from '@/lib/ui-tools'
import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import { useSwitchSpiderPackageMutation } from '../../api/spider-packages'
import { enableLabels } from '../../data/labels'
import { type SpiderPackageItemData } from '../../data/schemas'
import { useSpiderPackagesActions } from '../spider-packages-provider'

interface SpiderPackagesRowActionsProps {
  row: Row<SpiderPackageItemData>
}

export function SpiderPackagesRowActions({
  row,
}: SpiderPackagesRowActionsProps) {
  const { setOpen, setCurrentRow } = useSpiderPackagesActions()
  const switchMutation = useSwitchSpiderPackageMutation()

  const handleEdit = useCallback(() => {
    setCurrentRow(row.original)
    setOpen('update')
  }, [row.original, setCurrentRow, setOpen])

  const handleConfig = useCallback(() => {
    setCurrentRow(row.original)
    setOpen('config')
  }, [row.original, setCurrentRow, setOpen])

  const handleDelete = useCallback(() => {
    setCurrentRow(row.original)
    setOpen('delete')
  }, [row.original, setCurrentRow, setOpen])

  return (
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
        <DropdownMenuItem onClick={handleEdit}>
          编辑
          <DropdownMenuShortcut>
            <SquarePenIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleConfig}>
          配置
          <DropdownMenuShortcut>
            <Settings2Icon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {renderToggleSubMenu(
          '可用',
          enableLabels,
          row.original.spider_package_enabled,
          (status) =>
            handleToggle(
              switchMutation,
              {
                spiderPackageId: row.original.spider_package_id,
                data: { spider_package_enabled: status },
              },
              `爬虫包 ${row.original.spider_package_name} 状态切换成功`,
              `爬虫包 ${row.original.spider_package_name} 状态切换失败`
            )
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleDelete}>
          <span className='text-red-600'>删除</span>
          <DropdownMenuShortcut>
            <Trash2 size={16} className='text-red-600' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
