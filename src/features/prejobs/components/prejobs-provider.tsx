import React, { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { type PrejobItemData } from '../data/schemas'

/**
 * 预备作业管理对话框类型枚举
 */
type PrejobsDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'configInfo'
  | 'config'
  | 'view'
  | 'viewWebsite'
  | 'viewEntrypoint'
  | 'viewIndustry'
  | 'viewJobGroup'
  | 'sync'

/**
 * 预备作业搜索参数类型 definition
 */
type PrejobSearchParams = {
  industry_id?: number
  website_id?: number
  entrypoint_id?: number
  jobgroup_id?: number
  prejob_keyword?: string
  prejob_level?: string
  prejob_enabled?: boolean
  prejob_locked?: boolean
  prejob_paused?: boolean
  prejob_limited?: boolean
  deeply_search?: boolean
  page?: number
  size?: number
}

/**
 * 预备作业搜索参数上下文类型定义
 */
type PrejobsSearchContextType = {
  searchParams: PrejobSearchParams
}

/**
 * 预备作业对话框状态上下文类型定义
 */
type PrejobsDialogContextType = {
  open: PrejobsDialogType | null
  currentRow: PrejobItemData | null
}

/**
 * 预备作业操作上下文类型定义
 */
type PrejobsActionsContextType = {
  setOpen: (str: PrejobsDialogType | null) => void
  setCurrentRow: React.Dispatch<React.SetStateAction<PrejobItemData | null>>
  setSearchParams: React.Dispatch<React.SetStateAction<PrejobSearchParams>>
}

const PrejobsSearchContext =
  React.createContext<PrejobsSearchContextType | null>(null)
const PrejobsDialogContext =
  React.createContext<PrejobsDialogContextType | null>(null)
const PrejobsActionsContext =
  React.createContext<PrejobsActionsContextType | null>(null)

export function PrejobsProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: PrejobSearchParams
}) {
  const [open, setOpen] = useDialogState<PrejobsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<PrejobItemData | null>(null)
  const [searchParams, setSearchParams] =
    useState<PrejobSearchParams>(initialSearchParams)

  const search = useSearch({ from: '/_authenticated/prejobs/' })
  useEffect(() => {
    setSearchParams({
      industry_id: search.industry_id,
      website_id: search.website_id,
      entrypoint_id: search.entrypoint_id,
      jobgroup_id: search.jobgroup_id,
      prejob_keyword: search.prejob_keyword,
      prejob_level: search.prejob_level,
      prejob_enabled: search.prejob_enabled,
      prejob_locked: search.prejob_locked,
      prejob_paused: search.prejob_paused,
      prejob_limited: search.prejob_limited,
      deeply_search: search.deeply_search,
      page: search.page,
      size: search.size,
    })
  }, [
    search.industry_id,
    search.website_id,
    search.entrypoint_id,
    search.jobgroup_id,
    search.prejob_keyword,
    search.prejob_level,
    search.prejob_enabled,
    search.prejob_locked,
    search.prejob_paused,
    search.prejob_limited,
    search.deeply_search,
    search.page,
    search.size,
  ])

  const searchState = React.useMemo(() => ({ searchParams }), [searchParams])
  const dialogState = React.useMemo(
    () => ({ open, currentRow }),
    [open, currentRow]
  )
  const actions = React.useMemo(
    () => ({ setOpen, setCurrentRow, setSearchParams }),
    [setOpen]
  )

  return (
    <PrejobsSearchContext.Provider value={searchState}>
      <PrejobsDialogContext.Provider value={dialogState}>
        <PrejobsActionsContext.Provider value={actions}>
          {children}
        </PrejobsActionsContext.Provider>
      </PrejobsDialogContext.Provider>
    </PrejobsSearchContext.Provider>
  )
}

export const usePrejobsSearch = () => {
  const context = React.useContext(PrejobsSearchContext)
  if (!context) {
    throw new Error('usePrejobsSearch has to be used within <PrejobsProvider>')
  }
  return context
}

export const usePrejobsDialog = () => {
  const context = React.useContext(PrejobsDialogContext)
  if (!context) {
    throw new Error('usePrejobsDialog has to be used within <PrejobsProvider>')
  }
  return context
}

export const usePrejobsActions = () => {
  const context = React.useContext(PrejobsActionsContext)
  if (!context) {
    throw new Error('usePrejobsActions has to be used within <PrejobsProvider>')
  }
  return context
}

export const usePrejobs = () => {
  const search = usePrejobsSearch()
  const dialog = usePrejobsDialog()
  const actions = usePrejobsActions()

  return React.useMemo(
    () => ({ ...search, ...dialog, ...actions }),
    [search, dialog, actions]
  )
}
