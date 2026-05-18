import {
  Loader2,
  ChevronDown,
  CodeIcon,
  SettingsIcon,
  LayersIcon,
  KeyIcon,
  FlagIcon,
  UserRoundPlusIcon,
  UserRoundPenIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { EntrypointMiniItemCell } from '@/components/smart/cells/entrypoint-mini-item-cell'
import { IndustryMiniItemCell } from '@/components/smart/cells/industry-mini-item-cell'
import { PrejobMiniItemCell } from '@/components/smart/cells/prejob-mini-item-cell'
import { WebsiteMiniItemCell } from '@/components/smart/cells/website-mini-item-cell'
import type { EntrypointItemData } from '@/features/entrypoints/data/schemas'
import type { IndustryItemData } from '@/features/industries/data/schemas'
import type { WebsiteData } from '@/features/websites/data/schemas'
import { useParamModelRegisterQuery } from '../../api/param-model-register'

interface ParamModelRegisterViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registerId: number
}

export function ParamModelRegisterViewDialog({
  open,
  onOpenChange,
  registerId,
}: ParamModelRegisterViewDialogProps) {
  const {
    data: register,
    isLoading,
    isError,
  } = useParamModelRegisterQuery(registerId)

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-3xl'>
          <DialogTitle className='sr-only'>加载中...</DialogTitle>
          <DialogDescription className='sr-only'>
            正在获取注册条目数据
          </DialogDescription>
          <div className='flex h-64 items-center justify-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            <span className='text-muted-foreground'>加载注册条目数据...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (isError || !register) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-md'>
          <DialogTitle className='sr-only'>加载失败</DialogTitle>
          <DialogDescription className='sr-only'>
            无法加载注册条目数据，请稍后重试
          </DialogDescription>
          <div className='flex h-32 items-center justify-center'>
            <p className='text-muted-foreground'>无法加载注册条目数据</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const compactTime = (t: string | null | undefined) =>
    t
      ? new Date(t).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-'

  const shards = register.active_shards ?? []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] w-full max-w-3xl flex-col gap-0 space-y-0 overflow-hidden p-0'>
        <DialogHeader className='shrink-0 space-y-3 border-b bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='w-full min-w-0 space-y-1.5'>
              <DialogTitle className='flex items-center gap-3 text-2xl'>
                <CodeIcon className='h-7 w-7 text-primary/70' />
                <span className='truncate'>
                  {register.register_name || register.register_slug}
                </span>
                <Badge
                  variant={register.enabled ? 'default' : 'secondary'}
                  className='bg-green-600 text-xs'
                >
                  {register.enabled ? '启用' : '停用'}
                </Badge>
              </DialogTitle>
              <div className='flex flex-wrap items-center gap-3 pt-2'>
                <div className='flex items-center gap-2' />
              </div>
              <div className='flex w-full gap-3 pt-2'>
                <div className='flex flex-1 items-center gap-2'>
                  <p>
                    <FlagIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>ID: {register.register_id}</span>
                  </p>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <p>
                    <UserRoundPlusIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{register.created_by || '-'}</span>
                    <span>{compactTime(register.created_at)}</span>
                  </p>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <p>
                    <UserRoundPenIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{register.updated_by || '-'}</span>
                    <span>{compactTime(register.updated_at)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full' type='always'>
            <div className='space-y-6 p-6'>
              <details className='group' open>
                <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                  <SettingsIcon className='h-5 w-5 text-blue-500' />
                  标识信息
                  <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                </summary>
                <div className='mt-4 space-y-3 rounded-xl border bg-muted/30 p-4'>
                  <div className='flex flex-col gap-3 text-sm'>
                    <div>
                      <span className='text-muted-foreground'>爬虫标识:</span>
                      <span className='ml-2 font-mono'>
                        {register.spider_slug}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>标识:</span>
                      <span className='ml-2 font-mono break-all'>
                        {register.register_slug}
                      </span>
                    </div>
                    <div>
                      <span className='text-muted-foreground'>类别:</span>
                      {(() => {
                        const cat = register.category as
                          | Record<string, unknown>
                          | null
                          | undefined
                        if (cat) {
                          const name = (cat.industry_name ??
                            cat.website_name ??
                            cat.entrypoint_name ??
                            cat.prejob_name) as string
                          const slug = (cat.industry_slug ??
                            cat.website_slug ??
                            cat.entrypoint_slug ??
                            cat.prejob_slug) as string
                          if (name) {
                            return (
                              <>
                                <span className='ml-2 font-medium'>{name}</span>
                                <span className='ml-1 font-mono text-xs text-muted-foreground'>
                                  [{slug}]
                                </span>
                              </>
                            )
                          }
                        }
                        return (
                          <>
                            <span className='ml-2'>
                              {register.category_type}
                            </span>
                            <span className='ml-1 font-mono text-xs text-muted-foreground'>
                              [{register.category_slug}]
                            </span>
                          </>
                        )
                      })()}
                    </div>
                    {register.category && (
                      <div>
                        <span className='text-muted-foreground'>类别实体:</span>
                        <span className='ml-2'>
                          {(() => {
                            const cat = register.category as Record<
                              string,
                              unknown
                            >
                            switch (register.category_type) {
                              case 'industry':
                                return (
                                  <IndustryMiniItemCell
                                    entity={cat as unknown as IndustryItemData}
                                  />
                                )
                              case 'website':
                                return (
                                  <WebsiteMiniItemCell
                                    website={cat as unknown as WebsiteData}
                                  />
                                )
                              case 'entrypoint':
                                return (
                                  <EntrypointMiniItemCell
                                    entrypoint={
                                      cat as unknown as EntrypointItemData
                                    }
                                  />
                                )
                              case 'prejob':
                                return (
                                  <PrejobMiniItemCell
                                    entity={
                                      cat as unknown as {
                                        prejob_name: string
                                        prejob_slug: string
                                      }
                                    }
                                  />
                                )
                              default:
                                return <span>-</span>
                            }
                          })()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className='text-muted-foreground'>参数要素包:</span>
                      {register.param_form ? (
                        <>
                          <span className='ml-2 font-medium'>
                            {register.param_form.param_form_name}
                          </span>
                          <span className='ml-1 font-mono text-xs text-muted-foreground'>
                            [{register.param_form.param_form_slug}]
                          </span>
                        </>
                      ) : (
                        <span className='ml-2 font-mono'>
                          {register.param_form_slug}
                        </span>
                      )}
                    </div>
                    {register.spider_package && (
                      <div>
                        <span className='text-muted-foreground'>
                          关联爬虫包:
                        </span>
                        <span className='ml-2 font-medium'>
                          {register.spider_package.spider_package_name}
                        </span>
                        <span className='ml-1 font-mono text-xs text-muted-foreground'>
                          [{register.spider_package.spider_package_slug}]
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </details>

              <details className='group' open>
                <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                  <LayersIcon className='h-5 w-5 text-amber-500' />
                  分片配置
                  <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                </summary>
                <div className='mt-4 space-y-3 rounded-xl border bg-muted/30 p-4'>
                  <div className='text-sm'>
                    <span className='text-muted-foreground'>分片策略:</span>

                    <Badge variant='secondary' className='ml-2'>
                      {register.shard_strategy || '无'}
                    </Badge>
                  </div>
                </div>
              </details>

              {shards.length > 0 && (
                <details className='group' open>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <KeyIcon className='h-5 w-5 text-emerald-500' />
                    活跃分片
                    <Badge variant='secondary' className='ml-auto'>
                      {shards.length}
                    </Badge>
                    <ChevronDown className='ml-2 h-4 w-4 transition-transform group-open:rotate-180' />
                  </summary>
                  <div className='mt-4 grid grid-cols-2 gap-2'>
                    {shards.map((s, idx) => (
                      <div
                        key={idx}
                        className='rounded-lg border bg-muted/30 px-3 py-2 font-mono text-sm'
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {register.description && (
                <details className='group' open>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                    说明
                  </summary>
                  <div className='mt-4 rounded-xl border bg-muted/30 p-4 text-sm whitespace-pre-wrap'>
                    {register.description}
                  </div>
                </details>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
