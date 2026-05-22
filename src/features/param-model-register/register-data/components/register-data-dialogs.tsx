import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import { JsonEditor, githubDarkTheme, githubLightTheme } from 'json-edit-react'
import { toast } from 'sonner'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ParamFormRenderer } from '@/components/smart/param-form-renderer'
import { useParamFormBySlugQuery } from '@/features/param-forms/api/param-forms'
import { useWriteRegisterDataMutation } from '../../api/param-model-register'
import {
  WriteRegisterDataSchema,
  type WriteRegisterData,
} from '../../data/schemas'

interface RegisterDataWriteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registerId: number
  paramFormSlug: string | undefined
}

export function RegisterDataWriteDialog({
  open,
  onOpenChange,
  registerId,
  paramFormSlug,
}: RegisterDataWriteDialogProps) {
  const { resolvedTheme } = useTheme()
  const writeMutation = useWriteRegisterDataMutation()

  const hasParamForm = !!paramFormSlug
  const { data: paramForm } = useParamFormBySlugQuery(
    hasParamForm ? paramFormSlug : undefined
  )
  const [paramFormData, setParamFormData] = useState<Record<string, unknown>>(
    {}
  )

  const [activeTab, setActiveTab] = useState<string>(
    hasParamForm ? 'form' : 'raw'
  )

  const form = useForm<WriteRegisterData>({
    resolver: zodResolver(WriteRegisterDataSchema),
    defaultValues: {
      key: '',
      data: {},
    },
  })

  const onSubmit = async (data: WriteRegisterData) => {
    await writeMutation
      .mutateAsync({ registerId, data })
      .then(() => {
        toast.success('数据写入成功')
        onOpenChange(false)
        form.reset()
        setParamFormData({})
      })
      .catch(() => toast.error('数据写入失败'))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl'>
        <DialogHeader className='shrink-0 px-6 pt-6 pb-4'>
          <DialogTitle>写入数据</DialogTitle>
          <DialogDescription>向参数模型集写入新的数据条目</DialogDescription>
        </DialogHeader>

        <div className='min-h-0 flex-1 overflow-y-auto px-6'>
          <Form {...form}>
            <form
              id='write-data-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='key'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      数据键值 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='数据键值' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='form' disabled={!hasParamForm}>
                    表单输入
                  </TabsTrigger>
                  <TabsTrigger value='raw'>原始JSON</TabsTrigger>
                </TabsList>

                <TabsContent value='form' className='space-y-4 pt-4'>
                  {paramForm ? (
                    <ParamFormRenderer
                      paramFormData={paramForm}
                      formData={paramFormData}
                      onChange={(data) => {
                        setParamFormData(data)
                        form.setValue('data', data)
                      }}
                    />
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      加载参数要素包表单中...
                    </p>
                  )}
                </TabsContent>

                <TabsContent value='raw' className='pt-4'>
                  <FormField
                    control={form.control}
                    name='data'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>数据内容 (JSON)</FormLabel>
                        <FormControl>
                          <div className='h-full overflow-hidden rounded-md border bg-muted/30 p-3'>
                            <ScrollArea
                              className='h-[360px] w-full max-w-full'
                              type='always'
                            >
                              <JsonEditor
                                data={field.value}
                                setData={field.onChange}
                                rootFontSize={13}
                                theme={
                                  resolvedTheme === 'light'
                                    ? githubLightTheme
                                    : githubDarkTheme
                                }
                                minWidth='100%'
                                maxWidth='100%'
                                TextEditor={(props) => (
                                  <CodeMirror
                                    {...props}
                                    theme={
                                      resolvedTheme === 'light'
                                        ? githubLight
                                        : githubDark
                                    }
                                    extensions={[
                                      json(),
                                      EditorView.lineWrapping,
                                    ]}
                                    height='360px'
                                  />
                                )}
                              />
                              <ScrollBar orientation='horizontal' />
                            </ScrollArea>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>

        <DialogFooter className='shrink-0 px-6 pb-6'>
          <Button
            form='write-data-form'
            type='submit'
            disabled={writeMutation.isPending}
          >
            {writeMutation.isPending ? '写入中...' : '写入'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
