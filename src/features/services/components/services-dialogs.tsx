import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import { Server, Hash, Globe, Info, Monitor, Tag } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { StatusDot } from '@/features/clusters/components/status-dot'
import type { ClusterServiceData } from '../data/schemas'

interface ServicesDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service: ClusterServiceData
}

export function ServicesDetailDialog({
  open,
  onOpenChange,
  service,
}: ServicesDetailDialogProps) {
  const { resolvedTheme } = useTheme()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Server className='h-6 w-6 text-primary/70' />
            {service.name}
          </DialogTitle>
          <DialogDescription>服务详细信息</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Tag className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>服务标识</p>
                <p className='truncate text-sm font-medium'>
                  {service.service_slug}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Hash className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>节点 ID</p>
                <p className='truncate text-sm font-medium'>
                  {service.node_id}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Monitor className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>实例名称</p>
                <p className='truncate text-sm font-medium'>
                  {service.instance_name}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Globe className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>地址</p>
                <p className='truncate text-sm font-medium'>
                  {service.address}:{service.port}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Tag className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>状态</p>
                <div className='flex items-center gap-1.5'>
                  <StatusDot
                    status={
                      service.status as
                        | 'running'
                        | 'idle'
                        | 'warning'
                        | 'error'
                        | 'stopped'
                    }
                  />
                  <span className='text-sm font-medium'>
                    {service.status || 'unknown'}
                  </span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Info className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>ID</p>
                <p className='truncate text-sm font-medium'>{service.id}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
              <Info className='h-4 w-4 text-fuchsia-500' />
              Meta 信息
            </h4>
            <div className='h-full overflow-hidden rounded-xl border bg-muted/30 p-4'>
              <ScrollArea className='h-[240px] w-full max-w-full' type='always'>
                <JsonView
                  value={service.meta}
                  displayDataTypes={false}
                  displayObjectSize
                  enableClipboard
                  shortenTextAfterLength={0}
                  style={
                    resolvedTheme === 'light'
                      ? {
                          ...githubLightTheme,
                          backgroundColor: 'transparent',
                        }
                      : {
                          ...githubDarkTheme,
                          backgroundColor: 'transparent',
                        }
                  }
                />
                <ScrollBar orientation='horizontal' />
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
