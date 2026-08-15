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
  usePatchIndustryMutation,
  useIndustryQuery,
} from '../../api/industries.ts'
import {
  type IndustryConfigData,
  type IndustryItemData,
  IndustryConfigSchema,
} from '../../data/schemas.ts'

type IndustryConfigDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: IndustryItemData
}

function IndustryConfigDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: IndustryConfigDrawerProps) {
  const queryClient = useQueryClient()
  const { data: latestIndustry, isLoading: isLatestDataLoading } =
    useIndustryQuery(currentRow?.industry_id || 0)

  const { resolvedTheme } = useTheme()

  const configIndustryMutation = usePatchIndustryMutation()

  const commonParamFormQuery = useParamFormBySlugQuery('industry_common')
  const selfParamFormQuery = useParamFormBySlugQuery(
    currentRow?.industry_self_param_slug ?? undefined
  )

  const hasCommonTab =
    commonParamFormQuery.data !== undefined &&
    commonParamFormQuery.data.param_form_enabled
  const hasSelfTab =
    selfParamFormQuery.data !== undefined &&
    selfParamFormQuery.data.param_form_enabled

  const form = useForm<IndustryConfigData>({
    resolver: zodResolver(IndustryConfigSchema),
    defaultValues: currentRow ?? {
      industry_config: {},
      industry_readme: '',
    },
  })

  useConfigConflict({
    open,
    currentRow,
    latestEntity: latestIndustry,
    isLatestDataLoading,
    queryKey: ['industries'],
    queryClient,
    form,
    resetMapper: (latest) => ({
      industry_config: latest.industry_config,
      industry_readme: latest.industry_readme,
    }),
  })

  const commonFormData = form.watch('industry_config')?.common ?? {}
  const selfFormData = form.watch('industry_config')?.self ?? {}

  const handleCommonChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('industry_config') ?? {})
    cfg.common = data
    form.setValue('industry_config', cfg, { shouldDirty: true })
  }

  const handleSelfChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('industry_config') ?? {})
    cfg.self = data
    form.setValue('industry_config', cfg, { shouldDirty: true })
  }

  const onSubmit = async (data: IndustryConfigData) => {
    if (!currentRow?.industry_id) {
      // eslint-disable-next-line no-console
      console.error('缺少行业ID，无法配置和说明')
      return
    }

    await configIndustryMutation
      .mutateAsync({
        industryId: currentRow.industry_id,
        data,
      })
      .then((res) => {
        toast.success(`行业 ${res.industry_name} 说明与配置编辑成功`)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(
          `行业 ${currentRow.industry_name} 说明与配置编辑失败:`,
          error
        )
        toast.error(`行业 ${currentRow.industry_name} 说明与配置编辑失败`)
      })

    onOpenChange(false)
  }

  return (
    <ConfigSheet<IndustryConfigData>
      open={open}
      onOpenChange={onOpenChange}
      title='配置行业'
      description={
        <>
          {currentRow?.industry_name} (行业ID:{currentRow?.industry_id})
        </>
      }
      formId='industry-config-form'
      submitLabel='配置行业'
      form={form}
      onSubmit={onSubmit}
    >
      {({ showContent }) => (
        <Tabs defaultValue='raw' className='flex h-full flex-col'>
          <TabsList
            className={cn(
              'grid w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))]',
              !hasCommonTab && !hasSelfTab && 'hidden'
            )}
          >
            {hasCommonTab && (
              <TabsTrigger value='common'>行业通用参数</TabsTrigger>
            )}
            {hasSelfTab && <TabsTrigger value='self'>行业自用参数</TabsTrigger>}
            <TabsTrigger value='raw'>原始配置与说明</TabsTrigger>
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

          <TabsContent value='raw' className='flex-1 space-y-6 overflow-auto'>
            {showContent && (
              <div className='mt-4 space-y-6'>
                <ConfigReadmeField
                  form={form}
                  name='industry_readme'
                  label='行业说明 (Markdown)'
                  resolvedTheme={resolvedTheme}
                />
                <ConfigJsonField
                  form={form}
                  name='industry_config'
                  label='行业配置 (JSON)'
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

export const IndustryConfigDrawer = React.memo(IndustryConfigDrawerContent)
