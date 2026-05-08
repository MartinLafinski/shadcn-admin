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
  useConfigSheet,
  ConfigReadmeField,
  ConfigJsonField,
  useConfigConflict,
} from '@/components/smart/configs'
import { ParamFormRenderer } from '@/components/smart/param-form-renderer'
import { useParamFormBySlugQuery } from '../../../param-forms/api/param-forms.ts'
import { usePatchWebsiteMutation, useWebsiteQuery } from '../../api/websites.ts'
import {
  type WebsiteConfigData,
  type WebsiteItemData,
  WebsiteConfigSchema,
} from '../../data/schemas.ts'

type WebsiteConfigDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: WebsiteItemData
}

function WebsiteConfigDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: WebsiteConfigDrawerProps) {
  const queryClient = useQueryClient()
  const { data: latestWebsite, isLoading: isLatestDataLoading } =
    useWebsiteQuery(currentRow?.website_id || 0)

  const { resolvedTheme } = useTheme()
  const { showContent } = useConfigSheet()

  const configWebsiteMutation = usePatchWebsiteMutation()

  const commonParamFormQuery = useParamFormBySlugQuery('website_common')
  const selfParamFormQuery = useParamFormBySlugQuery(
    currentRow?.website_self_param_slug ?? undefined
  )

  const hasCommonTab = commonParamFormQuery.data !== undefined
  const hasSelfTab = selfParamFormQuery.data !== undefined

  const form = useForm<WebsiteConfigData>({
    resolver: zodResolver(WebsiteConfigSchema),
    defaultValues: currentRow ?? {
      website_config: {},
      website_readme: '',
    },
  })

  useConfigConflict({
    open,
    currentRow,
    latestEntity: latestWebsite,
    isLatestDataLoading,
    queryKey: ['websites'],
    queryClient,
    form,
    resetMapper: (latest) => ({
      website_config: latest.website_config,
      website_readme: latest.website_readme,
    }),
  })

  const commonFormData = form.watch('website_config')?.common ?? {}
  const selfFormData = form.watch('website_config')?.self ?? {}

  const handleCommonChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('website_config') ?? {})
    cfg.common = data
    form.setValue('website_config', cfg, { shouldDirty: true })
  }

  const handleSelfChange = (data: Record<string, unknown>) => {
    const cfg = structuredClone(form.getValues('website_config') ?? {})
    cfg.self = data
    form.setValue('website_config', cfg, { shouldDirty: true })
  }

  const onSubmit = async (data: WebsiteConfigData) => {
    if (!currentRow?.website_id) {
      // eslint-disable-next-line no-console
      console.error('缺少网站ID，无法配置和说明')
      return
    }

    await configWebsiteMutation
      .mutateAsync({
        websiteId: currentRow.website_id,
        data,
      })
      .then((res) => {
        toast.success(`网站 ${res.website_name} 说明与配置编辑成功`)
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(
          `网站 ${currentRow.website_name} 说明与配置编辑失败:`,
          error
        )
        toast.error(`网站 ${currentRow.website_name} 说明与配置编辑失败`)
      })

    onOpenChange(false)
  }

  return (
    <ConfigSheet<WebsiteConfigData>
      open={open}
      onOpenChange={onOpenChange}
      title='配置网站'
      description={
        <>
          {currentRow?.website_name} (网站ID:{currentRow?.website_id})
        </>
      }
      formId='website-config-form'
      submitLabel='配置网站'
      form={form}
      onSubmit={onSubmit}
    >
      <Tabs defaultValue='raw' className='flex h-full flex-col'>
        <TabsList
          className={cn(
            'grid w-full grid-cols-[repeat(auto-fit,minmax(0,1fr))]',
            !hasCommonTab && !hasSelfTab && 'hidden'
          )}
        >
          {hasCommonTab && (
            <TabsTrigger value='common'>网站通用参数</TabsTrigger>
          )}
          {hasSelfTab && <TabsTrigger value='self'>网站自用参数</TabsTrigger>}
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
                name='website_readme'
                label='网站说明 (Markdown)'
                resolvedTheme={resolvedTheme}
              />
              <ConfigJsonField
                form={form}
                name='website_config'
                label='网站配置 (JSON)'
                resolvedTheme={resolvedTheme}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ConfigSheet>
  )
}

export const WebsiteConfigDrawer = React.memo(WebsiteConfigDrawerContent)
