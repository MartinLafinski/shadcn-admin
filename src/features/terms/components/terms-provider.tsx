import React, { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { type TermItemData } from '../data/schemas'

type TermsDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'config'
  | 'view'
  | 'sync'

type TermSearchParams = {
  term_keyword?: string
  term_enabled?: boolean
  page?: number
  size?: number
}

type TermsSearchContextType = {
  searchParams: TermSearchParams
}

type TermsDialogContextType = {
  open: TermsDialogType | null
  currentRow: TermItemData | null
}

type TermsActionsContextType = {
  setOpen: (str: TermsDialogType | null) => void
  setCurrentRow: React.Dispatch<React.SetStateAction<TermItemData | null>>
  setSearchParams: React.Dispatch<React.SetStateAction<TermSearchParams>>
}

const TermsSearchContext = React.createContext<TermsSearchContextType | null>(
  null
)
const TermsDialogContext = React.createContext<TermsDialogContextType | null>(
  null
)
const TermsActionsContext = React.createContext<TermsActionsContextType | null>(
  null
)

export function TermsProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: TermSearchParams
}) {
  const [open, setOpen] = useDialogState<TermsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<TermItemData | null>(null)
  const [searchParams, setSearchParams] =
    useState<TermSearchParams>(initialSearchParams)

  const search = useSearch({ from: '/_authenticated/terms/' })
  useEffect(() => {
    setSearchParams({
      term_keyword: search.term_keyword as string | undefined,
      term_enabled: search.term_enabled as boolean | undefined,
      page: search.page as number | undefined,
      size: search.size as number | undefined,
    })
  }, [search.term_keyword, search.term_enabled, search.page, search.size])

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
    <TermsSearchContext.Provider value={searchState}>
      <TermsDialogContext.Provider value={dialogState}>
        <TermsActionsContext.Provider value={actions}>
          {children}
        </TermsActionsContext.Provider>
      </TermsDialogContext.Provider>
    </TermsSearchContext.Provider>
  )
}

export const useTermsSearch = () => {
  const context = React.useContext(TermsSearchContext)
  if (!context) {
    throw new Error('useTermsSearch has to be used within <TermsProvider>')
  }
  return context
}

export const useTermsDialog = () => {
  const context = React.useContext(TermsDialogContext)
  if (!context) {
    throw new Error('useTermsDialog has to be used within <TermsProvider>')
  }
  return context
}

export const useTermsActions = () => {
  const context = React.useContext(TermsActionsContext)
  if (!context) {
    throw new Error('useTermsActions has to be used within <TermsProvider>')
  }
  return context
}

export const useTerms = () => {
  const search = useTermsSearch()
  const dialog = useTermsDialog()
  const actions = useTermsActions()
  return React.useMemo(
    () => ({ ...search, ...dialog, ...actions }),
    [search, dialog, actions]
  )
}
