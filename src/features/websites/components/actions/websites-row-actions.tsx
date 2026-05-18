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
// 可用性标签
import { enableLabels, lockedLabels, pausedLabels } from '@/lib/labels'
// 统一处理状态切换操作
import { handleToggle } from '@/lib/ui-helper'
// 下拉菜单子控件
import { renderToggleSubMenu } from '@/lib/ui-tools'
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
// 网站API操作
import {
  useSwitchWebsiteMutation,
  useBatchLockWebsitesMutation,
  useBatchPauseWebsitesMutation,
} from '@/features/websites/api/websites.ts'
// 网站数据格式
import { WebsiteItemSchema } from '../../data/schemas.ts'
// 网站状态
import { useWebsitesActions } from '../websites-provider.tsx'

/**
 * 网站数据表格行操作组件
 * 提供网站条目的各种操作选项，如编辑、配置、删除等
 *
 * 开发者注意事项：
 * 1. 如果需要添加新的操作选项，请在 DropdownMenuContent 中添加新的 DropdownMenuItem
 * 2. 如果需要修改操作逻辑，请参考现有的 onClick 处理函数
 * 3. 如果需要修改禁用状态，请修改对应 MenuItem 的 disabled 属性
 * 4. 图标和功能绑定可以根据需要进行调整
 * 5. 所有操作都通过 useWebsites 上下文进行状态管理
 */
type DataTableRowActionsProps<TData> = {
  /**
   * 表格行数据
   * 包含网站条目的完整信息
   */
  row: Row<TData>
}

/**
 * 网站表格行操作组件 - 渲染一个下拉菜单，包含对当前行数据的各种操作选项
 *
 * @template TData - 表格行数据的类型
 * @param {DataTableRowActionsProps<TData>} props - 组件属性
 * @param {Row<TData>} props.row - 当前行的数据
 * @returns {JSX.Element} 渲染后的操作菜单组件
 */
export function WebsitesRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>): JSX.Element {
  // 解析当前行的原始数据为网站项目类型
  const websiteItem = WebsiteItemSchema.parse(row.original)
  // 从网站上下文中获取设置状态的函数
  const { setOpen, setCurrentRow } = useWebsitesActions()

  const switchMutation = useSwitchWebsiteMutation() // 使用网站状态切换的mutation
  const lockMutation = useBatchLockWebsitesMutation() // 使用网站锁定的mutation
  const pauseMutation = useBatchPauseWebsitesMutation() // 使用网站暂停的mutation

  // /**
  //  * 统一处理状态切换操作
  //  */
  // const handleToggle = async (
  //   mutation: any,
  //   data: any,
  //   successMsg: string,
  //   errorMsg: string
  // ) => {
  //   try {
  //     const result = await mutation.mutateAsync(data)
  //     toast.success(successMsg)
  //     return result
  //   } catch (error) {
  //     console.error(errorMsg, error)
  //     toast.error(errorMsg)
  //   }
  // }

  // /**
  //  * 渲染状态切换子菜单
  //  */
  // const renderToggleSubMenu = (
  //   title: string,
  //   labels: typeof enableLabels,
  //   onToggle: (value: any) => void
  // ) => (
  //   <DropdownMenuSub>
  //     <DropdownMenuSubTrigger>{title}</DropdownMenuSubTrigger>
  //     <DropdownMenuSubContent>
  //       <DropdownMenuRadioGroup>
  //         {labels.map((label) => (
  //           <DropdownMenuRadioItem
  //             key={label.label}
  //             value={label.value.toString()}
  //             onClick={() => onToggle(label.value)}
  //             className={label.className}
  //           >
  //             {label.label} <label.icon />
  //           </DropdownMenuRadioItem>
  //         ))}
  //       </DropdownMenuRadioGroup>
  //     </DropdownMenuSubContent>
  //   </DropdownMenuSub>
  // )

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
          {/* 编辑网站信息操作 */}
          <DropdownMenuItem
            onClick={() => {
              // 设置当前操作的行数据
              setCurrentRow(websiteItem)
              // 打开编辑对话框
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
              setCurrentRow(websiteItem)
              setOpen('config')
            }}
          >
            配置
            <DropdownMenuShortcut>
              <Settings2Icon size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* 网站启用/禁用状态切换子菜单 */}
          {renderToggleSubMenu(
            '可用',
            enableLabels,
            websiteItem.website_enabled,
            (status) =>
              handleToggle(
                switchMutation,
                {
                  websiteId: websiteItem.website_id,
                  data: { website_enabled: status },
                },
                `网站 ${websiteItem.website_name} 状态切换成功`,
                `网站 ${websiteItem.website_name} 状态切换失败`
              )
          )}

          {/* 网站锁定/解锁状态切换子菜单 */}
          {renderToggleSubMenu(
            '锁定',
            lockedLabels,
            websiteItem.website_locked,
            (locked) =>
              handleToggle(
                lockMutation,
                {
                  website_ids: [websiteItem.website_id],
                  website_locked: locked,
                },
                `网站 ${websiteItem.website_name} ${locked ? '锁定' : '解锁'}成功`,
                `网站 ${websiteItem.website_name} ${locked ? '锁定' : '解锁'}失败`
              )
          )}

          {/* 网站暂停/恢复状态切换子菜单 */}
          {renderToggleSubMenu(
            '运转',
            pausedLabels,
            websiteItem.website_paused,
            (paused) =>
              handleToggle(
                pauseMutation,
                {
                  website_ids: [websiteItem.website_id],
                  website_paused: paused,
                },
                `网站 ${websiteItem.website_name} ${paused ? '暂停' : '恢复'}成功`,
                `网站 ${websiteItem.website_name} ${paused ? '暂停' : '恢复'}失败`
              )
          )}

          <DropdownMenuSeparator />
          {/* 删除网站操作 - 危险操作 */}
          <DropdownMenuItem
            onClick={() => {
              // 设置当前操作的行数据
              setCurrentRow(websiteItem)
              // 打开删除确认对话框
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
