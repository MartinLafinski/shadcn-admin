import { useEffect, useState } from 'react'
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
import { FilterDropdown } from '@/components/smart/filter-dropdown'
import {
  enableLabels,
  lockedLabels,
  pausedLabels,
  limitedLabels,
} from '../../data/labels.tsx'
import { useJobGroups } from '../jobgroups-provider.tsx'

const route = getRouteApi('/_authenticated/jobgroups/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_JOBGROUP_PAGE_SIZE || 50
)

type SearchProps = { className?: string }

export function Search({ className = '' }: SearchProps) {
  const { searchParams, setSearchParams } = useJobGroups()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()

  const [keyword, setKeyword] = useState<string>('')
  const [enabledValue, setEnabledValue] = useState<boolean | undefined>(
    undefined
  )
  const [lockedValue, setLockedValue] = useState<boolean | undefined>(undefined)
  const [pausedValue, setPausedValue] = useState<boolean | undefined>(undefined)
  const [limitedValue, setLimitedValue] = useState<boolean | undefined>(
    undefined
  )

  useEffect(() => {
    setKeyword(searchParams?.keyword ?? '')
    setEnabledValue(searchParams?.enabled ?? undefined)
    setLockedValue(searchParams?.locked ?? undefined)
    setPausedValue(searchParams?.paused ?? undefined)
    setLimitedValue(searchParams?.limited ?? undefined)
  }, [
    searchParams.keyword,
    searchParams.enabled,
    searchParams.locked,
    searchParams.paused,
    searchParams.limited,
  ])

  const updateUrlParams = (params: Record<string, unknown>) => {
    navigate({
      search: (prev) => {
        const p: Record<string, unknown> = {
          ...(prev as Record<string, unknown>),
          ...params,
          page:
            (params.page as number) && (params.page as number) > 1
              ? params.page
              : undefined,
          size:
            (params.size as number) &&
            (params.size as number) !== DEFAULT_PAGE_SIZE
              ? params.size
              : undefined,
        }
        Object.keys(p).forEach((k) => {
          if (p[k] === undefined) delete p[k]
        })
        return p
      },
    })
  }

  const handleSearch = () => {
    const p = {
      keyword: keyword || undefined,
      enabled: enabledValue,
      locked: lockedValue,
      paused: pausedValue,
      limited: limitedValue,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(p)
    updateUrlParams(p)
    queryClient.invalidateQueries({ queryKey: ['jobgroups'] })
  }

  const handleReset = () => {
    setKeyword('')
    setEnabledValue(undefined)
    setLockedValue(undefined)
    setPausedValue(undefined)
    setLimitedValue(undefined)
    const p = {
      keyword: undefined,
      enabled: undefined,
      locked: undefined,
      paused: undefined,
      limited: undefined,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(p)
    updateUrlParams(p)
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
            placeholder='可用选项'
          />
          <FilterDropdown
            options={lockedLabels}
            value={lockedValue}
            onChange={setLockedValue}
            placeholder='锁定选项'
          />
          <FilterDropdown
            options={pausedLabels}
            value={pausedValue}
            onChange={setPausedValue}
            placeholder='运转选项'
          />
          <FilterDropdown
            options={limitedLabels}
            value={limitedValue}
            onChange={setLimitedValue}
            placeholder='受限选项'
          />
          <InputGroupInput
            placeholder='作业分组名称/标识'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
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
