import { useState } from 'react'
import { Server, SearchIcon, Globe, Monitor, Hash } from 'lucide-react'
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
import { useClusterServersQuery } from './api/servers'
import { ServersDetailDialog } from './components/servers-dialogs'
import type { ClusterServerData } from './data/schemas'

const ALL_STATUS = '__all__'

export function Servers() {
  const { data: servers, isLoading } = useClusterServersQuery()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS)
  const [selectedServer, setSelectedServer] =
    useState<ClusterServerData | null>(null)

  const statuses = Array.from(
    new Set(servers?.map((s) => s.status).filter(Boolean) ?? [])
  )

  const filteredServers = (servers ?? [])
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((s) =>
      statusFilter === ALL_STATUS ? true : s.status === statusFilter
    )

  if (isLoading) {
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-muted-foreground'>加载服务器列表中...</p>
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
          <h2 className='text-2xl font-bold tracking-tight'>觅蜂服务器管理</h2>
          <p className='text-muted-foreground'>
            查看所有觅蜂服务器的节点信息和运行状态
          </p>
        </div>

        <div className='flex items-end justify-between'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            <div className='relative'>
              <SearchIcon className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='搜索服务器...'
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

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {filteredServers.map((server) => (
            <div
              key={server.id}
              onClick={() => setSelectedServer(server)}
              className='cursor-pointer rounded-xl border p-5 transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow-md'
            >
              <div className='mb-4 flex items-start justify-between'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted p-2'>
                  <Server className='h-5 w-5 text-primary/70' />
                </div>
                <StatusBadge
                  status={
                    (server.status as
                      | 'running'
                      | 'idle'
                      | 'warning'
                      | 'error'
                      | 'stopped') || 'stopped'
                  }
                />
              </div>
              <div className='space-y-2'>
                <h3 className='font-semibold'>{server.name}</h3>
                <div className='space-y-1 text-xs text-muted-foreground'>
                  <p className='flex items-center gap-1.5'>
                    <Monitor className='h-3.5 w-3.5' />
                    {server.instance_name}
                  </p>
                  <p className='flex items-center gap-1.5'>
                    <Hash className='h-3.5 w-3.5' />
                    {server.node_id}
                  </p>
                  <p className='flex items-center gap-1.5'>
                    <Globe className='h-3.5 w-3.5' />
                    {server.address}:{server.port}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServers.length === 0 && (
          <div className='flex h-40 items-center justify-center text-muted-foreground'>
            没有匹配的服务器
          </div>
        )}
      </Main>

      {selectedServer && (
        <ServersDetailDialog
          open={!!selectedServer}
          onOpenChange={(v) => {
            if (!v) setSelectedServer(null)
          }}
          server={selectedServer}
        />
      )}
    </>
  )
}
