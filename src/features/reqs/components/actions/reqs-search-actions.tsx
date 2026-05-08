// 引入依赖
import { useEffect, useState } from 'react'
// 路由
import { getRouteApi } from '@tanstack/react-router'
// 图标
import {
  SearchIcon,
  XIcon,
  ChevronDownIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  Trash2,
  Download,
  Filter,
} from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 样式
import { cn } from '@/lib/utils.ts'
// 确认对话框
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
// 按钮组控件
import { ButtonGroup } from '@/components/ui/button-group.tsx'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
import { Calendar } from '@/components/ui/calendar.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
// 对话框控件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.tsx'
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
} from '@/components/ui/input-group.tsx'
// Popover 和 Command 控件
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
// 入口点数据查询
import { useEntrypointsQuery } from '@/features/entrypoints/api/entrypoints.ts'
import {
  type EntrypointsData,
  emptyEntrypointsData,
} from '@/features/entrypoints/data/schemas.ts'
// 任务数据查询
import { useJobsQuery } from '@/features/jobs/api/jobs.ts'
import { useTaskDaysQuery } from '@/features/jobs/api/jobs.ts'
// 网站数据查询
import { useWebsitesQuery } from '@/features/websites/api/websites.ts'
import {
  type WebsitesData,
  emptyWebsitesData,
} from '@/features/websites/data/schemas.ts'
// 请求API调用
import {
  useExportReqsByTaskMutation,
  useCleartaskReqsMutation,
} from '../../api/reqs.ts'
// 日期选择器控件
// import { DatePicker } from '@/components/date-picker'
// 结果类型标签
import { reqResultTypeLabels } from '../../data/labels.tsx'
// 获取请求数据
import { useReqs } from '../reqs-provider.tsx'

// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/reqs/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_REQ_PAGE_SIZE || 50
)
const JOB_SEARCH_SIZE: number = Number(
  import.meta.env.VITE_TASK_SEARCH_SIZE || 50
)
const WEBSITE_SEARCH_SIZE: number = Number(
  import.meta.env.VITE_WEBSITE_SEARCH_SIZE || 50
)
const ENTRYPOINT_SEARCH_SIZE: number = Number(
  import.meta.env.VITE_ENTRYPOINT_SEARCH_SIZE || 50
)
const MOBILE_BREAKPOINT = 1600 // 自定义断点为 1600px

/**
 * 自定义 hook：检测屏幕宽度是否小于 1600px
 */
function useMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener('change', onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return !!isMobile
}

/**
 * 搜索表单内容组件
 * 提取搜索表单的通用内容，用于桌面端和移动端复用
 */
