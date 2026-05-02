// 引入依赖
import { useEffect, useState } from 'react'
// 路由
import { getRouteApi } from '@tanstack/react-router'
// 图标
import { SearchIcon, XIcon, ChevronsUpDownIcon } from 'lucide-react'
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
// 可用性标签
import { enableLabels } from '../../data/labels.tsx'
// 获取友链数据
import { useLinks } from '../links-provider.tsx'

// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/links/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_LINKS_PAGE_SIZE || 50
)

/**
 * 友链搜索组件
 * 提供友链名称/标识的关键词搜索和状态筛选功能
 *
 * 组件功能：
 * 1. 支持关键词搜索（友链名称/标识）
 * 2. 支持状态筛选（启用/禁用/全部）
 * 3. 提供重置功能
 *
 * 使用说明：
 * - 组件会自动调用 useLinks 的 setSearchParams 方法更新搜索参数
 * - 搜索参数包括：links_keyword（关键词）和 links_enabled（状态）
 */
type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '' }: SearchProps) {
  const { searchParams, setSearchParams } = useLinks()
  const navigate = route.useNavigate()

  // 本地状态：输入框的关键词
  const [keyword, setKeyword] = useState<string>('')
  // 本地状态：选中的可用性标签（显示在下拉按钮上）
  const [selectedLabel, setSelectedLabel] = useState<string>('状态')
  // 本地状态：实际的可用性值（用于API参数）
  const [enabledValue, setEnabledValue] = useState<boolean | undefined>(
    undefined
  )

  // 当URL中的links_keyword参数发生变化时，同步更新本地keyword状态
  // 这样可以确保当用户直接通过URL访问或前进/后退时，搜索框中的内容与URL参数保持一致
  useEffect(() => {
    setKeyword(searchParams?.links_keyword ?? '')
  }, [searchParams.links_keyword])

  // 当URL中的links_enabled参数发生变化时，同步更新本地enabledValue和selectedLabel状态
  // 同时根据当前的enabledValue值找到对应的标签文本进行显示
  useEffect(() => {
    const value = searchParams?.links_enabled ?? undefined
    setEnabledValue(value)

    // 根据当前值更新显示标签
    if (value === undefined) {
      setSelectedLabel('所有') // 如果值为undefined（即所有状态），显示"所有"
    } else {
      // 根据enableLabels数组中对应的标签进行显示
      const matchedLabel = enableLabels.find((label) => label.value === value)
      setSelectedLabel(matchedLabel ? matchedLabel.label : '状态')
    }
  }, [searchParams.links_enabled])

  /**
   * 更新 URL 参数
   * 该函数用于更新浏览器URL中的搜索参数，同时保留其他参数不变
   *
   * @param params - 需要更新的参数对象
   * @param params.links_keyword - 网站关键词搜索参数
   * @param params.links_enabled - 网站启用状态筛选参数
   * @param params.page - 分页页码参数
   * @param params.size - 每页数量参数
   *
   * 使用说明：
   * - links_keyword: 如果为空字符串则转换为undefined，不传递该参数
   * - page: 只有当页码大于1时才添加到URL中（首页不显示页码参数）
   * - size: 只有当每页数量不等于默认值 DEFAULT_PAGE_SIZE 时才添加到URL中
   */
  const updateUrlParams = (params: {
    links_keyword?: string
    links_enabled?: boolean
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        // 创建新的参数对象，合并之前的参数和新参数
        const newParams = {
          ...(prev as Record<string, unknown>), // 保留之前的参数
          links_keyword: params.links_keyword || undefined, // 如果关键词为空则设为undefined
          links_enabled: params.links_enabled, // 状态参数直接使用
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
   * 将当前关键词和状态值提交到搜索参数中
   * 如果关键词为空，则不传递该参数
   */
  const handleSearch = () => {
    // 更新本地状态和API参数
    setSearchParams({
      links_keyword: keyword || undefined,
      links_enabled: enabledValue,
      page: 1,
      size: searchParams.size,
    })

    // 更新 URL 参数
    updateUrlParams({
      links_keyword: keyword || undefined,
      links_enabled: enabledValue,
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

    // 重置搜索参数
    const resetParams = {
      links_keyword: undefined,
      links_enabled: undefined,
      page: 1,
      size: searchParams.size,
    }

    setSearchParams(resetParams)
    updateUrlParams(resetParams)
  }

  return (
    <div className={cn('xs:max-w-xs flex w-full max-w-sm gap-4', className)}>
      {/* 搜索输入框组合，包含关键词输入和状态筛选下拉菜单 */}
      <ButtonGroup>
        <InputGroup className='[--radius:1rem]'>
          {/* 重置按钮 - 清空所有搜索条件 */}
          <InputGroupAddon align='inline-start'>
            <InputGroupButton size='icon-xs' onClick={handleReset}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>

          {/* 状态筛选下拉菜单 - 用于筛选友链的启用状态 */}
          <InputGroupAddon align='inline-start'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* 下拉触发按钮 - 显示当前选中的状态标签 */}
                <InputGroupButton
                  variant='ghost'
                  className={cn(
                    '-ml-2 !pr-1.5 text-sm',
                    enableLabels.find((label) => {
                      return label.value === enabledValue
                    })?.className ?? ''
                  )}
                >
                  {selectedLabel} <ChevronsUpDownIcon className='size-3' />
                </InputGroupButton>
              </DropdownMenuTrigger>

              {/* 下拉菜单内容 - 包含所有可选状态项 */}
              <DropdownMenuContent align='start' className='[--radius:0.95rem]'>
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
                    <item.icon /> {/* 显示状态图标 */}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>

          {/* 关键词输入框 - 支持输入友链名称、标识进行搜索 */}
          <InputGroupInput
            placeholder='友链名称/标识/链接'
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
          查找
        </Button>
      </ButtonGroup>
    </div>
  )
}
