import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import MDEditor from '@uiw/react-md-editor'
import {
  Loader2,
  ChevronDown,
  FileText,
  Braces,
  FileCodeIcon,
  FlagIcon,
  UserRoundPlusIcon,
  UserRoundPenIcon,
} from 'lucide-react'
import { paramFormTypeLabels } from '@/lib/labels'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useParamFormQuery } from '../../api/param-forms'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  paramFormId: number
}

export function ParamFormsViewDialog({
  open,
  onOpenChange,
  paramFormId,
}: Props) {
  const { resolvedTheme } = useTheme()
  const { data: pf, isLoading, isError } = useParamFormQuery(paramFormId)

  if (isLoading)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-3xl'>
          <DialogTitle className='sr-only'>加载中...</DialogTitle>
          <div className='flex h-64 items-center justify-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            <span className='text-muted-foreground'>加载参数要素数据...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  if (isError || !pf)
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-md'>
          <DialogTitle className='sr-only'>加载失败</DialogTitle>
          <div className='flex h-32 items-center justify-center'>
            <p className='text-muted-foreground'>无法加载参数要素数据</p>
          </div>
        </DialogContent>
      </Dialog>
    )

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] w-full max-w-3xl flex-col gap-0 space-y-0 overflow-hidden p-0'>
        <DialogHeader className='shrink-0 space-y-3 border-b bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='w-full min-w-0 space-y-1.5'>
              <DialogTitle className='flex items-center gap-3 text-2xl'>
                <FileCodeIcon className='h-7 w-7 text-primary/70' />
                <span className='truncate'>{pf.param_form_name}</span>
                <Badge
                  variant={pf.param_form_enabled ? 'success' : 'destructive'}
                  className='text-xs'
                >
                  {pf.param_form_enabled ? '启用' : '停用'}
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
                    <span>{pf.param_form_slug}</span>
                    <span>ID: {pf.param_form_id}</span>
                  </p>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <p>
                    <UserRoundPlusIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{pf.created_by || '-'}</span>
                    <span>{compactTime(pf.created_at)}</span>
                  </p>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <p>
                    <UserRoundPenIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span>{pf.updated_by || '-'}</span>
                    <span>{compactTime(pf.updated_at)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full' type='always'>
            <div className='space-y-6 p-6'>
              {(() => {
                const typeLabel = paramFormTypeLabels.find(
                  (l) => l.value === pf.param_type
                )
                if (typeLabel) {
                  const TypeIcon = typeLabel.icon
                  return (
                    <div
                      className={cn(
                        'flex items-center gap-2 rounded-xl border bg-muted/30 p-4',
                        typeLabel.className
                      )}
                    >
                      <TypeIcon className='h-5 w-5' />
                      <span className='rounded px-2 py-0.5 text-base'>
                        {typeLabel.label}
                      </span>
                      <code className='text-xs text-muted-foreground'>
                        [{pf.param_type}]
                      </code>
                    </div>
                  )
                }
                return null
              })()}
              <details className='group' open>
                <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                  <Braces className='h-5 w-5 text-amber-500' />
                  JSON Schema
                  <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                </summary>
                <div className='mt-4 rounded-xl border bg-muted/30 p-4'>
                  <JsonView
                    value={pf.param_json_schema}
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
              {pf.param_ui_schema &&
                Object.keys(pf.param_ui_schema).length > 0 && (
                  <details className='group' open>
                    <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                      <FileCodeIcon className='h-5 w-5 text-blue-500' />
                      UI Schema
                      <ChevronDown className='ml-auto h-4 w-4 transition-transform group-open:rotate-180' />
                    </summary>
                    <div className='mt-4 rounded-xl border bg-muted/30 p-4'>
                      <JsonView
                        value={pf.param_ui_schema}
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
              {pf.param_readme && (
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
                      source={pf.param_readme}
                      style={{ backgroundColor: 'transparent' }}
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
