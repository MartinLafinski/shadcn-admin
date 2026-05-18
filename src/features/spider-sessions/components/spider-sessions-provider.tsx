import React, { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { type SpiderSessionItemData } from '../data/schemas'

type SpiderSessionsDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'config'
  | 'configInfo'
  | 'sync'
  | 'viewWebsite'

type SpiderSessionSearchParams = {
  keyword?: string
  enabled?: boolean
  website_id?: number
  locked?: boolean
  paused?: boolean
  limited?: boolean
  expired?: boolean
  session_pool_id?: number
  page?: number
  size?: number
}

type SpiderSessionsSearchContextType = {
  searchParams: SpiderSessionSearchParams
}
type SpiderSessionsDialogContextType = {
  open: SpiderSessionsDialogType | null
  currentRow: SpiderSessionItemData | null
}
type SpiderSessionsActionsContextType = {
  setOpen: (s: SpiderSessionsDialogType | null) => void
  setCurrentRow: React.Dispatch<
    React.SetStateAction<SpiderSessionItemData | null>
  >
  setSearchParams: React.Dispatch<
    React.SetStateAction<SpiderSessionSearchParams>
  >
}

const SearchCtx = React.createContext<SpiderSessionsSearchContextType | null>(
  null
)
const DialogCtx = React.createContext<SpiderSessionsDialogContextType | null>(
  null
)
const ActionsCtx = React.createContext<SpiderSessionsActionsContextType | null>(
  null
)

export function SpiderSessionsProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: SpiderSessionSearchParams
}) {
  const [open, setOpen] = useDialogState<SpiderSessionsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<SpiderSessionItemData | null>(
    null
  )
  const [searchParams, setSearchParams] =
    useState<SpiderSessionSearchParams>(initialSearchParams)
  const search = useSearch({ from: '/_authenticated/spider-sessions/' })
  useEffect(
    () =>
      setSearchParams({
        keyword: search.keyword,
        enabled: search.enabled,
        website_id: search.website_id,
        locked: search.locked,
        paused: search.paused,
        limited: search.limited,
        expired: search.expired,
        session_pool_id: search.session_pool_id,
        page: search.page,
        size: search.size,
      }),
    [
      search.keyword,
      search.enabled,
      search.website_id,
      search.locked,
      search.paused,
      search.limited,
      search.expired,
      search.session_pool_id,
      search.page,
      search.size,
    ]
  )
  const s = React.useMemo(() => ({ searchParams }), [searchParams])
  const d = React.useMemo(() => ({ open, currentRow }), [open, currentRow])
  const a = React.useMemo(
    () => ({ setOpen, setCurrentRow, setSearchParams }),
    [setOpen]
  )
  return (
    <SearchCtx.Provider value={s}>
      <DialogCtx.Provider value={d}>
        <ActionsCtx.Provider value={a}>{children}</ActionsCtx.Provider>
      </DialogCtx.Provider>
    </SearchCtx.Provider>
  )
}

export const useSpiderSessionsSearch = () => {
  const c = React.useContext(SearchCtx)
  if (!c)
    throw new Error('useSpiderSessionsSearch within <SpiderSessionsProvider>')
  return c
}
export const useSpiderSessionsDialog = () => {
  const c = React.useContext(DialogCtx)
  if (!c) throw new Error('...')
  return c
}
export const useSpiderSessionsActions = () => {
  const c = React.useContext(ActionsCtx)
  if (!c) throw new Error('...')
  return c
}
export const useSpiderSessions = () => {
  const search = useSpiderSessionsSearch()
  const dialog = useSpiderSessionsDialog()
  const actions = useSpiderSessionsActions()
  return { ...search, ...dialog, ...actions }
}
