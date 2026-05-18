import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  EllipsisIcon,
  EyeIcon,
  Trash2,
  SquarePenIcon,
  Settings2Icon,
} from 'lucide-react'
import { enableLabels } from '@/lib/labels'
import { handleToggle } from '@/lib/ui-helper'
import { renderToggleSubMenu } from '@/lib/ui-tools'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSwitchParamFormMutation } from '../../api/param-forms'
import type { ParamFormItemData } from '../../data/schemas'
import { ParamFormSwitchSchema } from '../../data/schemas'
import { useParamFormsActions } from '../param-forms-provider'

interface ParamFormsRowActionsProps {
  row: ParamFormItemData
}

export function ParamFormsRowActions({ row }: ParamFormsRowActionsProps) {
  const navigate = useNavigate()
  const switchMutation = useSwitchParamFormMutation()
  const { setOpen, setCurrentRow } = useParamFormsActions()

  const handleEdit = useCallback(() => {
    navigate({
      to: '/param-forms/edit',
      search: { paramFormId: row.param_form_id },
    })
  }, [row.param_form_id, navigate])

  const handleView = useCallback(() => {
    setCurrentRow(row)
    setOpen('view')
  }, [row, setCurrentRow, setOpen])
  const handleConfig = useCallback(() => {
    setCurrentRow(row)
    setOpen('config')
  }, [row, setCurrentRow, setOpen])
  const handleDelete = useCallback(() => {
    setCurrentRow(row)
    setOpen('delete')
  }, [row, setCurrentRow, setOpen])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex h-8 w-8 p-0 data-[state=open]:bg-muted'
        >
          <EllipsisIcon className='h-4 w-4' />
          <span className='sr-only'>打开菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
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
          row.param_form_enabled,
          (status) =>
            handleToggle(
              switchMutation,
              {
                paramFormId: row.param_form_id,
                data: ParamFormSwitchSchema.parse({
                  param_form_enabled: status,
                }),
              },
              `参数要素 ${row.param_form_name} 状态切换成功`,
              `参数要素 ${row.param_form_name} 状态切换失败`
            )
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='!text-red-600'>
          <span className='text-red-600'>删除</span>
          <DropdownMenuShortcut>
            <Trash2 size={16} className='text-red-600' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
