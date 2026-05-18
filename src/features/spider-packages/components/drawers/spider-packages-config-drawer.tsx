import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTheme } from '@/context/theme-provider.tsx'
import {
  ConfigSheet,
  ConfigReadmeField,
  ConfigJsonField,
  useConfigConflict,
} from '@/components/smart/configs'
import {
  usePatchSpiderPackageMutation,
  useSpiderPackageQuery,
} from '../../api/spider-packages.ts'
import {
  PatchSpiderPackageSchema,
  type PatchSpiderPackageData,
  type SpiderPackageItemData,
} from '../../data/schemas.ts'

type SpiderPackageConfigDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: SpiderPackageItemData
}

function SpiderPackageConfigDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: SpiderPackageConfigDrawerProps) {
  const queryClient = useQueryClient()
  const { data: latestPackage, isLoading: isLatestDataLoading } =
    useSpiderPackageQuery(currentRow?.spider_package_id || 0)

  const { resolvedTheme } = useTheme()

  const patchMutation = usePatchSpiderPackageMutation()

  const form = useForm<PatchSpiderPackageData>({
    resolver: zodResolver(PatchSpiderPackageSchema),
    defaultValues: currentRow
      ? {
          spider_package_config: currentRow.spider_package_config,
          spider_package_readme: currentRow.spider_package_readme || '',
        }
      : {
          spider_package_config: {},
          spider_package_readme: '',
        },
  })

  useConfigConflict({
    open,
    currentRow,
    latestEntity: latestPackage,
    isLatestDataLoading,
    queryKey: ['spider-packages'],
    queryClient,
    form,
    resetMapper: (latest) => ({
      spider_package_config: latest.spider_package_config,
      spider_package_readme: latest.spider_package_readme,
    }),
  })

  const onSubmit = async (data: PatchSpiderPackageData) => {
    await patchMutation
      .mutateAsync({
        spiderPackageId: currentRow.spider_package_id,
        data,
      })
      .then(() => {
        toast.success('配置更新成功')
        onOpenChange(false)
      })
      .catch(() => toast.error('配置更新失败'))
  }

  return (
    <ConfigSheet<PatchSpiderPackageData>
      open={open}
      onOpenChange={onOpenChange}
      title='配置爬虫包'
      description={
        <>
          {currentRow?.spider_package_name} (包ID:
          {currentRow?.spider_package_id})
        </>
      }
      formId='spider-package-config-form'
      submitLabel='保存配置'
      form={form}
      onSubmit={onSubmit}
      isPending={patchMutation.isPending}
    >
      {({ showContent }) => (
        <div className='mt-4 space-y-6'>
          {showContent && (
            <>
              <ConfigReadmeField
                form={form}
                name='spider_package_readme'
                label='说明文档 (Markdown)'
                resolvedTheme={resolvedTheme}
              />
              <ConfigJsonField
                form={form}
                name='spider_package_config'
                label='配置 (JSON)'
                resolvedTheme={resolvedTheme}
              />
            </>
          )}
        </div>
      )}
    </ConfigSheet>
  )
}

export const SpiderPackageConfigDrawer = React.memo(
  SpiderPackageConfigDrawerContent
)
