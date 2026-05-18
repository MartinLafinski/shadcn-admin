import { useState, useCallback, useMemo } from 'react'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import Form from '@rjsf/shadcn'
import validator from '@rjsf/validator-ajv8'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import { JsonEditor, githubDarkTheme, githubLightTheme } from 'json-edit-react'
import { useTheme } from '@/context/theme-provider'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { FormMetaPanel, PanelLabel } from './components/form-meta-panel'

const DEFAULT_SCHEMA = `{
  "title": "用户注册表单",
  "type": "object",
  "required": ["username", "email", "password"],
  "properties": {
    "username": {
      "type": "string",
      "title": "用户名",
      "minLength": 3
    },
    "email": {
      "type": "string",
      "title": "邮箱",
      "format": "email"
    },
    "password": {
      "type": "string",
      "title": "密码",
      "minLength": 6
    },
    "age": {
      "type": "integer",
      "title": "年龄",
      "minimum": 0,
      "maximum": 150
    },
    "bio": {
      "type": "string",
      "title": "个人简介"
    },
    "gender": {
      "type": "string",
      "title": "性别",
      "enum": ["male", "female", "other"],
      "enumNames": ["男", "女", "其他"]
    },
    "subscribe": {
      "type": "boolean",
      "title": "订阅邮件通知",
      "default": true
    }
  }
}`

const DEFAULT_UI_SCHEMA = `{
  "bio": {
    "ui:widget": "textarea",
    "ui:placeholder": "请输入个人简介..."
  },
  "password": {
    "ui:help": "密码长度至少6位"
  },
  "ui:submitButtonOptions": {
    "submitText": "注册"
  }
}`

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

function FormBuilderContent() {
  const { resolvedTheme } = useTheme()

  const [rawSchema, setRawSchema] = useState(DEFAULT_SCHEMA)
  const [rawUiSchema, setRawUiSchema] = useState(DEFAULT_UI_SCHEMA)
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  const schema = useMemo(() => safeParseJSON(rawSchema), [rawSchema])
  const uiSchema = useMemo(() => safeParseJSON(rawUiSchema), [rawUiSchema])

  const handleSchemaChange = useCallback((value: string) => {
    setRawSchema(value)
  }, [])

  const handleUiSchemaChange = useCallback((value: string) => {
    setRawUiSchema(value)
  }, [])

  const handleFormChange = useCallback(
    ({ formData }: { formData?: Record<string, unknown> }) => {
      setFormData(formData || {})
    },
    []
  )

  const codeMirrorTheme = resolvedTheme === 'light' ? githubLight : githubDark
  const jsonEditorTheme =
    resolvedTheme === 'light' ? githubLightTheme : githubDarkTheme

  const schemaError = useMemo(() => {
    try {
      const parsed = JSON.parse(rawSchema)
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
  }, [rawSchema])

  const uiSchemaError = useMemo(() => {
    try {
      const parsed = JSON.parse(rawUiSchema)
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
  }, [rawUiSchema])

  const codeMirrorExtensions = useMemo(
    () => [json(), EditorView.lineWrapping],
    []
  )

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4 max-sm:space-x-0'>
          <ThemeSwitch />
          <ConfigDrawer />
          <UserMenu />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-3 sm:gap-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>表单构建</h2>
          <p className='text-muted-foreground'>
            通过 JSON Schema 动态生成表单，实时预览效果
          </p>
        </div>

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
                      <CodeMirror
                        extensions={codeMirrorExtensions}
                        value={rawSchema}
                        onChange={handleSchemaChange}
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
                          <CodeMirror
                            extensions={codeMirrorExtensions}
                            value={rawUiSchema}
                            onChange={handleUiSchemaChange}
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
                  {schema ? (
                    <Form
                      tagName='div'
                      schema={schema}
                      uiSchema={uiSchema || undefined}
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
            <FormMetaPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </Main>
    </>
  )
}

export function FormBuilder() {
  return <FormBuilderContent />
}
