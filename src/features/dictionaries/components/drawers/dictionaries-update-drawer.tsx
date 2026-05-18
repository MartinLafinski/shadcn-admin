import React, { useState, useEffect, useLayoutEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import MDEditor from '@uiw/react-md-editor'
import { toast } from 'sonner'
import { useTheme } from '@/context/theme-provider'
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
import {
  useUpdateDictionaryMutation,
  useDictionaryQuery,
} from '../../api/dictionaries'
import {
  type DictionaryUpdateData,
  type DictionaryItemData,
  DictionaryUpdateSchema,
} from '../../data/schemas'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: DictionaryItemData
}

function DictionaryUpdateDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const queryClient = useQueryClient()
  const { resolvedTheme } = useTheme()
  const [showEditors, setShowEditors] = useState(false)
  useLayoutEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setShowEditors(true))
      return () => cancelAnimationFrame(raf)
    }
    setShowEditors(false)
  }, [open])

  const { data: latest, isLoading: isLatestLoading } = useDictionaryQuery(
    currentRow?.dictionary_id || 0
  )

  useEffect(() => {
    if (latest && currentRow && open && !isLatestLoading) {
      if (latest.updated_at !== currentRow.updated_at) {
        form.reset({
          dictionary_name: latest.dictionary_name,
          dictionary_slug: latest.dictionary_slug,
          dict_collection: latest.dict_collection,
          dictionary_readme: latest.dictionary_readme ?? '',
        })
        queryClient.invalidateQueries({ queryKey: ['dictionaries'] })
      }
    }
  }, [latest, currentRow, open, isLatestLoading, queryClient])

  const updateMutation = useUpdateDictionaryMutation()
  const form = useForm<DictionaryUpdateData>({
    resolver: zodResolver(DictionaryUpdateSchema),
    defaultValues: currentRow
      ? {
          dictionary_name: currentRow.dictionary_name,
          dictionary_slug: currentRow.dictionary_slug,
          dict_collection: currentRow.dict_collection,
          dictionary_readme: currentRow.dictionary_readme ?? '',
        }
      : {
          dictionary_name: '',
          dictionary_slug: '',
          dict_collection: {},
          dictionary_readme: '',
        },
  })

  const onSubmit = async (data: DictionaryUpdateData) => {
    if (!currentRow?.dictionary_id) {
      toast.error('缺少属性字典ID')
      return
    }
    await updateMutation
      .mutateAsync({ id: currentRow.dictionary_id, data })
      .then((res) => toast.success(`属性字典 ${res.dictionary_name} 更新成功`))
      .catch((error) => {
        console.error(`属性字典 ${currentRow.dictionary_name} 更新失败:`, error)
        toast.error(`属性字典 ${currentRow.dictionary_name} 更新失败`)
      })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>编辑属性字典</SheetTitle>
          <SheetDescription>
            {currentRow?.dictionary_name} (ID:{currentRow?.dictionary_id})
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='dict-update-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <h4 className='text-sm font-bold'>基础设置</h4>
            <FormField
              control={form.control}
              name='dictionary_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    名称 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='属性字典名称' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='dictionary_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    标识 <span className='text-destructive'>*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='属性字典标识' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showEditors && (
              <>
                <h4 className='text-sm font-bold'>属性集合</h4>
                <FormField
                  control={form.control}
                  name='dict_collection'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-bold'>
                        属性集合 (JSON)
                      </FormLabel>
                      <FormControl data-color-mode={resolvedTheme}>
                        <CodeMirror
                          value={JSON.stringify(field.value ?? {}, null, 2)}
                          extensions={[json(), EditorView.lineWrapping]}
                          theme={
                            resolvedTheme === 'light' ? githubLight : githubDark
                          }
                          onChange={(val) => {
                            try {
                              field.onChange(JSON.parse(val))
                            } catch {
                              /* keep last valid */
                            }
                          }}
                          minHeight='200px'
                          basicSetup={{
                            lineNumbers: true,
                            foldGutter: true,
                            syntaxHighlighting: true,
                            bracketMatching: true,
                            closeBrackets: true,
                            autocompletion: true,
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <h4 className='text-sm font-bold'>说明文档</h4>
                <FormField
                  control={form.control}
                  name='dictionary_readme'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='pb-2 text-sm font-bold'>
                        说明 (Markdown)
                      </FormLabel>
                      <FormControl data-color-mode={resolvedTheme}>
                        <MDEditor
                          value={field.value ?? ''}
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
          <Button form='dict-update-form' type='submit'>
            更新属性字典
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const DictionaryUpdateDrawer = React.memo(DictionaryUpdateDrawerContent)
