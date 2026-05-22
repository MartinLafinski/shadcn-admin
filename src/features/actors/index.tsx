import { useMemo, useState } from 'react'
import {
  GhostIcon,
  SearchIcon,
  ChevronDown,
  Hash,
  Cpu,
  Timer,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { StatusBadge } from '@/features/clusters/components/status-badge'
import { StatusDot } from '@/features/clusters/components/status-dot'
import { useClusterActorsQuery } from './api/actors'
import { ActorsDetailDialog } from './components/actors-dialogs'
import type { ClusterActorData } from './data/schemas'

const ALL_STATUS = '__all__'

export function Actors() {
  const { data: actors, isLoading } = useClusterActorsQuery()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS)
  const [expandedName, setExpandedName] = useState<string | null>(null)
  const [selectedActor, setSelectedActor] = useState<ClusterActorData | null>(
    null
  )

  const statuses = Array.from(
    new Set(actors?.map((s) => s.status).filter(Boolean) ?? [])
  )

  const grouped = useMemo(() => {
    const map = new Map<string, ClusterActorData[]>()
    const list = (actors ?? [])
      .filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((a) =>
        statusFilter === ALL_STATUS ? true : a.status === statusFilter
      )
    for (const a of list) {
      const arr = map.get(a.name) || []
      arr.push(a)
      map.set(a.name, arr)
    }
    return [...map.entries()]
  }, [actors, searchTerm, statusFilter])

  if (isLoading) {
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-muted-foreground'>加载工作者列表中...</p>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <UserMenu />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>觅蜂工作者管理</h2>
          <p className='text-muted-foreground'>
            查看所有觅蜂工作者实例和运行状态
          </p>
        </div>

        <div className='flex items-end justify-between'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            <div className='relative'>
              <SearchIcon className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='搜索工作者...'
                className='h-9 w-44 pl-8 lg:w-64'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-32'>
                <SelectValue placeholder='全部状态' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUS}>全部状态</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s!}>
                    <div className='flex items-center gap-2'>
                      <StatusDot
                        status={
                          s as
                            | 'running'
                            | 'idle'
                            | 'warning'
                            | 'error'
                            | 'stopped'
                        }
                      />
                      {s}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className='flex flex-col gap-4'>
          {grouped.map(([name, members]) => {
            const isExpanded = expandedName === name
            const statusCounts = members.reduce(
              (acc, a) => {
                const s = a.status || 'unknown'
                acc[s] = (acc[s] || 0) + 1
                return acc
              },
              {} as Record<string, number>
            )

            return (
              <div key={name} className='w-full'>
                <div
                  onClick={() => setExpandedName(isExpanded ? null : name)}
                  className='flex w-full cursor-pointer items-center justify-between rounded-xl border p-5 transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow-md'
                >
                  <div className='flex items-center gap-4'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted p-2'>
                      <GhostIcon className='h-5 w-5 text-primary/70' />
                    </div>
                    <div>
                      <h3 className='font-semibold'>{name}</h3>
                      <p className='text-xs text-muted-foreground'>
                        {members.length} 个实例
                        {Object.entries(statusCounts).length > 0 && (
                          <span className='ml-2'>
                            {Object.entries(statusCounts).map(([s, c]) => (
                              <span key={s} className='mr-1'>
                                {s}:{c}
                              </span>
                            ))}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <StatusBadge
                      status={
                        (members[0].status as
                          | 'running'
                          | 'idle'
                          | 'warning'
                          | 'error'
                          | 'stopped') || 'stopped'
                      }
                    />
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        isExpanded && 'rotate-180'
                      )}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div className='ml-12 flex flex-col gap-2 pt-2'>
                    {members.map((actor) => (
                      <div
                        key={actor.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedActor(actor)
                        }}
                        className='flex w-full cursor-pointer items-center justify-between rounded-lg border bg-muted/30 p-3 transition-all hover:border-primary/30 hover:bg-accent/50'
                      >
                        <div className='flex items-center gap-4'>
                          <div className='min-w-0'>
                            <p className='text-sm font-medium'>
                              {actor.actor_uid}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {actor.actor_type} · {actor.address}:{actor.port}
                            </p>
                          </div>
                        </div>

                        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                          <span className='flex items-center gap-1'>
                            <Hash className='h-3 w-3' />
                            {actor.node_id}
                          </span>
                          <span className='flex items-center gap-1'>
                            <Timer className='h-3 w-3' />
                            {actor.pid}
                          </span>
                          <span className='flex items-center gap-1'>
                            <Cpu className='h-3 w-3' />
                            {actor.actor_type}
                          </span>
                          <StatusBadge
                            status={
                              (actor.status as
                                | 'running'
                                | 'idle'
                                | 'warning'
                                | 'error'
                                | 'stopped') || 'stopped'
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {grouped.length === 0 && (
          <div className='flex h-40 items-center justify-center text-muted-foreground'>
            没有匹配的工作者
          </div>
        )}
      </Main>

      {selectedActor && (
        <ActorsDetailDialog
          open={!!selectedActor}
          onOpenChange={(v) => {
            if (!v) setSelectedActor(null)
          }}
          actor={selectedActor}
        />
      )}
    </>
  )
}
