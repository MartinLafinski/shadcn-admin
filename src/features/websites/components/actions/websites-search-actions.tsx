// 引入依赖
import React, { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
// 路由
import { getRouteApi } from '@tanstack/react-router'
// 图标
import { SearchIcon, XIcon, ChevronsUpDownIcon } from 'lucide-react'
// 可用性标签
import {
  enableLabels,
  lockedLabels,
  pausedLabels,
  limitedLabels,
} from '@/lib/labels'
// 样式
import { cn } from '@/lib/utils.ts'
// 按钮组控件
import { ButtonGroup } from '@/components/ui/button-group.tsx'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 下拉菜单控件
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
// 输入框组控件
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group.tsx'
// 获取网站数据
import { useWebsitesSearch, useWebsitesActions } from '../websites-provider.tsx'

// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/websites/')
// 默认网站每页数量
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_WEBSITE_PAGE_SIZE || 50
)

/**
 * 筛选下拉菜单组件
 */
const FilterDropdown = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: typeof enableLabels
  value: boolean | undefined
  onChange: (value: boolean | undefined) => void
  placeholder: string
}) => {
  const selectedOption = options.find((o) => o.value === value)
  const label = selectedOption ? selectedOption.label : placeholder

  return (
    <InputGroupAddon align='inline-start'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <InputGroupButton
            variant='ghost'
            className={cn('-ml-2 !pr-1.5 text-sm', selectedOption?.className)}
          >
            {label} <ChevronsUpDownIcon className='size-3' />
          </InputGroupButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start' className='[--radius:0.95rem]'>
          <DropdownMenuItem onClick={() => onChange(undefined)}>
            所有
          </DropdownMenuItem>
          {options.map((item) => (
            <DropdownMenuItem
              key={item.value.toString()}
              onClick={() => onChange(item.value as boolean)}
            >
              {item.label} <item.icon />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </InputGroupAddon>
  )
}

/**
 * 网站搜索组件
 * 提供网站名称/标识/URL的关键词搜索和状态筛选功能
 *
 * 组件功能：
 * 1. 支持关键词搜索（网站名称/标识/URL）
 * 2. 支持状态筛选（启用/禁用/全部）
 * 3. 提供重置功能
 *
 * 使用说明：
 * - 组件会自动调用 useWebsites 的 setSearchParams 方法更新搜索参数
 * - 搜索参数包括：website_keyword（关键词）和 website_enabled（状态）
 */
type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '' }: SearchProps) {
  const { searchParams } = useWebsitesSearch()
  const { setSearchParams } = useWebsitesActions()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()

  // 本地状态：输入框的关键词，用于存储用户在搜索框中输入的内容
  const [keyword, setKeyword] = useState<string>('')

  // 本地筛选状态
  const [enabledValue, setEnabledValue] = useState<boolean | undefined>(
    undefined
  )
  const [lockedValue, setLockedValue] = useState<boolean | undefined>(undefined)
  const [pausedValue, setPausedValue] = useState<boolean | undefined>(undefined)
  const [limitedValue, setLimitedValue] = useState<boolean | undefined>(
    undefined
  )

  // 同步 URL 参数到本地状态
  useEffect(() => {
    setKeyword(searchParams?.website_keyword ?? '')
    setEnabledValue(searchParams?.website_enabled ?? undefined)
    setLockedValue(searchParams?.website_locked ?? undefined)
    setPausedValue(searchParams?.website_paused ?? undefined)
    setLimitedValue(searchParams?.website_limited ?? undefined)
  }, [
    searchParams.website_keyword,
    searchParams.website_enabled,
    searchParams.website_locked,
    searchParams.website_paused,
    searchParams.website_limited,
  ])

  /**
   * 更新 URL 参数
   * 该函数用于更新浏览器URL中的搜索参数，同时保留其他参数不变
   *
   * @param params - 需要更新的参数对象
   * @param params.website_keyword - 网站关键词搜索参数
   * @param params.website_enabled - 网站启用状态筛选参数
   * @param params.page - 分页页码参数
   * @param params.size - 每页数量参数
   *
   * 使用说明：
   * - website_keyword: 如果为空字符串则转换为undefined，不传递该参数
   * - page: 只有当页码大于1时才添加到URL中（首页不显示页码参数）
   * - size: 只有当每页数量不等于默认值 DEFAULT_PAGE_SIZE 时才添加到URL中
   */
  const updateUrlParams = (params: {
    website_keyword?: string
    website_enabled?: boolean
    website_locked?: boolean
    website_paused?: boolean
    website_limited?: boolean
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        // 创建新的参数对象，合并之前的参数和新参数
        const newParams = {
          ...(prev as Record<string, unknown>), // 保留之前的参数
          website_keyword: params.website_keyword || undefined, // 如果关键词为空则设为undefined
          website_enabled: params.website_enabled, // 状态参数直接使用
          website_locked: params.website_locked,
          website_paused: params.website_paused,
          website_limited: params.website_limited,
          page: params.page && params.page > 1 ? params.page : undefined, // 只有页码大于1时才保留
          size:
            params.size && params.size !== DEFAULT_PAGE_SIZE
              ? params.size
              : undefined, // 只有数量非DEFAULT_PAGE_SIZE时才保留
        }

        // 清理 undefined 值，避免在URL中出现 undefined 字符串
        // 这样可以保持URL的简洁性，例如不会出现 ?page=undefined 的情况
        Object.keys(newParams).forEach((key) => {
          if (newParams[key as keyof typeof newParams] === undefined) {
            delete newParams[key as keyof typeof newParams]
          }
        })

        return newParams
      },
    })
  }

  /**
   * 处理搜索按钮点击事件
   */
  const handleSearch = () => {
    // 更新本地状态和API参数
    setSearchParams({
      website_keyword: keyword || undefined,
      website_enabled: enabledValue,
      website_locked: lockedValue,
      website_paused: pausedValue,
      website_limited: limitedValue,
      page: 1,
      size: searchParams.size,
    })

    // 更新 URL 参数
    updateUrlParams({
      website_keyword: keyword || undefined,
      website_enabled: enabledValue,
      website_locked: lockedValue,
      website_paused: pausedValue,
      website_limited: limitedValue,
      page: 1,
      size: searchParams.size,
    })

    // 无论搜索参数是否变化，强制刷新查询以发出真实的搜索请求
    queryClient.invalidateQueries({ queryKey: ['websites'] })
  }

  /**
   * 处理重置按钮点击事件
   */
  const handleReset = () => {
    // 重置本地状态
    setKeyword('')
    setEnabledValue(undefined)
    setLockedValue(undefined)
    setPausedValue(undefined)
    setLimitedValue(undefined)

    // 重置搜索参数
    const resetParams = {
      website_keyword: undefined,
      website_enabled: undefined,
      website_locked: undefined,
      website_paused: undefined,
      website_limited: undefined,
      page: 1,
      size: searchParams.size,
    }

    setSearchParams(resetParams)
    updateUrlParams(resetParams)
  }

  return (
    <div className={cn('flex w-full max-w-2/3 gap-4', className)}>
      {/* 搜索输入框组合，包含关键词输入和状态筛选下拉菜单 */}
      <ButtonGroup>
        <InputGroup className='[--radius:1rem]'>
          {/* 重置按钮 - 清空所有搜索条件 */}
          <InputGroupAddon align='inline-start'>
            <InputGroupButton size='icon-xs' onClick={handleReset}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>

          <FilterDropdown
            options={enableLabels}
            value={enabledValue}
            onChange={setEnabledValue}
            placeholder='可用选项'
          />

          <FilterDropdown
            options={lockedLabels}
            value={lockedValue}
            onChange={setLockedValue}
            placeholder='锁定选项'
          />

          <FilterDropdown
            options={pausedLabels}
            value={pausedValue}
            onChange={setPausedValue}
            placeholder='运转选项'
          />

          <FilterDropdown
            options={limitedLabels}
            value={limitedValue}
            onChange={setLimitedValue}
            placeholder='受限选项'
          />

          {/* 关键词输入框 - 支持输入网站名称、标识或URL进行搜索 */}
          <InputGroupInput
            placeholder='网站名称/标识/URL'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)} // 更新关键词状态
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
        </InputGroup>

        {/* 搜索按钮 - 触发搜索操作 */}
        <Button onClick={handleSearch}>
          <SearchIcon />
          <span className='hidden sm:inline'>查找</span>
        </Button>
      </ButtonGroup>
    </div>
  )
}
