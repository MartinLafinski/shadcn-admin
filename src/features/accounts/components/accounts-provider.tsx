import React, { useState, useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { type AccountData } from '../data/schemas'

type AccountsDialogType = 'create' | 'update' | 'delete' | 'view'

type AccountSearchParams = {
  keyword?: string
  is_active?: boolean
  is_superuser?: boolean
  is_verified?: boolean
  page?: number
  size?: number
}

type AccountsContextType = {
  open: AccountsDialogType | null
  setOpen: (str: AccountsDialogType | null) => void
  currentRow: AccountData | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AccountData | null>>
  searchParams: AccountSearchParams
  setSearchParams: React.Dispatch<React.SetStateAction<AccountSearchParams>>
}

const AccountsContext = React.createContext<AccountsContextType | null>(null)

export function AccountsProvider({
  children,
  initialSearchParams = {},
}: {
  children: React.ReactNode
  initialSearchParams?: AccountSearchParams
}) {
  const [open, setOpen] = useDialogState<AccountsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AccountData | null>(null)
  const [searchParams, setSearchParams] =
    useState<AccountSearchParams>(initialSearchParams)

  const search = useSearch({ from: '/_authenticated/accounts/' })
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchParams({
      keyword: search.keyword,
      is_active: search.is_active,
      is_superuser: search.is_superuser,
      is_verified: search.is_verified,
      page: search.page,
      size: search.size,
    })
  }, [
    search.keyword,
    search.is_active,
    search.is_superuser,
    search.is_verified,
    search.page,
    search.size,
  ])

  return (
    <AccountsContext
      value={{
        open,
        setOpen,
        currentRow,
        setCurrentRow,
        searchParams,
        setSearchParams,
      }}
    >
      {children}
    </AccountsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAccounts = () => {
  const accountsContext = React.useContext(AccountsContext)

  if (!accountsContext) {
    throw new Error('useAccounts has to be used within <AccountsContext>')
  }

  return accountsContext
}
