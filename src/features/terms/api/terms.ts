import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { extracted_pagination } from '@/config/pagination'
import { getAccessToken } from '@/lib/auth-token'
import {
  type TermBatchExportData,
  type TermBatchSwitchData,
  type TermConfigData,
  type TermCreateData,
  type TermData,
  type TermsData,
  type TermSwitchData,
  type TermUpdateData,
} from '../data/schemas.ts'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const PAGE_SIZE: number = Number(import.meta.env.VITE_TERM_PAGE_SIZE || 50)

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

export const fetchTerms = async (
  term_keyword: string | undefined = undefined,
  term_enabled: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE,
  token: string | null
): Promise<TermsData> => {
  let url = `${API_BASE_URL}/terms/?page=${page}&size=${size}`
  if (term_keyword) {
    url += `&term_keyword=${encodeURIComponent(term_keyword)}`
  }
  if (term_enabled !== undefined) {
    url += `&term_enabled=${term_enabled}`
  }
  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  await handleResponse(response)
  const pagination = extracted_pagination(response)
  const terms: TermData[] = await response.json()
  return { terms, pagination }
}

export const fetchTermById = async (
  termId: number,
  token: string | null
): Promise<TermData> => {
  const response = await fetch(`${API_BASE_URL}/terms/${termId}/`, {
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  })
  await handleResponse(response)
  return response.json()
}

export const createTerm = async (
  data: TermCreateData,
  token: string | null
): Promise<TermData> => {
  const response = await fetch(`${API_BASE_URL}/terms/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}

export const updateTerm = async (
  termId: number,
  data: TermUpdateData,
  token: string | null
): Promise<TermData> => {
  const response = await fetch(`${API_BASE_URL}/terms/${termId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}

export const patchTerm = async (
  termId: number,
  data: TermConfigData,
  token: string | null
): Promise<TermData> => {
  const response = await fetch(`${API_BASE_URL}/terms/${termId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}

export const deleteTerm = async (
  termId: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/terms/${termId}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  return await handleResponse(response)
}

export const batchDeleteTerms = async (
  termIds: number[],
  token: string | null
): Promise<Response> => {
  const params = termIds.map((id) => `term_ids=${id}`).join('&')
  const response = await fetch(`${API_BASE_URL}/terms/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  return await handleResponse(response)
}

export const switchTerm = async (
  termId: number,
  data: TermSwitchData,
  token: string | null
): Promise<TermData> => {
  const response = await fetch(`${API_BASE_URL}/terms/${termId}/switch/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}

export const batchSwitchTerms = async (
  data: TermBatchSwitchData,
  token: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/terms/switch/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
}

export const syncTerms = async (
  data: { only_clear?: boolean },
  token: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/terms/sync/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
}

export const exportTerms = async (token: string | null): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/terms/export/`, {
    method: 'POST',
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  })
  return await handleResponse(response)
}

export const batchExportTerms = async (
  data: TermBatchExportData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/terms/export/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  })
  return await handleResponse(response)
}

// =============================================================================
// TanStack Query Hooks
// =============================================================================

export const useTermsQuery = (
  term_keyword: string | undefined = undefined,
  term_enabled: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE
) => {
  return useQuery({
    queryKey: ['terms', term_keyword, term_enabled, page, size],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchTerms(term_keyword, term_enabled, page, size, token)
    },
    placeholderData: (previousData) => previousData,
  })
}

export const useTermQuery = (termId: number) => {
  return useQuery({
    queryKey: ['term', termId],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchTermById(termId, token)
    },
    enabled: !!termId,
  })
}

export const useCreateTermMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: TermCreateData) => {
      const token = getAccessToken()
      return createTerm(variables, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] })
    },
  })
}

export const useUpdateTermMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: { termId: number; data: TermUpdateData }) => {
      const token = getAccessToken()
      return updateTerm(variables.termId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['terms'] })
      queryClient.invalidateQueries({
        queryKey: ['term', variables.termId],
      })
    },
  })
}

export const usePatchTermMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: { termId: number; data: TermConfigData }) => {
      const token = getAccessToken()
      return patchTerm(variables.termId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['terms'] })
      queryClient.invalidateQueries({
        queryKey: ['term', variables.termId],
      })
    },
  })
}

export const useSwitchTermMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: { termId: number; data: TermSwitchData }) => {
      const token = getAccessToken()
      return switchTerm(variables.termId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['terms'] })
      queryClient.invalidateQueries({
        queryKey: ['term', variables.termId],
      })
    },
  })
}

export const useBatchSwitchTermsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: TermBatchSwitchData) => {
      const token = getAccessToken()
      return batchSwitchTerms(variables, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] })
    },
  })
}

export const useSyncTermsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: { only_clear?: boolean }) => {
      const token = getAccessToken()
      return syncTerms(variables, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['terms'] })
    },
  })
}

export const useExportTermsMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      const response = await exportTerms(token)
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'terms_export.json'
      return { blob, filename }
    },
    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    },
  })
}

export const useBatchExportTermsMutation = () => {
  return useMutation({
    mutationFn: async (variables: TermBatchExportData) => {
      const token = getAccessToken()
      const response = await batchExportTerms(variables, token)
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'terms_export.json'
      return { blob, filename }
    },
    onSuccess: ({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      window.URL.revokeObjectURL(url)
    },
  })
}

export const useBatchDeleteTermsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: number[]) => {
      const token = getAccessToken()
      return batchDeleteTerms(variables, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['terms'] })
      if (variables && Array.isArray(variables)) {
        variables.forEach((id) => {
          queryClient.invalidateQueries({ queryKey: ['term', id] })
        })
      }
    },
  })
}

export const useDeleteTermMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: { termId: number }) => {
      const token = getAccessToken()
      return deleteTerm(variables.termId, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['terms'] })
      queryClient.invalidateQueries({
        queryKey: ['term', variables.termId],
      })
    },
  })
}
