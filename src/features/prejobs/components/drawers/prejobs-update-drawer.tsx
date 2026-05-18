import React from 'react'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { json } from '@codemirror/lang-json'
import { EditorView } from '@codemirror/view'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import CodeMirror from '@uiw/react-codemirror'
import MDEditor from '@uiw/react-md-editor'
import { JsonEditor, githubDarkTheme, githubLightTheme } from 'json-edit-react'
import {
  CheckIcon,
  ChevronsUpDownIcon,
  Maximize2Icon,
  Minimize2Icon,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider.tsx'
import { Button } from '@/components/ui/button.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx'
import { Input } from '@/components/ui/input.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
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
import { useEntrypointsQuery } from '@/features/entrypoints/api/entrypoints.ts'
import { levelLabels } from '@/features/prejobs/data/labels.tsx'
import { useWebsitesQuery } from '@/features/websites/api/websites.ts'
import { useUpdatePrejobMutation, usePrejobQuery } from '../../api/prejobs.ts'
import {
  type PrejobUpdateData,
  type PrejobItemData,
  PrejobUpdateSchema,
} from '../../data/schemas.ts'

const WEBSITE_SEARCH_SIZE: number = Number(
  import.meta.env.VITE_WEBSITE_SEARCH_SIZE || 50
)
const ENTRYPOINT_SEARCH_SIZE: number = Number(
  import.meta.env.VITE_ENTRYPOINT_SEARCH_SIZE || 50
)

type PrejobUpdateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: PrejobItemData
}

