// 引入依赖
import * as React from 'react'
// 表单处理
import { useForm } from 'react-hook-form'
// 数据验证
import { zodResolver } from '@hookform/resolvers/zod'
// 图标
import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react'
// 操作结果提示框
import { toast } from 'sonner'
// 工具函数
import { cn } from '@/lib/utils'
// 按钮控件
import { Button } from '@/components/ui/button.tsx'
// 复选框控件
import { Checkbox } from '@/components/ui/checkbox.tsx'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx'
// 对话框控件
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx'
// 表单控件
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.tsx'
// Popover 和 Command 控件
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
// 滚动区域
import { ScrollArea } from '@/components/ui/scroll-area.tsx'
import { useIndustriesQuery } from '@/features/industries/api/industries.ts'
import { useWebsitesQuery } from '@/features/websites/api/websites.ts'
// API调用
import { useSyncEntrypointsMutation } from '../../api/entrypoints.ts'
// 入口点数据结构
import {
  type SyncEntrypointsData,
  SyncEntrypointsSchema,
} from '../../data/schemas.ts'

const WEBSITE_SEARCH_SIZE: number = Number(
  import.meta.env.VITE_WEBSITE_SEARCH_SIZE || 50
)
const INDUSTRY_SEARCH_SIZE: number = Number(
  import.meta.env.VITE_INDUSTRY_SEARCH_SIZE || 50
)

/**
 * 入口点同步对话框组件的属性接口
 */
interface EntrypointsSyncDialogProps {
  /** 对话框的开启状态 */
  open: boolean
  /** 对话框状态变化时的回调函数 */
  onOpenChange: (open: boolean) => void
}

/**
 * 入口点同步对话框组件
 * 用于配置同步选项并执行入口点同步操作
 *
 * 功能说明：
 * - 支持选择要同步的网站（多选，使用combobox添加）
 * - 支持选择要同步的行业（多选，使用combobox添加）
 * - 支持设置重置预备作业、锁定、暂停的选项
 * - 使用标签显示已选择的网站和行业
 * - 提供表单验证和提交处理
 */
