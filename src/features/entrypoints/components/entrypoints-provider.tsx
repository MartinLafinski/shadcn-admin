// 引入依赖
import React, { useState } from 'react'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 入口点数据结构
import { type EntrypointItemData } from '../data/schemas'

/**
 * 入口点管理对话框类型枚举
 * 定义了入口点管理功能中可能打开的各种对话框类型
 * 
 * 类型说明：
 * - 'create': 创建入口点对话框 - 用于添加新的入口点记录
 * - 'update': 更新入口点对话框 - 用于修改现有的入口点信息
 * - 'delete': 删除入口点对话框 - 用于确认删除入口点操作
 * - 'export': 导入入口点对话框 - 用于批量导入入口点数据
 * - 'configInfo': 入口点配置信息对话框 - 用于查看入口点配置详情
 * - 'config': 入口点配置对话框 - 用于编辑入口点的配置信息
 */
type EntrypointsDialogType = 'create' | 'update' | 'delete' | 'export' | 'configInfo' | 'config' | 'viewWebsite'

/**
 * 入口点搜索参数类型定义
 */
type EntrypointSearchParams = {
    // 搜索关键词
    entrypoint_keyword?: string
    // 入口点启用状态过滤
    entrypoint_enabled?: boolean
    // 网站ID过滤
    website_id?: number
    // 页码
    page?: number
    // 页容量
    size?: number
}

/**
 * 入口点管理上下文类型定义
 * 用于管理入口点列表中的对话框状态和当前选中的数据行
 */
type EntrypointsContextType = {
    // 当前打开的对话框类型，可为创建、更新、删除或导入，null表示无对话框打开
    open: EntrypointsDialogType | null
    // 设置对话框打开状态的方法
    setOpen: (str: EntrypointsDialogType | null) => void
    // 当前操作的数据行，null表示没有选中任何行
    currentRow: EntrypointItemData | null
    // 设置当前操作数据行的方法
    setCurrentRow: React.Dispatch<React.SetStateAction<EntrypointItemData | null>>
    // 搜索参数状态
    searchParams: EntrypointSearchParams
    // 设置搜索参数的方法
    setSearchParams: React.Dispatch<React.SetStateAction<EntrypointSearchParams>>
}

// 创建入口点管理上下文，初始值为null
const EntrypointsContext = React.createContext<EntrypointsContextType | null>(null)

/**
 * 入口点管理上下文提供者组件
 * 为子组件提供入口点管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 */
export function EntrypointsProvider({
    children
}: {
    children: React.ReactNode
}) {
    // 使用自定义hook管理对话框打开状态，初始为null（关闭状态）
    const [open, setOpen] = useDialogState<EntrypointsDialogType>(null)
    // 管理当前操作的数据行，初始为null（未选中任何行）
    const [currentRow, setCurrentRow] = useState<EntrypointItemData | null>(null)
    // 管理搜索参数状态
    const [searchParams, setSearchParams] = useState<EntrypointSearchParams>({})

    return (
        <EntrypointsContext value={{ open, setOpen, currentRow, setCurrentRow, searchParams, setSearchParams }}>
            {children}
        </EntrypointsContext>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于在组件中访问入口点管理上下文
 * 
 * @returns 入口点管理上下文对象，包含对话框状态和当前选中行数据
 * 
 * @throws 当Hook在EntrypointsProvider组件外部使用时抛出错误
 */
export const useEntrypoints = () => {
    const entrypointsContext = React.useContext(EntrypointsContext)

    if (!entrypointsContext) {
        throw new Error('useEntrypoints has to be used within <EntrypointsProvider>')
    }

    return entrypointsContext
}