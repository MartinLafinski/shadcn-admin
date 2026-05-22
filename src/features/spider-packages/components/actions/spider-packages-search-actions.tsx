import React, { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { SearchIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { ButtonGroup } from '@/components/ui/button-group.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group.tsx'
import { WebsiteCombobox } from '@/components/smart/combobox/website-combobox'
import { FilterDropdown } from '@/components/smart/filter-dropdown'
import { enableLabels } from '../../data/labels.tsx'
import { useSpiderPackages } from '../spider-packages-provider.tsx'

const route = getRouteApi('/_authenticated/spider-packages/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_SPIDER_PACKAGE_PAGE_SIZE || 50
)

type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({ className = '' }: SearchProps) {
  const { searchParams, setSearchParams } = useSpiderPackages()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()

  const [keyword, setKeyword] = useState<string>('')
  const [enabledValue, setEnabledValue] = useState<boolean | undefined>(
    undefined
  )
  const [websiteId, setWebsiteId] = useState<number | undefined>(undefined)

  useEffect(() => {
    setKeyword(searchParams?.spider_package_keyword ?? '')
    setEnabledValue(searchParams?.spider_package_enabled ?? undefined)
    setWebsiteId(searchParams?.website_id)
  }, [
    searchParams.spider_package_keyword,
    searchParams.spider_package_enabled,
    searchParams.website_id,
  ])

  const updateUrlParams = (params: {
    spider_package_keyword?: string
    spider_package_enabled?: boolean
    website_id?: number
    page?: number
    size?: number
  }) => {
    navigate({
      search: (prev) => {
        const newParams = {
          ...(prev as Record<string, unknown>),
          spider_package_keyword: params.spider_package_keyword || undefined,
          spider_package_enabled: params.spider_package_enabled,
          website_id: params.website_id,
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
      spider_package_keyword: keyword || undefined,
      spider_package_enabled: enabledValue,
      website_id: websiteId,
      page: 1,
      size: searchParams.size,
    })
    updateUrlParams({
      spider_package_keyword: keyword || undefined,
      spider_package_enabled: enabledValue,
      website_id: websiteId,
      page: 1,
      size: searchParams.size,
    })
    queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
  }

  const handleReset = () => {
    setKeyword('')
    setEnabledValue(undefined)
    setWebsiteId(undefined)

    const resetParams = {
      spider_package_keyword: undefined,
      spider_package_enabled: undefined,
      website_id: undefined,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(resetParams)
    updateUrlParams(resetParams)
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

          <InputGroupAddon align='inline-start'>
            <WebsiteCombobox
              value={websiteId}
              onChange={(id) => setWebsiteId(id ?? undefined)}
              variant='inline'
              placeholder='选择网站'
            />
          </InputGroupAddon>

          <FilterDropdown
            options={enableLabels}
            value={enabledValue}
            onChange={setEnabledValue}
            placeholder='可用状态'
          />

          <InputGroupInput
            placeholder='爬虫包名称/标识'
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
          查找
        </Button>
      </ButtonGroup>
    </div>
  )
}
