import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { SearchIcon, XIcon, SearchCheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { ButtonGroup } from '@/components/ui/button-group.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group.tsx'
import { EntrypointCombobox } from '@/components/smart/combobox/entrypoint-combobox'
import { IndustryCombobox } from '@/components/smart/combobox/industry-combobox'
import { JobGroupCombobox } from '@/components/smart/combobox/jobgroup-combobox'
import { WebsiteCombobox } from '@/components/smart/combobox/website-combobox'
import { FilterDropdown } from '@/components/smart/filter-dropdown'
import {
  enableLabels,
  lockedLabels,
  pausedLabels,
  limitedLabels,
  levelLabels,
  deeplySearchLabels,
} from '@/features/prejobs/data/labels.tsx'
import { usePrejobs } from '../prejobs-provider'

const route = getRouteApi('/_authenticated/prejobs/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_PREJOB_PAGE_SIZE || 50
)

export function Search({ className = '' }: { className?: string }) {
  const { searchParams, setSearchParams } = usePrejobs()
  const navigate = route.useNavigate()
  const queryClient = useQueryClient()

  const [keyword, setKeyword] = useState<string>('')
  const [level, setLevel] = useState<string | undefined>(undefined)
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined)
  const [locked, setLocked] = useState<boolean | undefined>(undefined)
  const [paused, setPaused] = useState<boolean | undefined>(undefined)
  const [limited, setLimited] = useState<boolean | undefined>(undefined)
  const [deeplySearch, setDeeplySearch] = useState<boolean>(false)
  const [websiteId, setWebsiteId] = useState<number | undefined>(undefined)
  const [industryId, setIndustryId] = useState<number | undefined>(undefined)
  const [jobgroupId, setJobgroupId] = useState<number | undefined>(undefined)
  const [entrypointId, setEntrypointId] = useState<number | undefined>(
    undefined
  )

  useEffect(() => {
    setKeyword(searchParams?.prejob_keyword ?? '')
    setLevel(searchParams?.prejob_level)
    setEnabled(searchParams?.prejob_enabled)
    setLocked(searchParams?.prejob_locked)
    setPaused(searchParams?.prejob_paused)
    setLimited(searchParams?.prejob_limited)
    setDeeplySearch(searchParams?.deeply_search ?? false)
    setWebsiteId(searchParams?.website_id)
    setIndustryId(searchParams?.industry_id)
    setJobgroupId(searchParams?.jobgroup_id)
    setEntrypointId(searchParams?.entrypoint_id)
  }, [
    searchParams.prejob_keyword,
    searchParams.prejob_level,
    searchParams.prejob_enabled,
    searchParams.prejob_locked,
    searchParams.prejob_paused,
    searchParams.prejob_limited,
    searchParams.website_id,
    searchParams.industry_id,
    searchParams.jobgroup_id,
    searchParams.entrypoint_id,
    searchParams.deeply_search,
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
      prejob_keyword: keyword || undefined,
      prejob_level: level,
      prejob_enabled: enabled,
      prejob_locked: locked,
      prejob_paused: paused,
      prejob_limited: limited,
      deeply_search: deeplySearch,
      website_id: websiteId,
      industry_id: industryId,
      jobgroup_id: jobgroupId,
      entrypoint_id: entrypointId,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(p)
    updateUrlParams(p)
    queryClient.invalidateQueries({ queryKey: ['prejobs'] })
  }

  const handleReset = () => {
    setKeyword('')
    setLevel(undefined)
    setEnabled(undefined)
    setLocked(undefined)
    setPaused(undefined)
    setLimited(undefined)
    setDeeplySearch(false)
    setWebsiteId(undefined)
    setIndustryId(undefined)
    setJobgroupId(undefined)
    setEntrypointId(undefined)
    const p = {
      prejob_keyword: undefined,
      prejob_level: undefined,
      prejob_enabled: undefined,
      prejob_locked: undefined,
      prejob_paused: undefined,
      prejob_limited: undefined,
      deeply_search: false,
      website_id: undefined,
      industry_id: undefined,
      jobgroup_id: undefined,
      entrypoint_id: undefined,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(p)
    updateUrlParams(p)
  }

  return (
    <div className={cn('flex w-full max-w-4/5 gap-4', className)}>
      <ButtonGroup>
        <InputGroup className='[--radius:1rem]'>
          <InputGroupAddon align='inline-start'>
            <InputGroupButton size='icon-xs' onClick={handleReset}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>

          <InputGroupAddon align='inline-start'>
            <JobGroupCombobox
              value={jobgroupId}
              onChange={(id) => setJobgroupId(id ?? undefined)}
              variant='inline'
              placeholder='分组?'
            />
          </InputGroupAddon>

          <InputGroupAddon align='inline-start'>
            <IndustryCombobox
              value={industryId}
              onChange={(id) => setIndustryId(id ?? undefined)}
              variant='inline'
              placeholder='行业?'
            />
          </InputGroupAddon>

          <InputGroupAddon align='inline-start'>
            <WebsiteCombobox
              value={websiteId}
              onChange={(id) => setWebsiteId(id ?? undefined)}
              variant='inline'
              placeholder='网站?'
            />
          </InputGroupAddon>

          <InputGroupAddon align='inline-start'>
            <EntrypointCombobox
              mode='id'
              value={entrypointId}
              onChange={(id) =>
                setEntrypointId((id ?? undefined) as number | undefined)
              }
              variant='inline'
              websiteId={websiteId}
              industryId={industryId}
              placeholder='入口?'
            />
          </InputGroupAddon>

          <FilterDropdown
            options={levelLabels}
            value={level}
            onChange={setLevel}
            placeholder='优先级?'
          />

          <FilterDropdown
            options={enableLabels}
            value={enabled}
            onChange={setEnabled}
            placeholder='可用?'
          />
          <FilterDropdown
            options={lockedLabels}
            value={locked}
            onChange={setLocked}
            placeholder='锁定?'
          />
          <FilterDropdown
            options={pausedLabels}
            value={paused}
            onChange={setPaused}
            placeholder='运转?'
          />
          <FilterDropdown
            options={limitedLabels}
            value={limited}
            onChange={setLimited}
            placeholder='受限?'
          />

          <InputGroupInput
            placeholder='预备作业名称/标识'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch()
            }}
          />
        </InputGroup>

        <Button
          onClick={handleSearch}
          className='rounded-r-none border-r border-primary-foreground/20'
        >
          {deeplySearch ? (
            <SearchCheckIcon className='text-blue-600' />
          ) : (
            <SearchIcon />
          )}
          <span className='hidden sm:inline'>
            {deeplySearch ? '深度查找' : '查找'}
          </span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='default' className='rounded-l-none px-2'>
              <SearchCheckIcon className='size-3' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='[--radius:0.95rem]'>
            {deeplySearchLabels.map((item) => (
              <DropdownMenuItem
                key={item.value.toString()}
                onClick={() => setDeeplySearch(item.value)}
              >
                <item.icon className={cn('mr-2 size-4', item.className)} />
                {item.label}
                {deeplySearch === item.value && (
                  <SearchCheckIcon className='ml-auto size-4' />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  )
}
