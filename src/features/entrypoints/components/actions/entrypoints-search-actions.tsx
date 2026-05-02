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
// 样式
import { cn } from '@/lib/utils.ts'
// 按钮组控件
import { ButtonGroup } from '@/components/ui/button-group.tsx'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
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
// Popover 和 Command 控件
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
// 行业数据查询
import { useIndustriesQuery } from '@/features/industries/api/industries.ts'
// 网站数据查询
import { useWebsitesQuery } from '@/features/websites/api/websites.ts'
// 可用性标签
import {
  enableLabels,
  lockedLabels,
  pausedLabels,
  limitedLabels,
  deeplySearchLabels,
} from '../../data/labels.tsx'
// 获取入口点数据
import { useEntrypoints } from '../entrypoints-provider.tsx'

// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/entrypoints/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_ENTRYPOINT_PAGE_SIZE || 50
)
const WEBSITE_SEARCH_SIZE: number = Number(
  import.meta.env.VITE_WEBSITE_SEARCH_SIZE || 50
)
const INDUSTRY_SEARCH_SIZE: number = Number(
  import.meta.env.VITE_INDUSTRIY_SEARCH_SIZE || 50
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

  // 本地状态：网站搜索关键词
  const [websiteKeyword, setWebsiteKeyword] = useState<string>('')
  // 本地状态：控制网站下拉框的打开状态
  const [websitePopoverOpen, setWebsitePopoverOpen] = useState(false)
  // 本地状态：网站选择框的ID
  const [websiteId, setWebsiteId] = useState<number | undefined>(undefined)

  // 本地状态：行业搜索关键词
  const [industryKeyword, setIndustryKeyword] = useState<string>('')
  // 本地状态：控制行业下拉框的打开状态
  const [industryPopoverOpen, setIndustryPopoverOpen] = useState(false)
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

  // 获取网站列表数据（支持搜索）
  const { data: websitesData, isLoading: websitesLoading } = useWebsitesQuery(
    websiteKeyword,
    undefined,
    undefined,
    undefined,
    undefined,
    1,
    WEBSITE_SEARCH_SIZE
  )

  // 获取行业列表数据（支持搜索）
  const { data: industriesData, isLoading: industriesLoading } =
    useIndustriesQuery(industryKeyword, 1, INDUSTRY_SEARCH_SIZE)

  // 获取当前选中的网站
  const selectedWebsite = websitesData?.websites?.find(
    (w) => w.website_id === websiteId
  )

  // 获取当前选中的行业
  const selectedIndustry = industriesData?.industries?.find(
    (i) => i.industry_id === industryId
  )

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
            <Popover
              open={websitePopoverOpen}
              onOpenChange={setWebsitePopoverOpen}
            >
              <PopoverTrigger asChild>
                <InputGroupButton
                  variant='ghost'
                  size='sm'
                  role='combobox'
                  className={cn(
                    '-ml-2 h-6 justify-between text-sm',
                    !websiteId && 'text-muted-foreground'
                  )}
                >
                  {websiteId
                    ? selectedWebsite
                      ? `${selectedWebsite.website_name} [${selectedWebsite.website_slug}]`
                      : '选择一个网站'
                    : '选择网站'}
                  <ChevronsUpDownIcon className='size-3' />
                </InputGroupButton>
              </PopoverTrigger>
              <PopoverContent className='p-0' align='start'>
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder='搜索网站...'
                    value={websiteKeyword}
                    onValueChange={setWebsiteKeyword}
                  />
                  <CommandList>
                    {!websitesLoading &&
                      (!websitesData?.websites ||
                        websitesData.websites.length === 0) && (
                        <CommandEmpty>未找到网站</CommandEmpty>
                      )}
                    {websitesLoading && <CommandEmpty>加载中...</CommandEmpty>}
                    {websitesData?.websites &&
                      websitesData.websites.length > 0 && (
                        <CommandGroup
                          key={websitesData?.websites.length.toString()}
                        >
                          {websitesData.websites.map((website) => (
                            <CommandItem
                              key={website.website_id.toString()}
                              value={`${website.website_id}`}
                              onSelect={() => {
                                setWebsiteId(website.website_id)
                                setWebsitePopoverOpen(false)
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  websiteId === website.website_id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <div className='flex flex-col'>
                                <span className='flex font-semibold'>
                                  {website.website_name}
                                </span>
                                <span className='flex text-xs text-muted-foreground'>
                                  [{website.website_slug}]
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </InputGroupAddon>

          {/* 行业下拉菜单 */}
          <InputGroupAddon align='inline-start'>
            <Popover
              open={industryPopoverOpen}
              onOpenChange={setIndustryPopoverOpen}
            >
              <PopoverTrigger asChild>
                <InputGroupButton
                  variant='ghost'
                  size='sm'
                  role='combobox'
                  className={cn(
                    '-ml-2 h-6 justify-between text-sm',
                    !industryId && 'text-muted-foreground'
                  )}
                >
                  {industryId
                    ? selectedIndustry
                      ? `${selectedIndustry.industry_name} [${selectedIndustry.industry_slug}]`
                      : '选择一个行业'
                    : '选择行业'}
                  <ChevronsUpDownIcon className='size-3' />
                </InputGroupButton>
              </PopoverTrigger>
              <PopoverContent className='p-0' align='start'>
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder='搜索行业...'
                    value={industryKeyword}
                    onValueChange={setIndustryKeyword}
                  />
                  <CommandList>
                    {!industriesLoading &&
                      (!industriesData?.industries ||
                        industriesData.industries.length === 0) && (
                        <CommandEmpty>未找到行业</CommandEmpty>
                      )}
                    {industriesLoading && (
                      <CommandEmpty>加载中...</CommandEmpty>
                    )}
                    {industriesData?.industries &&
                      industriesData.industries.length > 0 && (
                        <CommandGroup
                          key={industriesData?.industries.length.toString()}
                        >
                          {industriesData.industries.map((industry) => (
                            <CommandItem
                              key={industry.industry_id.toString()}
                              value={`${industry.industry_id}`}
                              onSelect={() => {
                                setIndustryId(industry.industry_id)
                                setIndustryPopoverOpen(false)
                              }}
                            >
                              <CheckIcon
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  industryId === industry.industry_id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <div className='flex flex-col'>
                                <span className='flex font-semibold'>
                                  {industry.industry_name}
                                </span>
                                <span className='flex text-xs text-muted-foreground'>
                                  [{industry.industry_slug}]
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </InputGroupAddon>

          {/* 状态筛选 */}
          <FilterDropdown
            options={enableLabels}
            value={enabledValue}
            onChange={setEnabledValue}
            placeholder='可用选项'
          />

          {/* 锁定筛选 */}
          <FilterDropdown
            options={lockedLabels}
            value={lockedValue}
            onChange={setLockedValue}
            placeholder='锁定选项'
          />

          {/* 暂停筛选 */}
          <FilterDropdown
            options={pausedLabels}
            value={pausedValue}
            onChange={setPausedValue}
            placeholder='运转选项'
          />

          {/* 受限筛选 */}
          <FilterDropdown
            options={limitedLabels}
            value={limitedValue}
            onChange={setLimitedValue}
            placeholder='受限选项'
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
