import React, { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { type DictionaryItemData } from '../data/schemas'

type DictionariesDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'config'
  | 'view'
  | 'sync'

type DictionariesSearchParams = {
  dictionary_keyword?: string
  dictionary_enabled?: boolean
  page?: number
  size?: number
}

type DictionariesSearchContextType = { searchParams: DictionariesSearchParams }
type DictionariesDialogContextType = {
  open: DictionariesDialogType | null
  currentRow: DictionaryItemData | null
}
type DictionariesActionsContextType = {
  setOpen: (str: DictionariesDialogType | null) => void
  setCurrentRow: React.Dispatch<React.SetStateAction<DictionaryItemData | null>>
  setSearchParams: React.Dispatch<
    React.SetStateAction<DictionariesSearchParams>
  >
}

const DictionariesSearchContext =
  React.createContext<DictionariesSearchContextType | null>(null)
const DictionariesDialogContext =
  React.createContext<DictionariesDialogContextType | null>(null)
const DictionariesActionsContext =
  React.createContext<DictionariesActionsContextType | null>(null)

export function DictionariesProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: DictionariesSearchParams
}) {
  const [open, setOpen] = useDialogState<DictionariesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<DictionaryItemData | null>(null)
  const [searchParams, setSearchParams] =
    useState<DictionariesSearchParams>(initialSearchParams)

  const search = useSearch({ from: '/_authenticated/dictionaries/' })
  useEffect(() => {
    setSearchParams({
      dictionary_keyword: search.dictionary_keyword as string | undefined,
      dictionary_enabled: search.dictionary_enabled as boolean | undefined,
      page: search.page as number | undefined,
      size: search.size as number | undefined,
    })
  }, [
    search.dictionary_keyword,
    search.dictionary_enabled,
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
    <DictionariesSearchContext.Provider value={searchState}>
      <DictionariesDialogContext.Provider value={dialogState}>
        <DictionariesActionsContext.Provider value={actions}>
          {children}
        </DictionariesActionsContext.Provider>
      </DictionariesDialogContext.Provider>
    </DictionariesSearchContext.Provider>
  )
}

export const useDictionariesSearch = () => {
  const context = React.useContext(DictionariesSearchContext)
  if (!context)
    throw new Error(
      'useDictionariesSearch has to be used within <DictionariesProvider>'
    )
  return context
}

export const useDictionariesDialog = () => {
  const context = React.useContext(DictionariesDialogContext)
  if (!context)
    throw new Error(
      'useDictionariesDialog has to be used within <DictionariesProvider>'
    )
  return context
}

export const useDictionariesActions = () => {
  const context = React.useContext(DictionariesActionsContext)
  if (!context)
    throw new Error(
      'useDictionariesActions has to be used within <DictionariesProvider>'
    )
  return context
}

export const useDictionaries = () => {
  const search = useDictionariesSearch()
  const dialog = useDictionariesDialog()
  const actions = useDictionariesActions()
  return React.useMemo(
    () => ({ ...search, ...dialog, ...actions }),
    [search, dialog, actions]
  )
}
