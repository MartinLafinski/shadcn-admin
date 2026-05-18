import React, { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { type ParamModelRegisterItemData } from '../data/schemas'

type ParamModelRegistersDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'sync'

type ParamModelRegistersSearchParams = {
  spider_slug?: string
  category_type?: string
  category_slug?: string
  param_form_slug?: string
  page?: number
  size?: number
}

type ParamModelRegistersSearchContextType = {
  searchParams: ParamModelRegistersSearchParams
}

type ParamModelRegistersDialogContextType = {
  open: ParamModelRegistersDialogType | null
  currentRow: ParamModelRegisterItemData | null
}

type ParamModelRegistersActionsContextType = {
  setOpen: (str: ParamModelRegistersDialogType | null) => void
  setCurrentRow: React.Dispatch<
    React.SetStateAction<ParamModelRegisterItemData | null>
  >
  setSearchParams: React.Dispatch<
    React.SetStateAction<ParamModelRegistersSearchParams>
  >
}

const ParamModelRegistersSearchContext =
  React.createContext<ParamModelRegistersSearchContextType | null>(null)
const ParamModelRegistersDialogContext =
  React.createContext<ParamModelRegistersDialogContextType | null>(null)
const ParamModelRegistersActionsContext =
  React.createContext<ParamModelRegistersActionsContextType | null>(null)

export function ParamModelRegistersProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: ParamModelRegistersSearchParams
}) {
  const [open, setOpen] = useDialogState<ParamModelRegistersDialogType>(null)
  const [currentRow, setCurrentRow] =
    useState<ParamModelRegisterItemData | null>(null)
  const [searchParams, setSearchParams] =
    useState<ParamModelRegistersSearchParams>(initialSearchParams)

  const search = useSearch({ from: '/_authenticated/param-model-register/' })
  useEffect(() => {
    setSearchParams({
      spider_slug: search.spider_slug as string | undefined,
      category_type: search.category_type as string | undefined,
      category_slug: search.category_slug as string | undefined,
      param_form_slug: search.param_form_slug as string | undefined,
      page: search.page as number | undefined,
      size: search.size as number | undefined,
    })
  }, [
    search.spider_slug,
    search.category_type,
    search.category_slug,
    search.param_form_slug,
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
    <ParamModelRegistersSearchContext.Provider value={searchState}>
      <ParamModelRegistersDialogContext.Provider value={dialogState}>
        <ParamModelRegistersActionsContext.Provider value={actions}>
          {children}
        </ParamModelRegistersActionsContext.Provider>
      </ParamModelRegistersDialogContext.Provider>
    </ParamModelRegistersSearchContext.Provider>
  )
}

export const useParamModelRegistersSearch = () => {
  const context = React.useContext(ParamModelRegistersSearchContext)
  if (!context) {
    throw new Error(
      'useParamModelRegistersSearch has to be used within <ParamModelRegistersProvider>'
    )
  }
  return context
}

export const useParamModelRegistersDialog = () => {
  const context = React.useContext(ParamModelRegistersDialogContext)
  if (!context) {
    throw new Error(
      'useParamModelRegistersDialog has to be used within <ParamModelRegistersProvider>'
    )
  }
  return context
}

export const useParamModelRegistersActions = () => {
  const context = React.useContext(ParamModelRegistersActionsContext)
  if (!context) {
    throw new Error(
      'useParamModelRegistersActions has to be used within <ParamModelRegistersProvider>'
    )
  }
  return context
}

export const useParamModelRegisters = () => {
  const search = useParamModelRegistersSearch()
  const dialog = useParamModelRegistersDialog()
  const actions = useParamModelRegistersActions()
  return React.useMemo(
    () => ({ ...search, ...dialog, ...actions }),
    [search, dialog, actions]
  )
}
