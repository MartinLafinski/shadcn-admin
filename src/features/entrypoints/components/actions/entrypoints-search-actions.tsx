// 引入依赖
import React, { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
// 路由
import { getRouteApi } from '@tanstack/react-router'
// 图标
import {
  SearchIcon,
  XIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  SearchCheckIcon,
} from 'lucide-react'
// 可用性标签
import {
  enableLabels,
  lockedLabels,
  pausedLabels,
  limitedLabels,
  deeplySearchLabels,
} from '@/lib/labels.tsx'
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
// 行业数据查询
import { IndustryCombobox } from '@/components/smart/combobox/industry-combobox'
// 网站数据查询
import { WebsiteCombobox } from '@/components/smart/combobox/website-combobox'
import { FilterDropdown } from '@/components/smart/filter-dropdown'
// 获取入口点数据
import { useEntrypoints } from '../entrypoints-provider.tsx'

// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/entrypoints/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_ENTRYPOINT_PAGE_SIZE || 50
)

/**
 * 入口点搜索组件
 * 提供入口点名称/标识/URL的关键词搜索和状态筛选功能
 */
type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '' }: SearchProps) {
  const { searchParams, setSearchParams } = useEntrypoints()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()

  // 本地状态：行业选择框的ID
  const [industryId, setIndustryId] = useState<number | undefined>(undefined)

  // 本地状态：输入框的关键词
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
  const [deeplySearch, setDeeplySearch] = useState<boolean>(false)
  const [websiteId, setWebsiteId] = useState<number | undefined>(undefined)

  useEffect(() => {
    setKeyword(searchParams?.entrypoint_keyword ?? '')
    setWebsiteId(searchParams?.website_id)
    setIndustryId(searchParams?.industry_id)
    setEnabledValue(searchParams?.entrypoint_enabled ?? undefined)
    setLockedValue(searchParams?.entrypoint_locked ?? undefined)
    setPausedValue(searchParams?.entrypoint_paused ?? undefined)
    setLimitedValue(searchParams?.entrypoint_limited ?? undefined)
    setDeeplySearch(searchParams?.deeply_search ?? false)
  }, [
    searchParams.entrypoint_keyword,
    searchParams.website_id,
    searchParams.industry_id,
    searchParams.entrypoint_enabled,
    searchParams.entrypoint_locked,
    searchParams.entrypoint_paused,
    searchParams.entrypoint_limited,
    searchParams.deeply_search,
  ])

  const updateUrlParams = (params: {
    website_id?: number
    industry_id?: number
    entrypoint_keyword?: string
    entrypoint_enabled?: boolean
    entrypoint_locked?: boolean
    entrypoint_paused?: boolean
    entrypoint_limited?: boolean
    deeply_search?: boolean
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        const newParams = {
          ...(prev as Record<string, unknown>),
          website_id: params.website_id || undefined,
          industry_id: params.industry_id || undefined,
          entrypoint_keyword: params.entrypoint_keyword || undefined,
          entrypoint_enabled: params.entrypoint_enabled,
          entrypoint_locked: params.entrypoint_locked,
          entrypoint_paused: params.entrypoint_paused,
          entrypoint_limited: params.entrypoint_limited,
          deeply_search: params.deeply_search,
          page: params.page && params.page > 1 ? params.page : undefined,
          size:
            params.size && params.size !== DEFAULT_PAGE_SIZE
              ? params.size
              : undefined,
        }

        Object.keys(newParams).forEach((key) => {
          if (newParams[key as keyof typeof newParams] === undefined) {
            delete newParams[key as keyof typeof newParams]
          }
        })

        return newParams
      },
    })
  }

  const handleSearch = () => {
    setSearchParams({
      website_id: websiteId || undefined,
      industry_id: industryId || undefined,
      entrypoint_keyword: keyword || undefined,
      entrypoint_enabled: enabledValue,
      entrypoint_locked: lockedValue,
      entrypoint_paused: pausedValue,
      entrypoint_limited: limitedValue,
      deeply_search: deeplySearch,
      page: 1,
      size: searchParams.size,
    })
    updateUrlParams({
      website_id: websiteId || undefined,
      industry_id: industryId || undefined,
      entrypoint_keyword: keyword || undefined,
      entrypoint_enabled: enabledValue,
      entrypoint_locked: lockedValue,
      entrypoint_paused: pausedValue,
      entrypoint_limited: limitedValue,
      deeply_search: deeplySearch,
      page: 1,
      size: searchParams.size,
    })

    queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
  }

  const handleReset = () => {
    setKeyword('')
    setEnabledValue(undefined)
    setLockedValue(undefined)
    setPausedValue(undefined)
    setLimitedValue(undefined)
    setDeeplySearch(false)
    setWebsiteId(undefined)
    setIndustryId(undefined)

    const resetParams = {
      industry_id: undefined,
      website_id: undefined,
      entrypoint_keyword: undefined,
      entrypoint_enabled: undefined,
      entrypoint_locked: undefined,
      entrypoint_paused: undefined,
      entrypoint_limited: undefined,
      deeply_search: false,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(resetParams)
    updateUrlParams(resetParams)
  }

  return (
    <div className={cn('flex w-full max-w-2/3 gap-4', className)}>
      <ButtonGroup>
        <InputGroup className='[--radius:1rem]'>
          <InputGroupAddon align='inline-start'>
            <InputGroupButton size='icon-xs' onClick={handleReset}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
          {/* 网站下拉菜单 */}
          <InputGroupAddon align='inline-start'>
            <WebsiteCombobox
              value={websiteId}
              onChange={(id) => setWebsiteId(id ?? undefined)}
              variant='inline'
              placeholder='网站?'
            />
          </InputGroupAddon>

          {/* 行业下拉菜单 */}
          <InputGroupAddon align='inline-start'>
            <IndustryCombobox
              value={industryId}
              onChange={(id) => setIndustryId(id ?? undefined)}
              variant='inline'
              placeholder='行业?'
            />
          </InputGroupAddon>

          {/* 状态筛选 */}
          <FilterDropdown
            options={enableLabels}
            value={enabledValue}
            onChange={setEnabledValue}
            placeholder='可用?'
          />

          {/* 锁定筛选 */}
          <FilterDropdown
            options={lockedLabels}
            value={lockedValue}
            onChange={setLockedValue}
            placeholder='锁定?'
          />

          {/* 暂停筛选 */}
          <FilterDropdown
            options={pausedLabels}
            value={pausedValue}
            onChange={setPausedValue}
            placeholder='运转?'
          />

          {/* 受限筛选 */}
          <FilterDropdown
            options={limitedLabels}
            value={limitedValue}
            onChange={setLimitedValue}
            placeholder='受限?'
          />
          {/* 关键词输入框 */}
          <InputGroupInput
            placeholder='入口点名称/标识/URL'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
        </InputGroup>

        {/* 搜索按钮 */}
        <Button
          onClick={handleSearch}
          className='rounded-r-none border-r border-primary-foreground/20'
        >
          {deeplySearch ? (
            <SearchCheckIcon className='text-blue-600' />
          ) : (
            <SearchIcon />
          )}
          {deeplySearch ? '深度查找' : '查找'}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='default' className='rounded-l-none px-2'>
              <ChevronsUpDownIcon className='size-3' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='[--radius:0.95rem]'>
            {deeplySearchLabels.map((item) => (
              <DropdownMenuItem
                key={item.value.toString()}
                onClick={() => setDeeplySearch(item.value)}
              >
                <item.icon className={cn('mr-2 size-4', item.className)} />
                {item.label}
                {deeplySearch === item.value && (
                  <CheckIcon className='ml-auto size-4' />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  )
}
