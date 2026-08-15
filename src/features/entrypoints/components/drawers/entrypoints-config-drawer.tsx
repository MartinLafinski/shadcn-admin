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
import { useParamFormBySlugQuery } from '../../../param-forms/api/param-forms.ts'
import {
  usePatchEntrypointMutation,
  useEntrypointQuery,
} from '../../api/entrypoints.ts'
import {
  type EntrypointConfigData,
  type EntrypointItemData,
  EntrypointConfigSchema,
} from '../../data/schemas.ts'

type EntrypointConfigDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: EntrypointItemData
}

function EntrypointConfigDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: EntrypointConfigDrawerProps) {
  const queryClient = useQueryClient()
  const { data: latestEntrypoint, isLoading: isLatestDataLoading } =
    useEntrypointQuery(currentRow?.entrypoint_id || 0)

  const { resolvedTheme } = useTheme()

  const configEntrypointMutation = usePatchEntrypointMutation()

  const commonParamFormQuery = useParamFormBySlugQuery('entrypoint_common')
  const selfParamFormQuery = useParamFormBySlugQuery(
    currentRow?.entrypoint_self_param_slug ?? undefined
  )

  const hasCommonTab =
    commonParamFormQuery.data !== undefined &&
    commonParamFormQuery.data.param_form_enabled
  const hasSelfTab =
    selfParamFormQuery.data !== undefined &&
    selfParamFormQuery.data.param_form_enabled

  const webEntrypointParamFormQuery = useParamFormBySlugQuery(
    currentRow?.param_form_website_entrypoint?.param_form_slug ?? undefined
  )
  const indEntrypointParamFormQuery = useParamFormBySlugQuery(
    currentRow?.param_form_industry_entrypoint?.param_form_slug ?? undefined
  )

  const hasWebEntrypointTab =
    webEntrypointParamFormQuery.data !== undefined &&
    webEntrypointParamFormQuery.data.param_form_enabled
  const hasIndEntrypointTab =
    indEntrypointParamFormQuery.data !== undefined &&
    indEntrypointParamFormQuery.data.param_form_enabled

  const form = useForm<EntrypointConfigData>({
    resolver: zodResolver(EntrypointConfigSchema),
    defaultValues: currentRow ?? {
      entrypoint_config: {},
      entrypoint_readme: '',
    },
  })

  useConfigConflict({
    open,
    currentRow,
    latestEntity: latestEntrypoint,
    isLatestDataLoading,
    queryKey: ['entrypoints'],
    queryClient,
    form,
    resetMapper: (latest) => ({
      entrypoint_config: latest.entrypoint_config,
      entrypoint_readme: latest.entrypoint_readme,
    }),
  })

  const commonFormData = form.watch('entrypoint_config')?.common ?? {}
  const selfFormData = form.watch('entrypoint_config')?.self ?? {}

  const handleCommonChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('entrypoint_config') ?? {})
    cfg.common = data
    form.setValue('entrypoint_config', cfg, { shouldDirty: true })
  }

  const handleSelfChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('entrypoint_config') ?? {})
    cfg.self = data
    form.setValue('entrypoint_config', cfg, { shouldDirty: true })
  }

  const webEntrypointFormData =
    form.watch('entrypoint_config')?.website_entrypoint ?? {}
  const indEntrypointFormData =
    form.watch('entrypoint_config')?.industry_entrypoint ?? {}

  const handleWebEntrypointChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('entrypoint_config') ?? {})
    cfg.website_entrypoint = data
    form.setValue('entrypoint_config', cfg, { shouldDirty: true })
  }

  const handleIndEntrypointChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('entrypoint_config') ?? {})
    cfg.industry_entrypoint = data
    form.setValue('entrypoint_config', cfg, { shouldDirty: true })
  }

  const onSubmit = async (data: EntrypointConfigData) => {
    if (!currentRow?.entrypoint_id) {
      // eslint-disable-next-line no-console
      console.error('缺少入口点ID，无法配置和说明')
      return
    }

    await configEntrypointMutation
      .mutateAsync({
        entrypointId: currentRow.entrypoint_id,
        data,
      })
      .then((res) => {
        toast.success(`入口点 ${res.entrypoint_name} 说明与配置编辑成功`)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(
          `入口点 ${currentRow.entrypoint_name} 说明与配置编辑失败:`,
          error
        )
        toast.error(`入口点 ${currentRow.entrypoint_name} 说明与配置编辑失败`)
      })

    onOpenChange(false)
  }

  return (
    <ConfigSheet<EntrypointConfigData>
      open={open}
      onOpenChange={onOpenChange}
      title='配置入口点'
      description={
        <>
          {currentRow?.entrypoint_name} (入口点ID:
          {currentRow?.entrypoint_id})
        </>
      }
      formId='entrypoint-config-form'
      submitLabel='配置入口点'
      form={form}
      onSubmit={onSubmit}
    >
      {({ showContent }) => (
        <Tabs defaultValue='raw' className='flex h-full flex-col'>
          <TabsList
            className={cn(
              'grid w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))]',
              !hasCommonTab &&
                !hasSelfTab &&
                !hasWebEntrypointTab &&
                !hasIndEntrypointTab &&
                'hidden'
            )}
          >
            {hasCommonTab && <TabsTrigger value='common'>入口通用</TabsTrigger>}
            {hasSelfTab && <TabsTrigger value='self'>入口自用</TabsTrigger>}
            {hasWebEntrypointTab && (
              <TabsTrigger value='web_entrypoint'>网站指定</TabsTrigger>
            )}
            {hasIndEntrypointTab && (
              <TabsTrigger value='ind_entrypoint'>行业指定</TabsTrigger>
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

          {hasWebEntrypointTab && (
            <TabsContent
              value='web_entrypoint'
              className='flex-1 overflow-auto'
            >
              {showContent && (
                <ParamFormRenderer
                  paramFormData={webEntrypointParamFormQuery.data!}
                  formData={webEntrypointFormData}
                  onChange={handleWebEntrypointChange}
                />
              )}
            </TabsContent>
          )}

          {hasIndEntrypointTab && (
            <TabsContent
              value='ind_entrypoint'
              className='flex-1 overflow-auto'
            >
              {showContent && (
                <ParamFormRenderer
                  paramFormData={indEntrypointParamFormQuery.data!}
                  formData={indEntrypointFormData}
                  onChange={handleIndEntrypointChange}
                />
              )}
            </TabsContent>
          )}

          <TabsContent value='raw' className='flex-1 space-y-6 overflow-auto'>
            {showContent && (
              <div className='mt-4 space-y-6'>
                <ConfigReadmeField
                  form={form}
                  name='entrypoint_readme'
                  label='入口点说明 (Markdown)'
                  resolvedTheme={resolvedTheme}
                />
                <ConfigJsonField
                  form={form}
                  name='entrypoint_config'
                  label='入口点配置 (JSON)'
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

export const EntrypointConfigDrawer = React.memo(EntrypointConfigDrawerContent)
