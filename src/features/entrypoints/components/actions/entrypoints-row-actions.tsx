// 引入依赖
import React, { type JSX } from 'react'
// 在文件顶部引入Link
import { Link } from '@tanstack/react-router'
// 表格
import { type Row } from '@tanstack/react-table'
// 图标
import {
  Trash2,
  SquarePenIcon,
  Settings2Icon,
  EllipsisIcon,
  ListVideo,
  ListTree,
  Newspaper,
  Calendar as CalendarIcon,
  DrillIcon,
  Wrench,
} from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
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
// 入口点API操作
import {
  useSwitchEntrypointMutation,
  useBatchLockEntrypointsMutation,
  useBatchPauseEntrypointsMutation,
} from '@/features/entrypoints/api/entrypoints.ts'
// 可用性标签
import { enableLabels, lockedLabels, pausedLabels } from '../../data/labels.tsx'
// 入口点数据格式
import { EntrypointItemSchema } from '../../data/schemas.ts'
// 入口点状态
import { useEntrypoints } from '../entrypoints-provider.tsx'

/**
 * 入口点数据表格行操作组件
 * 提供入口点条目的各种操作选项，如编辑、配置、删除等
 *
 * 开发者注意事项：
 * 1. 如果需要添加新的操作选项，请在 DropdownMenuContent 中添加新的 DropdownMenuItem
 * 2. 如果需要修改操作逻辑，请参考现有的 onClick 处理函数
 * 3. 如果需要修改禁用状态，请修改对应 MenuItem 的 disabled 属性
 * 4. 图标和功能绑定可以根据需要进行调整
 * 5. 所有操作都通过 useEntrypoints 上下文进行状态管理
 */
type DataTableRowActionsProps<TData> = {
  /**
   * 表格行数据
   * 包含入口点条目的完整信息
   */
  row: Row<TData>
}

/**
 * 入口点表格行操作组件 - 渲染一个下拉菜单，包含对当前行数据的各种操作选项
 *
 * @template TData - 表格行数据的类型
 * @param {DataTableRowActionsProps<TData>} props - 组件属性
 * @param {Row<TData>} props.row - 当前行的数据
 * @returns {JSX.Element} 渲染后的操作菜单组件
 */
