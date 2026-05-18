import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2, SquarePenIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { DatetimeInput } from '@/components/smart/datetime-input'
import {
  useReleasesQuery,
  useCreateReleaseMutation,
  useUpdateReleaseMutation,
  useDeleteReleaseMutation,
} from '@/features/spider-packages/api/spider-packages'
import {
  CreateSpiderPackageReleaseSchema,
  UpdateSpiderPackageReleaseSchema,
  type SpiderPackageReleaseData,
  type CreateSpiderPackageReleaseData,
} from '../../data/schemas'

interface SpiderPackagesReleasesDialogProps {
  open: boolean
  spiderPackageId: number
  spiderPackageName: string
  onOpenChange: () => void
}

export function SpiderPackagesReleasesDialog({
  open,
  spiderPackageId,
  spiderPackageName,
  onOpenChange,
}: SpiderPackagesReleasesDialogProps) {
  const { data: releases = [], isLoading } = useReleasesQuery(spiderPackageId)

  const createMutation = useCreateReleaseMutation()
  const updateMutation = useUpdateReleaseMutation()
  const deleteMutation = useDeleteReleaseMutation()

  const [formOpen, setFormOpen] = useState(false)
  const [editingRelease, setEditingRelease] =
    useState<SpiderPackageReleaseData | null>(null)
  const [deletingRelease, setDeletingRelease] =
    useState<SpiderPackageReleaseData | null>(null)

  const isEdit = !!editingRelease

  const form = useForm<CreateSpiderPackageReleaseData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(
      isEdit
        ? UpdateSpiderPackageReleaseSchema
        : CreateSpiderPackageReleaseSchema
    ) as any,
    defaultValues: {
      release_version: '',
      release_url: '',
      release_readme: '',
      is_prerelease: false,
      is_draft: false,
      released_at: null,
    },
  })

  const openCreate = () => {
    setEditingRelease(null)
    form.reset({
      release_version: '',
      release_url: '',
      release_readme: '',
      is_prerelease: false,
      is_draft: false,
      released_at: null,
    })
    setFormOpen(true)
  }

  const openEdit = (r: SpiderPackageReleaseData) => {
    setEditingRelease(r)
    form.reset({
      release_version: r.release_version,
      release_url: r.release_url,
      release_readme: r.release_readme || '',
      is_prerelease: r.is_prerelease,
      is_draft: r.is_draft,
      released_at: r.released_at || null,
    })
    setFormOpen(true)
  }

  const handleFormSubmit = async (data: CreateSpiderPackageReleaseData) => {
    if (isEdit && editingRelease) {
      await updateMutation
        .mutateAsync({
          spiderPackageId,
          releaseId: editingRelease.release_id,
          data,
        })
        .then(() => {
          toast.success('发布版本更新成功')
          setFormOpen(false)
        })
        .catch(() => toast.error('发布版本更新失败'))
    } else {
      await createMutation
        .mutateAsync({ spiderPackageId, data })
        .then(() => {
          toast.success('发布版本创建成功')
          setFormOpen(false)
        })
        .catch(() => toast.error('发布版本创建失败'))
    }
  }

  const handleDelete = async () => {
    if (!deletingRelease) return
    await deleteMutation
      .mutateAsync({
        spiderPackageId,
        releaseId: deletingRelease.release_id,
      })
      .then(() => {
        toast.success('发布版本删除成功')
        setDeletingRelease(null)
      })
      .catch(() => toast.error('发布版本删除失败'))
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[80vh] sm:max-w-[800px]'>
          <DialogHeader className='flex flex-row items-center justify-between pt-4'>
            <DialogTitle className='-mt-8'>
              {spiderPackageName} - 发布版本
            </DialogTitle>
            <Button variant='outline' size='sm' onClick={openCreate}>
              <Plus className='mr-1 size-4' />
              新增发布
            </Button>
          </DialogHeader>

          <div className='max-h-[60vh] overflow-auto'>
            {isLoading ? (
              <div className='flex h-24 items-center justify-center text-muted-foreground'>
                加载中...
              </div>
            ) : releases.length === 0 ? (
              <div className='flex h-24 items-center justify-center text-muted-foreground'>
                暂无发布版本
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>版本</TableHead>
                    <TableHead>下载地址</TableHead>
                    <TableHead className='text-center'>预发布</TableHead>
                    <TableHead className='text-center'>草稿</TableHead>
                    <TableHead>发布日期</TableHead>
                    <TableHead className='w-[80px]'>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {releases.map((r) => (
                    <TableRow key={r.release_id}>
                      <TableCell className='font-medium'>
                        {r.release_version}
                      </TableCell>
                      <TableCell>
                        <a
                          href={r.release_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='block max-w-[180px] truncate text-sm text-blue-600 hover:underline dark:text-blue-400'
                        >
                          {r.release_url}
                        </a>
                      </TableCell>
                      <TableCell className='text-center'>
                        <Badge
                          variant='outline'
                          className={cn(
                            r.is_prerelease
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                          )}
                        >
                          {r.is_prerelease ? '是' : '否'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-center'>
                        <Badge
                          variant='outline'
                          className={cn(
                            r.is_draft
                              ? 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          )}
                        >
                          {r.is_draft ? '是' : '否'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {r.released_at || '-'}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            onClick={() => openEdit(r)}
                          >
                            <SquarePenIcon className='size-3.5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7 text-red-500'
                            onClick={() => setDeletingRelease(r)}
                          >
                            <Trash2 className='size-3.5' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={formOpen}
        onOpenChange={(v) => {
          if (!v) setFormOpen(false)
        }}
      >
        <DialogContent className='sm:max-w-[480px]'>
          <DialogHeader>
            <DialogTitle>{isEdit ? '编辑发布' : '新增发布'}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form
              id='release-form'
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='release_version'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      版本号 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='v1.0.0' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='release_url'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      下载地址 <span className='text-destructive'>*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder='https://...' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='release_readme'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>说明</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder='发布说明（可选）'
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='grid grid-cols-2 gap-4'>
                <FormField
                  control={form.control}
                  name='is_prerelease'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                      <FormLabel>预发布</FormLabel>
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
                  name='is_draft'
                  render={({ field }) => (
                    <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3'>
                      <FormLabel>草稿</FormLabel>
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
                name='released_at'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>发布日期</FormLabel>
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
              <div className='flex justify-end gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setFormOpen(false)}
                >
                  取消
                </Button>
                <Button
                  type='submit'
                  disabled={
                    isEdit ? updateMutation.isPending : createMutation.isPending
                  }
                >
                  {isEdit
                    ? updateMutation.isPending
                      ? '更新中...'
                      : '保存'
                    : createMutation.isPending
                      ? '创建中...'
                      : '创建'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        destructive
        open={!!deletingRelease}
        onOpenChange={(v) => {
          if (!v) setDeletingRelease(null)
        }}
        handleConfirm={handleDelete}
        className='max-w-md'
        title={`删除发布版本 [${deletingRelease?.release_version}] ?`}
        desc='此操作无法撤销。'
        confirmText='删除'
        cancelBtnText='取消'
      />
    </>
  )
}
