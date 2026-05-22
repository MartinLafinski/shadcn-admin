import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import MDEditor from '@uiw/react-md-editor'
import { JsonEditor, githubDarkTheme, githubLightTheme } from 'json-edit-react'
import { Maximize2Icon, Minimize2Icon, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@/context/theme-provider.tsx'
import { Button } from '@/components/ui/button.tsx'
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
} from '@/components/ui/sheet.tsx'
import { Switch } from '@/components/ui/switch.tsx'
import { WebsiteCombobox } from '@/components/smart/combobox/website-combobox'
import { DatetimeInput } from '@/components/smart/datetime-input'
import { useCreateSpiderSessionMutation } from '../../api/spider-sessions.ts'
import {
  SpiderSessionCreateSchema,
  type SpiderSessionCreateData,
} from '../../data/schemas.ts'

export function SpiderSessionCreateDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { resolvedTheme } = useTheme()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const createMutation = useCreateSpiderSessionMutation()

  const form = useForm<any>({
    resolver: zodResolver(SpiderSessionCreateSchema),
    defaultValues: {
      website_id: undefined,
      session_pool_id: undefined,
      session_name: '',
      session_slug: '',
      session_user_agent: '',
      session_headers: {},
      session_cookies: [],
      session_proxy: '',
      session_weight: 0,
      session_max_spider_task_count: 128,
      expired_at: '',
      rate_limits: [],
      session_config: {},
      session_readme: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rate_limits',
  })

  const onSubmit = async (data: SpiderSessionCreateData) => {
    await createMutation
      .mutateAsync(data)
      .then(() => {
        toast.success('爬虫会话创建成功')
        onOpenChange(false)
        form.reset()
      })
      .catch(() => toast.error('爬虫会话创建失败'))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>创建爬虫会话</SheetTitle>
          <SheetDescription>填写爬虫会话的基本信息</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='ss-create-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <div className='space-y-4'>
              <h4 className='text-sm font-bold'>基础设置</h4>
              {/* 所属网站 */}
              <FormField
                control={form.control}
                name='website_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      所属网站 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <WebsiteCombobox
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 会话名称 */}
              <FormField
                control={form.control}
                name='session_name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      会话名称 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='会话名称' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 标识 */}
              <FormField
                control={form.control}
                name='session_slug'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      标识 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='session-slug' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 过期日期 */}
              <FormField
                control={form.control}
                name='expired_at'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>到期时间</FormLabel>
                    <FormControl>
                      <DatetimeInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 会话池、最大任务数、过期时间 */}
              <div className='grid grid-cols-3 gap-4'>
                <FormField
                  control={form.control}
                  name='session_pool_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>会话池</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='会话池ID'
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? Number(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='session_weight'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>权重</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='session_max_spider_task_count'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>最大任务数</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='space-y-4 border-t pt-4'>
              <h4 className='text-sm font-bold'>会话参数</h4>
              {/* User-Agent */}
              <FormField
                control={form.control}
                name='session_user_agent'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User-Agent</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='自定义 User-Agent'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 代理地址 */}
              <FormField
                control={form.control}
                name='session_proxy'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>代理地址</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='http://proxy:8080'
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-3 border-t pt-4'>
              <div className='flex items-center justify-between'>
                <h4 className='text-sm font-bold'>限流规则</h4>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    append({
                      max_uses: 100,
                      within_minutes: 1,
                      consider_ip: false,
                    })
                  }
                >
                  <Plus className='mr-1 size-4' />
                  添加规则
                </Button>
              </div>

              {fields.map((f, i) => (
                <div key={f.id} className='space-y-3 rounded-lg border p-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium'>规则 #{i + 1}</span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 text-red-500'
                      onClick={() => remove(i)}
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </div>
                  <div className='grid grid-cols-3 gap-3'>
                    {/* 最大次数 */}
                    <FormField
                      control={form.control}
                      name={`rate_limits.${i}.max_uses`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>最大次数</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* 时间窗口 */}
                    <FormField
                      control={form.control}
                      name={`rate_limits.${i}.within_minutes`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xs'>
                            时间窗口(分)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* 按IP计数 */}
                    <FormField
                      control={form.control}
                      name={`rate_limits.${i}.consider_ip`}
                      render={({ field }) => (
                        <FormItem className='px-2'>
                          <FormLabel className='text-xs'>按IP计数</FormLabel>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className='space-y-4 border-t pt-4'>
              <h4 className='text-sm font-bold'>请求定制</h4>
              {/* Headers */}
              <FormField
                control={form.control}
                name='session_headers'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headers (JSON)</FormLabel>
                    <FormControl>
                      <JsonEditor
                        data={field.value || {}}
                        setData={field.onChange}
                        rootFontSize={12}
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
                            extensions={[json(), EditorView.lineWrapping]}
                            height='auto'
                            minHeight='100px'
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Cookies */}
              <FormField
                control={form.control}
                name='session_cookies'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cookies (JSON)</FormLabel>
                    <FormControl>
                      <JsonEditor
                        data={field.value || []}
                        setData={field.onChange}
                        rootFontSize={12}
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
                            extensions={[json(), EditorView.lineWrapping]}
                            height='auto'
                            minHeight='100px'
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-4 border-t pt-4'>
              {/* 会话配置 */}
              <FormField
                control={form.control}
                name='session_config'
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
                        会话配置 (JSON)
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
                    <FormControl className='min-h-0 flex-1 overflow-y-auto'>
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
                            extensions={[json(), EditorView.lineWrapping]}
                            height={isFullscreen ? '100%' : 'auto'}
                            minHeight='300px'
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage className='flex-shrink-0' />
                  </FormItem>
                )}
              />
              {/* 说明文档 */}
              <FormField
                control={form.control}
                name='session_readme'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='pb-2 text-sm font-bold'>
                      说明文档 (Markdown)
                    </FormLabel>
                    <FormControl data-color-mode={resolvedTheme}>
                      <MDEditor value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>取消</Button>
          </SheetClose>
          <Button
            form='ss-create-form'
            type='submit'
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? '创建中...' : '创建'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
