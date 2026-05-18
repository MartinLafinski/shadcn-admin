import JsonView from '@uiw/react-json-view'
import { githubDarkTheme } from '@uiw/react-json-view/githubDark'
import { githubLightTheme } from '@uiw/react-json-view/githubLight'
import MDEditor from '@uiw/react-md-editor'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils.ts'
import { useTheme } from '@/context/theme-provider.tsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { levelLabels } from '@/features/prejobs/data/labels.tsx'
import { type PrejobItemData } from '../../data/schemas.ts'

interface PrejobsViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prejob: PrejobItemData | null
}

export function PrejobsViewDialog({
  open,
  onOpenChange,
  prejob,
}: PrejobsViewDialogProps) {
  const { resolvedTheme } = useTheme()

  if (!prejob) {
    return null
  }

  const levelLabel = levelLabels.find(
    (label) => label.value === prejob.prejob_level
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex h-[80vh] flex-col overflow-hidden p-0 sm:max-w-[80%]'>
        <DialogHeader className='shrink-0 p-6 pb-4'>
          <DialogTitle>{prejob.prejob_name} - 预备作业信息</DialogTitle>
          <DialogDescription>
            查看 {prejob.prejob_name} 预备作业的信息。
          </DialogDescription>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-hidden'>
          <ScrollArea className='h-full w-full' type={'always'}>
            <div className='space-y-6 px-6 pb-6'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>预备作业可用性</h4>
                  <div
                    className={cn(
                      'flex items-center gap-2 rounded-md border p-3',
                      prejob.prejob_enabled
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
                    )}
                  >
                    {prejob.prejob_enabled ? (
                      <>
                        <Check className='h-5 w-5 text-green-600 dark:text-green-400' />
                        <span className='font-medium text-green-700 dark:text-green-300'>
                          已启用
                        </span>
                      </>
                    ) : (
                      <>
                        <X className='h-5 w-5 text-red-600 dark:text-red-400' />
                        <span className='font-medium text-red-700 dark:text-red-300'>
                          已禁用
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>预备作业ID</h4>
                  <div
                    className='rounded-md border bg-background p-2 break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {prejob.prejob_id}
                  </div>
                </div>

                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>预备作业名称</h4>
                  <div
                    className='rounded-md border bg-background p-2 break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {prejob.prejob_name}
                  </div>
                </div>

                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>预备作业标识</h4>
                  <div
                    className='rounded-md border bg-background p-2 break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {prejob.prejob_slug}
                  </div>
                </div>

                <div className='space-y-2'>
                  <h4 className='text-sm font-medium'>优先级</h4>
                  <div
                    className='rounded-md border bg-background p-2 break-all'
                    data-color-mode={resolvedTheme}
                  >
                    {levelLabel ? levelLabel.label : prejob.prejob_level}
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>说明文档</h4>
                <div
                  className='rounded-md border bg-background p-4'
                  data-color-mode={resolvedTheme}
                >
                  <MDEditor.Markdown
                    source={prejob.prejob_readme}
                    style={{ backgroundColor: 'transparent' }}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <h4 className='text-sm font-medium'>配置信息</h4>
                <div className='rounded-md border bg-muted/50 p-4'>
                  <JsonView
                    value={prejob.prejob_config}
                    displayDataTypes={false}
                    displayObjectSize={true}
                    enableClipboard={true}
                    shortenTextAfterLength={0}
                    style={
                      resolvedTheme === 'light'
                        ? {
                            ...githubLightTheme,
                            backgroundColor: 'transparent',
                          }
                        : { ...githubDarkTheme, backgroundColor: 'transparent' }
                    }
                  />
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
