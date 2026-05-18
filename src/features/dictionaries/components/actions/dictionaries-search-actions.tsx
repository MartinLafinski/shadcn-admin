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
  useDictionariesSearch,
  useDictionariesActions,
} from '../dictionaries-provider'

const route = getRouteApi('/_authenticated/dictionaries/')
const DEFAULT_PAGE_SIZE = Number(
  import.meta.env.VITE_DICTIONARY_PAGE_SIZE || 50
)

type SearchProps = { className?: string }

export function Search({ className = '' }: SearchProps) {
  const { searchParams } = useDictionariesSearch()
  const { setSearchParams } = useDictionariesActions()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()
  const [keyword, setKeyword] = useState<string>('')

  useEffect(() => {
    setKeyword(searchParams?.dictionary_keyword ?? '')
  }, [searchParams.dictionary_keyword])

  const updateUrlParams = (params: {
    dictionary_keyword?: string
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        const newParams = {
          ...(prev as Record<string, unknown>),
          dictionary_keyword: params.dictionary_keyword || undefined,
          page: params.page && params.page > 1 ? params.page : undefined,
          size:
            params.size && params.size !== DEFAULT_PAGE_SIZE
              ? params.size
              : undefined,
        }
        Object.keys(newParams).forEach((key) => {
          if (newParams[key as keyof typeof newParams] === undefined)
            delete newParams[key as keyof typeof newParams]
        })
        return newParams as Record<string, unknown>
      },
    })
  }

  const handleSearch = () => {
    setSearchParams({
      dictionary_keyword: keyword || undefined,
      page: 1,
      size: searchParams.size,
    })
    updateUrlParams({
      dictionary_keyword: keyword || undefined,
      page: 1,
      size: searchParams.size,
    })
    queryClient.invalidateQueries({ queryKey: ['dictionaries'] })
  }

  const handleReset = () => {
    setKeyword('')
    const resetParams = {
      dictionary_keyword: undefined,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(resetParams)
    updateUrlParams(resetParams)
    queryClient.invalidateQueries({ queryKey: ['dictionaries'] })
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
            placeholder='属性字典名称/标识'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
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
