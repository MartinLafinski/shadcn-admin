// 引入依赖
import { useEffect, useState } from 'react'
// 样式
import { cn } from '@/lib/utils.ts'
// 图标
import { SearchIcon, XIcon, ChevronDownIcon, CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
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
// // 输入框组控件
// import {
//   InputGroup,
//   InputGroupAddon,
//   InputGroupButton,
//   InputGroupInput,
// } from "@/components/ui/input-group.tsx"
// // 按钮组控件
// import {
//   ButtonGroup,
// } from "@/components/ui/button-group.tsx"
// 日期选择器控件
import { DatePicker } from '@/components/date-picker'
// 可用性标签
import { taskStatusLabels } from "../../data/labels.tsx"
// 获取任务数据
import { useJobs } from '../jobs-provider.tsx'
// 网站数据查询
import { useWebsitesQuery } from '@/features/websites/api/websites.ts'
// 入口点数据查询
import { useEntrypointsQuery } from '@/features/entrypoints/api/entrypoints.ts'
// 任务日期查询
import { useTaskDaysQuery } from '@/features/jobs/api/jobs.ts'
// 路由
import { getRouteApi } from "@tanstack/react-router"

// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/jobs/')
const DEFAULT_PAGE_SIZE: number = Number(import.meta.env.VITE_TASK_PAGE_SIZE || 50)
const WEBSITE_SEARCH_SIZE: number = Number(import.meta.env.VITE_WEBSITE_SEARCH_SIZE || 50)
const ENTRYPOINT_SEARCH_SIZE: number = Number(import.meta.env.VITE_ENTRYPOINT_SEARCH_SIZE || 50)


type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({
                         className = ''
                       }: SearchProps) {
  const { searchParams, setSearchParams } = useJobs()
  const navigate = route.useNavigate()

  // 本地状态: 日期（Date对象）
  const [dayDate, setDayDate] = useState<Date | undefined>(undefined)

  // 本地状态：网站搜索关键词
  const [websiteKeyword, setWebsiteKeyword] = useState<string>('')
  // 本地状态：控制网站下拉框的打开状态
  const [websitePopoverOpen, setWebsitePopoverOpen] = useState(false)
  // 本地状态：网站选择框的ID
  const [websiteId, setWebsiteId] = useState<number | undefined>(undefined)

  // 本地状态：入口点搜索关键词
  const [entrypointKeyword, setEntrypointKeyword] = useState<string>('')
  // 本地状态：控制入口点下拉框的打开状态
  const [entrypointPopoverOpen, setEntrypointPopoverOpen] = useState(false)
  // 本地状态：入口点选择框的ID
  const [entrypointId, setEntrypointId] = useState<number | undefined>(undefined)

  // 本地状态：任务状态选择
  const [statusValue, setStatusValue] = useState<string | undefined>(undefined)


  // 获取网站列表数据（支持搜索）
  const { data: websitesData, isLoading: websitesLoading } = useWebsitesQuery(websiteKeyword, undefined, 1, WEBSITE_SEARCH_SIZE)

  // 获取入口点列表数据（支持搜索）
  const { data: entrypointsData, isLoading: entrypointsLoading } = useEntrypointsQuery(websiteId, entrypointKeyword, undefined, 1, ENTRYPOINT_SEARCH_SIZE)

  // 获取任务日期列表
  const { data: taskDays } = useTaskDaysQuery()

  // 获取当前选中的网站
  const selectedWebsite = websitesData?.websites?.find(w => w.website_id === websiteId)

  // 获取当前选中的入口点
  const selectedEntrypoint = entrypointsData?.entrypoints?.find(e => e.entrypoint_id === entrypointId)


  // 初始化搜索参数：从 URL 参数中恢复之前的选择状态
  // 包括入口点 ID、网站 ID 和日期选择
  useEffect(() => {
    // 设置入口点 ID，如果 URL 中存在的话
    setEntrypointId(searchParams?.entrypoint_id)
    
    // 设置网站 ID，如果 URL 中存在的话
    setWebsiteId(searchParams?.website_id)
    
    // 从 URL 参数中解析并恢复日期（格式：YYYYMMDD）
    // 例如：20231215 表示 2023年12月15日
    if (searchParams?.day) {
      const year = parseInt(searchParams.day.substring(0, 4))
      const month = parseInt(searchParams.day.substring(4, 6)) - 1 // 月份需要减1，因为 JS 月份从 0 开始
      const day = parseInt(searchParams.day.substring(6, 8))
      setDayDate(new Date(year, month, day))
    } else if (taskDays && taskDays.length > 0) {
      // 如果 URL 中没有日期参数，但有 taskDays 数据，则选择最近期的日期
      // taskDays 中的日期格式为 YYYYMMDD，按字符串排序即可得到最近期的日期
      const latestDay = taskDays[0] // 假设 taskDays 已按日期降序排列
      const year = parseInt(latestDay.substring(0, 4))
      const month = parseInt(latestDay.substring(4, 6)) - 1
      const day = parseInt(latestDay.substring(6, 8))
      setDayDate(new Date(year, month, day))
    } else {
      // 如果 URL 中没有日期参数，也没有 taskDays 数据，则清空日期选择
      setDayDate(undefined)
    }
  }, [searchParams.entrypoint_id, searchParams.website_id, searchParams.day, taskDays])

  // 初始化状态参数：从 URL 参数中恢复任务状态选择
  useEffect(() => {
    // 从 URL 参数获取状态值，如果不存在则设为 undefined
    const value = searchParams?.status ?? undefined
    setStatusValue(value)
  }, [searchParams.status])


  /**
   * 更新URL搜索参数的辅助函数
   * 
   * 此函数负责将搜索条件同步到URL中，使得页面刷新后仍能保持当前的筛选状态
   * 同时优化了URL参数的显示，移除了不必要的默认值，保持URL的简洁性
   * 
   * @param params - 需要更新的搜索参数对象
   * @param params.day - 日期参数，格式为 YYYYMMDD
   * @param params.website_id - 网站ID，关联到特定网站的过滤条件
   * @param params.entrypoint_id - 入口点ID，关联到特定入口点的过滤条件
   * @param params.status - 任务状态，如 "running", "completed", "canceled" 等
   * @param params.page - 当前页码，只有大于1时才会显示在URL中（默认第一页不显示）
   * @param params.size - 每页显示条数，只有非默认值 DEFAULT_PAGE_SIZE 时才会显示在URL中
   * 
   * 注意事项：
   * - 此函数会保留其他未指定的搜索参数，确保不会意外清除已有的筛选条件
   * - 页码参数仅在大于1时才会出现在URL中，保持URL简洁性（第一页通常不需要显示页码参数）
   * - 每页大小参数仅在非默认值 DEFAULT_PAGE_SIZE 时才会出现在URL中（符合常见分页行为）
   * - 所有值为undefined的参数都会从URL中移除，避免出现 "?param=undefined" 的情况
   */
  const updateUrlParams = (params: {
    day?: string
    website_id?: number
    entrypoint_id?: number
    status?: string
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        // 创建新的参数对象，合并之前的参数和新参数
        const newParams = {
          ...(prev as Record<string, unknown>), // 保留之前的参数，防止意外覆盖其他搜索条件
          day: params.day, // 日期参数直接赋值
          website_id: params.website_id || undefined, // 如果网站ID为空则设为undefined，这样会在后续清理中被移除
          entrypoint_id: params.entrypoint_id || undefined, // 如果入口点ID为空则设为undefined
          status: params.status as "running" | "completed" | "canceled" | undefined, // 状态参数直接使用，限定类型为允许的状态值
          page: params.page && params.page > 1 ? params.page : undefined, // 只有页码大于1时才保留，保持URL简洁性
          size: params.size && params.size !== DEFAULT_PAGE_SIZE ? params.size : undefined, // 只有数量非默认值 DEFAULT_PAGE_SIZE 时才保留，符合常见分页行为
        }

        // 清理 undefined 值，避免在URL中出现 undefined 字符串
        // 这样可以保持URL的简洁性，例如不会出现 ?page=undefined 的情况
        // 同时也避免将空值参数传递给服务器，减少不必要的参数传输
        Object.keys(newParams).forEach(key => {
          if (newParams[key as keyof typeof newParams] === undefined) {
            delete newParams[key as keyof typeof newParams] // 移除值为undefined的参数键
          }
        })

        return newParams // 返回处理后的参数对象
      },
    })
  }

  /**
   * 处理搜索按钮点击事件
   * 将当前关键词和状态值提交到搜索参数中
   * 如果关键词为空，则不传递该参数
   */
  const handleSearch = () => {
    // 将 Date 对象转换为 YYYYMMDD 格式
    const dayValue = dayDate ? (
      `${dayDate.getFullYear()}${String(dayDate.getMonth() + 1).padStart(2, '0')}${String(dayDate.getDate()).padStart(2, '0')}`
    ) : undefined

    // 更新搜索参数，触发 API 重新请求
    setSearchParams({
      day: dayValue,
      website_id: websiteId || undefined,
      entrypoint_id: entrypointId || undefined,
      status: statusValue,
      page: 1,
      size: searchParams.size,
    })
    // 更新 URL 参数
    updateUrlParams({
      day: dayValue,
      website_id: websiteId || undefined,
      entrypoint_id: entrypointId || undefined,
      status: statusValue,
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
    setStatusValue(undefined)
    setDayDate(undefined)
    setWebsiteId(undefined)
    setEntrypointId( undefined)

    // 重置搜索参数
    const resetParams = {
      day: undefined,
      website_id: undefined,
      entrypoint_id: undefined,
      status: undefined,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(resetParams)
    updateUrlParams(resetParams)
  }

  // 获取当前选中的状态标签
  const currentStatusLabel = statusValue 
    ? taskStatusLabels.find(label => label.value === statusValue)?.label 
    : '所有状态'

  return (
    <div className={cn("flex w-full max-w-2/3 gap-4 ", className)}>
      {/* 网站选择框 */}

      {/* 日期选择器 - 使用 shadcn/ui 的 DatePicker 组件 */}
      <DatePicker
        selected={dayDate}
        onSelect={setDayDate}
        placeholder='选择日期'
        availableDates={taskDays}
      />

      {/* 任务状态选择下拉框 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'justify-between',
              !statusValue && 'text-muted-foreground'
            )}
          >
            {currentStatusLabel}
            <ChevronDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          {/* "所有状态"选项 - 清除状态筛选 */}
          <DropdownMenuItem
            onClick={() => setStatusValue(undefined)}
            className={cn(!statusValue && 'bg-accent')}
          >
            <CheckIcon
              className={cn(
                'mr-2 h-4 w-4',
                !statusValue ? 'opacity-100' : 'opacity-0'
              )}
            />
            所有状态
          </DropdownMenuItem>
          
          {/* 遍历 taskStatusLabels 数组，生成每个状态选项 */}
          {taskStatusLabels.map((item) => (
            <DropdownMenuItem
              key={item.value}
              onClick={() => setStatusValue(item.value)}
              className={cn(statusValue === item.value && 'bg-accent')}
            >
              <CheckIcon
                className={cn(
                  'mr-2 h-4 w-4',
                  statusValue === item.value ? 'opacity-100' : 'opacity-0'
                )}
              />
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover open={websitePopoverOpen} onOpenChange={setWebsitePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className={cn(
              'justify-between',
              !websiteId && 'text-muted-foreground'
            )}
          >
            {websiteId
              ? selectedWebsite
                ? `${selectedWebsite.website_name} [${selectedWebsite.website_slug}]`
                : '选择一个网站'
              : '选择网站'}
            <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
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


      <Popover open={entrypointPopoverOpen} onOpenChange={setEntrypointPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className={cn(
              'justify-between',
              !entrypointId && 'text-muted-foreground'
            )}
          >
            {entrypointId
              ? selectedEntrypoint
                ? `${selectedEntrypoint.entrypoint_name} [${selectedEntrypoint.entrypoint_slug}]`
                : '选择一个入口点'
              : '选择入口点'}
            <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='p-0' align='start'>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder='搜索入口点...'
              value={entrypointKeyword}
              onValueChange={setEntrypointKeyword}
            />
            <CommandList>
              {!entrypointsLoading && (!entrypointsData?.entrypoints || entrypointsData.entrypoints.length === 0) && (
                <CommandEmpty>未找到入口点</CommandEmpty>
              )}
              {entrypointsLoading && (
                <CommandEmpty>加载中...</CommandEmpty>
              )}
              {entrypointsData?.entrypoints && entrypointsData.entrypoints.length > 0 && (
                <CommandGroup key={entrypointsData?.entrypoints.length.toString()}>
                  {entrypointsData.entrypoints.map((entrypoint) => (
                    <CommandItem
                      key={entrypoint.entrypoint_id.toString()}
                      value={`${entrypoint.entrypoint_id}`}
                      onSelect={() => {
                        setEntrypointId(entrypoint.entrypoint_id)
                        setEntrypointPopoverOpen(false)
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          'mr-2 h-4 w-4',
                          entrypointId === entrypoint.entrypoint_id
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="flex font-semibold">{entrypoint.entrypoint_name}</span>
                        <span className="flex text-muted-foreground text-xs">
                          [{entrypoint.entrypoint_slug}]
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

      {/* 重置按钮 - 清空所有搜索条件 */}
      <Button onClick={handleSearch}>
        <SearchIcon />
        搜索
      </Button>

      {/* 重置按钮 - 清空所有搜索条件 */}
      <Button variant='outline' onClick={handleReset}>
        <XIcon/>
        重置
      </Button>
    </div>
  )
}