function SearchFormContent({
  dayDate,
  setDayDate,
  // datePickerOpen,
  // setDatePickerOpen,
  // taskDays,
  open,
  setOpen,
  availableDatesSet,
  websiteId,
  setWebsiteId,
  websitePopoverOpen,
  setWebsitePopoverOpen,
  websiteKeyword,
  setWebsiteKeyword,
  selectedWebsite,
  websitesData,
  websitesLoading,
  entrypointId,
  setEntrypointId,
  entrypointPopoverOpen,
  setEntrypointPopoverOpen,
  entrypointKeyword,
  setEntrypointKeyword,
  selectedEntrypoint,
  entrypointsData,
  entrypointsLoading,
  taskId,
  setTaskId,
  jobPopoverOpen,
  setJobPopoverOpen,
  jobKeyword,
  setJobKeyword,
  selectedJob,
  filteredJobs,
  jobsLoading,
  resultTypeValue,
  setResultTypeValue,
  currentResultTypeLabel,
  resultCategoryValue,
  setResultCategoryValue,
  resultCategoryOptions,
  selectedResultCategory,
  handleSearch,
  handleReset,
  setExportDialogOpen,
  setClearDialogOpen,
  isVertical = false,
}: {
  dayDate: Date | undefined
  setDayDate: (date: Date | undefined) => void
  // datePickerOpen: boolean
  // setDatePickerOpen: (open: boolean) => void
  // taskDays: string[] | undefined
  open: boolean
  setOpen: (open: boolean) => void
  availableDatesSet: Set<string> | null
  websiteId: number | undefined
  setWebsiteId: (id: number | undefined) => void
  websitePopoverOpen: boolean
  setWebsitePopoverOpen: (open: boolean) => void
  websiteKeyword: string
  setWebsiteKeyword: (keyword: string) => void
  selectedWebsite: any
  websitesData: WebsitesData
  websitesLoading: boolean
  entrypointId: number | undefined
  setEntrypointId: (id: number | undefined) => void
  entrypointPopoverOpen: boolean
  setEntrypointPopoverOpen: (open: boolean) => void
  entrypointKeyword: string
  setEntrypointKeyword: (keyword: string) => void
  selectedEntrypoint: any
  entrypointsData: EntrypointsData
  entrypointsLoading: boolean
  taskId: number | undefined
  setTaskId: (id: number | undefined) => void
  jobPopoverOpen: boolean
  setJobPopoverOpen: (open: boolean) => void
  jobKeyword: string
  setJobKeyword: (keyword: string) => void
  selectedJob: any
  filteredJobs: any[]
  jobsLoading: boolean
  resultTypeValue: string | undefined
  setResultTypeValue: (value: string | undefined) => void
  currentResultTypeLabel: string
  resultCategoryValue: string | undefined
  setResultCategoryValue: (value: string | undefined) => void
  resultCategoryOptions: any[]
  selectedResultCategory: any
  handleSearch: () => void
  handleReset: () => void
  setExportDialogOpen: (open: boolean) => void
  setClearDialogOpen: (open: boolean) => void
  isVertical?: boolean
}) {
  const containerClass = isVertical ? 'flex flex-col gap-4 w-full' : ''
  // const buttonGroupClass = isVertical ? 'w-full' : ''
  // const inputGroupClass = isVertical ? 'w-full' : ''

  return (
    <>
      <ButtonGroup className={containerClass}>
        <InputGroup className={cn('h-auto! [--radius:1rem]', containerClass)}>
          <InputGroupAddon align='inline-start'>
            <InputGroupButton size='icon-xs' onClick={handleReset}>
              <XIcon />
              {isVertical ? <span>重置</span> : ''}
            </InputGroupButton>
          </InputGroupAddon>

          {/*/!* 日期选择器 *!/*/}
          {/*<InputGroupAddon align="inline-start">*/}
          {/*  <DatePicker*/}
          {/*    selected={dayDate}*/}
          {/*    onSelect={(date) => {*/}
          {/*      setDayDate(date)*/}
          {/*      setDatePickerOpen(false)*/}
          {/*    }}*/}
          {/*    placeholder='选择日期'*/}
          {/*    availableDates={taskDays}*/}
          {/*    open={datePickerOpen}*/}
          {/*    onOpenChange={setDatePickerOpen}*/}
          {/*  />*/}
          {/*</InputGroupAddon>*/}

          <InputGroupAddon align='inline-start'>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  id='date-picker'
                  className='h-6 justify-between font-normal'
                >
                  {dayDate ? dayDate.toLocaleDateString() : '日期'}
                  <ChevronsUpDownIcon className='size-3 shrink-0' />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className='w-auto overflow-hidden p-0'
                align={isVertical ? 'center' : 'start'}
              >
                <Calendar
                  mode='single'
                  captionLayout='dropdown'
                  selected={dayDate}
                  onSelect={(date) => {
                    setDayDate(date)
                    setOpen(false)
                  }}
                  disabled={(date: Date) => {
                    if (availableDatesSet && availableDatesSet.size > 0) {
                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      const day = String(date.getDate()).padStart(2, '0')
                      const dateString = `${year}${month}${day}`
                      return !availableDatesSet.has(dateString)
                    }
                    return date > new Date() || date < new Date('1900-01-01')
                  }}
                />
              </PopoverContent>
            </Popover>
          </InputGroupAddon>

          {/* 网站选择 ComboBox */}
          <InputGroupAddon align='inline-start'>
            <Popover
              open={websitePopoverOpen}
              onOpenChange={setWebsitePopoverOpen}
            >
              <PopoverTrigger asChild>
                <InputGroupButton
                  variant='ghost'
                  role='combobox'
                  className={cn(
                    'justify-between',
                    !websiteId && 'text-muted-foreground'
                  )}
                >
                  {websiteId
                    ? selectedWebsite
                      ? `${selectedWebsite.website_name}`
                      : '选择一个网站'
                    : '选择网站'}
                  <ChevronsUpDownIcon className='size-3 shrink-0' />
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

          {/* 入口点选择 ComboBox */}
          <InputGroupAddon align='inline-start'>
            <Popover
              open={entrypointPopoverOpen}
              onOpenChange={setEntrypointPopoverOpen}
            >
              <PopoverTrigger asChild>
                <InputGroupButton
                  variant='ghost'
                  role='combobox'
                  className={cn(
                    'justify-between',
                    !entrypointId && 'text-muted-foreground'
                  )}
                >
                  {entrypointId
                    ? selectedEntrypoint
                      ? `${selectedEntrypoint.entrypoint_name}`
                      : '选择一个入口点'
                    : '选择入口点'}
                  <ChevronsUpDownIcon className='size-3 shrink-0' />
                </InputGroupButton>
              </PopoverTrigger>
              <PopoverContent className='p-0' align='start'>
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder='搜索入口点...'
                    value={entrypointKeyword}
                    onValueChange={setEntrypointKeyword}
                  />
                  <CommandList>
                    {!entrypointsLoading &&
                      (!entrypointsData?.entrypoints ||
                        entrypointsData.entrypoints.length === 0) && (
                        <CommandEmpty>未找到入口点</CommandEmpty>
                      )}
                    {entrypointsLoading && (
                      <CommandEmpty>加载中...</CommandEmpty>
                    )}
                    {entrypointsData?.entrypoints &&
                      entrypointsData.entrypoints.length > 0 && (
                        <CommandGroup
                          key={entrypointsData?.entrypoints.length.toString()}
                        >
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
                              <div className='flex flex-col'>
                                <span className='flex font-semibold'>
                                  {entrypoint.entrypoint_name}
                                </span>
                                <span className='flex text-xs text-muted-foreground'>
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
          </InputGroupAddon>

          {/* 任务选择 ComboBox */}
          <InputGroupAddon align='inline-start'>
            <Popover open={jobPopoverOpen} onOpenChange={setJobPopoverOpen}>
              <PopoverTrigger asChild>
                <InputGroupButton
                  variant='ghost'
                  role='combobox'
                  className={cn(
                    'justify-between',
                    !taskId && 'text-muted-foreground'
                  )}
                >
                  {taskId
                    ? selectedJob
                      ? `${selectedJob.task_id} - ${selectedJob.entrypoint?.entrypoint_name || '无标题'}`
                      : '必须选择任务'
                    : '必选任务'}
                  <ChevronsUpDownIcon className='size-3 shrink-0' />
                </InputGroupButton>
              </PopoverTrigger>
              <PopoverContent className='p-0' align='start'>
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder='搜索任务...'
                    value={jobKeyword}
                    onValueChange={setJobKeyword}
                  />
                  <CommandList>
                    {!jobsLoading &&
                      (!filteredJobs || filteredJobs.length === 0) && (
                        <CommandEmpty>未找到任务</CommandEmpty>
                      )}
                    {jobsLoading && <CommandEmpty>加载中...</CommandEmpty>}
                    {filteredJobs && filteredJobs.length > 0 && (
                      <CommandGroup key={filteredJobs.length.toString()}>
                        {filteredJobs.map((job) => (
                          <CommandItem
                            key={job.task_id?.toString() ?? 'no-id'}
                            value={`${job.task_id}`}
                            onSelect={() => {
                              setTaskId(job.task_id || undefined)
                              setJobPopoverOpen(false)
                            }}
                          >
                            <CheckIcon
                              className={cn(
                                'mr-2 h-4 w-4',
                                taskId === job.task_id
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                            <div className='flex flex-col'>
                              <span className='flex font-semibold'>
                                {job.task_id} -{' '}
                                {job.entrypoint?.entrypoint_name || '无标题'}
                              </span>
                              <span className='flex text-xs text-muted-foreground'>
                                {job.entrypoint?.website?.website_name || '-'}
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

          {/* 请求结果类型选择下拉框 */}
          <InputGroupAddon align='inline-start'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton
                  variant='ghost'
                  className={cn(
                    'justify-between',
                    !resultTypeValue && 'text-muted-foreground'
                  )}
                >
                  {currentResultTypeLabel}
                  <ChevronDownIcon className='size-3 shrink-0' />
                </InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                <DropdownMenuItem
                  onClick={() => {
                    setResultTypeValue(undefined)
                    setResultCategoryValue(undefined)
                  }}
                  className={cn(!resultTypeValue && 'bg-accent')}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      !resultTypeValue ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  所有结果类型
                </DropdownMenuItem>
                {reqResultTypeLabels.map((item) => (
                  <DropdownMenuItem
                    key={item.value}
                    onClick={() => {
                      setResultTypeValue(item.value)
                      setResultCategoryValue(undefined)
                    }}
                    className={cn(
                      resultTypeValue === item.value && 'bg-accent'
                    )}
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        resultTypeValue === item.value
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                    <item.icon className='mr-2 h-4 w-4' />
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>

          {/* 结果分类下拉框 */}
          <InputGroupAddon align='inline-start'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton
                  variant='ghost'
                  className={cn(
                    'justify-between',
                    !resultCategoryValue && 'text-muted-foreground'
                  )}
                  disabled={!resultTypeValue}
                >
                  {resultCategoryValue && selectedResultCategory
                    ? selectedResultCategory.name
                    : resultTypeValue === 'failed'
                      ? '选择异常原因'
                      : resultTypeValue === 'discarded'
                        ? '选择丢弃原因'
                        : resultTypeValue === 'succeed'
                          ? '选择页面类型'
                          : '请先选择结果类型'}
                  <ChevronDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start'>
                {resultCategoryOptions.length === 0 && (
                  <div className='px-2 py-1.5 text-sm text-muted-foreground'>
                    {!resultTypeValue ? '请先选择结果类型' : '暂无选项'}
                  </div>
                )}
                {resultCategoryOptions.length > 0 && (
                  <DropdownMenuItem
                    onClick={() => {
                      setResultCategoryValue(undefined)
                    }}
                    className={cn(!resultCategoryValue && 'bg-accent')}
                  >
                    <CheckIcon
                      className={cn(
                        'mr-2 h-4 w-4',
                        !resultCategoryValue ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className='flex flex-col'>
                      <span className='flex font-semibold'>所有未入库原因</span>
                      <span className='flex text-xs text-muted-foreground'>
                        -
                      </span>
                    </div>
                  </DropdownMenuItem>
                )}
                {resultCategoryOptions.length > 0 &&
                  resultCategoryOptions.map((item: any) => (
                    <DropdownMenuItem
                      key={item.code}
                      onClick={() => {
                        setResultCategoryValue(item.code)
                      }}
                      className={cn(
                        resultCategoryValue === item.code && 'bg-accent'
                      )}
                    >
                      <CheckIcon
                        className={cn(
                          'mr-2 h-4 w-4',
                          resultCategoryValue === item.code
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      <div className='flex flex-col'>
                        <span className='flex font-semibold'>{item.name}</span>
                        <span className='flex text-xs text-muted-foreground'>
                          [{item.code}]
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
        </InputGroup>

        {/* 搜索按钮 */}
        <Button
          onClick={handleSearch}
          disabled={!dayDate || !taskId}
          className={isVertical ? 'w-full' : ''}
        >
          <SearchIcon />
          搜索
        </Button>

        {/* 导出按钮 */}
        <Button
          onClick={() => setExportDialogOpen(true)}
          disabled={!dayDate || !taskId}
          className='bg-lime-600 text-white hover:bg-lime-700/80 dark:bg-lime-700'
        >
          <Download size={18} />
          导出
        </Button>

        {/* 清空按钮 */}
        <Button
          variant='destructive'
          onClick={() => setClearDialogOpen(true)}
          disabled={!dayDate || !taskId}
          className={isVertical ? 'w-full' : ''}
        >
          <Trash2 size={18} />
          清空
        </Button>
      </ButtonGroup>
    </>
  )
}

type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '' }: SearchProps) {
  const { searchParams, setSearchParams, setCurrentJob } = useReqs()
  const navigate = route.useNavigate()

  // 移动端检测
  const isMobile = useMobile()
  // 对话框打开状态
  const [searchDialogOpen, setSearchDialogOpen] = useState(false)

  // 初始化网站请求结果导出/清空mutation
  const exportReqsByTaskMutation = useExportReqsByTaskMutation()
  const clearWebsiteMutation = useCleartaskReqsMutation()

  // 确认对话框状态
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  // 本地状态: 日期（Date对象）
  const [dayDate, setDayDate] = useState<Date | undefined>(undefined)
  // 本地状态：控制日期选择器的打开状态
  // const [datePickerOpen, setDatePickerOpen] = useState(false)

  // 本地状态：任务搜索关键词
  const [jobKeyword, setJobKeyword] = useState<string>('')
  // 本地状态：控制任务下拉框的打开状态
  const [jobPopoverOpen, setJobPopoverOpen] = useState(false)
  // 本地状态：任务选择框的ID
  const [taskId, setTaskId] = useState<number | undefined>(undefined)

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
  const [entrypointId, setEntrypointId] = useState<number | undefined>(
    undefined
  )

  // 本地状态：结果分类选择
  const [resultCategoryValue, setResultCategoryValue] = useState<
    string | undefined
  >(undefined)

  // 本地状态：请求结果类型选择
  const [resultTypeValue, setResultTypeValue] = useState<string | undefined>(
    undefined
  )

  // 获取任务列表数据（支持搜索）
  // 将 Date 对象转换为 YYYYMMDD 格式作为 day 参数
  const dayValue = dayDate
    ? `${dayDate.getFullYear()}${String(dayDate.getMonth() + 1).padStart(2, '0')}${String(dayDate.getDate()).padStart(2, '0')}`
    : undefined

  const { data: jobsData, isLoading: jobsLoading } = useJobsQuery(
    dayValue, // day (YYYYMMDD 格式)
    websiteId, // website_id 来自已选择的网站
    entrypointId, // entrypoint_id 来自已选择的入口点
    undefined, // status
    1, // page
    JOB_SEARCH_SIZE
  )

  // 获取网站列表数据（支持搜索）
  const { data: websitesData, isLoading: websitesLoading } = useWebsitesQuery(
    websiteKeyword,
    undefined,
    1,
    WEBSITE_SEARCH_SIZE
  )

  // 获取入口点列表数据（支持搜索），website_id 来自已选择的网站
  const { data: entrypointsData, isLoading: entrypointsLoading } =
    useEntrypointsQuery(
      websiteId,
      entrypointKeyword,
      undefined,
      1,
      ENTRYPOINT_SEARCH_SIZE
    )

  // 获取任务日期列表
  const { data: taskDays } = useTaskDaysQuery()

  // 获取当前选中的任务
  const selectedJob = jobsData?.jobs?.find((j) => j.task_id === taskId)

  // 当选中的任务发生变化时，更新 currentJob
  useEffect(() => {
    setCurrentJob(selectedJob || null)
  }, [selectedJob, setCurrentJob])

  // 获取当前选中的网站
  const selectedWebsite = websitesData?.websites?.find(
    (w) => w.website_id === websiteId
  )

  // 获取当前选中的入口点
  const selectedEntrypoint = entrypointsData?.entrypoints?.find(
    (e) => e.entrypoint_id === entrypointId
  )

  // 根据结果类型获取结果分类选项
  const getResultCategoryOptions = () => {
    const websiteConfig = selectedWebsite?.website_config as any
    if (!websiteConfig) return []

    if (resultTypeValue === 'failed') {
      return websiteConfig.exceptions || []
    } else if (resultTypeValue === 'discarded') {
      return websiteConfig.discards || []
    } else if (resultTypeValue === 'succeed') {
      return websiteConfig.pages || []
    }
    return []
  }

  const resultCategoryOptions = getResultCategoryOptions()

  // 获取当前选中的结果分类
  const selectedResultCategory = resultCategoryOptions.find(
    (item: any) => item.code === resultCategoryValue
  )

  /**
   * 处理导出选中网站的请求结果操作
   */
  const onExportReqsByTask = async () => {
    if (!taskId) return
    setExportDialogOpen(false)

    await exportReqsByTaskMutation
      .mutateAsync(taskId)
      .then(() => {
        toast.success(
          `任务 [${selectedJob?.task_id}] ${selectedJob?.entrypoint?.entrypoint_name} 的请求结果导出成功`
        )
      })
      .catch((error) => {
        console.error('任务请求结果导出失败:', error)
        toast.error('任务请求结果导出失败')
      })
  }

  /**
   * 处理清空选中网站的请求结果操作
   */
  const onClearReqsByTask = async () => {
    if (!taskId) return
    setClearDialogOpen(false)

    await clearWebsiteMutation
      .mutateAsync(taskId)
      .then(() => {
        toast.success(
          `任务 [${selectedJob?.task_id}] ${selectedJob?.entrypoint?.entrypoint_name} 的请求结果清空成功`
        )
      })
      .catch((error) => {
        console.error('任务请求结果清空失败:', error)
        toast.error('任务请求结果清空失败')
      })
  }

  // 初始化搜索参数：从 URL 参数中恢复之前的选择状态
  // 包括任务 ID、网站 ID、入口点 ID、日期、结果类型和结果分类
  useEffect(() => {
    // 设置任务 ID，如果 URL 中存在的话
    setTaskId(searchParams?.task_id)

    // 设置网站 ID，如果 URL 中存在的话
    setWebsiteId(searchParams?.website_id)

    // 设置入口点 ID，如果 URL 中存在的话
    setEntrypointId(searchParams?.entrypoint_id)

    // 设置结果分类，如果 URL 中存在的话
    setResultCategoryValue(searchParams?.result_category)

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
  }, [
    searchParams.task_id,
    searchParams.website_id,
    searchParams.entrypoint_id,
    searchParams.day,
    searchParams.result_category,
    taskDays,
  ])

  // 初始化状态参数：从 URL 参数中恢复请求结果类型选择
  useEffect(() => {
    // 从 URL 参数获取结果类型值，如果不存在则设为 undefined
    const value = searchParams?.result_type ?? undefined
    setResultTypeValue(value)
  }, [searchParams.result_type])

  useEffect(() => {
    const value = searchParams?.result_category ?? ''
    setResultCategoryValue(value)
  }, [searchParams.result_category])

  /**
   * 更新URL搜索参数的辅助函数
   *
   * 此函数负责将搜索条件同步到URL中，使得页面刷新后仍能保持当前的筛选状态
   * 同时优化了URL参数的显示，移除了不必要的默认值，保持URL的简洁性
   *
   * @param params - 需要更新的搜索参数对象
   * @param params.day - 日期参数，格式为 YYYYMMDD
   * @param params.task_id - 任务ID，关联到特定任务的过滤条件
   * @param params.website_id - 网站ID，关联到特定网站的过滤条件
   * @param params.entrypoint_id - 入口点ID，关联到特定入口点的过滤条件
   * @param params.result_type - 请求结果类型，如 "succeed", "failed", "discarded" 等
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
    task_id?: number
    website_id?: number
    entrypoint_id?: number
    result_type?: string
    result_category?: string
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        // 创建新的参数对象，合并之前的参数和新参数
        const newParams = {
          ...(prev as Record<string, unknown>), // 保留之前的参数，防止意外覆盖其他搜索条件
          day: params.day, // 日期参数直接赋值
          task_id: params.task_id || undefined, // 如果任务ID为空则设为undefined，这样会在后续清理中被移除
          website_id: params.website_id || undefined, // 如果网站ID为空则设为undefined
          entrypoint_id: params.entrypoint_id || undefined, // 如果入口点ID为空则设为undefined
          result_type: params.result_type as
            | 'succeed'
            | 'failed'
            | 'discarded'
            | undefined, // 结果类型参数直接使用，限定类型为允许的结果类型值
          result_category: params.result_category || undefined,
          page: params.page && params.page > 1 ? params.page : undefined, // 只有页码大于1时才保留，保持URL简洁性
          size:
            params.size && params.size !== DEFAULT_PAGE_SIZE
              ? params.size
              : undefined, // 只有数量非默认值 DEFAULT_PAGE_SIZE 时才保留，符合常见分页行为
        }

        // 清理 undefined 值，避免在URL中出现 undefined 字符串
        // 这样可以保持URL的简洁性，例如不会出现 ?page=undefined 的情况
        // 同时也避免将空值参数传递给服务器，减少不必要的参数传输
        Object.keys(newParams).forEach((key) => {
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
   * 将当前关键词和结果类型值提交到搜索参数中
   * 如果关键词为空，则不传递该参数
   */
  const handleSearch = () => {
    // 将 Date 对象转换为 YYYYMMDD 格式
    const dayValue = dayDate
      ? `${dayDate.getFullYear()}${String(dayDate.getMonth() + 1).padStart(2, '0')}${String(dayDate.getDate()).padStart(2, '0')}`
      : undefined

    // 更新搜索参数，触发 API 重新请求
    setSearchParams({
      day: dayValue,
      task_id: taskId || undefined,
      website_id: websiteId || undefined,
      entrypoint_id: entrypointId || undefined,
      result_type: resultTypeValue,
      result_category: resultCategoryValue,
      page: 1,
      size: searchParams.size,
    })
    // 更新 URL 参数
    updateUrlParams({
      day: dayValue,
      task_id: taskId || undefined,
      website_id: websiteId || undefined,
      entrypoint_id: entrypointId || undefined,
      result_type: resultTypeValue,
      result_category: resultCategoryValue,
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
    setResultTypeValue(undefined)
    setResultCategoryValue(undefined)
    setTaskId(undefined)
    setWebsiteId(undefined)
    setEntrypointId(undefined)
    setDayDate(undefined)

    // 重置搜索参数
    const resetParams = {
      day: undefined,
      task_id: undefined,
      website_id: undefined,
      entrypoint_id: undefined,
      result_type: undefined,
      result_category: undefined,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(resetParams)
    updateUrlParams(resetParams)
  }

  // 获取当前选中的结果类型标签
  const currentResultTypeLabel =
    (resultTypeValue
      ? reqResultTypeLabels.find((label) => label.value === resultTypeValue)
          ?.label
      : '所有结果类型') || '所有结果类型'

  // 过滤任务列表，根据关键词搜索
  const filteredJobs =
    jobsData?.jobs?.filter(
      (job) =>
        job.entrypoint?.entrypoint_name
          ?.toLowerCase()
          .includes(jobKeyword.toLowerCase()) || false
    ) || []

  const [open, setOpen] = useState(false)
  const availableDatesSet = taskDays ? new Set(taskDays) : null

  return (
    <>
      {/* 桌面端视图（宽度 >= 1600） */}
      {!isMobile && (
        <div className={cn('flex w-full flex-wrap gap-4', className)}>
          <SearchFormContent
            dayDate={dayDate}
            setDayDate={setDayDate}
            // datePickerOpen={datePickerOpen}
            // setDatePickerOpen={setDatePickerOpen}
            // taskDays={taskDays}
            open={open}
            setOpen={setOpen}
            availableDatesSet={availableDatesSet}
            websiteId={websiteId}
            setWebsiteId={setWebsiteId}
            websitePopoverOpen={websitePopoverOpen}
            setWebsitePopoverOpen={setWebsitePopoverOpen}
            websiteKeyword={websiteKeyword}
            setWebsiteKeyword={setWebsiteKeyword}
            selectedWebsite={selectedWebsite}
            websitesData={websitesData || emptyWebsitesData}
            websitesLoading={websitesLoading}
            entrypointId={entrypointId}
            setEntrypointId={setEntrypointId}
            entrypointPopoverOpen={entrypointPopoverOpen}
            setEntrypointPopoverOpen={setEntrypointPopoverOpen}
            entrypointKeyword={entrypointKeyword}
            setEntrypointKeyword={setEntrypointKeyword}
            selectedEntrypoint={selectedEntrypoint}
            entrypointsData={entrypointsData || emptyEntrypointsData}
            entrypointsLoading={entrypointsLoading}
            taskId={taskId}
            setTaskId={setTaskId}
            jobPopoverOpen={jobPopoverOpen}
            setJobPopoverOpen={setJobPopoverOpen}
            jobKeyword={jobKeyword}
            setJobKeyword={setJobKeyword}
            selectedJob={selectedJob}
            filteredJobs={filteredJobs}
            jobsLoading={jobsLoading}
            resultTypeValue={resultTypeValue}
            setResultTypeValue={setResultTypeValue}
            currentResultTypeLabel={currentResultTypeLabel}
            resultCategoryValue={resultCategoryValue}
            setResultCategoryValue={setResultCategoryValue}
            resultCategoryOptions={resultCategoryOptions}
            selectedResultCategory={selectedResultCategory}
            handleSearch={handleSearch}
            handleReset={handleReset}
            setExportDialogOpen={setExportDialogOpen}
            setClearDialogOpen={setClearDialogOpen}
            isVertical={false}
          />
        </div>
      )}

      {/* 移动端视图（宽度 < 1600） */}
      {isMobile && (
        <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
          <DialogTrigger asChild>
            <Button variant='outline' className={className}>
              <Filter className='mr-2 h-4 w-4' />
              搜索
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>搜索请求</DialogTitle>
              <DialogDescription>选择筛选条件来搜索请求</DialogDescription>
            </DialogHeader>
            <div className='py-4'>
              <SearchFormContent
                dayDate={dayDate}
                setDayDate={setDayDate}
                // datePickerOpen={datePickerOpen}
                // setDatePickerOpen={setDatePickerOpen}
                // taskDays={taskDays}
                open={open}
                setOpen={setOpen}
                availableDatesSet={availableDatesSet}
                websiteId={websiteId}
                setWebsiteId={setWebsiteId}
                websitePopoverOpen={websitePopoverOpen}
                setWebsitePopoverOpen={setWebsitePopoverOpen}
                websiteKeyword={websiteKeyword}
                setWebsiteKeyword={setWebsiteKeyword}
                selectedWebsite={selectedWebsite}
                websitesData={websitesData || emptyWebsitesData}
                websitesLoading={websitesLoading}
                entrypointId={entrypointId}
                setEntrypointId={setEntrypointId}
                entrypointPopoverOpen={entrypointPopoverOpen}
                setEntrypointPopoverOpen={setEntrypointPopoverOpen}
                entrypointKeyword={entrypointKeyword}
                setEntrypointKeyword={setEntrypointKeyword}
                selectedEntrypoint={selectedEntrypoint}
                entrypointsData={entrypointsData || emptyEntrypointsData}
                entrypointsLoading={entrypointsLoading}
                taskId={taskId}
                setTaskId={setTaskId}
                jobPopoverOpen={jobPopoverOpen}
                setJobPopoverOpen={setJobPopoverOpen}
                jobKeyword={jobKeyword}
                setJobKeyword={setJobKeyword}
                selectedJob={selectedJob}
                filteredJobs={filteredJobs}
                jobsLoading={jobsLoading}
                resultTypeValue={resultTypeValue}
                setResultTypeValue={setResultTypeValue}
                currentResultTypeLabel={currentResultTypeLabel}
                resultCategoryValue={resultCategoryValue}
                setResultCategoryValue={setResultCategoryValue}
                resultCategoryOptions={resultCategoryOptions}
                selectedResultCategory={selectedResultCategory}
                handleSearch={() => {
                  handleSearch()
                  setSearchDialogOpen(false)
                }}
                handleReset={handleReset}
                setExportDialogOpen={(open) => {
                  setExportDialogOpen(open)
                  setSearchDialogOpen(false)
                }}
                setClearDialogOpen={(open) => {
                  setClearDialogOpen(open)
                  setSearchDialogOpen(false)
                }}
                isVertical={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 导出确认对话框 */}
      <AlertDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              确认导出 {selectedJob?.task_name} 请求结果？
            </AlertDialogTitle>
            <AlertDialogDescription>
              此操作将导出任务 [
              {dayDate
                ? `${dayDate.getFullYear()}${String(dayDate.getMonth() + 1).padStart(2, '0')}${String(dayDate.getDate()).padStart(2, '0')}`
                : ''}
              -{selectedJob?.task_id}]{' '}
              {selectedJob?.entrypoint?.entrypoint_name} 的所有请求结果。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={onExportReqsByTask}>
              确认导出
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 清空确认对话框 */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              确认清空任务 {selectedJob?.task_name} 请求结果？
            </AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除任务 [
              {dayDate
                ? `${dayDate.getFullYear()}${String(dayDate.getMonth() + 1).padStart(2, '0')}${String(dayDate.getDate()).padStart(2, '0')}`
                : ''}
              -{selectedJob?.task_id}]{' '}
              {selectedJob?.entrypoint?.entrypoint_name}{' '}
              的所有请求结果，此操作不可撤销。请谨慎操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={onClearReqsByTask}
              className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
            >
              确认清空
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
