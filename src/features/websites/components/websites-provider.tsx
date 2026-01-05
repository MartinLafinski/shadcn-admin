// 引入依赖
import React, { useState } from 'react'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 网站数据结构
import { type WebsiteItemData } from '../data/schemas'

/**
 * 网站管理对话框类型枚举
 * 定义了网站管理功能中可能打开的各种对话框类型
 * 
 * 类型说明：
 * - 'create': 创建网站对话框 - 用于添加新的网站记录
 * - 'update': 更新网站对话框 - 用于修改现有的网站信息
 * - 'delete': 删除网站对话框 - 用于确认删除网站操作
 * - 'export': 导入网站对话框 - 用于批量导入网站数据
 * - 'configInfo': 网站配置信息对话框 - 用于查看网站配置详情
 * - 'config': 网站配置对话框 - 用于编辑网站的配置信息
 */
type WebsitesDialogType = 'create' | 'update' | 'delete' | 'export' | 'configInfo' | 'config' | 'view'

/**
 * 网站搜索参数类型定义
 */
type WebsiteSearchParams = {
    // 搜索关键词
    website_keyword?: string
    // 网站启用状态过滤
    website_enabled?: boolean
    // 页码
    page?: number
    // 页容量
    size?: number
}

/**
 * 网站管理上下文类型定义
 * 用于管理网站列表中的对话框状态和当前选中的数据行
 */
type WebsitesContextType = {
    // 当前打开的对话框类型，可为创建、更新、删除或导入，null表示无对话框打开
    open: WebsitesDialogType | null
    // 设置对话框打开状态的方法
    setOpen: (str: WebsitesDialogType | null) => void
    // 当前操作的数据行，null表示没有选中任何行
    currentRow: WebsiteItemData | null
    // 设置当前操作数据行的方法
    setCurrentRow: React.Dispatch<React.SetStateAction<WebsiteItemData | null>>
    // 搜索参数状态
    searchParams: WebsiteSearchParams
    // 设置搜索参数的方法
    setSearchParams: React.Dispatch<React.SetStateAction<WebsiteSearchParams>>
}

// 创建网站管理上下文，初始值为null
const WebsitesContext = React.createContext<WebsitesContextType | null>(null)

/**
 * 网站管理上下文提供者组件
 * 为子组件提供网站管理所需的状态和方法
 *
 * @param children - 需要访问上下文的子组件
 */
export function WebsitesProvider({
    children
}: {
    children: React.ReactNode
}) {
    // 使用自定义hook管理对话框打开状态，初始为null（关闭状态）
    const [open, setOpen] = useDialogState<WebsitesDialogType>(null)
    // 管理当前操作的数据行，初始为null（未选中任何行）
    const [currentRow, setCurrentRow] = useState<WebsiteItemData | null>(null)
    // 管理搜索参数状态
    const [searchParams, setSearchParams] = useState<WebsiteSearchParams>({})

    return (
        <WebsitesContext value={{ open, setOpen, currentRow, setCurrentRow, searchParams, setSearchParams }}>
            {children}
        </WebsitesContext>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于在组件中访问网站管理上下文
 * 
 * @returns 网站管理上下文对象，包含对话框状态和当前选中行数据
 * 
 * @throws 当Hook在WebsitesProvider组件外部使用时抛出错误
 */
export const useWebsites = () => {
    const websitesContext = React.useContext(WebsitesContext)

    if (!websitesContext) {
        throw new Error('useWebsites has to be used within <WebsitesContext>')
    }

    return websitesContext
}
