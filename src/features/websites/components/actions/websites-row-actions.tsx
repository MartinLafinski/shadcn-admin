// 引入依赖
import { type JSX, useState } from 'react'
// 在文件顶部引入Link
import { Link } from '@tanstack/react-router'
// 表格
import { type Row } from '@tanstack/react-table'
// 图标
import {
  Trash2,
  SquarePenIcon,
  DoorOpen,
  ListTodo,
  Settings2Icon,
  EllipsisIcon,
  ListVideo,
  ListTree,
  Newspaper,
  DrillIcon,
  RefreshCcwIcon,
  StopCircleIcon,
} from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 确认对话框
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 下拉菜单控件
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
// 网站API操作
import {
  useSwitchWebsiteMutation,
  useBatchLockWebsitesMutation,
  useBatchPauseWebsitesMutation,
  useResetWebsitePreTasksMutation,
  useClearWebsitePreTasksMutation,
} from '@/features/websites/api/websites.ts'
// 可用性标签
import { enableLabels, lockedLabels, pausedLabels } from '../../data/labels.tsx'
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
  const resetPreTasksMutation = useResetWebsitePreTasksMutation() // 使用重置准任务的mutation
  const clearPreTasksMutation = useClearWebsitePreTasksMutation() // 使用清空准任务的mutation

  // 确认对话框状态
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  /**
   * 统一处理状态切换操作
   */
  const handleToggle = async (
    mutation: any,
    data: any,
    successMsg: string,
    errorMsg: string
  ) => {
    try {
      const result = await mutation.mutateAsync(data)
      toast.success(successMsg)
      return result
    } catch (error) {
      console.error(errorMsg, error)
      toast.error(errorMsg)
    }
  }

  /**
   * 渲染状态切换子菜单
   */
  const renderToggleSubMenu = (
    title: string,
    labels: typeof enableLabels,
    onToggle: (value: any) => void
  ) => (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>{title}</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuRadioGroup>
          {labels.map((label) => (
            <DropdownMenuRadioItem
              key={label.label}
              value={label.value.toString()}
              onClick={() => onToggle(label.value)}
              className={label.className}
            >
              {label.label} <label.icon />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )

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
          {/* 网站配置 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>网站配置</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup>
                {/* 单独修改网站爬虫配置操作 */}
                <DropdownMenuItem
                  onClick={() => {
                    // 设置当前操作的行数据
                    setCurrentRow(websiteItem)
                    // 打开单独修改爬虫配置对话框
                    setOpen('editConfig')
                  }}
                >
                  普通模式
                  <DropdownMenuShortcut>
                    <Settings2Icon size={16} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                {/* 网站说明与配置操作 */}
                <DropdownMenuItem
                  onClick={() => {
                    // 设置当前操作的行数据
                    setCurrentRow(websiteItem)
                    // 打开配置对话框
                    setOpen('config')
                  }}
                >
                  专家模式
                  <DropdownMenuShortcut>
                    <DrillIcon size={16} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />

          {/* 预备任务 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>预备任务</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup>
                {/* 重置准任务操作 */}
                <DropdownMenuItem onClick={() => setResetDialogOpen(true)}>
                  重置准任务
                  <DropdownMenuShortcut>
                    <RefreshCcwIcon size={16} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
                {/* 清空准任务操作 */}
                <DropdownMenuItem onClick={() => setClearDialogOpen(true)}>
                  清空准任务
                  <DropdownMenuShortcut>
                    <Trash2 size={16} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />

          {/* 作业任务 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>作业任务</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup>
                {/* 中止作业任务操作 */}
                <DropdownMenuItem>
                  中止作业任务
                  <DropdownMenuShortcut>
                    <StopCircleIcon size={16} />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />

          {/* 查看关联 */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>查看关联</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup>
                {/* 查看入口点功能 */}
                <DropdownMenuItem asChild>
                  <Link
                    to='/entrypoints'
                    search={{ website_id: websiteItem.website_id }}
                    target='_blank'
                  >
                    查看入口点
                    <DropdownMenuShortcut>
                      <DoorOpen size={16} />
                    </DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                {/* 查看准任务功能 */}
                <DropdownMenuItem asChild>
                  <Link
                    to='/pre-tasks'
                    search={{ website_id: websiteItem.website_id }}
                    target='_blank'
                  >
                    查看准任务
                    <DropdownMenuShortcut>
                      <ListTodo size={16} />
                    </DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                {/* 查看作业任务功能 */}
                <DropdownMenuItem asChild>
                  <Link
                    to='/jobs'
                    search={{ website_id: websiteItem.website_id }}
                    target='_blank'
                  >
                    查看作业任务
                    <DropdownMenuShortcut>
                      <ListVideo size={16} />
                    </DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                {/* 查看请求结果功能 */}
                <DropdownMenuItem asChild>
                  <Link
                    to='/reqs'
                    search={{ website_id: websiteItem.website_id }}
                    target='_blank'
                  >
                    查看请求结果
                    <DropdownMenuShortcut>
                      <ListTree size={16} />
                    </DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
                {/* 查看文章功能 */}
                <DropdownMenuItem asChild>
                  <Link
                    to='/articles'
                    search={{ website_id: websiteItem.website_id }}
                    target='_blank'
                  >
                    查看文章
                    <DropdownMenuShortcut>
                      <Newspaper size={16} />
                    </DropdownMenuShortcut>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />

          {/* 网站启用/禁用状态切换子菜单 */}
          {renderToggleSubMenu('可用', enableLabels, (status) =>
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
          {renderToggleSubMenu('锁定', lockedLabels, (locked) =>
            handleToggle(
              lockMutation,
              { website_ids: [websiteItem.website_id], website_locked: locked },
              `网站 ${websiteItem.website_name} ${locked ? '锁定' : '解锁'}成功`,
              `网站 ${websiteItem.website_name} ${locked ? '锁定' : '解锁'}失败`
            )
          )}

          {/* 网站暂停/恢复状态切换子菜单 */}
          {renderToggleSubMenu('运转', pausedLabels, (paused) =>
            handleToggle(
              pauseMutation,
              { website_ids: [websiteItem.website_id], website_paused: paused },
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

      {/* 重置准任务确认对话框 */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重置准任务？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将重置网站 {websiteItem.website_name} (ID:{' '}
              {websiteItem.website_id})
              的所有准任务状态，但不会删除准任务数据。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleToggle(
                  resetPreTasksMutation,
                  websiteItem.website_id,
                  `网站 ${websiteItem.website_name} 准任务重置成功`,
                  `网站 ${websiteItem.website_name} 准任务重置失败`
                ).then(() => setResetDialogOpen(false))
              }
            >
              确认重置
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 清空准任务确认对话框 */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空准任务？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除网站 {websiteItem.website_name} (ID:{' '}
              {websiteItem.website_id})
              的所有准任务数据，此操作不可撤销。请谨慎操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleToggle(
                  clearPreTasksMutation,
                  websiteItem.website_id,
                  `网站 ${websiteItem.website_name} 准任务清空成功`,
                  `网站 ${websiteItem.website_name} 准任务清空失败`
                ).then(() => setClearDialogOpen(false))
              }
              className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
            >
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
