import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import { JsonEditor, githubDarkTheme, githubLightTheme } from 'json-edit-react'
import { Plus, Trash2 } from 'lucide-react'
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
import { useUpdateSpiderSessionMutation } from '../../api/spider-sessions.ts'
import {
  SpiderSessionUpdateSchema,
  type SpiderSessionUpdateData,
  type SpiderSessionItemData,
} from '../../data/schemas.ts'

export function SpiderSessionUpdateDrawer({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: SpiderSessionItemData
}) {
  const { resolvedTheme } = useTheme()
  const updateMutation = useUpdateSpiderSessionMutation()

  const defaults = {
    website_id: currentRow.website_id,
    session_pool_id: currentRow.session_pool_id || undefined,
    session_name: currentRow.session_name,
    session_slug: currentRow.session_slug,
    session_user_agent: currentRow.session_user_agent || '',
    session_headers: currentRow.session_headers || {},
    session_cookies: currentRow.session_cookies || [],
    session_proxy: currentRow.session_proxy || '',
    session_weight: currentRow.session_weight,
    session_max_spider_task_count: currentRow.session_max_spider_task_count,
    expired_at: currentRow.expired_at || '',
    rate_limits: currentRow.rate_limits || [],
  }

  const form = useForm<any>({
    resolver: zodResolver(SpiderSessionUpdateSchema),
    defaultValues: defaults,
  })

  useEffect(() => {
    form.reset(defaults)
  }, [currentRow, form])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'rate_limits',
  })

  const onSubmit = async (data: SpiderSessionUpdateData) => {
    await updateMutation
      .mutateAsync({
        id: currentRow.session_id,
        data,
      })
      .then(() => {
        toast.success('爬虫会话更新成功')
        onOpenChange(false)
      })
      .catch(() => toast.error('爬虫会话更新失败'))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>编辑爬虫会话</SheetTitle>
          <SheetDescription>
            修改 {currentRow.session_name} 的信息
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            id='ss-update-form'
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} value={field.value ?? ''} />
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
                      <Input {...field} value={field.value ?? ''} />
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
          </form>
        </Form>

        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>取消</Button>
          </SheetClose>
          <Button
            form='ss-update-form'
            type='submit'
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? '更新中...' : '保存'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
