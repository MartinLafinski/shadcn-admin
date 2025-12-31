import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useSearchParams } from '@tanstack/react-router'

interface BlackwordsContextType {
  searchParams: {
    blackwords_keyword: string | undefined
    blackwords_enabled: boolean | undefined
    page: number
    size: number
  }
  setSearchParams: (newParams: Partial<BlackwordsContextType['searchParams']>) => void
  isCreateDialogOpen: boolean  // 实际上是控制创建drawer
  setIsCreateDialogOpen: (open: boolean) => void
  isEditDialogOpen: boolean   // 实际上是控制编辑drawer/对话框
  setIsEditDialogOpen: (open: boolean) => void
  isDeleteDialogOpen: boolean
  setIsDeleteDialogOpen: (open: boolean) => void
  blackwordToEdit: number | null
  setBlackwordToEdit: (id: number | null) => void
  blackwordToDelete: number | null
  setBlackwordToDelete: (id: number | null) => void
}

const BlackwordsContext = createContext<BlackwordsContextType | undefined>(undefined)

export const useBlackwords = () => {
  const context = useContext(BlackwordsContext)
  if (context === undefined) {
    throw new Error('useBlackwords must be used within a BlackwordsProvider')
  }
  return context
}

interface BlackwordsProviderProps {
  children: ReactNode
}

export const BlackwordsProvider: React.FC<BlackwordsProviderProps> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams({ from: '/_authenticated/blackwords/' })
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [blackwordToEdit, setBlackwordToEdit] = useState<number | null>(null)
  const [blackwordToDelete, setBlackwordToDelete] = useState<number | null>(null)

  // 同步URL参数和内部状态
  const internalSearchParams = {
    blackwords_keyword: searchParams.blackwords_keyword,
    blackwords_enabled: searchParams.blackwords_enabled,
    page: searchParams.page || 1,
    size: searchParams.size || 10,
  }

  const handleSetSearchParams = (newParams: Partial<BlackwordsContextType['searchParams']>) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      page: newParams.page || prev.page, // 保持当前页码，除非明确指定新页码
    }))
  }

  return (
    <BlackwordsContext.Provider
      value={{
        searchParams: internalSearchParams,
        setSearchParams: handleSetSearchParams,
        isCreateDialogOpen,
        setIsCreateDialogOpen,
        isEditDialogOpen,
        setIsEditDialogOpen,
        isDeleteDialogOpen,
        setIsDeleteDialogOpen,
        blackwordToEdit,
        setBlackwordToEdit,
        blackwordToDelete,
        setBlackwordToDelete,
      }}
    >
      {children}
    </BlackwordsContext.Provider>
  )
}