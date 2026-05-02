// 引入依赖
import { useEffect, useState } from 'react'
// 路由
import { getRouteApi } from '@tanstack/react-router'
// 图标
import {
  SearchIcon,
  XIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  Trash2,
  RotateCcw,
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
} from '@/components/ui/input-group.tsx'
// Popover 和 Command 控件
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
// 网站数据查询
import { useWebsitesQuery } from '@/features/websites/api/websites.ts'
// 准任务API调用
import {
  useResetWebsitePreTasksMutation,
  useClearWebsitePreTasksMutation,
} from '../../api/pre-tasks.ts'
// 获取准任务数据
import { usePreTasks } from '../pre-tasks-provider.tsx'

// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/pre-tasks/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_TASK_PAGE_SIZE || 50
)
const WEBSITE_SEARCH_SIZE: number = Number(
  import.meta.env.VITE_WEBSITE_SEARCH_SIZE || 50
)

/**
 * 准任务搜索组件
 * 提供网站筛选功能
 *
 * 组件功能：
 * 1. 支持根据网站筛选准任务
 * 2. 提供重置功能
 * 3. 支持对所选网站进行清空和重置操作
 *
 * 使用说明：
 * - 组件会自动调用 usePreTasks 的 setSearchParams 方法更新搜索参数
 * - 搜索参数包括：website_id（网站ID）
 */
type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '' }: SearchProps) {
  const { searchParams, setSearchParams } = usePreTasks()
  const navigate = route.useNavigate()

  // 初始化准任务重置/清空mutation
  const resetWebsiteMutation = useResetWebsitePreTasksMutation()
  const clearWebsiteMutation = useClearWebsitePreTasksMutation()

  // 确认对话框状态
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)

  // 本地状态：网站搜索关键词
  const [websiteKeyword, setWebsiteKeyword] = useState<string>('')
  // 本地状态：控制网站下拉框的打开状态
  const [websitePopoverOpen, setWebsitePopoverOpen] = useState(false)
  // 本地状态：网站选择框的ID
  const [websiteId, setWebsiteId] = useState<number | undefined>(undefined)

  // 获取网站列表数据（支持搜索）
  const { data: websitesData, isLoading: websitesLoading } = useWebsitesQuery(
    websiteKeyword,
    undefined,
    1,
    WEBSITE_SEARCH_SIZE
  )

  // 获取当前选中的网站
  const selectedWebsite = websitesData?.websites?.find(
    (w) => w.website_id === websiteId
  )

  useEffect(() => {
    setWebsiteId(searchParams?.website_id)
  }, [searchParams.website_id])

  const updateUrlParams = (params: {
    website_id?: number
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        // 创建新的参数对象，合并之前的参数和新参数
        const newParams = {
          ...(prev as Record<string, unknown>), // 保留之前的参数
          website_id: params.website_id || undefined, // 如果网站ID为空则设为undefined
          page: params.page && params.page > 1 ? params.page : undefined, // 只有页码大于1时才保留
          size:
            params.size && params.size !== DEFAULT_PAGE_SIZE
              ? params.size
              : undefined, // 只有数量非 DEFAULT_PAGE_SIZE 时才保留
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
   * 将当前网站ID提交到搜索参数中
   */
  const handleSearch = () => {
    // 更新搜索参数，触发 API 重新请求
    setSearchParams({
      website_id: websiteId || undefined,
      page: 1,
      size: searchParams.size,
    })
    // 更新 URL 参数
    updateUrlParams({
      website_id: websiteId || undefined,
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
    setWebsiteId(undefined)

    // 重置搜索参数
    const resetParams = {
      website_id: undefined,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(resetParams)
    updateUrlParams(resetParams)
  }

  /**
   * 处理重置选中网站的准任务操作
   */
  const onResetWebsite = async () => {
    if (!websiteId) return
    setResetDialogOpen(false)

    await resetWebsiteMutation
      .mutateAsync(websiteId)
      .then(() => {
        toast.success(`网站 ${selectedWebsite?.website_name} 的准任务重置成功`)
      })
      .catch((error) => {
        console.error('网站准任务重置失败:', error)
        toast.error('网站准任务重置失败')
      })
  }

  /**
   * 处理清空选中网站的准任务操作
   */
  const onClearWebsite = async () => {
    if (!websiteId) return
    setClearDialogOpen(false)

    await clearWebsiteMutation
      .mutateAsync(websiteId)
      .then(() => {
        toast.success(`网站 ${selectedWebsite?.website_name} 的准任务清空成功`)
      })
      .catch((error) => {
        console.error('网站准任务清空失败:', error)
        toast.error('网站准任务清空失败')
      })
  }

  return (
    <>
      <div className={cn('flex w-full max-w-2/3 gap-4', className)}>
        {/* 搜索输入框组合，包含关键词输入和状态筛选下拉菜单 */}
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
                    role='combobox'
                    className={cn(
                      'mr-2 justify-between text-sm',
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
                      {websitesLoading && (
                        <CommandEmpty>加载中...</CommandEmpty>
                      )}
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
          </InputGroup>
          {/* 搜索按钮 - 触发搜索操作 */}
          <Button onClick={handleSearch}>
            <SearchIcon />
            <span className='max-sm:hidden'>查找</span>
          </Button>
          {/* 重置选中网站的准任务按钮 */}
          <Button
            onClick={() => setResetDialogOpen(true)}
            disabled={!websiteId || resetWebsiteMutation.isPending}
            className='bg-orange-500 text-white hover:bg-orange-600/80 dark:bg-orange-600'
          >
            <RotateCcw size={18} />
            <span className='max-sm:hidden'>重置</span>
          </Button>
          {/* 清空选中网站的准任务按钮 */}
          <Button
            variant='destructive'
            onClick={() => setClearDialogOpen(true)}
            disabled={!websiteId || clearWebsiteMutation.isPending}
          >
            <Trash2 size={18} />
            <span className='max-sm:hidden'>清空</span>
          </Button>
        </ButtonGroup>
      </div>

      {/* 重置确认对话框 */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认重置网站准任务？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将重置网站 {selectedWebsite?.website_name}{' '}
              的所有准任务状态，但不会删除准任务数据。此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={onResetWebsite}>
              确认重置
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 清空确认对话框 */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认清空网站准任务？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将永久删除网站 {selectedWebsite?.website_name}{' '}
              的所有准任务数据，此操作不可撤销。请谨慎操作。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={onClearWebsite}
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
