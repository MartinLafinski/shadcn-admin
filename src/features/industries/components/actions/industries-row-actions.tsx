// 引入依赖
import { type JSX } from 'react'
// 表格
import { type Row } from '@tanstack/react-table'
// 图标
import {
  Trash2,
  SquarePenIcon,
  Settings2Icon,
  EllipsisIcon,
} from 'lucide-react'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 下拉菜单控件
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
// 行业数据格式
import { IndustryItemSchema } from '../../data/schemas.ts'
// 行业状态
import { useIndustriesActions } from '../industries-provider.tsx'

/**
 * 行业数据表格行操作组件
 * 提供行业条目的各种操作选项，如编辑、配置、删除等
 */
type DataTableRowActionsProps<TData> = {
  /**
   * 表格行数据
   * 包含行业条目的完整信息
   */
  row: Row<TData>
}

/**
 * 行业表格行操作组件 - 渲染一个下拉菜单，包含对当前行数据的各种操作选项
 *
 * @template TData - 表格行数据的类型
 * @param {DataTableRowActionsProps<TData>} props - 组件属性
 * @param {Row<TData>} props.row - 当前行的数据
 * @returns {JSX.Element} 渲染后的操作菜单组件
 */
export function IndustriesRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>): JSX.Element {
  // 解析当前行的原始数据为行业项目类型
  const industryItem = IndustryItemSchema.parse(row.original)
  // 从行业上下文中获取设置状态的函数
  const { setOpen, setCurrentRow } = useIndustriesActions()

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
          {/* 编辑行业信息操作 */}
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(industryItem)
              setOpen('update')
            }}
          >
            编辑
            <DropdownMenuShortcut>
              <SquarePenIcon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* 网站说明与配置操作 */}
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(industryItem)
              setOpen('config')
            }}
          >
            配置
            <DropdownMenuShortcut>
              <Settings2Icon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* 删除行业操作 - 危险操作 */}
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(industryItem)
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
