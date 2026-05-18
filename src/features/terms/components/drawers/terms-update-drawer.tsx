import React, { useState, useEffect, useLayoutEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import MDEditor from '@uiw/react-md-editor'
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
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useUpdateTermMutation, useTermQuery } from '../../api/terms'
import {
  TermUpdateSchema,
  type TermUpdateData,
  type TermItemData,
} from '../../data/schemas'

type TermUpdateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: TermItemData
}

function TermUpdateDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: TermUpdateDrawerProps) {
  const queryClient = useQueryClient()
  const { resolvedTheme } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)

  const { data: latestTerm, isLoading: isLatestDataLoading } = useTermQuery(
    currentRow?.term_id || 0
  )

  const [showEditors, setShowEditors] = useState(false)
  useLayoutEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setShowEditors(true))
      return () => cancelAnimationFrame(raf)
    }
    setShowEditors(false)
  }, [open])

  useEffect(() => {
    if (latestTerm && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestTerm.updated_at !== currentRow.updated_at
      if (hasChanged) {
        form.reset({
          term_name: latestTerm.term_name,
          term_slug: latestTerm.term_slug,
          term_collection: latestTerm.term_collection,
          term_readme: latestTerm.term_readme ?? '',
        })
        queryClient.invalidateQueries({ queryKey: ['terms'] })
      }
    }
  }, [latestTerm, currentRow, open, isLatestDataLoading, queryClient])

  const updateTermMutation = useUpdateTermMutation()

  const form = useForm<TermUpdateData>({
    resolver: zodResolver(TermUpdateSchema),
    defaultValues: currentRow
      ? {
          term_name: currentRow.term_name,
          term_slug: currentRow.term_slug,
          term_collection: currentRow.term_collection,
          term_readme: currentRow.term_readme ?? '',
        }
      : {
          term_name: '',
          term_slug: '',
          term_collection: [],
          term_readme: '',
        },
  })

  const onSubmit = async (data: TermUpdateData) => {
    if (!currentRow?.term_id) {
      console.error('缺少术语ID，无法更新')
      toast.error('缺少术语ID，无法更新')
      return
    }

    await updateTermMutation
      .mutateAsync({
        termId: currentRow.term_id,
        data,
      })
      .then((res) => {
        toast.success(`术语库 ${res.term_name} 更新成功`)
      })
      .catch((error) => {
        console.error(`术语库 ${currentRow.term_name} 更新失败:`, error)
        toast.error(`术语库 ${currentRow.term_name} 更新失败`)
      })

    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>编辑术语库</SheetTitle>
          <SheetDescription>
            {currentRow?.term_name} (ID:{currentRow?.term_id})
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='term-update-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <h4 className='text-sm font-bold'>基础设置</h4>
            <FormField
              control={form.control}
              name='term_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    术语库名称 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='术语库名称(强调可读性)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='term_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    术语标识 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='术语标识(字母、数字、连字符或下划线)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showEditors && (
              <>
                <h4 className='text-sm font-bold'>术语集合</h4>
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

                <h4 className='text-sm font-bold'>说明文档</h4>
                <FormField
                  control={form.control}
                  name='term_readme'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='pb-2 text-sm font-bold'>
                        术语库说明 (Markdown)
                      </FormLabel>
                      <FormControl data-color-mode={resolvedTheme}>
                        <MDEditor
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='term-update-form' type='submit'>
            更新术语库
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const TermUpdateDrawer = React.memo(TermUpdateDrawerContent)
