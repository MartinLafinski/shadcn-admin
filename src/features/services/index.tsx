import { useState } from 'react'
import { RouterIcon, SearchIcon, Globe, Monitor, Hash, Tag } from 'lucide-react'
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
import { useClusterServicesQuery } from './api/services'
import { ServicesDetailDialog } from './components/services-dialogs'
import type { ClusterServiceData } from './data/schemas'

const ALL_STATUS = '__all__'

export function Services() {
  const { data: services, isLoading } = useClusterServicesQuery()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(ALL_STATUS)
  const [selectedService, setSelectedService] =
    useState<ClusterServiceData | null>(null)

  const statuses = Array.from(
    new Set(services?.map((s) => s.status).filter(Boolean) ?? [])
  )

  const filteredServices = (services ?? [])
    .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((s) =>
      statusFilter === ALL_STATUS ? true : s.status === statusFilter
    )

  if (isLoading) {
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-muted-foreground'>加载服务列表中...</p>
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
          <h2 className='text-2xl font-bold tracking-tight'>觅蜂服务管理</h2>
          <p className='text-muted-foreground'>
            查看所有觅蜂微服务的节点信息和运行状态
          </p>
        </div>

        <div className='flex items-end justify-between'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
            <div className='relative'>
              <SearchIcon className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='搜索服务...'
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
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => setSelectedService(service)}
              className='flex w-full cursor-pointer items-center justify-between rounded-xl border p-5 transition-all hover:border-primary/30 hover:bg-accent/50 hover:shadow-md'
            >
              <div className='flex items-center gap-4'>
                <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-muted p-2'>
                  <RouterIcon className='h-5 w-5 text-primary/70' />
                </div>
                <div className='min-w-0'>
                  <h3 className='font-semibold'>{service.name}</h3>
                  <p className='text-xs text-muted-foreground'>
                    {service.service_slug}
                  </p>
                </div>
              </div>

              <div className='hidden flex-1 items-center gap-6 px-8 md:flex'>
                <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                  <Monitor className='h-3.5 w-3.5' />
                  <span className='max-w-[160px] truncate'>
                    {service.instance_name}
                  </span>
                </div>
                <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                  <Hash className='h-3.5 w-3.5' />
                  <span className='max-w-[160px] truncate'>
                    {service.node_id}
                  </span>
                </div>
                <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
                  <Globe className='h-3.5 w-3.5' />
                  <span>
                    {service.address}:{service.port}
                  </span>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <StatusBadge
                  status={
                    (service.status as
                      | 'running'
                      | 'idle'
                      | 'warning'
                      | 'error'
                      | 'stopped') || 'stopped'
                  }
                />
                <Tag className='h-4 w-4 text-muted-foreground' />
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className='flex h-40 items-center justify-center text-muted-foreground'>
            没有匹配的服务
          </div>
        )}
      </Main>

      {selectedService && (
        <ServicesDetailDialog
          open={!!selectedService}
          onOpenChange={(v) => {
            if (!v) setSelectedService(null)
          }}
          service={selectedService}
        />
      )}
    </>
  )
}
