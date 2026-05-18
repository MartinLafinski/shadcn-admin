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
  usePatchSpiderSessionMutation,
  useSpiderSessionQuery,
} from '../../api/spider-sessions.ts'
import {
  PatchSpiderSessionSchema,
  type PatchSpiderSessionData,
  type SpiderSessionItemData,
} from '../../data/schemas.ts'

type SpiderSessionConfigDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: SpiderSessionItemData
}

function SpiderSessionConfigDrawerContent({
  open,
  onOpenChange,
  currentRow,
}: SpiderSessionConfigDrawerProps) {
  const queryClient = useQueryClient()
  const { data: latestSession, isLoading: isLatestDataLoading } =
    useSpiderSessionQuery(currentRow?.session_id || 0)

  const { resolvedTheme } = useTheme()

  const patchMutation = usePatchSpiderSessionMutation()

  const form = useForm<PatchSpiderSessionData>({
    resolver: zodResolver(PatchSpiderSessionSchema),
    defaultValues: currentRow
      ? {
          session_config: currentRow.session_config,
          session_readme: currentRow.session_readme || '',
        }
      : {
          session_config: {},
          session_readme: '',
        },
  })

  useConfigConflict({
    open,
    currentRow,
    latestEntity: latestSession,
    isLatestDataLoading,
    queryKey: ['spider-sessions'],
    queryClient,
    form,
    resetMapper: (latest) => ({
      session_config: latest.session_config,
      session_readme: latest.session_readme,
    }),
  })

  const onSubmit = async (data: PatchSpiderSessionData) => {
    await patchMutation
      .mutateAsync({ id: currentRow.session_id, data })
      .then(() => {
        toast.success('配置更新成功')
        onOpenChange(false)
      })
      .catch(() => toast.error('配置更新失败'))
  }

  return (
    <ConfigSheet<PatchSpiderSessionData>
      open={open}
      onOpenChange={onOpenChange}
      title='配置爬虫会话'
      description={
        <>
          {currentRow?.session_name} (会话ID:{currentRow?.session_id})
        </>
      }
      formId='ss-config-form'
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
                name='session_readme'
                label='会话说明 (Markdown)'
                resolvedTheme={resolvedTheme}
              />
              <ConfigJsonField
                form={form}
                name='session_config'
                label='会话配置 (JSON)'
                resolvedTheme={resolvedTheme}
              />
            </>
          )}
        </div>
      )}
    </ConfigSheet>
  )
}

export const SpiderSessionConfigDrawer = React.memo(
  SpiderSessionConfigDrawerContent
)
