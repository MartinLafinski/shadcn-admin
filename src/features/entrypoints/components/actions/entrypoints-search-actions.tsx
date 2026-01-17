// 引入依赖
import { useEffect, useState } from 'react'
// 样式
import { cn } from '@/lib/utils.ts'
// 图标
import { SearchIcon, XIcon, CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 下拉菜单控件
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx"
// Popover 和 Command 控件
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
// 输入框组控件
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group.tsx"
// 按钮组控件
import {
  ButtonGroup,
} from "@/components/ui/button-group.tsx"
// 可用性标签
import { enableLabels } from "../../data/labels.tsx"
// 获取入口点数据
import { useEntrypoints } from '../entrypoints-provider.tsx'
// 网站数据查询
import { useWebsitesQuery } from '@/features/websites/api/websites.ts'
// 路由
import { getRouteApi } from "@tanstack/react-router";

// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/entrypoints/')
const DEFAULT_PAGE_SIZE: number = Number(import.meta.env.VITE_ENTRYPOINT_PAGE_SIZE || 50)
const WEBSITE_SEARCH_SIZE: number = Number(import.meta.env.VITE_WEBSITE_SEARCH_SIZE || 50)

/**
 * 入口点搜索组件
 * 提供入口点名称/标识/URL的关键词搜索和状态筛选功能
 * 
 * 组件功能：
 * 1. 支持关键词搜索（入口点名称/标识/URL）
 * 2. 支持状态筛选（启用/禁用/全部）
 * 3. 提供重置功能
 * 
 * 使用说明：
 * - 组件会自动调用 useEntrypoints 的 setSearchParams 方法更新搜索参数
 * - 搜索参数包括：entrypoint_keyword（关键词）和 entrypoint_enabled（状态）
 */
type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({
                         className = ''
                       }: SearchProps) {
  const { searchParams, setSearchParams } = useEntrypoints()
  const navigate = route.useNavigate()

  // 本地状态：网站搜索关键词
  const [websiteKeyword, setWebsiteKeyword] = useState<string>('')
  // 本地状态：控制网站下拉框的打开状态
  const [websitePopoverOpen, setWebsitePopoverOpen] = useState(false)
  // 本地状态：网站选择框的ID
  const [websiteId, setWebsiteId] = useState<number | undefined>(undefined)
  // 本地状态：输入框的关键词
  const [keyword, setKeyword] = useState<string>('')
  // 本地状态：选中的可用性标签（显示在下拉按钮上）
  const [selectedLabel, setSelectedLabel] = useState<string>('状态')
  // 本地状态：实际的可用性值（用于API参数）
  const [enabledValue, setEnabledValue] = useState<boolean | undefined>(undefined)

  // 获取网站列表数据（支持搜索）
  const { data: websitesData, isLoading: websitesLoading } = useWebsitesQuery(websiteKeyword, undefined, 1, WEBSITE_SEARCH_SIZE)

  // 获取当前选中的网站
  const selectedWebsite = websitesData?.websites?.find(w => w.website_id === websiteId)

  useEffect(() => {
    setKeyword(searchParams?.entrypoint_keyword ?? '')
    setWebsiteId(searchParams?.website_id)
  }, [searchParams.entrypoint_keyword, searchParams.website_id])

  useEffect(() => {
    const value = searchParams?.entrypoint_enabled ?? undefined
    setEnabledValue(value)

    // 根据当前值更新显示标签
    if (value === undefined) {
      setSelectedLabel('所有') // 如果值为undefined（即所有状态），显示"所有"
    } else {
      // 根据enableLabels数组中对应的标签进行显示
      const matchedLabel = enableLabels.find(label => label.value === value)
      setSelectedLabel(matchedLabel ? matchedLabel.label : '状态')
    }
  }, [searchParams.entrypoint_enabled])

  const updateUrlParams = (params: {
    website_id?: number
    entrypoint_keyword?: string
    entrypoint_enabled?: boolean
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        // 创建新的参数对象，合并之前的参数和新参数
        const newParams = {
          ...(prev as Record<string, unknown>), // 保留之前的参数
          website_id: params.website_id || undefined, // 如果网站ID为空则设为undefined
          entrypoint_keyword: params.entrypoint_keyword || undefined, // 如果关键词为空则设为undefined
          entrypoint_enabled: params.entrypoint_enabled, // 状态参数直接使用
          page: params.page && params.page > 1 ? params.page : undefined, // 只有页码大于1时才保留
          size: params.size && params.size !== DEFAULT_PAGE_SIZE ? params.size : undefined, // 只有数量非 DEFAULT_PAGE_SIZE 时才保留
        }

        // 清理 undefined 值，避免在URL中出现 undefined 字符串
        // 这样可以保持URL的简洁性，例如不会出现 ?page=undefined 的情况
        Object.keys(newParams).forEach(key => {
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
   * 将当前关键词和状态值提交到搜索参数中
   * 如果关键词为空，则不传递该参数
   */
  const handleSearch = () => {
    // 更新搜索参数，触发 API 重新请求
    setSearchParams({
      website_id: websiteId || undefined,
      entrypoint_keyword: keyword || undefined, // 如果关键词为空，设置为 undefined（不传递参数）
      entrypoint_enabled: enabledValue, // 传递选中的状态值（true/false/undefined）
      page: 1,
      size: searchParams.size,
    })
    // 更新 URL 参数
    updateUrlParams({
      website_id: websiteId || undefined,
      entrypoint_keyword: keyword || undefined,
      entrypoint_enabled: enabledValue,
      page: 1,
      size: searchParams.size,
    })
  }

  /**
   * 处理重置按钮点击事件
   * 重置所有本地状态和搜索参数
   * 重置后会触发默认的数据请求（无过滤条件）
   */
  const handleReset = () => {
    setKeyword('') // 清空关键词
    setSelectedLabel('状态') // 重置标签显示为"状态"
    setEnabledValue(undefined) // 重置状态值为 undefined（不过滤状态）
    setWebsiteId(undefined)

    // 重置搜索参数
    const resetParams = {
      website_id: undefined, // 如果网站ID为空，设置为 undefined
      entrypoint_keyword: undefined, // 如果关键词为空，设置为 undefined（不传递参数）
      entrypoint_enabled: undefined, // 传递选中的状态值（true/false/undefined）
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(resetParams)
    updateUrlParams(resetParams)
  }

  return (
    <div className={cn("flex w-full max-w-2/3 gap-4 ", className)}>
      {/* 网站选择框 */}



      {/* 搜索输入框组合，包含关键词输入和状态筛选下拉菜单 */}
      <ButtonGroup>
        <InputGroup className="[--radius:1rem]">
          <InputGroupAddon align="inline-start">
            <InputGroupButton size="icon-xs" onClick={handleReset}>
              <XIcon/>
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupAddon align="inline-start">
            <Popover open={websitePopoverOpen} onOpenChange={setWebsitePopoverOpen}>
              <PopoverTrigger asChild>
                <InputGroupButton
                  variant='ghost'
                  size='sm'
                  role='combobox'
                  className={cn(
                    'justify-between h-6 -ml-2 text-sm',
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
                    {!websitesLoading && (!websitesData?.websites || websitesData.websites.length === 0) && (
                      <CommandEmpty>未找到网站</CommandEmpty>
                    )}
                    {websitesLoading && (
                      <CommandEmpty>加载中...</CommandEmpty>
                    )}
                    {websitesData?.websites && websitesData.websites.length > 0 && (
                      <CommandGroup key={websitesData?.websites.length.toString()}>
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
                            <div className="flex flex-col">
                              <span className="flex font-semibold">{website.website_name}</span>
                              <span className="flex text-muted-foreground text-xs">
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
          {/* 状态筛选下拉菜单 - 用于筛选入口点的启用状态 */}
          <InputGroupAddon align="inline-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* 下拉触发按钮 - 显示当前选中的状态标签 */}
                <InputGroupButton
                  variant="ghost"
                  className={cn("!pr-1.5 -ml-2 text-sm",
                    enableLabels.find((label)=> {
                      return label.value === enabledValue
                    })?.className ?? ''
                  )}
                >
                  {selectedLabel} <ChevronsUpDownIcon className="size-3" />
                </InputGroupButton>
              </DropdownMenuTrigger>

              {/* 下拉菜单内容 - 包含所有可选状态项 */}
              <DropdownMenuContent align="start" className="[--radius:0.95rem]">
                {/* "所有"选项 - 清除状态筛选条件 */}
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedLabel('所有')
                    setEnabledValue(undefined)
                  }}
                >
                  所有
                </DropdownMenuItem>

                {/* 遍历 enableLabels 数组，生成每个状态选项 */}
                {enableLabels.map((item) => (
                  <DropdownMenuItem
                    key={item.value.toString()} // 使用值的字符串作为唯一键
                    onClick={() => {
                      // 更新显示标签和实际状态值
                      setSelectedLabel(`${item.label}`)
                      setEnabledValue(item.value as boolean)
                    }}
                  >
                    {item.label} {/* 显示状态标签 */}
                    <item.icon/> {/* 显示状态图标 */}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
          {/* 关键词输入框 - 支持输入入口点名称、标识或URL进行搜索 */}
          <InputGroupInput
            placeholder="入口点名称/标识/URL"
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
          <SearchIcon/>
          查找
        </Button>
      </ButtonGroup>
    </div>
  )
}