import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { SearchIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  useParamModelRegistersSearch,
  useParamModelRegistersActions,
} from '../param-model-register-provider'

const route = getRouteApi('/_authenticated/param-model-register/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_PARAM_MODEL_REGISTER_PAGE_SIZE || 50
)

type SearchProps = {
  className?: string
}

export function Search({ className = '' }: SearchProps) {
  const { searchParams } = useParamModelRegistersSearch()
  const { setSearchParams } = useParamModelRegistersActions()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()

  const [keyword, setKeyword] = useState<string>('')

  useEffect(() => {
    setKeyword(searchParams?.spider_slug ?? '')
  }, [searchParams.spider_slug])

  const updateUrlParams = (params: {
    spider_slug?: string
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        const newParams = {
          ...(prev as Record<string, unknown>),
          spider_slug: params.spider_slug || undefined,
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
        return newParams as Record<string, unknown>
      },
    })
  }

  const handleSearch = () => {
    setSearchParams({
      spider_slug: keyword || undefined,
      page: 1,
      size: searchParams.size,
    })
    updateUrlParams({
      spider_slug: keyword || undefined,
      page: 1,
      size: searchParams.size,
    })
    queryClient.invalidateQueries({ queryKey: ['param-model-register'] })
  }

  const handleReset = () => {
    setKeyword('')
    const resetParams = {
      spider_slug: undefined,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(resetParams)
    updateUrlParams(resetParams)
    queryClient.invalidateQueries({ queryKey: ['param-model-register'] })
  }

  return (
    <div className={cn('xs:max-w-xs flex w-full max-w-sm gap-4', className)}>
      <ButtonGroup>
        <InputGroup className='[--radius:1rem]'>
          <InputGroupAddon align='inline-start'>
            <InputGroupButton size='icon-xs' onClick={handleReset}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupInput
            placeholder='爬虫标识/名称'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
        </InputGroup>
        <Button onClick={handleSearch}>
          <SearchIcon />
          <span className='hidden sm:inline'>查找</span>
        </Button>
      </ButtonGroup>
    </div>
  )
}
