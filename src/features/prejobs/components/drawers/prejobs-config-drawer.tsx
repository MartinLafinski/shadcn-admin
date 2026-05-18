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
import { usePatchPrejobMutation, usePrejobQuery } from '../../api/prejobs.ts'
import {
  PatchPrejobSchema,
  type PatchPrejobData,
  type PrejobItemData,
} from '../../data/schemas.ts'

type PrejobConfigDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: PrejobItemData
}

function PrejobConfigDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: PrejobConfigDrawerProps) {
  const queryClient = useQueryClient()
  const { data: latest, isLoading: isLatestDataLoading } = usePrejobQuery(
    currentRow?.prejob_id || 0
  )

  const { resolvedTheme } = useTheme()
  const patchMutation = usePatchPrejobMutation()

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
    latestEntity: latest,
    isLatestDataLoading,
    queryKey: ['prejobs'],
    queryClient,
    form,
    resetMapper: (latest) => ({
      prejob_config: latest.prejob_config,
      prejob_readme: latest.prejob_readme,
    }),
  })

  const onSubmit = async (data: PatchPrejobData) => {
    await patchMutation
      .mutateAsync({ prejobId: currentRow.prejob_id, data })
      .then(() => {
        toast.success('配置更新成功')
        onOpenChange(false)
      })
      .catch(() => toast.error('配置更新失败'))
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
                name='prejob_readme'
                label='说明文档 (Markdown)'
                resolvedTheme={resolvedTheme}
              />
              <ConfigJsonField
                form={form}
                name='prejob_config'
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

export const PrejobConfigDrawer = React.memo(PrejobConfigDrawerContent)
