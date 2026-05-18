import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { SearchIcon, XIcon } from 'lucide-react'
import { expiredLabels } from '@/lib/labels'
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
import {
  enableLabels,
  lockedLabels,
  pausedLabels,
  limitedLabels,
} from '../../data/labels.tsx'
import { useSpiderSessions } from '../spider-sessions-provider.tsx'

const route = getRouteApi('/_authenticated/spider-sessions/')
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_SPIDER_SESSION_PAGE_SIZE || 50
)

const POOL_COLORS: Record<number, string> = {
  0: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-none',
  1: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-none',
  2: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 rounded-none',
  3: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300 rounded-none',
  4: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 rounded-none',
  5: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300 rounded-none',
  6: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-none',
  7: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300 rounded-none',
  8: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300 rounded-none',
  9: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 rounded-none',
}

const poolLabels = Array.from({ length: 32 }, (_, i) => ({
  value: i,
  label: i === 0 ? '无池' : `# ${i}`,
  className: i === 0 ? 'text-gray-400 rounded-none' : POOL_COLORS[i % 10],
}))

export function Search({ className = '' }: { className?: string }) {
  const { searchParams, setSearchParams } = useSpiderSessions()
  const navigate = route.useNavigate()
  const qc = useQueryClient()
  const [keyword, setKeyword] = useState('')
  const [enabled, setEnabled] = useState<boolean | undefined>(undefined)
  const [locked, setLocked] = useState<boolean | undefined>(undefined)
  const [paused, setPaused] = useState<boolean | undefined>(undefined)
  const [limited, setLimited] = useState<boolean | undefined>(undefined)
  const [expired, setExpired] = useState<boolean | undefined>(undefined)
  const [poolId, setPoolId] = useState<number | undefined>(undefined)
  const [websiteId, setWebsiteId] = useState<number | undefined>(undefined)

  useEffect(() => {
    setKeyword(searchParams?.keyword ?? '')
    setEnabled(searchParams?.enabled ?? undefined)
    setLocked(searchParams?.locked ?? undefined)
    setPaused(searchParams?.paused ?? undefined)
    setLimited(searchParams?.limited ?? undefined)
    setExpired(searchParams?.expired ?? undefined)
    setPoolId(searchParams?.session_pool_id)
    setWebsiteId(searchParams?.website_id)
  }, [
    searchParams.keyword,
    searchParams.enabled,
    searchParams.locked,
    searchParams.paused,
    searchParams.limited,
    searchParams.expired,
    searchParams.session_pool_id,
    searchParams.website_id,
  ])

  const upd = (p: Record<string, unknown>) =>
    navigate({
      search: (prev) => {
        const np: Record<string, unknown> = {
          ...(prev as Record<string, unknown>),
          ...p,
          page:
            (p.page as number) && (p.page as number) > 1 ? p.page : undefined,
          size:
            (p.size as number) && (p.size as number) !== DEFAULT_PAGE_SIZE
              ? p.size
              : undefined,
        }
        Object.keys(np).forEach((k) => {
          if (np[k] === undefined) delete np[k]
        })
        return np
      },
    })

  const hs = () => {
    const p: Record<string, unknown> = {
      keyword: keyword || undefined,
      enabled,
      locked,
      paused,
      limited,
      expired,
      session_pool_id: poolId || undefined,
      website_id: websiteId || undefined,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(p as any)
    upd(p)
    qc.invalidateQueries({ queryKey: ['spider-sessions'] })
  }

  const hr = () => {
    setKeyword('')
    setEnabled(undefined)
    setLocked(undefined)
    setPaused(undefined)
    setLimited(undefined)
    setExpired(undefined)
    setPoolId(undefined)
    setWebsiteId(undefined)
    const p: Record<string, unknown> = {
      keyword: undefined,
      enabled: undefined,
      locked: undefined,
      paused: undefined,
      limited: undefined,
      expired: undefined,
      session_pool_id: undefined,
      website_id: undefined,
      page: 1,
      size: searchParams.size,
    }
    setSearchParams(p as any)
    upd(p)
  }

  return (
    <div className={cn('flex w-full max-w-2/3 gap-4', className)}>
      <ButtonGroup>
        <InputGroup className='[--radius:1rem]'>
          <InputGroupAddon align='inline-start'>
            <InputGroupButton size='icon-xs' onClick={hr}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
          <InputGroupAddon align='inline-start'>
            <WebsiteCombobox
              value={websiteId}
              onChange={(id) => setWebsiteId(id ?? undefined)}
              variant='inline'
              placeholder='网站?'
            />
          </InputGroupAddon>
          <FilterDropdown
            options={expiredLabels}
            value={expired}
            onChange={setExpired}
            placeholder='时效?'
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
          <FilterDropdown
            options={poolLabels}
            value={poolId}
            onChange={setPoolId}
            placeholder='会话池?'
          />
          <InputGroupInput
            placeholder='爬虫会话名称/标识'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') hs()
            }}
          />
        </InputGroup>
        <Button onClick={hs}>
          <SearchIcon />
          查找
        </Button>
      </ButtonGroup>
    </div>
  )
}
