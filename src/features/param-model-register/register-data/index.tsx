import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Plus, Trash2, SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfigDrawer } from '@/components/config-drawer'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ParamFormRenderer } from '@/components/smart/param-form-renderer'
import { ThemeSwitch } from '@/components/theme-switch'
import { UserMenu } from '@/components/user-menu'
import { useParamFormBySlugQuery } from '@/features/param-forms/api/param-forms'
import {
  useRegisterDataQuery,
  useDeleteRegisterDataMutation,
} from '../api/param-model-register'
import { useParamModelRegisterQuery } from '../api/param-model-register'
import type { RegisterDataItem } from '../data/schemas'
import { RegisterDataWriteDialog } from './components/register-data-dialogs'

function DataItemFormView({
  data,
  paramFormSlug,
}: {
  data: Record<string, unknown>
  paramFormSlug: string | undefined
}) {
  const { data: paramForm } = useParamFormBySlugQuery(
    paramFormSlug ?? undefined
  )
  if (!paramForm) {
    return (
      <p className='text-sm text-muted-foreground'>加载参数要素包表单中...</p>
    )
  }
  return (
    <div className='max-h-80 overflow-y-auto rounded-md border bg-muted/30 p-3'>
      <ParamFormRenderer
        paramFormData={paramForm}
        formData={data}
        onChange={() => {}}
        disabled
      />
    </div>
  )
}

export function RegisterDataPage() {
  const { registerId } = useParams({
    from: '/_authenticated/param-model-register/$registerId',
  })
  const navigate = useNavigate()

  const registerQuery = useParamModelRegisterQuery(Number(registerId))
  const { data: listData, isLoading } = useRegisterDataQuery(Number(registerId))
  const queryClient = useQueryClient()
  const deleteMutation = useDeleteRegisterDataMutation()

  const [searchTerm, setSearchTerm] = useState('')
  const [showWriteDialog, setShowWriteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RegisterDataItem | null>(
    null
  )
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false)

  const register = registerQuery.data
  const items = (listData?.items ?? []).filter((item) =>
    item.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const allSelected = items.length > 0 && selectedKeys.size === items.length
  const someSelected = selectedKeys.size > 0

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedKeys(new Set())
    } else {
      setSelectedKeys(new Set(items.map((i) => i.key)))
    }
  }

  const handleToggleItem = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const handleBatchDelete = async () => {
    const keys = [...selectedKeys]
    await Promise.all(
      keys.map((key) =>
        deleteMutation.mutateAsync({ registerId: Number(registerId), key })
      )
    )
    setSelectedKeys(new Set())
    setShowBatchDeleteConfirm(false)
    queryClient.invalidateQueries({
      queryKey: ['param-model-register', Number(registerId), 'data'],
    })
  }

  if (isLoading || !register) {
    return (
      <Main>
        <div className='flex h-64 items-center justify-center'>
          <p className='text-muted-foreground'>加载中...</p>
        </div>
      </Main>
    )
  }

  return (
    <>
      <Header fixed>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate({ to: '/param-model-register' })}
        >
          <ArrowLeft className='mr-1 h-4 w-4' /> 返回
        </Button>
        <div className='ms-auto flex items-center gap-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <UserMenu />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            参数模型数据管理
          </h2>
          <p className='text-muted-foreground'>
            {register.register_name}: <code className='text-xs'>{register.register_slug}</code>
            {/*{register.register_name || register.register_slug} ·{' '}*/}
            {/*<code className='text-xs'>{register.spider_slug}</code> ·{' '}*/}
            {/*{register.category_type} · {register.param_form_slug}*/}
          </p>
        </div>

        <div className='flex items-end justify-between'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <SearchIcon className='absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='搜索数据键值...'
                className='h-9 w-44 pl-8 lg:w-64'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label='全选'
            />
            {someSelected && (
              <div className='flex items-center gap-2'>
                <span className='text-sm text-muted-foreground'>
                  已选 {selectedKeys.size} 项
                </span>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={() => setShowBatchDeleteConfirm(true)}
                >
                  <Trash2 className='mr-1 h-4 w-4' /> 批量删除
                </Button>
              </div>
            )}
          </div>
          <Button size='sm' onClick={() => setShowWriteDialog(true)}>
            <Plus className='mr-1 h-4 w-4' /> 写入数据
          </Button>
        </div>

        <div className='flex flex-col gap-3'>
          {items.map((item) => (
            <div
              key={item.key}
              className='flex w-full items-start justify-between rounded-xl border p-4 transition-all hover:border-primary/30 hover:bg-accent/50'
            >
              <div className='flex items-start gap-3'>
                <Checkbox
                  checked={selectedKeys.has(item.key)}
                  onCheckedChange={() => handleToggleItem(item.key)}
                  aria-label={`选择 ${item.key}`}
                />
                <div className='min-w-0 flex-1'>
                  <h3 className='font-mono text-sm font-semibold'>
                    {item.key}
                  </h3>
                  <details className='group mt-2'>
                    <summary className='cursor-pointer text-xs text-muted-foreground hover:text-foreground'>
                      查看数据
                    </summary>
                    <Tabs defaultValue='json' className='mt-2'>
                      <TabsList className='grid w-full grid-cols-2'>
                        <TabsTrigger
                          value='form'
                          disabled={!register.param_form_slug}
                        >
                          表单视图
                        </TabsTrigger>
                        <TabsTrigger value='json'>原始JSON</TabsTrigger>
                      </TabsList>
                      <TabsContent value='form'>
                        <DataItemFormView
                          data={item.data}
                          paramFormSlug={register.param_form_slug || undefined}
                        />
                      </TabsContent>
                      <TabsContent value='json'>
                        <div className='max-h-64 overflow-hidden rounded-md border bg-muted/30 p-3'>
                          <pre className='text-xs break-all whitespace-pre-wrap'>
                            {JSON.stringify(item.data, null, 2)}
                          </pre>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </details>
                </div>
              </div>
              <div className='flex shrink-0 items-center gap-4'>
                <span className='text-xs whitespace-nowrap text-muted-foreground'>
                  {Object.keys(item.data).length} 字段 ·{' '}
                  {JSON.stringify(item.data).length.toLocaleString()} 字节
                </span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-red-500 hover:text-red-600'
                  onClick={() => setDeleteTarget(item)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && (
          <div className='flex h-40 items-center justify-center text-muted-foreground'>
            暂无数据
          </div>
        )}
      </Main>

      {showWriteDialog && (
        <RegisterDataWriteDialog
          open={showWriteDialog}
          onOpenChange={setShowWriteDialog}
          registerId={Number(registerId)}
          paramFormSlug={register.param_form_slug || undefined}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          destructive
          open={!!deleteTarget}
          onOpenChange={(v) => {
            if (!v) setDeleteTarget(null)
          }}
          handleConfirm={async () => {
            await deleteMutation.mutateAsync({
              registerId: Number(registerId),
              key: deleteTarget.key,
            })
            setDeleteTarget(null)
          }}
          className='max-w-md'
          title={`删除数据 [${deleteTarget.key}] ？`}
          desc='此操作无法撤销'
          confirmText='删除'
          cancelBtnText='取消'
        />
      )}

      {showBatchDeleteConfirm && (
        <ConfirmDialog
          destructive
          open={showBatchDeleteConfirm}
          onOpenChange={setShowBatchDeleteConfirm}
          handleConfirm={handleBatchDelete}
          className='max-w-md'
          title={`批量删除 ${selectedKeys.size} 条数据？`}
          desc='此操作无法撤销'
          confirmText='删除'
          cancelBtnText='取消'
        />
      )}
    </>
  )
}
