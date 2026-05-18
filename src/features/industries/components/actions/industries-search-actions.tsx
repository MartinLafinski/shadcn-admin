// 引入依赖
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
// 路由
import { getRouteApi } from '@tanstack/react-router'
// 图标
import { SearchIcon, XIcon } from 'lucide-react'
// 样式
import { cn } from '@/lib/utils.ts'
// 按钮组控件
import { ButtonGroup } from '@/components/ui/button-group.tsx'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 输入框组控件
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group.tsx'
// 获取行业数据
import {
  useIndustriesSearch,
  useIndustriesActions,
} from '../industries-provider.tsx'

// 定义搜索参数记录类型
const route = getRouteApi('/_authenticated/industries/')
// 默认行业每页数量
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_INDUSTRY_PAGE_SIZE || 50
)

/**
 * 行业搜索组件
 * 提供行业名称/标识的关键词搜索功能
 *
 * 组件功能：
 * 1. 支持关键词搜索（行业名称/标识）
 * 2. 提供重置功能
 */
type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '' }: SearchProps) {
  const { searchParams } = useIndustriesSearch()
  const { setSearchParams } = useIndustriesActions()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()

  // 本地状态：输入框的关键词，用于存储用户在搜索框中输入的内容
  const [keyword, setKeyword] = useState<string>('')

  // 当URL中的industry_keyword参数发生变化时，同步更新本地keyword状态
  useEffect(() => {
    setKeyword(searchParams?.industry_keyword ?? '')
  }, [searchParams.industry_keyword])

  /**
   * 更新 URL 参数
   * 该函数用于更新浏览器URL中的搜索参数，同时保留其他参数不变
   */
  const updateUrlParams = (params: {
    industry_keyword?: string
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        // 创建新的参数对象，合并之前的参数和新参数
        const newParams = {
          ...(prev as Record<string, unknown>),
          industry_keyword: params.industry_keyword || undefined,
          page: params.page && params.page > 1 ? params.page : undefined,
          size:
            params.size && params.size !== DEFAULT_PAGE_SIZE
              ? params.size
              : undefined,
        }

        // 清理 undefined 值
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
      industry_keyword: keyword || undefined,
      page: 1,
      size: searchParams.size,
    })

    // 更新 URL 参数
    updateUrlParams({
      industry_keyword: keyword || undefined,
      page: 1,
      size: searchParams.size,
    })

    // 使查询缓存失效，强制重新获取数据
    queryClient.invalidateQueries({ queryKey: ['industries'] })
  }

  /**
   * 处理重置按钮点击事件
   */
  const handleReset = () => {
    // 重置本地状态
    setKeyword('')

    // 重置搜索参数
    const resetParams = {
      industry_keyword: undefined,
      page: 1,
      size: searchParams.size,
    }

    setSearchParams(resetParams)
    updateUrlParams(resetParams)

    // 使查询缓存失效，强制重新获取数据
    queryClient.invalidateQueries({ queryKey: ['industries'] })
  }

  return (
    <div className={cn('xs:max-w-xs flex w-full max-w-sm gap-4', className)}>
      {/* 搜索输入框组合，包含关键词输入 */}
      <ButtonGroup>
        <InputGroup className='[--radius:1rem]'>
          {/* 重置按钮 - 清空所有搜索条件 */}
          <InputGroupAddon align='inline-start'>
            <InputGroupButton size='icon-xs' onClick={handleReset}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>

          {/* 关键词输入框 - 支持输入行业名称或标识进行搜索 */}
          <InputGroupInput
            placeholder='行业名称/标识'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
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
