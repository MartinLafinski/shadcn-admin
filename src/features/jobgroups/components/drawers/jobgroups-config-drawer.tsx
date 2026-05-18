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
  usePatchJobGroupMutation,
  useJobGroupQuery,
} from '../../api/jobgroups.ts'
import {
  PatchJobGroupSchema,
  type PatchJobGroupData,
  type JobGroupItemData,
} from '../../data/schemas.ts'

type JobGroupConfigDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: JobGroupItemData
}

function JobGroupConfigDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: JobGroupConfigDrawerProps) {
  const queryClient = useQueryClient()
  const { data: latest, isLoading: isLatestDataLoading } = useJobGroupQuery(
    currentRow?.jobgroup_id || 0
  )

  const { resolvedTheme } = useTheme()
  const patchMutation = usePatchJobGroupMutation()

  const form = useForm<PatchJobGroupData>({
    resolver: zodResolver(PatchJobGroupSchema),
    defaultValues: currentRow
      ? {
          jobgroup_config: currentRow.jobgroup_config,
          jobgroup_readme: currentRow.jobgroup_readme || '',
        }
      : {
          jobgroup_config: {},
          jobgroup_readme: '',
        },
  })

  useConfigConflict({
    open,
    currentRow,
    latestEntity: latest,
    isLatestDataLoading,
    queryKey: ['jobgroups'],
    queryClient,
    form,
    resetMapper: (latest) => ({
      jobgroup_config: latest.jobgroup_config,
      jobgroup_readme: latest.jobgroup_readme,
    }),
  })

  const onSubmit = async (data: PatchJobGroupData) => {
    await patchMutation
      .mutateAsync({ id: currentRow.jobgroup_id, data })
      .then(() => {
        toast.success('配置更新成功')
        onOpenChange(false)
      })
      .catch(() => toast.error('配置更新失败'))
  }

  return (
    <ConfigSheet<PatchJobGroupData>
      open={open}
      onOpenChange={onOpenChange}
      title='配置作业分组'
      description={
        <>
          {currentRow?.jobgroup_name} (分组ID:{currentRow?.jobgroup_id})
        </>
      }
      formId='jobgroup-config-form'
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
                name='jobgroup_readme'
                label='说明文档 (Markdown)'
                resolvedTheme={resolvedTheme}
              />
              <ConfigJsonField
                form={form}
                name='jobgroup_config'
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

export const JobGroupConfigDrawer = React.memo(JobGroupConfigDrawerContent)
