// 引入依赖
import { type JSX } from "react"
// 在文件顶部引入Link
import { Link } from "@tanstack/react-router"
// 表格
import { type Row } from '@tanstack/react-table'
// 图标
import { Trash2, SquarePenIcon, DoorOpen, ListTodo, Settings2Icon, EllipsisIcon, ListVideo } from 'lucide-react'
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
// 网站状态
import { useWebsites } from '../websites-provider.tsx'
// 网站数据格式
import { WebsiteItemSchema } from '../../data/schemas.ts'
// 可用性标签
import { enableLabels } from '../../data/labels.tsx'
// 网站API操作
import { useSwitchWebsiteMutation } from "@/features/websites/api/websites.ts"
// 操作结果提示框
import { toast } from "sonner"


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
export function WebsitesRowActions<TData>(
    {
        row,
    }: DataTableRowActionsProps<TData>): JSX.Element
{
    // 解析当前行的原始数据为网站项目类型
    const websiteItem = WebsiteItemSchema.parse(row.original)
    // 从网站上下文中获取设置状态的函数
    const { setOpen, setCurrentRow } = useWebsites()

    const switchMutation = useSwitchWebsiteMutation() // 使用网站状态切换的mutation


    /**
     * 处理开关状态变化的异步函数
     * 发送API请求切换网站状态并显示操作结果
     */
    const handleToggleSwitch = async (website_enabled: boolean) => {
        await switchMutation.mutateAsync({
            websiteId: websiteItem.website_id,
            data: {
                website_enabled: website_enabled
            },
        }).then((result) => {
            toast.success(`网站 ${result.website_name} 状态切换成功`) // 操作成功提示
        }).catch((error) => {
            console.error(`网站 ${websiteItem.website_name} 状态切换失败:`, error) // 记录错误日志
            toast.error(`网站 ${websiteItem.website_name} 状态切换失败`) // 操作失败提示
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
                {/* 网站说明与配置操作 */}
                <DropdownMenuItem
                  onClick={() => {
                      // 设置当前操作的行数据
                      setCurrentRow(websiteItem)
                      // 打开配置对话框
                      setOpen('config')
                  }}
                >
                    说明与配置
                    <DropdownMenuShortcut>
                        <Settings2Icon size={16} />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                {/* 查看入口点功能 */}
                <DropdownMenuItem asChild>
                    <Link
                        to="/entrypoints"
                        search={{ website_id: websiteItem.website_id }}
                        target="_blank"
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
                      to="/pre-tasks"
                      search={{ website_id: websiteItem.website_id }}
                      target="_blank"
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
                      to="/jobs"
                      search={{ website_id: websiteItem.website_id }}
                      target="_blank"
                    >
                        查看作业任务
                        <DropdownMenuShortcut>
                            <ListVideo size={16} />
                        </DropdownMenuShortcut>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* 网站启用/禁用状态切换子菜单 */}
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
                                >
                                    {/* 显示标签文本和对应图标 */}
                                    {label.label} <label.icon></label.icon>
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
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
                    删除
                    <DropdownMenuShortcut>
                        <Trash2 size={16} />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}