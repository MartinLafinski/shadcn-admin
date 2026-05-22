import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import { Server, Hash, Globe, Info, Cpu, Clock, Tag, Timer } from 'lucide-react'
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
import type { ClusterActorData } from '../data/schemas'

interface ActorsDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actor: ClusterActorData
}

export function ActorsDetailDialog({
  open,
  onOpenChange,
  actor,
}: ActorsDetailDialogProps) {
  const { resolvedTheme } = useTheme()

  const startedAt = new Date(actor.start_timestamp * 1000).toLocaleString(
    'zh-CN'
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Server className='h-6 w-6 text-primary/70' />
            {actor.name}
          </DialogTitle>
          <DialogDescription>工作者详细信息</DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Tag className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>UID</p>
                <p className='truncate text-sm font-medium'>
                  {actor.actor_uid}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Cpu className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>类型</p>
                <p className='truncate text-sm font-medium'>
                  {actor.actor_type}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Globe className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>地址</p>
                <p className='truncate text-sm font-medium'>
                  {actor.address}:{actor.port}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Hash className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>节点 ID</p>
                <p className='truncate text-sm font-medium'>{actor.node_id}</p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Timer className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>PID</p>
                <p className='truncate text-sm font-medium'>{actor.pid}</p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Clock className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>启动时间</p>
                <p className='truncate text-sm font-medium'>{startedAt}</p>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Tag className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>状态</p>
                <div className='flex items-center gap-1.5'>
                  <StatusDot
                    status={
                      actor.status as
                        | 'running'
                        | 'idle'
                        | 'warning'
                        | 'error'
                        | 'stopped'
                    }
                  />
                  <span className='text-sm font-medium'>
                    {actor.status || 'unknown'}
                  </span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-2 rounded-lg border bg-muted/30 p-3'>
              <Info className='h-4 w-4 text-muted-foreground' />
              <div className='min-w-0'>
                <p className='text-xs text-muted-foreground'>ID</p>
                <p className='truncate text-sm font-medium'>{actor.id}</p>
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
                  value={actor.meta}
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
