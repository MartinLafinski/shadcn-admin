import React, { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { type SpiderPackageItemData } from '../data/schemas'

type SpiderPackagesDialogType =
  | 'create'
  | 'update'
  | 'delete'
  | 'config'
  | 'configInfo'
  | 'releases'
  | 'viewWebsite'

type SpiderPackageSearchParams = {
  spider_package_keyword?: string
  spider_package_enabled?: boolean
  website_id?: number
  page?: number
  size?: number
}

type SpiderPackagesSearchContextType = {
  searchParams: SpiderPackageSearchParams
}

type SpiderPackagesDialogContextType = {
  open: SpiderPackagesDialogType | null
  currentRow: SpiderPackageItemData | null
}

type SpiderPackagesActionsContextType = {
  setOpen: (str: SpiderPackagesDialogType | null) => void
  setCurrentRow: React.Dispatch<
    React.SetStateAction<SpiderPackageItemData | null>
  >
  setSearchParams: React.Dispatch<
    React.SetStateAction<SpiderPackageSearchParams>
  >
}

const SpiderPackagesSearchContext =
  React.createContext<SpiderPackagesSearchContextType | null>(null)
const SpiderPackagesDialogContext =
  React.createContext<SpiderPackagesDialogContextType | null>(null)
const SpiderPackagesActionsContext =
  React.createContext<SpiderPackagesActionsContextType | null>(null)

export function SpiderPackagesProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: SpiderPackageSearchParams
}) {
  const [open, setOpen] = useDialogState<SpiderPackagesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<SpiderPackageItemData | null>(
    null
  )
  const [searchParams, setSearchParams] =
    useState<SpiderPackageSearchParams>(initialSearchParams)

  const search = useSearch({ from: '/_authenticated/spider-packages/' })
  useEffect(() => {
    setSearchParams({
      spider_package_keyword: search.spider_package_keyword,
      spider_package_enabled: search.spider_package_enabled,
      website_id: search.website_id,
      page: search.page,
      size: search.size,
    })
  }, [
    search.spider_package_keyword,
    search.spider_package_enabled,
    search.website_id,
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
    <SpiderPackagesSearchContext.Provider value={searchState}>
      <SpiderPackagesDialogContext.Provider value={dialogState}>
        <SpiderPackagesActionsContext.Provider value={actions}>
          {children}
        </SpiderPackagesActionsContext.Provider>
      </SpiderPackagesDialogContext.Provider>
    </SpiderPackagesSearchContext.Provider>
  )
}

export const useSpiderPackagesSearch = () => {
  const context = React.useContext(SpiderPackagesSearchContext)
  if (!context) {
    throw new Error(
      'useSpiderPackagesSearch has to be used within <SpiderPackagesProvider>'
    )
  }
  return context
}

export const useSpiderPackagesDialog = () => {
  const context = React.useContext(SpiderPackagesDialogContext)
  if (!context) {
    throw new Error(
      'useSpiderPackagesDialog has to be used within <SpiderPackagesProvider>'
    )
  }
  return context
}

export const useSpiderPackagesActions = () => {
  const context = React.useContext(SpiderPackagesActionsContext)
  if (!context) {
    throw new Error(
      'useSpiderPackagesActions has to be used within <SpiderPackagesProvider>'
    )
  }
  return context
}

export const useSpiderPackages = () => {
  const search = useSpiderPackagesSearch()
  const dialog = useSpiderPackagesDialog()
  const actions = useSpiderPackagesActions()
  return React.useMemo(
    () => ({ ...search, ...dialog, ...actions }),
    [search, dialog, actions]
  )
}
