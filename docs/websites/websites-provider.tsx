// 引入依赖
import React, { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
// 自定义对话框hook
import useDialogState from '@/hooks/use-dialog-state'
// 网站数据结构
import { type WebsiteItemData } from '../data/schemas'

/**
 * 网站管理对话框类型枚举
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
 */
type WebsitesContextType = {
    // 当前打开的对话框类型
    open: WebsitesDialogType | null
    // 设置对话框打开状态的方法
    setOpen: (str: WebsitesDialogType | null) => void
    // 当前操作的数据行
    currentRow: WebsiteItemData | null
    // 设置当前操作数据行的方法
    setCurrentRow: React.Dispatch<React.SetStateAction<WebsiteItemData | null>>
    // 搜索参数状态
    searchParams: WebsiteSearchParams
    // 设置搜索参数的方法
    setSearchParams: React.Dispatch<React.SetStateAction<WebsiteSearchParams>>
}

// 创建网站管理上下文
const WebsitesContext = React.createContext<WebsitesContextType | null>(null)

/**
 * 网站管理上下文提供者组件
 * 
 * @param children - 需要访问上下文的子组件
 * @param initialSearchParams - 初始的搜索参数（可选）
 */
export function WebsitesProvider({
    children,
    initialSearchParams = {}
}: {
    children: React.ReactNode
    initialSearchParams?: WebsiteSearchParams
}) {
    // 使用自定义hook管理对话框打开状态
    const [open, setOpen] = useDialogState<WebsitesDialogType>(null)
    // 管理当前操作的数据行
    const [currentRow, setCurrentRow] = useState<WebsiteItemData | null>(null)
    
    // 使用 URL 的 search 参数作为初始值
    const [searchParams, setSearchParams] = useState<WebsiteSearchParams>(initialSearchParams)
    
    // 监听 URL 的 search 参数变化，同步到 state
    const search = useSearch({ from: '/_authenticated/websites' })
    useEffect(() => {
        setSearchParams({
            website_keyword: search.website_keyword,
            website_enabled: search.website_enabled,
            page: search.page,
            size: search.size,
        })
    }, [search.website_keyword, search.website_enabled, search.page, search.size])
    
    return (
        <WebsitesContext value={{ open, setOpen, currentRow, setCurrentRow, searchParams, setSearchParams }}>
            {children}
        </WebsitesContext>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
/**
 * 自定义Hook，用于在组件中访问网站管理上下文
 */
export const useWebsites = () => {
    const websitesContext = React.useContext(WebsitesContext)

    if (!websitesContext) {
        throw new Error('useWebsites has to be used within <WebsitesContext>')
    }

    return websitesContext
}