export function EntrypointsSyncDialog({
  open,
  onOpenChange,
}: EntrypointsSyncDialogProps) {
  // 初始化同步入口点的mutation
  const syncEntrypointsMutation = useSyncEntrypointsMutation()

  // 网站搜索关键词和Popover状态
  const [websiteKeyword, setWebsiteKeyword] = React.useState<string>('')
  const [websitePopoverOpen, setWebsitePopoverOpen] = React.useState(false)

  // 行业搜索关键词和Popover状态
  const [industryKeyword, setIndustryKeyword] = React.useState<string>('')
  const [industryPopoverOpen, setIndustryPopoverOpen] = React.useState(false)

  // 获取网站和行业列表（根据搜索关键词动态查询）
  const { data: websitesData, isLoading: websitesLoading } = useWebsitesQuery(
    websiteKeyword,
    undefined,
    undefined,
    undefined,
    undefined,
    1,
    WEBSITE_SEARCH_SIZE
  )
  const { data: industriesData, isLoading: industriesLoading } =
    useIndustriesQuery(industryKeyword, 1, INDUSTRY_SEARCH_SIZE)

  const websites = websitesData?.websites || []
  const industries = industriesData?.industries || []

  // 初始化表单，设置验证规则和默认值
  const form = useForm<any>({
    resolver: zodResolver(SyncEntrypointsSchema),
    defaultValues: {
      website_ids: undefined,
      industry_ids: undefined,
      clear_prejobs: false,
      clear_locked: false,
      clear_paused: false,
      only_clear: false,
    },
  })

  // 获取当前选中的网站和行业
  const selectedWebsiteIds = form.watch('website_ids') || []
  const selectedIndustryIds = form.watch('industry_ids') || []

  const selectedWebsites =
    websites.filter((w) => selectedWebsiteIds.includes(w.website_id)) || []
  const selectedIndustries =
    industries.filter((i) => selectedIndustryIds.includes(i.industry_id)) || []

  /**
   * 表单提交处理函数
   * 调用API同步入口点数据
   */
  const onSubmit = async (data: SyncEntrypointsData) => {
    await syncEntrypointsMutation
      .mutateAsync(data)
      .then(() => {
        toast.success('入口点同步成功')
      })
      .catch((error) => {
        console.error('入口点同步失败:', error)
        toast.error('入口点同步失败')
      })
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] overflow-hidden sm:max-w-[700px]'>
        <DialogHeader>
          <DialogTitle>同步入口点</DialogTitle>
          <DialogDescription>
            配置同步选项并执行入口点同步操作
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className='flex-1 px-1'>
          <Form {...form}>
            <form
              id='entrypoint-sync-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-6 py-4'
            >
              {/* 网站多选 */}
              <FormField
                control={form.control}
                name='website_ids'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>选择网站（可选）</FormLabel>
                    <FormMessage />
                    <div className='space-y-2'>
                      <div className='text-sm text-muted-foreground'>
                        不选则同步所有网站的入口点
                      </div>

                      {/* 已选择的网站标签 */}
                      {selectedWebsites.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                          {selectedWebsites.map((website) => (
                            <div
                              key={website.website_id}
                              className='inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm text-primary'
                            >
                              <span>{website.website_name}</span>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='h-4 w-4 p-0 hover:bg-destructive/20'
                                onClick={() => {
                                  const newValue = (field.value || []).filter(
                                    (id: number) => id !== website.website_id
                                  )
                                  field.onChange(newValue)
                                }}
                              >
                                <XIcon className='h-3 w-3' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 网站选择combobox */}
                      <Popover
                        open={websitePopoverOpen}
                        onOpenChange={setWebsitePopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type='button'
                              variant='outline'
                              role='combobox'
                              className='w-full justify-between'
                              onClick={() => setWebsitePopoverOpen(true)}
                            >
                              添加网站
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
                                (!websites || websites.length === 0) && (
                                  <CommandEmpty>未找到网站</CommandEmpty>
                                )}
                              {websitesLoading && (
                                <CommandEmpty>加载中...</CommandEmpty>
                              )}
                              {websites && websites.length > 0 && (
                                <CommandGroup key={websites.length.toString()}>
                                  {websites.map((website) => (
                                    <CommandItem
                                      key={website.website_id.toString()}
                                      value={`${website.website_id}`}
                                      onSelect={() => {
                                        const newValue = field.value?.includes(
                                          website.website_id
                                        )
                                          ? field.value
                                          : [
                                              ...(field.value || []),
                                              website.website_id,
                                            ]
                                        field.onChange(newValue)
                                        setWebsiteKeyword('')
                                        setWebsitePopoverOpen(false)
                                      }}
                                    >
                                      <CheckIcon
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value?.includes(
                                            website.website_id
                                          )
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      {website.website_name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormItem>
                )}
              />

              {/* 行业多选 */}
              <FormField
                control={form.control}
                name='industry_ids'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>选择行业（可选）</FormLabel>
                    <FormMessage />
                    <div className='space-y-2'>
                      <div className='text-sm text-muted-foreground'>
                        不选则同步所有行业的入口点
                      </div>

                      {/* 已选择的行业标签 */}
                      {selectedIndustries.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                          {selectedIndustries.map((industry) => (
                            <div
                              key={industry.industry_id}
                              className='inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-sm text-primary'
                            >
                              <span>{industry.industry_name}</span>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='h-4 w-4 p-0 hover:bg-destructive/20'
                                onClick={() => {
                                  const newValue = (field.value || []).filter(
                                    (id: number) => id !== industry.industry_id
                                  )
                                  field.onChange(newValue)
                                }}
                              >
                                <XIcon className='h-3 w-3' />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 行业选择combobox */}
                      <Popover
                        open={industryPopoverOpen}
                        onOpenChange={setIndustryPopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type='button'
                              variant='outline'
                              role='combobox'
                              className='w-full justify-between'
                              onClick={() => setIndustryPopoverOpen(true)}
                            >
                              添加行业
                              <ChevronsUpDownIcon className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-full p-0' align='start'>
                          <Command shouldFilter={false} className='w-full'>
                            <CommandInput
                              className='w-full'
                              placeholder='搜索行业...'
                              value={industryKeyword}
                              onValueChange={setIndustryKeyword}
                            />
                            <CommandList className='w-full'>
                              {!industriesLoading &&
                                (!industries || industries.length === 0) && (
                                  <CommandEmpty>未找到行业</CommandEmpty>
                                )}
                              {industriesLoading && (
                                <CommandEmpty>加载中...</CommandEmpty>
                              )}
                              {industries && industries.length > 0 && (
                                <CommandGroup
                                  key={industries.length.toString()}
                                >
                                  {industries.map((industry) => (
                                    <CommandItem
                                      key={industry.industry_id.toString()}
                                      value={`${industry.industry_id}`}
                                      onSelect={() => {
                                        const newValue = field.value?.includes(
                                          industry.industry_id
                                        )
                                          ? field.value
                                          : [
                                              ...(field.value || []),
                                              industry.industry_id,
                                            ]
                                        field.onChange(newValue)
                                        setIndustryKeyword('')
                                        setIndustryPopoverOpen(false)
                                      }}
                                    >
                                      <CheckIcon
                                        className={cn(
                                          'mr-2 h-4 w-4',
                                          field.value?.includes(
                                            industry.industry_id
                                          )
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                      {industry.industry_name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormItem>
                )}
              />

              {/* 重置选项 */}
              <div className='space-y-3 border-t pt-2'>
                <div className='text-sm font-medium'>同步选项</div>

                {/* 重置爬虫任务关联选项 */}
                <FormField
                  control={form.control}
                  name='clear_spider_tasks'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel className='flex flex-col items-start gap-1'>
                          重置爬虫任务关联
                          <span className='text-sm font-normal text-muted-foreground'>
                            同步时重置入口点的爬虫任务关联信息
                          </span>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='clear_prejobs'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel className='flex flex-col items-start gap-1'>
                          重置预备作业关联
                          <span className='text-sm font-normal text-muted-foreground'>
                            同步时重置入口点的预备作业关联信息
                          </span>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='clear_locked'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel className='flex flex-col items-start gap-1'>
                          重置锁定信息
                          <span className='text-sm font-normal text-muted-foreground'>
                            同步时重置入口点的锁定状态信息
                          </span>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='clear_paused'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className='space-y-1 leading-none'>
                        <FormLabel className='flex flex-col items-start gap-1'>
                          重置暂停信息
                          <span className='text-sm font-normal text-muted-foreground'>
                            同步时重置入口点的暂停状态信息
                          </span>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* 仅清理缓存选项 */}
              <FormField
                control={form.control}
                name='only_clear'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel className='flex flex-col items-start gap-1'>
                        仅清理缓存，不重写数据
                        <span className='text-sm font-normal text-muted-foreground'>
                          同步时不将变化写回持久化数据，仅清理缓存
                        </span>
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              {/* 警告信息 */}
              <div className='rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20'>
                <p className='text-sm text-amber-900 dark:text-amber-200'>
                  <strong>注意：</strong>
                  同步操作仅影响缓存中数据，不会影响持久化数据。
                </p>
              </div>
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => {
              onOpenChange(false)
              form.reset()
            }}
          >
            取消
          </Button>
          <Button
            form='entrypoint-sync-form'
            type='submit'
            disabled={syncEntrypointsMutation.isPending}
          >
            {syncEntrypointsMutation.isPending ? '同步中...' : '执行同步'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
