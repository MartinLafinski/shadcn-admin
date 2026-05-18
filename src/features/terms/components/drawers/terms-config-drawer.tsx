import React, { useState, useEffect, useLayoutEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import { Maximize2Icon, Minimize2Icon } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/context/theme-provider.tsx'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ConfigReadmeField } from '@/components/smart/configs'
import { usePatchTermMutation, useTermQuery } from '../../api/terms'
import {
  TermConfigSchema,
  type TermConfigData,
  type TermItemData,
} from '../../data/schemas'

type TermConfigDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: TermItemData
}

function TermConfigDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: TermConfigDrawerProps) {
  const queryClient = useQueryClient()
  const { resolvedTheme } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { data: latestTerm, isLoading: isLatestDataLoading } = useTermQuery(
    currentRow?.term_id || 0
  )

  const [showContent, setShowContent] = useState(false)
  useLayoutEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setShowContent(true))
      return () => cancelAnimationFrame(raf)
    }
    setShowContent(false)
  }, [open])

  useEffect(() => {
    if (latestTerm && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestTerm.updated_at !== currentRow.updated_at
      if (hasChanged) {
        form.reset({
          term_collection: latestTerm.term_collection,
          term_readme: latestTerm.term_readme ?? '',
        })
        queryClient.invalidateQueries({ queryKey: ['terms'] })
      }
    }
  }, [latestTerm, currentRow, open, isLatestDataLoading, queryClient])

  const patchTermMutation = usePatchTermMutation()

  const form = useForm<TermConfigData>({
    resolver: zodResolver(TermConfigSchema),
    defaultValues: currentRow
      ? {
          term_collection: currentRow.term_collection,
          term_readme: currentRow.term_readme ?? '',
        }
      : {
          term_collection: [],
          term_readme: '',
        },
  })

  const onSubmit = async (data: TermConfigData) => {
    if (!currentRow?.term_id) {
      console.error('缺少术语ID，无法配置')
      toast.error('缺少术语ID，无法配置')
      return
    }

    await patchTermMutation
      .mutateAsync({
        termId: currentRow.term_id,
        data,
      })
      .then((res) => {
        toast.success(`术语库 ${res.term_name} 说明与配置编辑成功`)
      })
      .catch((error) => {
        console.error(
          `术语库 ${currentRow.term_name} 说明与配置编辑失败:`,
          error
        )
        toast.error(`术语库 ${currentRow.term_name} 说明与配置编辑失败`)
      })

    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>配置与说明</SheetTitle>
          <SheetDescription>
            {currentRow?.term_name} (ID:{currentRow?.term_id})
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='term-config-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {showContent && (
              <>
                <FormField
                  control={form.control}
                  name='term_collection'
                  render={({ field }) => (
                    <FormItem
                      className={
                        isFullscreen
                          ? 'fixed inset-0 z-50 m-0 flex !h-screen !w-screen flex-col overflow-hidden rounded-none border-0 bg-background'
                          : ''
                      }
                    >
                      <div className='flex flex-shrink-0 items-center justify-between'>
                        <FormLabel className='text-sm font-bold'>
                          术语集合 (每行一个术语)
                        </FormLabel>
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className='h-8 w-8 p-0'
                        >
                          {isFullscreen ? (
                            <Minimize2Icon className='h-4 w-4' />
                          ) : (
                            <Maximize2Icon className='h-4 w-4' />
                          )}
                        </Button>
                      </div>
                      <FormControl>
                        <CodeMirror
                          value={(field.value ?? []).join('\n')}
                          onChange={(value) => {
                            const lines = value.split('\n')
                            const filteredLines = lines.filter(
                              (item, index) => {
                                if (item.trim() !== '') return true
                                if (index === lines.length - 1) return true
                                return false
                              }
                            )
                            field.onChange(filteredLines)
                          }}
                          theme={
                            resolvedTheme === 'light' ? githubLight : githubDark
                          }
                          height={isFullscreen ? '100%' : '200px'}
                          minHeight='200px'
                        />
                      </FormControl>
                      <FormMessage className='flex-shrink-0' />
                    </FormItem>
                  )}
                />

                <ConfigReadmeField
                  form={form}
                  name='term_readme'
                  label='术语库说明 (Markdown)'
                  resolvedTheme={resolvedTheme}
                />
              </>
            )}
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='term-config-form' type='submit'>
            保存配置
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const TermConfigDrawer = React.memo(TermConfigDrawerContent)
