import React, { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { type JobGroupItemData } from '../data/schemas'

type JobGroupsDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'config'
  | 'configInfo'
  | 'sync'

type JobGroupSearchParams = {
  keyword?: string
  enabled?: boolean
  locked?: boolean
  paused?: boolean
  limited?: boolean
  page?: number
  size?: number
}

type JobGroupsSearchContextType = { searchParams: JobGroupSearchParams }
type JobGroupsDialogContextType = {
  open: JobGroupsDialogType | null
  currentRow: JobGroupItemData | null
}
type JobGroupsActionsContextType = {
  setOpen: (str: JobGroupsDialogType | null) => void
  setCurrentRow: React.Dispatch<React.SetStateAction<JobGroupItemData | null>>
  setSearchParams: React.Dispatch<React.SetStateAction<JobGroupSearchParams>>
}

const JobGroupsSearchContext =
  React.createContext<JobGroupsSearchContextType | null>(null)
const JobGroupsDialogContext =
  React.createContext<JobGroupsDialogContextType | null>(null)
const JobGroupsActionsContext =
  React.createContext<JobGroupsActionsContextType | null>(null)

export function JobGroupsProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: JobGroupSearchParams
}) {
  const [open, setOpen] = useDialogState<JobGroupsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<JobGroupItemData | null>(null)
  const [searchParams, setSearchParams] =
    useState<JobGroupSearchParams>(initialSearchParams)

  const search = useSearch({ from: '/_authenticated/jobgroups/' })
  useEffect(() => {
    setSearchParams({
      keyword: search.keyword,
      enabled: search.enabled,
      locked: search.locked,
      paused: search.paused,
      limited: search.limited,
      page: search.page,
      size: search.size,
    })
  }, [
    search.keyword,
    search.enabled,
    search.locked,
    search.paused,
    search.limited,
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
    <JobGroupsSearchContext.Provider value={searchState}>
      <JobGroupsDialogContext.Provider value={dialogState}>
        <JobGroupsActionsContext.Provider value={actions}>
          {children}
        </JobGroupsActionsContext.Provider>
      </JobGroupsDialogContext.Provider>
    </JobGroupsSearchContext.Provider>
  )
}

export const useJobGroupsSearch = () => {
  const context = React.useContext(JobGroupsSearchContext)
  if (!context)
    throw new Error(
      'useJobGroupsSearch has to be used within <JobGroupsProvider>'
    )
  return context
}

export const useJobGroupsDialog = () => {
  const context = React.useContext(JobGroupsDialogContext)
  if (!context)
    throw new Error(
      'useJobGroupsDialog has to be used within <JobGroupsProvider>'
    )
  return context
}

export const useJobGroupsActions = () => {
  const context = React.useContext(JobGroupsActionsContext)
  if (!context)
    throw new Error(
      'useJobGroupsActions has to be used within <JobGroupsProvider>'
    )
  return context
}

export const useJobGroups = () => {
  const search = useJobGroupsSearch()
  const dialog = useJobGroupsDialog()
  const actions = useJobGroupsActions()
  return React.useMemo(
    () => ({ ...search, ...dialog, ...actions }),
    [search, dialog, actions]
  )
}
