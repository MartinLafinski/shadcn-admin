// 引入依赖
import { type JSX } from "react"
// 表格
import { type Row } from '@tanstack/react-table'
// 图标
import { Trash2, SquarePenIcon, CloudSyncIcon, FolderSyncIcon, Settings2Icon, EllipsisIcon } from 'lucide-react'
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
// 模板状态
import { useTemplates } from '../templates-provider.tsx'
// 模板数据格式
import { TemplateItemSchema } from '../../data/schemas.ts'
// 可用性标签
import { enableLabels } from '../../data/labels.tsx'
// 模板API操作
import { useSwitchTemplateMutation } from "@/features/templates/api/templates.ts"
// 操作结果提示框
import { toast } from "sonner"


/**
 * 模板数据表格行操作组件
 * 提供模板条目的各种操作选项，如编辑、配置、删除等
 * 
 * 开发者注意事项：
 * 1. 如果需要添加新的操作选项，请在 DropdownMenuContent 中添加新的 DropdownMenuItem
 * 2. 如果需要修改操作逻辑，请参考现有的 onClick 处理函数
 * 3. 如果需要修改禁用状态，请修改对应 MenuItem 的 disabled 属性
 * 4. 图标和功能绑定可以根据需要进行调整
 * 5. 所有操作都通过 useTemplates 上下文进行状态管理
 */
type DataTableRowActionsProps<TData> = {
    /**
     * 表格行数据
     * 包含模板条目的完整信息
     */
    row: Row<TData>
}

/**
 * 模板表格行操作组件 - 渲染一个下拉菜单，包含对当前行数据的各种操作选项
 * 
 * @template TData - 表格行数据的类型
 * @param {DataTableRowActionsProps<TData>} props - 组件属性
 * @param {Row<TData>} props.row - 当前行的数据
 * @returns {JSX.Element} 渲染后的操作菜单组件
 */
export function TemplatesRowActions<TData>(
    {
        row,
    }: DataTableRowActionsProps<TData>): JSX.Element
{
    // 解析当前行的原始数据为模板项目类型
    const templateItem = TemplateItemSchema.parse(row.original)
    // 从模板上下文中获取设置状态的函数
    const { setOpen, setCurrentRow } = useTemplates()

    const switchMutation = useSwitchTemplateMutation() // 使用模板状态切换的mutation


    /**
     * 处理开关状态变化的异步函数
     * 发送API请求切换模板状态并显示操作结果
     */
    const handleToggleSwitch = async (template_enabled: boolean) => {
        await switchMutation.mutateAsync({
            templateId: templateItem.template_id,
            data: {
                template_enabled: template_enabled
            },
        }).then((result) => {
            toast.success(`模板 ${result.template_name} 状态切换成功`) // 操作成功提示
        }).catch((error) => {
            console.error(`模板 ${templateItem.template_name} 状态切换失败:`, error) // 记录错误日志
            toast.error(`模板 ${templateItem.template_name} 状态切换失败`) // 操作失败提示
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
                {/* 编辑模板信息操作 */}
                <DropdownMenuItem
                    onClick={() => {
                        // 设置当前操作的行数据
                        setCurrentRow(templateItem)
                        // 打开编辑对话框
                        setOpen('update')
                    }}
                >
                    编辑
                    <DropdownMenuShortcut>
                        <SquarePenIcon size={16} />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                {/* 模板说明与配置操作 */}
                <DropdownMenuItem
                  onClick={() => {
                      // 设置当前操作的行数据
                      setCurrentRow(templateItem)
                      // 打开配置对话框
                      setOpen('config')
                  }}
                >
                    说明与配置
                    <DropdownMenuShortcut>
                        <Settings2Icon size={16} />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                {/* 同步入口点功能 - 目前禁用 */}
                <DropdownMenuItem disabled>
                    同步入口点
                    <DropdownMenuShortcut>
                        <CloudSyncIcon size={16} />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                {/* 同步准任务功能 - 目前禁用 */}
                <DropdownMenuItem disabled>
                    同步准任务
                    <DropdownMenuShortcut>
                        <FolderSyncIcon size={16} />
                    </DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {/* 模板启用/禁用状态切换子菜单 */}
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
                {/* 删除模板操作 - 危险操作 */}
                <DropdownMenuItem
                    onClick={() => {
                        // 设置当前操作的行数据
                        setCurrentRow(templateItem)
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