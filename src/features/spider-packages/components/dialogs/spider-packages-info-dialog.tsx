import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import MDEditor from '@uiw/react-md-editor'
import {
  Package,
  ChevronDown,
  Loader2,
  FileText,
  Braces,
  FlagIcon,
  UserRoundPlusIcon,
  UserRoundPenIcon,
  ExternalLinkIcon,
  BoxesIcon,
} from 'lucide-react'
import { useTheme } from '@/context/theme-provider.tsx'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSpiderPackageQuery } from '../../api/spider-packages.ts'
import type { SpiderPackageReleaseData } from '../../data/schemas'

interface SpiderPackagesInfoDialogProps {
  open: boolean
  onOpenChange: () => void
  spiderPackageId: number
}

export function SpiderPackagesInfoDialog({
  open,
  onOpenChange,
  spiderPackageId,
}: SpiderPackagesInfoDialogProps) {
  const { resolvedTheme } = useTheme()
  const {
    data: pkg,
    isLoading,
    isError,
  } = useSpiderPackageQuery(spiderPackageId)

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-3xl'>
          <DialogTitle className='sr-only'>加载中...</DialogTitle>
          <DialogDescription className='sr-only'>
            正在获取爬虫包数据
          </DialogDescription>
          <div className='flex h-64 items-center justify-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            <span className='text-muted-foreground'>加载爬虫包数据...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (isError || !pkg) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-md'>
          <DialogTitle className='sr-only'>加载失败</DialogTitle>
          <DialogDescription className='sr-only'>
            无法加载爬虫包数据，请稍后重试
          </DialogDescription>
          <div className='flex h-32 items-center justify-center'>
            <p className='text-muted-foreground'>无法加载爬虫包数据</p>
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

  const hasConfig =
    pkg.spider_package_config &&
    Object.keys(pkg.spider_package_config).length > 0
  const releaseCount = pkg.releases?.length || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] w-full max-w-3xl flex-col gap-0 space-y-0 overflow-hidden p-0'>
        <DialogHeader className='shrink-0 space-y-3 border-b bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='w-full min-w-0 space-y-1.5'>
              <DialogTitle className='flex items-center gap-3 text-2xl'>
                <Package className='h-7 w-7 text-primary/70' />
                <span className='truncate'>{pkg.spider_package_name}</span>
                <Badge
                  variant={
                    pkg.spider_package_enabled ? 'success' : 'destructive'
                  }
                  className='text-xs'
                >
                  {pkg.spider_package_enabled ? '启用' : '停用'}
                </Badge>
              </DialogTitle>
              <div className='flex w-full gap-3 pt-2'>
                <div className='flex flex-1 items-center gap-2'>
                  <FlagIcon className='h-3.5 w-3.5 shrink-0' />
                  <div className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{pkg.spider_package_slug}</span>
                    <span>ID: {pkg.spider_package_id}</span>
                  </div>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <UserRoundPlusIcon className='h-3.5 w-3.5 shrink-0' />
                  <div className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{pkg.created_by || '-'}</span>
                    <span>{compactTime(pkg.created_at)}</span>
                  </div>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <UserRoundPenIcon className='h-3.5 w-3.5 shrink-0' />
                  <div className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{pkg.updated_by || '-'}</span>
                    <span>{compactTime(pkg.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full' type='always'>
            <div className='space-y-6 p-6'>
              <div className='flex items-center gap-3 rounded-xl border bg-muted/30 p-4'>
                <div>
                  <p className='text-xs text-muted-foreground'>版本</p>
                  <Badge
                    variant='outline'
                    className='bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  >
                    {pkg.spider_package_version}
                  </Badge>
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-xs text-muted-foreground'>下载地址</p>
                  <a
                    href={pkg.spider_package_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400'
                  >
                    <span className='truncate'>{pkg.spider_package_url}</span>
                    <ExternalLinkIcon className='h-3 w-3 shrink-0' />
                  </a>
                </div>
              </div>

              {releaseCount > 0 && (
                <details className='group' open>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <BoxesIcon className='h-5 w-5 text-cyan-500' />
                    发布版本
                    <Badge variant='secondary' className='ml-auto'>
                      {releaseCount}
                    </Badge>
                    <ChevronDown className='ml-2 h-4 w-4 transition-transform group-open:rotate-180' />
                  </summary>
                  <div className='mt-4 space-y-2'>
                    {pkg.releases.map(
                      (r: SpiderPackageReleaseData, idx: number) => (
                        <a
                          key={r.release_id}
                          href={r.release_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50'
                        >
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant='outline'
                              className='bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            >
                              {r.release_version}
                            </Badge>
                            {r.is_prerelease && (
                              <Badge
                                variant='outline'
                                className='bg-amber-100 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              >
                                预发布
                              </Badge>
                            )}
                            {r.is_draft && (
                              <Badge
                                variant='outline'
                                className='bg-slate-100 text-xs text-slate-800 dark:bg-slate-900/30 dark:text-slate-300'
                              >
                                草稿
                              </Badge>
                            )}
                          </div>
                          <span className='text-xs text-muted-foreground'>
                            {idx === 0 ? '最新' : `#${idx + 1}`}
                          </span>
                        </a>
                      )
                    )}
                  </div>
                </details>
              )}

              {pkg.spider_package_readme && (
                <details className='group' open>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <FileText className='h-5 w-5 text-sky-500' />
                    说明文档
                    <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                  </summary>
                  <div
                    className='mt-4 rounded-xl border bg-card p-4'
                    data-color-mode={resolvedTheme}
                  >
                    <MDEditor.Markdown
                      source={pkg.spider_package_readme}
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </div>
                </details>
              )}

              {hasConfig && (
                <details className='group'>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <Braces className='h-5 w-5 text-fuchsia-500' />
                    配置信息
                    <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                  </summary>
                  <div className='mt-4 rounded-xl border bg-muted/30 p-4'>
                    <JsonView
                      value={pkg.spider_package_config}
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