export function EntrypointsRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>): JSX.Element {
  // 解析当前行的原始数据为入口点项目类型
  const entrypointItem = EntrypointItemSchema.parse(row.original)
  // 从入口点上下文中获取设置状态的函数
  const { setOpen, setCurrentRow } = useEntrypoints()
  const lockMutation = useBatchLockEntrypointsMutation() // 使用网站锁定的mutation
  const pauseMutation = useBatchPauseEntrypointsMutation() // 使用网站暂停的mutation
  const switchMutation = useSwitchEntrypointMutation() // 使用入口点状态切换的mutation

  /**
   * 处理开关状态变化的异步函数
   * 发送API请求切换入口点状态并显示操作结果
   */
  const handleToggleSwitch = async (entrypoint_enabled: boolean) => {
    await switchMutation
      .mutateAsync({
        entrypointId: entrypointItem.entrypoint_id,
        data: {
          entrypoint_enabled: entrypoint_enabled,
        },
      })
      .then((result) => {
        toast.success(`入口点 ${result.entrypoint_name} 状态切换成功`) // 操作成功提示
      })
      .catch((error) => {
        console.error(
          `入口点 ${entrypointItem.entrypoint_name} 状态切换失败:`,
          error
        ) // 记录错误日志
        toast.error(`入口点 ${entrypointItem.entrypoint_name} 状态切换失败`) // 操作失败提示
      })
  }

  /**
   * 处理锁定/解锁状态变化的异步函数
   * 发送API请求切换入口点状态并显示操作结果
   */
  const handleToggleLocked = async (entrypoint_locked: boolean) => {
    await lockMutation
      .mutateAsync({
        entrypoint_ids: [entrypointItem.entrypoint_id],
        entrypoint_locked: entrypoint_locked,
      })
      .then(() => {
        toast.success(
          `入口点 ${entrypointItem.entrypoint_name} ${entrypoint_locked ? '锁定' : '解锁'}成功`
        ) // 操作成功提示
      })
      .catch((error) => {
        console.error(
          `入口点 ${entrypointItem.entrypoint_name} ${entrypoint_locked ? '锁定' : '解锁'}失败:`,
          error
        ) // 记录错误日志
        toast.error(
          `入口点 ${entrypointItem.entrypoint_name} ${entrypoint_locked ? '锁定' : '解锁'}失败`
        ) // 操作失败提示
      })
  }

  /**
   * 处理暂停/恢复状态变化的异步函数
   * 发送API请求切换入口点状态并显示操作结果
   */
  const handleTogglePaused = async (entrypoint_paused: boolean) => {
    await pauseMutation
      .mutateAsync({
        entrypoint_ids: [entrypointItem.entrypoint_id],
        entrypoint_paused: entrypoint_paused,
      })
      .then(() => {
        toast.success(
          `入口点 ${entrypointItem.entrypoint_name} ${entrypoint_paused ? '暂停' : '恢复'}成功`
        ) // 操作成功提示
      })
      .catch((error) => {
        console.error(
          `入口点 ${entrypointItem.entrypoint_name} ${entrypoint_paused ? '暂停' : '恢复'}失败:`,
          error
        ) // 记录错误日志
        toast.error(
          `入口点 ${entrypointItem.entrypoint_name} ${entrypoint_paused ? '暂停' : '恢复'}失败`
        ) // 操作失败提示
      })
  }

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
        {/* 编辑入口点信息操作 */}
        <DropdownMenuItem
          onClick={() => {
            // 设置当前操作的行数据
            setCurrentRow(entrypointItem)
            // 打开编辑对话框
            setOpen('update')
          }}
        >
          编辑
          <DropdownMenuShortcut>
            <SquarePenIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        {/* 入口点日期区间操作 */}
        <DropdownMenuItem
          onClick={() => {
            // 设置当前操作的行数据
            setCurrentRow(entrypointItem)
            // 打开日期区间对话框
            setOpen('period')
          }}
        >
          更新日期区间
          <DropdownMenuShortcut>
            <CalendarIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        {/* 入口点爬虫配置操作 */}
        <DropdownMenuItem
          onClick={() => {
            // 设置当前操作的行数据
            setCurrentRow(entrypointItem)
            // 打开爬虫配置对话框
            setOpen('configSpider')
          }}
        >
          爬虫配置[普通]
          <DropdownMenuShortcut>
            <Settings2Icon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        {/* 通过入口点创建预备作业操作 */}
        <DropdownMenuItem
          onClick={() => {
            // 设置当前操作的行数据
            setCurrentRow(entrypointItem)
            // 打开创建预备作业对话框
            setOpen('createPrejob')
          }}
        >
          创建预备作业
          <DropdownMenuShortcut>
            <Wrench size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>

        {/* 入口点说明与配置操作 */}
        <DropdownMenuItem
          onClick={() => {
            // 设置当前操作的行数据
            setCurrentRow(entrypointItem)
            // 打开配置对话框
            setOpen('config')
          }}
        >
          说明与配置[专家]
          <DropdownMenuShortcut>
            <DrillIcon size={16} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* 查看作业任务功能 */}
        <DropdownMenuItem asChild>
          <Link
            to='/jobs'
            search={{
              website_id: entrypointItem.website_id || undefined,
              industry_id: entrypointItem.industry_id || undefined,
              entrypoint_id: entrypointItem.entrypoint_id || undefined,
            }}
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
            search={{
              website_id: entrypointItem.website_id || undefined,
              industry_id: entrypointItem.industry_id || undefined,
              entrypoint_id: entrypointItem.entrypoint_id || undefined,
            }}
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
            search={{
              website_id: entrypointItem.website_id || undefined,
              industry_id: entrypointItem.industry_id || undefined,
              entrypoint_id: entrypointItem.entrypoint_id || undefined,
            }}
            target='_blank'
          >
            查看文章
            <DropdownMenuShortcut>
              <Newspaper size={16} />
            </DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {/* 入口点启用/禁用状态切换子菜单 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>可用</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup>
              {/* 遍历所有可用状态选项并渲染为单选项目 */}
              {enableLabels.map((label) => (
                <DropdownMenuRadioItem
                  key={label.label}
                  value={label.value.toString()}
                  onClick={() => handleToggleSwitch(label.value)}
                  className={label.className}
                >
                  {/* 显示标签文本和对应图标 */}
                  {label.label} <label.icon></label.icon>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 网站锁定/解锁状态切换子菜单 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>锁定</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup>
              {/* 遍历所有可用状态选项并渲染为单选项目 */}
              {lockedLabels.map((label) => (
                <DropdownMenuRadioItem
                  key={label.label}
                  value={label.value.toString()}
                  onClick={() => handleToggleLocked(label.value)}
                  className={label.className}
                >
                  {/* 显示标签文本和对应图标 */}
                  {label.label} <label.icon></label.icon>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* 网站暂停/恢复状态切换子菜单 */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>运转</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup>
              {/* 遍历所有可用状态选项并渲染为单选项目 */}
              {pausedLabels.map((label) => (
                <DropdownMenuRadioItem
                  key={label.label}
                  value={label.value.toString()}
                  onClick={() => handleTogglePaused(label.value)}
                  className={label.className}
                >
                  {/* 显示标签文本和对应图标 */}
                  {label.label} <label.icon></label.icon>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        {/* 删除入口点操作 - 危险操作 */}
        <DropdownMenuItem
          onClick={() => {
            // 设置当前操作的行数据
            setCurrentRow(entrypointItem)
            // 打开删除确认对话框
            setOpen('delete')
          }}
          className='text-red-600'
        >
          删除
          <DropdownMenuShortcut>
            <Trash2 size={16} className='text-red-600' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
