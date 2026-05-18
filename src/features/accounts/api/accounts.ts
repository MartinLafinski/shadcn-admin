import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { extracted_pagination } from '@/config/pagination'
import { getAccessToken } from '@/lib/auth-token'
import {
  type AccountCreateData,
  type AccountData,
  type AccountsData,
  type AccountUpdateData,
} from '../data/schemas.ts'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const PAGE_SIZE: number = Number(import.meta.env.VITE_ACCOUNT_PAGE_SIZE || 50)

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

export const fetchAccounts = async (
  keyword: string | undefined = undefined,
  is_active: boolean | undefined = undefined,
  is_superuser: boolean | undefined = undefined,
  is_verified: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE,
  token: string | null
): Promise<AccountsData> => {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('size', String(size))
  if (keyword) params.set('keyword', keyword)
  if (is_active !== undefined) params.set('is_active', String(is_active))
  if (is_superuser !== undefined)
    params.set('is_superuser', String(is_superuser))
  if (is_verified !== undefined) params.set('is_verified', String(is_verified))

  const response = await fetch(`${API_BASE_URL}/users/?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
  const pagination = extracted_pagination(response)
  const accounts: AccountData[] = await response.json()

  return {
    accounts,
    pagination,
  }
}

export const fetchAccountById = async (
  accountId: string | number,
  token: string | null
): Promise<AccountData> => {
  const response = await fetch(`${API_BASE_URL}/users/${accountId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
  return response.json()
}

export const fetchCurrentAccount = async (
  token: string | null
): Promise<AccountData> => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
  return response.json()
}

export const createAccount = async (
  data: AccountCreateData,
  token: string | null
): Promise<AccountData> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}

export const updateAccount = async (
  accountId: string | number,
  data: AccountUpdateData,
  token: string | null
): Promise<AccountData> => {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== '')
  )
  const response = await fetch(`${API_BASE_URL}/users/${accountId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cleanData),
  })
  await handleResponse(response)
  return response.json()
}

export const updateCurrentAccount = async (
  data: AccountUpdateData,
  token: string | null
): Promise<AccountData> => {
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined && v !== '')
  )
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cleanData),
  })
  await handleResponse(response)
  return response.json()
}

export const deleteAccount = async (
  accountId: string | number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/users/${accountId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

export const useAccountsQuery = (
  keyword: string | undefined = undefined,
  is_active: boolean | undefined = undefined,
  is_superuser: boolean | undefined = undefined,
  is_verified: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE
) => {
  return useQuery({
    queryKey: [
      'accounts',
      keyword,
      is_active,
      is_superuser,
      is_verified,
      page,
      size,
    ],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchAccounts(
        keyword,
        is_active,
        is_superuser,
        is_verified,
        page,
        size,
        token
      )
    },
    placeholderData: (previousData) => previousData,
  })
}

export const useAccountQuery = (accountId: string | number) => {
  return useQuery({
    queryKey: ['account', accountId],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchAccountById(accountId, token)
    },
    enabled: !!accountId,
  })
}

export const useCurrentAccountQuery = () => {
  return useQuery({
    queryKey: ['account', 'me'],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchCurrentAccount(token)
    },
  })
}

export const useCreateAccountMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: AccountCreateData) => {
      const token = getAccessToken()
      return createAccount(variables, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })
}

export const useUpdateAccountMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      accountId: string | number
      data: AccountUpdateData
    }) => {
      const token = getAccessToken()
      return updateAccount(variables.accountId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({
        queryKey: ['account', variables.accountId],
      })
    },
  })
}

export const useUpdateCurrentAccountMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: AccountUpdateData) => {
      const token = getAccessToken()
      return updateCurrentAccount(variables, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', 'me'] })
    },
  })
}

export const useDeleteAccountMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: { accountId: string | number }) => {
      const token = getAccessToken()
      return deleteAccount(variables.accountId, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({
        queryKey: ['account', variables.accountId],
      })
    },
  })
}
