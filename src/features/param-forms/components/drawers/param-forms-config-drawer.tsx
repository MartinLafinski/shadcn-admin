import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react'
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
  usePatchParamFormMutation,
  useParamFormQuery,
} from '../../api/param-forms'
import {
  type ParamFormPatchData,
  type ParamFormItemData,
  ParamFormPatchSchema,
} from '../../data/schemas'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: ParamFormItemData
}

function ParamFormConfigDrawerContent({
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

  const { data: latest, isLoading: isLatestLoading } = useParamFormQuery(
    currentRow?.param_form_id || 0
  )

  useEffect(() => {
    if (
      latest &&
      currentRow &&
      open &&
      !isLatestLoading &&
      latest.updated_at !== currentRow.updated_at
    ) {
      form.reset({
        param_json_schema: latest.param_json_schema,
        param_ui_schema: latest.param_ui_schema,
        param_readme: latest.param_readme ?? '',
      })
      queryClient.invalidateQueries({ queryKey: ['paramForms'] })
    }
  }, [latest, currentRow, open, isLatestLoading, queryClient])

  const patchMutation = usePatchParamFormMutation()
  const form = useForm<ParamFormPatchData>({
    resolver: zodResolver(ParamFormPatchSchema),
    defaultValues: currentRow
      ? {
          param_json_schema: currentRow.param_json_schema,
          param_ui_schema: currentRow.param_ui_schema,
          param_readme: currentRow.param_readme ?? '',
        }
      : { param_json_schema: {}, param_ui_schema: {}, param_readme: '' },
  })

  const codeMirrorExtensions = useMemo(
    () => [json(), EditorView.lineWrapping],
    []
  )
  const codeMirrorTheme = resolvedTheme === 'light' ? githubLight : githubDark

  const onSubmit = async (data: ParamFormPatchData) => {
    if (!currentRow?.param_form_id) {
      toast.error('缺少参数要素ID')
      return
    }
    await patchMutation
      .mutateAsync({ paramFormId: currentRow.param_form_id, data })
      .then((res) =>
        toast.success(`参数要素 ${res.param_form_name} 说明与配置编辑成功`)
      )
      .catch((error) => {
        console.error(
          `参数要素 ${currentRow.param_form_name} 说明与配置编辑失败:`,
          error
        )
        toast.error(`参数要素 ${currentRow.param_form_name} 说明与配置编辑失败`)
      })
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>配置与说明</SheetTitle>
          <SheetDescription>
            {currentRow?.param_form_name} (ID:{currentRow?.param_form_id})
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='pf-config-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {showContent && (
              <>
                <FormField
                  control={form.control}
                  name='param_json_schema'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-bold'>
                        JSON Schema
                      </FormLabel>
                      <FormControl data-color-mode={resolvedTheme}>
                        <CodeMirror
                          value={JSON.stringify(field.value ?? {}, null, 2)}
                          extensions={codeMirrorExtensions}
                          theme={codeMirrorTheme}
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
                <FormField
                  control={form.control}
                  name='param_ui_schema'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-sm font-bold'>
                        UI Schema
                      </FormLabel>
                      <FormControl data-color-mode={resolvedTheme}>
                        <CodeMirror
                          value={JSON.stringify(field.value ?? {}, null, 2)}
                          extensions={codeMirrorExtensions}
                          theme={codeMirrorTheme}
                          onChange={(val) => {
                            try {
                              field.onChange(JSON.parse(val))
                            } catch {
                              /* keep last valid */
                            }
                          }}
                          minHeight='150px'
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
                  name='param_readme'
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
          <Button form='pf-config-form' type='submit'>
            保存配置
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export const ParamFormConfigDrawer = React.memo(ParamFormConfigDrawerContent)
