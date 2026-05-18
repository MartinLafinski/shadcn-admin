import MDEditor from '@uiw/react-md-editor'
import {
  LibraryBigIcon,
  ChevronDown,
  Loader2,
  FileText,
  FlagIcon,
  UserRoundPlusIcon,
  UserRoundPenIcon,
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
import { useTermQuery } from '../../api/terms'

interface TermsViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  termId: number
}

export function TermsViewDialog({
  open,
  onOpenChange,
  termId,
}: TermsViewDialogProps) {
  const { resolvedTheme } = useTheme()
  const { data: term, isLoading, isError } = useTermQuery(termId)

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-3xl'>
          <DialogTitle className='sr-only'>加载中...</DialogTitle>
          <DialogDescription className='sr-only'>
            正在获取术语库数据
          </DialogDescription>
          <div className='flex h-64 items-center justify-center gap-2'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
            <span className='text-muted-foreground'>加载术语库数据...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (isError || !term) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='min-h-[30vh] max-w-md'>
          <DialogTitle className='sr-only'>加载失败</DialogTitle>
          <DialogDescription className='sr-only'>
            无法加载术语库数据，请稍后重试
          </DialogDescription>
          <div className='flex h-32 items-center justify-center'>
            <p className='text-muted-foreground'>无法加载术语库数据</p>
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

  const collection = term.term_collection ?? []
  const DISPLAYED_TERMS = 10

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[92vh] w-full max-w-3xl flex-col gap-0 space-y-0 overflow-hidden p-0'>
        <DialogHeader className='shrink-0 space-y-3 border-b bg-gradient-to-r from-primary/5 via-transparent to-transparent px-6 py-5'>
          <div className='flex items-start justify-between gap-4'>
            <div className='w-full min-w-0 space-y-1.5'>
              <DialogTitle className='flex items-center gap-3 text-2xl'>
                <LibraryBigIcon className='h-7 w-7 text-primary/70' />
                <span className='truncate'>{term.term_name}</span>
                <Badge
                  variant={term.term_enabled ? 'success' : 'destructive'}
                  className='text-xs'
                >
                  {term.term_enabled ? '启用' : '停用'}
                </Badge>
              </DialogTitle>
              <div className='flex flex-wrap items-center gap-3 pt-2'>
                <div className='flex items-center gap-2'></div>
              </div>
              <div className='flex w-full gap-3 pt-2'>
                <div className='flex flex-1 items-center gap-2'>
                  <p>
                    <FlagIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span className=''>{term.term_slug}</span>
                    <span className=''>ID: {term.term_id}</span>
                  </p>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <p>
                    <UserRoundPlusIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span className=''>{term.created_by || '-'}</span>
                    <span className=''>{compactTime(term.created_at)}</span>
                  </p>
                </div>
                <div className='flex flex-1 items-center gap-2 border-l pl-4'>
                  <p>
                    <UserRoundPenIcon className='h-3.5 w-3.5' />
                  </p>
                  <p className='flex flex-col gap-0 text-xs text-muted-foreground'>
                    <span className=''>{term.updated_by || '-'}</span>
                    <span className=''>{compactTime(term.updated_at)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full' type='always'>
            <div className='space-y-6 p-6'>
              {collection.length > 0 && (
                <details className='group' open>
                  <summary className='flex cursor-pointer items-center gap-2 text-base font-semibold transition-colors hover:text-primary'>
                    <LibraryBigIcon className='h-5 w-5 text-amber-500' />
                    术语集合
                    <Badge variant='secondary' className='ml-auto'>
                      {collection.length}
                    </Badge>
                    <ChevronDown className='ml-2 h-4 w-4 transition-transform group-open:rotate-180' />
                  </summary>
                  <div className='mt-4 grid grid-cols-2 gap-2'>
                    {collection.slice(0, DISPLAYED_TERMS).map((item, idx) => (
                      <div
                        key={idx}
                        className='rounded-lg border bg-muted/30 px-3 py-2 font-mono text-sm'
                      >
                        {item}
                      </div>
                    ))}
                    {collection.length > DISPLAYED_TERMS && (
                      <div className='rounded-lg border bg-muted/30 px-3 py-2 font-mono text-sm text-muted-foreground'>
                        +{collection.length - DISPLAYED_TERMS} 项
                      </div>
                    )}
                  </div>
                </details>
              )}

              {term.term_readme && (
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
                      source={term.term_readme}
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
