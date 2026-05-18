import { useEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import { type QueryClient } from '@tanstack/react-query'

interface UseConfigConflictOptions {
  open: boolean
  currentRow: { updated_at: string } | undefined
  latestEntity: { updated_at: string } | undefined
  isLatestDataLoading: boolean
  queryKey: string[]
  queryClient: QueryClient
  form: UseFormReturn<Record<string, unknown>>
  resetMapper: (latest: Record<string, unknown>) => Record<string, unknown>
}

export function useConfigConflict({
  open,
  currentRow,
  latestEntity,
  isLatestDataLoading,
  queryKey,
  queryClient,
  form,
  resetMapper,
}: UseConfigConflictOptions) {
  useEffect(() => {
    if (latestEntity && currentRow && open && !isLatestDataLoading) {
      const hasChanged = latestEntity.updated_at !== currentRow.updated_at
      if (hasChanged) {
        form.reset(resetMapper(latestEntity))
        queryClient.invalidateQueries({ queryKey })
      }
    }
  }, [
    latestEntity,
    currentRow,
    open,
    isLatestDataLoading,
    queryClient,
    form,
    resetMapper,
    queryKey,
  ])
}
