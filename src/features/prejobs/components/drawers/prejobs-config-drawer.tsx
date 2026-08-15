import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-provider.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ConfigSheet,
  ConfigReadmeField,
  ConfigJsonField,
  useConfigConflict,
} from '@/components/smart/configs'
import { ParamFormRenderer } from '@/components/smart/param-form-renderer'
import { useParamFormBySlugQuery } from '@/features/param-forms/api/param-forms.ts'
import { usePatchPrejobMutation, usePrejobQuery } from '../../api/prejobs.ts'
import {
  type PatchPrejobData,
  type PrejobItemData,
  PatchPrejobSchema,
} from '../../data/schemas.ts'

type PrejobConfigDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: PrejobItemData
}

function PrejobConfigDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: PrejobConfigDrawerProps) {
  const queryClient = useQueryClient()
  const { data: latestPrejob, isLoading: isLatestDataLoading } = usePrejobQuery(
    currentRow?.prejob_id || 0
  )

  const { resolvedTheme } = useTheme()

  const patchMutation = usePatchPrejobMutation()

  const commonParamFormQuery = useParamFormBySlugQuery('prejob_common')
  const selfParamFormQuery = useParamFormBySlugQuery(
    currentRow?.prejob_self_param_slug ?? undefined
  )

  const hasCommonTab =
    commonParamFormQuery.data !== undefined &&
    commonParamFormQuery.data.param_form_enabled
  const hasSelfTab =
    selfParamFormQuery.data !== undefined &&
    selfParamFormQuery.data.param_form_enabled

  const websitePrejobParamFormQuery = useParamFormBySlugQuery(
    currentRow?.param_form_website_prejob?.param_form_slug ?? undefined
  )
  const industryPrejobParamFormQuery = useParamFormBySlugQuery(
    currentRow?.param_form_industry_prejob?.param_form_slug ?? undefined
  )
  const entrypointPrejobParamFormQuery = useParamFormBySlugQuery(
    currentRow?.param_form_entrypoint_prejob?.param_form_slug ?? undefined
  )

  const hasWebsitePrejobTab =
    websitePrejobParamFormQuery.data !== undefined &&
    websitePrejobParamFormQuery.data.param_form_enabled
  const hasIndustryPrejobTab =
    industryPrejobParamFormQuery.data !== undefined &&
    industryPrejobParamFormQuery.data.param_form_enabled
  const hasEntrypointPrejobTab =
    entrypointPrejobParamFormQuery.data !== undefined &&
    entrypointPrejobParamFormQuery.data.param_form_enabled

  const form = useForm<PatchPrejobData>({
    resolver: zodResolver(PatchPrejobSchema),
    defaultValues: currentRow
      ? {
          prejob_config: currentRow.prejob_config,
          prejob_readme: currentRow.prejob_readme || '',
        }
      : {
          prejob_config: {},
          prejob_readme: '',
        },
  })

  useConfigConflict({
    open,
    currentRow,
    latestEntity: latestPrejob,
    isLatestDataLoading,
    queryKey: ['prejobs'],
    queryClient,
    form,
    resetMapper: (latest) => ({
      prejob_config: latest.prejob_config,
      prejob_readme: latest.prejob_readme,
    }),
  })

  const commonFormData = form.watch('prejob_config')?.common ?? {}
  const selfFormData = form.watch('prejob_config')?.self ?? {}

  const handleCommonChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('prejob_config') ?? {})
    cfg.common = data
    form.setValue('prejob_config', cfg, { shouldDirty: true })
  }

  const handleSelfChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('prejob_config') ?? {})
    cfg.self = data
    form.setValue('prejob_config', cfg, { shouldDirty: true })
  }

  const websitePrejobFormData =
    form.watch('prejob_config')?.website_prejob ?? {}
  const industryPrejobFormData =
    form.watch('prejob_config')?.industry_prejob ?? {}
  const entrypointPrejobFormData =
    form.watch('prejob_config')?.entrypoint_prejob ?? {}

  const handleWebsitePrejobChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('prejob_config') ?? {})
    cfg.website_prejob = data
    form.setValue('prejob_config', cfg, { shouldDirty: true })
  }

  const handleIndustryPrejobChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('prejob_config') ?? {})
    cfg.industry_prejob = data
    form.setValue('prejob_config', cfg, { shouldDirty: true })
  }

  const handleEntrypointPrejobChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('prejob_config') ?? {})
    cfg.entrypoint_prejob = data
    form.setValue('prejob_config', cfg, { shouldDirty: true })
  }

  const onSubmit = async (data: PatchPrejobData) => {
    if (!currentRow?.prejob_id) {
      // eslint-disable-next-line no-console
      console.error('缺少预备作业ID，无法配置和说明')
      return
    }

    await patchMutation
      .mutateAsync({
        prejobId: currentRow.prejob_id,
        data,
      })
      .then((res) => {
        toast.success(`预备作业 ${res.prejob_name} 说明与配置编辑成功`)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(
          `预备作业 ${currentRow.prejob_name} 说明与配置编辑失败:`,
          error
        )
        toast.error(`预备作业 ${currentRow.prejob_name} 说明与配置编辑失败`)
      })

    onOpenChange(false)
  }

  return (
    <ConfigSheet<PatchPrejobData>
      open={open}
      onOpenChange={onOpenChange}
      title='配置预备作业'
      description={
        <>
          {currentRow?.prejob_name} (作业ID:{currentRow?.prejob_id})
        </>
      }
      formId='prejob-config-form'
      submitLabel='配置预备作业'
      form={form}
      onSubmit={onSubmit}
      isPending={patchMutation.isPending}
    >
      {({ showContent }) => (
        <Tabs defaultValue='raw' className='flex h-full flex-col'>
          <TabsList
            className={cn(
              'grid w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))]',
              !hasCommonTab &&
                !hasSelfTab &&
                !hasWebsitePrejobTab &&
                !hasIndustryPrejobTab &&
                !hasEntrypointPrejobTab &&
                'hidden'
            )}
          >
            {hasCommonTab && <TabsTrigger value='common'>预备通用</TabsTrigger>}
            {hasSelfTab && <TabsTrigger value='self'>预备自用</TabsTrigger>}
            {hasWebsitePrejobTab && (
              <TabsTrigger value='website_prejob'>网站指定</TabsTrigger>
            )}
            {hasIndustryPrejobTab && (
              <TabsTrigger value='industry_prejob'>行业指定</TabsTrigger>
            )}
            {hasEntrypointPrejobTab && (
              <TabsTrigger value='entrypoint_prejob'>入口点指定</TabsTrigger>
            )}
            <TabsTrigger value='raw'>原始配置</TabsTrigger>
          </TabsList>

          {hasCommonTab && (
            <TabsContent value='common' className='flex-1 overflow-auto'>
              {showContent && (
                <ParamFormRenderer
                  paramFormData={commonParamFormQuery.data!}
                  formData={commonFormData}
                  onChange={handleCommonChange}
                />
              )}
            </TabsContent>
          )}

          {hasSelfTab && (
            <TabsContent value='self' className='flex-1 overflow-auto'>
              {showContent && (
                <ParamFormRenderer
                  paramFormData={selfParamFormQuery.data!}
                  formData={selfFormData}
                  onChange={handleSelfChange}
                />
              )}
            </TabsContent>
          )}

          {hasWebsitePrejobTab && (
            <TabsContent
              value='website_prejob'
              className='flex-1 overflow-auto'
            >
              {showContent && (
                <ParamFormRenderer
                  paramFormData={websitePrejobParamFormQuery.data!}
                  formData={websitePrejobFormData}
                  onChange={handleWebsitePrejobChange}
                />
              )}
            </TabsContent>
          )}

          {hasIndustryPrejobTab && (
            <TabsContent
              value='industry_prejob'
              className='flex-1 overflow-auto'
            >
              {showContent && (
                <ParamFormRenderer
                  paramFormData={industryPrejobParamFormQuery.data!}
                  formData={industryPrejobFormData}
                  onChange={handleIndustryPrejobChange}
                />
              )}
            </TabsContent>
          )}

          {hasEntrypointPrejobTab && (
            <TabsContent
              value='entrypoint_prejob'
              className='flex-1 overflow-auto'
            >
              {showContent && (
                <ParamFormRenderer
                  paramFormData={entrypointPrejobParamFormQuery.data!}
                  formData={entrypointPrejobFormData}
                  onChange={handleEntrypointPrejobChange}
                />
              )}
            </TabsContent>
          )}

          <TabsContent value='raw' className='flex-1 space-y-6 overflow-auto'>
            {showContent && (
              <div className='mt-4 space-y-6'>
                <ConfigReadmeField
                  form={form}
                  name='prejob_readme'
                  label='预备作业说明 (Markdown)'
                  resolvedTheme={resolvedTheme}
                />
                <ConfigJsonField
                  form={form}
                  name='prejob_config'
                  label='预备作业配置 (JSON)'
                  resolvedTheme={resolvedTheme}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </ConfigSheet>
  )
}

export const PrejobConfigDrawer = React.memo(PrejobConfigDrawerContent)
