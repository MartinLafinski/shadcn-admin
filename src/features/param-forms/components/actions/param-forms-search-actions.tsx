import React, { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { SearchIcon, XIcon } from 'lucide-react'
import { enableLabels } from '@/lib/labels'
import { paramFormTypeLabels } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { FilterDropdown } from '@/components/smart/filter-dropdown'
import {
  useParamFormsSearch,
  useParamFormsActions,
} from '../param-forms-provider'

const route = getRouteApi('/_authenticated/param-forms/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_PARAMFORM_PAGE_SIZE || 20
)

type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '' }: SearchProps) {
  const { searchParams } = useParamFormsSearch()
  const { setSearchParams } = useParamFormsActions()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()

  const [keyword, setKeyword] = useState<string>('')
  const [enabledValue, setEnabledValue] = useState<boolean | undefined>(
    undefined
  )
  const [paramTypeValue, setParamTypeValue] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    setKeyword(searchParams?.keyword ?? '')
    setEnabledValue(searchParams?.enabled ?? undefined)
    setParamTypeValue(searchParams?.param_type ?? undefined)
  }, [searchParams.keyword, searchParams.enabled, searchParams.param_type])

  const updateUrlParams = (params: {
    keyword?: string
    enabled?: boolean
    param_type?: string
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        const newParams = {
          ...(prev as Record<string, unknown>),
          keyword: params.keyword || undefined,
          enabled: params.enabled,
          param_type: params.param_type || undefined,
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
      keyword: keyword || undefined,
      enabled: enabledValue,
      param_type: paramTypeValue || undefined,
      page: 1,
      size: searchParams.size,
    })

    updateUrlParams({
      keyword: keyword || undefined,
      enabled: enabledValue,
      param_type: paramTypeValue || undefined,
      page: 1,
      size: searchParams.size,
    })

    queryClient.invalidateQueries({ queryKey: ['paramForms'] })
  }

  const handleReset = () => {
    setKeyword('')
    setEnabledValue(undefined)
    setParamTypeValue(undefined)

    const resetParams = {
      keyword: undefined,
      enabled: undefined,
      param_type: undefined,
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

          <FilterDropdown
            options={enableLabels}
            value={enabledValue}
            onChange={setEnabledValue}
            placeholder='可用?'
          />

          <FilterDropdown
            options={paramFormTypeLabels}
            value={paramTypeValue}
            onChange={setParamTypeValue}
            placeholder='类型?'
          />

          <InputGroupInput
            placeholder='表单名称/标识'
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