export function PrejobUpdateDrawer({
  open,
  onOpenChange,
  currentRow,
}: PrejobUpdateDrawerProps) {
  const queryClient = useQueryClient()
  const {
    data: latestPrejob,
    isLoading: isLatestDataLoading,
    refetch,
  } = usePrejobQuery(currentRow?.prejob_id || 0)
  const [, setShowConflictWarning] = useState(false)

  // 网站搜索关键词状态
  const [websiteKeyword, setWebsiteKeyword] = React.useState<string>('')
  // 控制网站下拉框的打开状态
  const [websitePopoverOpen, setWebsitePopoverOpen] = React.useState(false)
  // 入口点搜索关键词状态
  const [entrypointKeyword, setEntrypointKeyword] = React.useState<string>('')
  // 控制入口点下拉框的打开状态
  const [entrypointPopoverOpen, setEntrypointPopoverOpen] =
    React.useState(false)

  useEffect(() => {
    if (open && currentRow?.prejob_id) {
      refetch()
    }
  }, [open, currentRow?.prejob_id])

  useEffect(() => {
    if (latestPrejob && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestPrejob.updated_at !== currentRow.updated_at
      if (hasChanged) {
        setShowConflictWarning(true)
        form.reset({
          prejob_name: latestPrejob.prejob_name,
          prejob_slug: latestPrejob.prejob_slug,
          entrypoint_id: latestPrejob.entrypoint_id,
          prejob_level: latestPrejob.prejob_level,
          max_tasks_in_website: latestPrejob.max_tasks_in_website,
          max_tasks_in_entrypoint: latestPrejob.max_tasks_in_entrypoint,
          max_tasks_in_prejob: latestPrejob.max_tasks_in_prejob,
          min_tasks_in_prejob: latestPrejob.min_tasks_in_prejob,
          lock_prejob_on_working: latestPrejob.lock_prejob_on_working,
          lock_entrypoint_on_working: latestPrejob.lock_entrypoint_on_working,
          lock_website_on_working: latestPrejob.lock_website_on_working,
          interval: latestPrejob.interval,
          on_success: latestPrejob.on_success,
          on_failure: latestPrejob.on_failure,
        })
        queryClient.invalidateQueries({ queryKey: ['prejobs'] })
      }
    }
  }, [latestPrejob, currentRow, open, isLatestDataLoading, queryClient])

  const { resolvedTheme } = useTheme()
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const updatePrejobMutation = useUpdatePrejobMutation()

  // 获取网站列表数据（支持搜索）
  const { data: websitesData, isLoading: websitesLoading } = useWebsitesQuery(
    websiteKeyword,
    undefined,
    undefined,
    undefined,
    undefined,
    1,
    WEBSITE_SEARCH_SIZE
  )

  const form = useForm<PrejobUpdateData & { website_id?: number }>({
    resolver: zodResolver(PrejobUpdateSchema),
    defaultValues: currentRow
      ? {
          ...currentRow,
          website_id: undefined,
        }
      : ({
          website_id: undefined,
          entrypoint_id: null,
          prejob_name: '',
          prejob_slug: '',
          prejob_level: 'medium',
          prejob_enabled: true,
          prejob_config: {},
          prejob_readme: '',
          max_tasks_in_website: 0,
          max_tasks_in_entrypoint: 0,
          max_tasks_in_prejob: 0,
          min_tasks_in_prejob: 1,
          lock_prejob_on_working: false,
          lock_entrypoint_on_working: false,
          lock_website_on_working: false,
          interval: 60,
          on_success: 'continue',
          on_failure: 'pause_prejob',
        } as any),
  })

  // 获取当前选中的网站ID
  const selectedWebsiteId = form.watch('website_id')

  // 获取入口点列表数据（支持根据网站过滤和搜索）
  const { data: entrypointsData, isLoading: entrypointsLoading } =
    useEntrypointsQuery(
      selectedWebsiteId,
      undefined,
      entrypointKeyword,
      true,
      undefined,
      undefined,
      undefined,
      1,
      ENTRYPOINT_SEARCH_SIZE
    )

  // 获取当前选中的网站对象
  const selectedWebsite = websitesData?.websites?.find(
    (w) => w.website_id === selectedWebsiteId
  )

  // 获取当前选中的入口点对象
  const selectedEntrypoint = entrypointsData?.entrypoints?.find(
    (e) => e.entrypoint_id === form.watch('entrypoint_id')
  )

  const onSubmit = async (data: PrejobUpdateData & { website_id?: number }) => {
    if (!currentRow?.prejob_id) {
      console.error('缺少预备作业ID，无法更新')
      toast.error('缺少预备作业ID，无法更新')
      return
    }

    // 剔除 website_id 后提交
    const { website_id, ...submitData } = data
    await updatePrejobMutation
      .mutateAsync({
        prejobId: currentRow.prejob_id,
        data: submitData as PrejobUpdateData,
      })
      .then((res) => {
        toast.success(`预备作业 ${res.prejob_name} 更新成功`)
      })
      .catch((error) => {
        console.error(`预备作业 ${currentRow.prejob_name} 更新失败:`, error)
        toast.error(`预备作业 ${currentRow.prejob_name} 更新失败`)
      })

    onOpenChange(false)
    form.reset()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
      }}
    >
      <SheetContent className='flex min-w-1/3 flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>更新预备作业</SheetTitle>
          <SheetDescription>
            更新预备作业 (预备作业ID:{currentRow?.prejob_id})
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='prejob-update-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            {/* 网站选择字段 - 用于过滤入口点 */}
            <FormField
              control={form.control}
              name='website_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>所属网站</FormLabel>
                  <Popover
                    open={websitePopoverOpen}
                    onOpenChange={setWebsitePopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? selectedWebsite
                              ? `${selectedWebsite.website_name} [${selectedWebsite.website_slug}]`
                              : '选择一个网站'
                            : '选择一个网站'}
                          <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-full p-0' align='start'>
                      <Command shouldFilter={false} className='w-full'>
                        <CommandInput
                          className='w-full'
                          placeholder='搜索网站...'
                          value={websiteKeyword}
                          onValueChange={setWebsiteKeyword}
                        />
                        <CommandList className='w-full'>
                          {!websitesLoading &&
                            (!websitesData?.websites ||
                              websitesData.websites.length === 0) && (
                              <CommandEmpty>未找到网站</CommandEmpty>
                            )}
                          {websitesLoading && (
                            <CommandEmpty>加载中...</CommandEmpty>
                          )}
                          {websitesData?.websites &&
                            websitesData.websites.length > 0 && (
                              <CommandGroup
                                key={websitesData?.websites.length.toString()}
                              >
                                {websitesData.websites.map((website) => (
                                  <CommandItem
                                    key={website.website_id.toString()}
                                    value={`${website.website_id}`}
                                    onSelect={() => {
                                      form.setValue(
                                        'website_id',
                                        website.website_id,
                                        { shouldValidate: true }
                                      )
                                      // 如果网站变了，清空入口点
                                      form.setValue('entrypoint_id', null)
                                      setWebsitePopoverOpen(false)
                                    }}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        field.value === website.website_id
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    <span className='font-semibold'>
                                      {website.website_name}
                                    </span>
                                    <span className='ml-2 text-xs text-muted-foreground'>
                                      [{website.website_slug}]
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 入口点选择字段 - 实际关联到预备作业 */}
            <FormField
              control={form.control}
              name='entrypoint_id'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>关联入口点</FormLabel>
                  <Popover
                    open={entrypointPopoverOpen}
                    onOpenChange={setEntrypointPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          disabled={!selectedWebsiteId}
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value
                            ? selectedEntrypoint
                              ? `${selectedEntrypoint.entrypoint_name} [${selectedEntrypoint.entrypoint_slug}]`
                              : '选择一个入口点'
                            : '选择一个入口点'}
                          <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-full p-0' align='start'>
                      <Command shouldFilter={false} className='w-full'>
                        <CommandInput
                          className='w-full'
                          placeholder='搜索入口点...'
                          value={entrypointKeyword}
                          onValueChange={setEntrypointKeyword}
                        />
                        <CommandList className='w-full'>
                          {!entrypointsLoading &&
                            (!entrypointsData?.entrypoints ||
                              entrypointsData.entrypoints.length === 0) && (
                              <CommandEmpty>未找到入口点</CommandEmpty>
                            )}
                          {entrypointsLoading && (
                            <CommandEmpty>加载中...</CommandEmpty>
                          )}
                          {entrypointsData?.entrypoints &&
                            entrypointsData.entrypoints.length > 0 && (
                              <CommandGroup
                                key={entrypointsData?.entrypoints.length.toString()}
                              >
                                {entrypointsData.entrypoints.map(
                                  (entrypoint) => (
                                    <CommandItem
                                      key={entrypoint.entrypoint_id.toString()}
                                      value={`${entrypoint.entrypoint_id}`}
                                      onSelect={() => {
                                        form.setValue(
                                          'entrypoint_id',
                                          entrypoint.entrypoint_id,
                                          { shouldValidate: true }
                                        )
                                        setEntrypointPopoverOpen(false)
                                      }}
                                    >
                                      <CheckIcon
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value ===
                                            entrypoint.entrypoint_id
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      <span className='font-semibold'>
                                        {entrypoint.entrypoint_name}
                                      </span>
                                      <span className='ml-2 text-xs text-muted-foreground'>
                                        [{entrypoint.entrypoint_slug}]
                                      </span>
                                    </CommandItem>
                                  )
                                )}
                              </CommandGroup>
                            )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='prejob_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>预备作业名称</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='预备作业名称(强调可读性)' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='prejob_slug'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>预备作业标识</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder='预备作业标识(字母、数字、连字符或下划线)'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 任务数量限制 */}
            <h4 className='text-sm font-bold'>任务数量限制</h4>
            <div className='grid grid-cols-2 gap-x-4 gap-y-6'>
              <FormField
                control={form.control}
                name='max_tasks_in_website'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>网站内最大任务数</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='0表示无限制'
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='max_tasks_in_entrypoint'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>入口点内最大任务数</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='0表示无限制'
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='max_tasks_in_prejob'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>预备作业最大任务数</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='0表示无限制'
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='min_tasks_in_prejob'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>预备作业最小任务数</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='最少任务数'
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 触发设置 */}
            <h4 className='text-sm font-bold'>触发设置</h4>
            <div className='grid grid-cols-2 gap-x-4 gap-y-6'>
              <FormField
                control={form.control}
                name='prejob_level'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>优先级</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='选择优先级' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {levelLabels.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='interval'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>触发间隔（秒）</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type='number'
                        placeholder='触发间隔时间'
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='on_success'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>成功后续处理</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='选择成功处理方式' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='continue'>继续（周期性）</SelectItem>
                        <SelectItem value='break'>停止（一次性）</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='on_failure'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>失败后续处理</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='选择失败处理方式' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='ignore'>忽略</SelectItem>
                        <SelectItem value='continue'>继续</SelectItem>
                        <SelectItem value='pause_website'>暂停网站</SelectItem>
                        <SelectItem value='pause_entrypoint'>
                          暂停入口点
                        </SelectItem>
                        <SelectItem value='pause_prejob'>
                          暂停预备作业
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 独占设置 */}
            <h4 className='text-sm font-bold'>独占与启用</h4>
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='prejob_enabled'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>启用状态</FormLabel>
                      <div className='text-[0.8rem] text-muted-foreground'>
                        是否启用此预备作业
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lock_prejob_on_working'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>独占同预备作业</FormLabel>
                      <div className='text-[0.8rem] text-muted-foreground'>
                        运行时阻止同预备作业下分配其他任务
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='lock_entrypoint_on_working'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>独占同入口点</FormLabel>
                      <div className='text-[0.8rem] text-muted-foreground'>
                        运行时阻止同入口点下分配其他任务
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='lock_website_on_working'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <FormLabel className='text-sm'>独占同网站</FormLabel>
                      <div className='text-[0.8rem] text-muted-foreground'>
                        运行时阻止同网站下分配其他任务
                      </div>
                    </div>
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

            <FormField
              control={form.control}
              name='prejob_config'
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
                      预备作业配置
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
                      minWidth={isFullscreen ? '100%' : '100%'}
                      maxWidth={isFullscreen ? '100%' : '100%'}
                      TextEditor={(props) => {
                        return (
                          <CodeMirror
                            {...props}
                            theme={
                              resolvedTheme === 'light'
                                ? githubLight
                                : githubDark
                            }
                            extensions={[json(), EditorView.lineWrapping]}
                            height={isFullscreen ? '100%' : 'auto'}
                          />
                        )
                      }}
                    />
                  </FormControl>
                  <FormMessage className='shrink-0' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='prejob_readme'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='pb-2 text-sm font-bold'>
                    预备作业说明
                  </FormLabel>
                  <FormControl data-color-mode={resolvedTheme}>
                    <MDEditor value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>关闭</Button>
          </SheetClose>
          <Button form='prejob-update-form' type='submit'>
            更新预备作业
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
