import React, { useState, useEffect, useLayoutEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
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
import {
  usePatchDictionaryMutation,
  useDictionaryQuery,
} from '../../api/dictionaries'
import {
  type DictionaryConfigData,
  type DictionaryItemData,
  DictionaryConfigSchema,
} from '../../data/schemas'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: DictionaryItemData
}

function DictionaryConfigDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const queryClient = useQueryClient()
  const { resolvedTheme } = useTheme()
  const [showContent, setShowContent] = useState(false)
  useLayoutEffect(() => {
    if (open) {
      const raf = requestAnimationFrame(() => setShowContent(true))
      return () => cancelAnimationFrame(raf)
    }
    setShowContent(false)
  }, [open])

  const { data: latest, isLoading: isLatestLoading } = useDictionaryQuery(
    currentRow?.dictionary_id || 0
  )

  useEffect(() => {
    if (latest && currentRow && open && !isLatestLoading) {
      if (latest.updated_at !== currentRow.updated_at) {
        form.reset({
          dict_collection: latest.dict_collection,
          dictionary_readme: latest.dictionary_readme ?? '',
        })
        queryClient.invalidateQueries({ queryKey: ['dictionaries'] })
      }
    }
  }, [latest, currentRow, open, isLatestLoading, queryClient])

  const patchMutation = usePatchDictionaryMutation()
  const form = useForm<DictionaryConfigData>({
    resolver: zodResolver(DictionaryConfigSchema),
    defaultValues: currentRow
      ? {
          dict_collection: currentRow.dict_collection,
          dictionary_readme: currentRow.dictionary_readme ?? '',
        }
      : { dict_collection: {}, dictionary_readme: '' },
  })

  const onSubmit = async (data: DictionaryConfigData) => {
    if (!currentRow?.dictionary_id) {
      toast.error('缺少属性字典ID')
      return
    }
    await patchMutation
      .mutateAsync({ id: currentRow.dictionary_id, data })
      .then((res) =>
        toast.success(`属性字典 ${res.dictionary_name} 说明与配置编辑成功`)
      )
      .catch((error) => {
        console.error(
          `属性字典 ${currentRow.dictionary_name} 说明与配置编辑失败:`,
          error
        )
        toast.error(`属性字典 ${currentRow.dictionary_name} 说明与配置编辑失败`)
      })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>配置与说明</SheetTitle>
          <SheetDescription>
            {currentRow?.dictionary_name} (ID:{currentRow?.dictionary_id})
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='dict-config-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {showContent && (
              <>
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
                <ConfigReadmeField
                  form={form}
                  name='dictionary_readme'
                  label='说明 (Markdown)'
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
          <Button form='dict-config-form' type='submit'>
            保存配置
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const DictionaryConfigDrawer = React.memo(DictionaryConfigDrawerContent)
