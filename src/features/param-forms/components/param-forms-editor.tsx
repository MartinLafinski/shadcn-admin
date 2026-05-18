import { useState, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import Form from '@rjsf/shadcn'
import validator from '@rjsf/validator-ajv8'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import { JsonEditor, githubDarkTheme, githubLightTheme } from 'json-edit-react'
import { ArrowLeftIcon, SaveIcon } from 'lucide-react'
import { toast } from 'sonner'
import { paramFormTypeLabels } from '@/lib/labels'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Form as FormUI,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import {
  useCreateParamFormMutation,
  useUpdateParamFormMutation,
} from '../api/param-forms'
import {
  ParamFormCreateSchema,
  type ParamFormCreateData,
  type ParamFormItemData,
} from '../data/schemas'

function safeParseJSON(raw: string) {
  try {
    const parsed = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function PanelLabel({
  label,
  error,
}: {
  label: string
  error?: string | null
}) {
  return (
    <div className='flex items-center justify-between border-b px-3 py-1.5'>
      <span className='text-xs font-medium text-muted-foreground'>{label}</span>
      {error && (
        <span className='ml-2 truncate text-xs text-destructive'>{error}</span>
      )}
    </div>
  )
}

type ParamFormsEditorProps = {
  mode: 'create' | 'edit'
  paramFormId?: number
  initialData?: ParamFormItemData
}

export function ParamFormsEditor({
  mode,
  paramFormId,
  initialData,
}: ParamFormsEditorProps) {
  const { resolvedTheme } = useTheme()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const createMutation = useCreateParamFormMutation()
  const updateMutation = useUpdateParamFormMutation()

  const [formData, setFormData] = useState<Record<string, unknown>>({})

  const defaultValues = useMemo(() => {
    if (mode === 'edit' && initialData) {
      return {
        param_form_name: initialData.param_form_name,
        param_form_slug: initialData.param_form_slug,
        param_json_schema: initialData.param_json_schema,
        param_ui_schema: initialData.param_ui_schema || {},
        param_type: initialData.param_type || 'unknown:unknown',
        param_readme: initialData.param_readme || '',
      }
    }
    return {
      param_form_name: '',
      param_form_slug: '',
      param_json_schema: {},
      param_ui_schema: {},
      param_type: 'unknown:unknown',
      param_readme: '',
    }
  }, [mode, initialData])

  const rhfForm = useForm<ParamFormCreateData>({
    resolver: zodResolver(ParamFormCreateSchema),
    defaultValues,
  })

  const jsonSchemaValue = rhfForm.watch('param_json_schema')
  const uiSchemaValue = rhfForm.watch('param_ui_schema')

  const jsonSchemaRaw = useMemo(
    () => JSON.stringify(jsonSchemaValue || {}, null, 2),
    [jsonSchemaValue]
  )
  const uiSchemaRaw = useMemo(
    () => JSON.stringify(uiSchemaValue || {}, null, 2),
    [uiSchemaValue]
  )

  const parsedSchema = useMemo(
    () => safeParseJSON(jsonSchemaRaw),
    [jsonSchemaRaw]
  )
  const parsedUiSchema = useMemo(
    () => safeParseJSON(uiSchemaRaw),
    [uiSchemaRaw]
  )

  const schemaError = useMemo(() => {
    try {
      const parsed = JSON.parse(jsonSchemaRaw)
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return 'Schema 必须是一个 JSON 对象'
      }
      return null
    } catch (e) {
      return `JSON 解析错误: ${(e as Error).message}`
    }
  }, [jsonSchemaRaw])

  const uiSchemaError = useMemo(() => {
    try {
      const parsed = JSON.parse(uiSchemaRaw)
      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        Array.isArray(parsed)
      ) {
        return 'UI Schema 必须是一个 JSON 对象'
      }
      return null
    } catch (e) {
      return `JSON 解析错误: ${(e as Error).message}`
    }
  }, [uiSchemaRaw])

  const handleFormChange = useCallback(
    ({ formData: data }: { formData?: Record<string, unknown> }) => {
      setFormData(data || {})
    },
    []
  )

  const codeMirrorExtensions = useMemo(
    () => [json(), EditorView.lineWrapping],
    []
  )
  const codeMirrorTheme = resolvedTheme === 'light' ? githubLight : githubDark
  const jsonEditorTheme =
    resolvedTheme === 'light' ? githubLightTheme : githubDarkTheme

  const isPending = createMutation.isPending || updateMutation.isPending

  const onSubmit = async (data: ParamFormCreateData) => {
    try {
      if (mode === 'create') {
        const result = await createMutation.mutateAsync(data)
        toast.success(`参数要素 ${result.param_form_name} 创建成功`)
        navigate({ to: '/param-forms' })
      } else if (mode === 'edit' && paramFormId) {
        await updateMutation.mutateAsync({ paramFormId, data })
        toast.success(`参数要素 ${data.param_form_name} 更新成功`)
      }
      queryClient.invalidateQueries({ queryKey: ['paramForms'] })
    } catch {
      toast.error(mode === 'create' ? '参数要素创建失败' : '参数要素更新失败')
    }
  }

  return (
    <>
      <Header fixed>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' asChild>
            <Link to='/param-forms'>
              <ArrowLeftIcon className='mr-1 h-4 w-4' />
              返回列表
            </Link>
          </Button>
          <div className='h-4 w-px bg-border' />
          <h2 className='text-lg font-semibold tracking-tight'>
            {mode === 'create' ? '创建参数要素' : '编辑参数要素'}
          </h2>
        </div>
        <div className='ms-auto flex items-center space-x-4 max-sm:space-x-0'>
          <ThemeSwitch />
          <ConfigDrawer />
          <UserMenu />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-3 sm:gap-4'>
        <FormUI {...rhfForm}>
          <form
            id='param-forms-editor-form'
            onSubmit={rhfForm.handleSubmit(onSubmit, (errors) => {
              console.error('表单校验未通过:', errors)
            })}
            noValidate
            className='flex flex-1 flex-col gap-3 sm:gap-4'
          >
            <ResizablePanelGroup
              orientation='horizontal'
              className='flex-1 rounded-lg border bg-card'
            >
              <ResizablePanel defaultSize={40} minSize={20}>
                <ResizablePanelGroup orientation='vertical'>
                  <ResizablePanel defaultSize={50} minSize={20}>
                    <div className='flex h-full flex-col'>
                      <PanelLabel label='Data Schema' error={schemaError} />
                      <div className='flex-1 overflow-hidden'>
                        <ScrollArea className='h-full'>
                          <FormField
                            control={rhfForm.control}
                            name='param_json_schema'
                            render={({ field }) => (
                              <FormControl data-color-mode={resolvedTheme}>
                                <CodeMirror
                                  extensions={codeMirrorExtensions}
                                  value={jsonSchemaRaw}
                                  onChange={(val) => {
                                    try {
                                      field.onChange(JSON.parse(val))
                                    } catch {
                                      field.onChange(val)
                                    }
                                  }}
                                  theme={codeMirrorTheme}
                                  minHeight='200px'
                                  basicSetup={{
                                    lineNumbers: true,
                                    highlightActiveLineGutter: true,
                                    foldGutter: true,
                                    syntaxHighlighting: true,
                                    bracketMatching: true,
                                    closeBrackets: true,
                                    autocompletion: true,
                                  }}
                                />
                              </FormControl>
                            )}
                          />
                        </ScrollArea>
                      </div>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle orientation='horizontal' />

                  <ResizablePanel defaultSize={50} minSize={20}>
                    <ResizablePanelGroup orientation='horizontal'>
                      <ResizablePanel defaultSize={50} minSize={20}>
                        <div className='flex h-full flex-col'>
                          <PanelLabel label='UI Schema' error={uiSchemaError} />
                          <div className='flex-1 overflow-hidden'>
                            <ScrollArea className='h-full'>
                              <FormField
                                control={rhfForm.control}
                                name='param_ui_schema'
                                render={({ field }) => (
                                  <FormControl data-color-mode={resolvedTheme}>
                                    <CodeMirror
                                      extensions={codeMirrorExtensions}
                                      value={uiSchemaRaw}
                                      onChange={(val) => {
                                        try {
                                          field.onChange(JSON.parse(val))
                                        } catch {
                                          field.onChange(val)
                                        }
                                      }}
                                      theme={codeMirrorTheme}
                                      minHeight='150px'
                                      basicSetup={{
                                        lineNumbers: true,
                                        highlightActiveLineGutter: true,
                                        foldGutter: true,
                                        syntaxHighlighting: true,
                                        bracketMatching: true,
                                        closeBrackets: true,
                                        autocompletion: true,
                                      }}
                                    />
                                  </FormControl>
                                )}
                              />
                            </ScrollArea>
                          </div>
                        </div>
                      </ResizablePanel>

                      <ResizableHandle orientation='vertical' />

                      <ResizablePanel defaultSize={50} minSize={20}>
                        <div className='flex h-full flex-col'>
                          <PanelLabel label='输出数据' />
                          <div className='flex-1 overflow-hidden'>
                            <ScrollArea className='h-full'>
                              <JsonEditor
                                rootFontSize={12}
                                data={formData}
                                theme={jsonEditorTheme}
                                restrictEdit
                                restrictAdd
                                restrictDelete
                                restrictTypeSelection
                                rootName='formData'
                              />
                            </ScrollArea>
                          </div>
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>

              <ResizableHandle orientation='vertical' />

              <ResizablePanel defaultSize={30} minSize={25}>
                <div className='flex h-full flex-col'>
                  <PanelLabel label='表单预览' />
                  <div className='flex-1 overflow-hidden p-4'>
                    <ScrollArea className='h-full'>
                      {parsedSchema ? (
                        <Form
                          tagName='div'
                          schema={parsedSchema}
                          uiSchema={parsedUiSchema || undefined}
                          validator={validator}
                          formData={formData}
                          onChange={handleFormChange}
                        />
                      ) : (
                        <div className='flex h-64 items-center justify-center text-muted-foreground'>
                          {schemaError ? (
                            <p className='text-destructive'>{schemaError}</p>
                          ) : (
                            <p>请在左侧输入有效的 JSON Schema</p>
                          )}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle orientation='vertical' />

              <ResizablePanel defaultSize={30} minSize={20}>
                <div className='flex h-full flex-col'>
                  <PanelLabel label='参数要素包' />
                  <ScrollArea className='flex-1'>
                    <div className='flex flex-col gap-4 p-4'>
                      <FormField
                        control={rhfForm.control}
                        name='param_form_name'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>要素包名称</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='请输入要素包名称'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={rhfForm.control}
                        name='param_form_slug'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>要素包标识</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder='字母、数字、连字符或下划线'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={rhfForm.control}
                        name='param_type'
                        render={({ field }) => {
                          const selectedLabel = paramFormTypeLabels.find(
                            (o) => o.value === field.value
                          )
                          return (
                            <FormItem>
                              <FormLabel>要素包类型</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue>
                                      {field.value
                                        ? (selectedLabel?.label ?? field.value)
                                        : '请选择要素包类型'}
                                    </SelectValue>
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {paramFormTypeLabels.map((item) => (
                                    <SelectItem
                                      key={item.value}
                                      value={item.value}
                                    >
                                      <span className='flex items-center gap-2'>
                                        <item.icon className='h-4 w-4' />
                                        {item.label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )
                        }}
                      />

                      <FormField
                        control={rhfForm.control}
                        name='param_readme'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>要素包说明</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder='Markdown 格式的说明文本...'
                                rows={6}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type='submit'
                        disabled={isPending}
                        className='w-full'
                      >
                        <SaveIcon className='mr-2 h-4 w-4' />
                        {isPending
                          ? '保存中...'
                          : mode === 'create'
                            ? '创建'
                            : '更新'}
                      </Button>
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </form>
        </FormUI>
      </Main>
    </>
  )
}
