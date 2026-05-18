import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { extracted_pagination } from '@/config/pagination'
import { getAccessToken } from '@/lib/auth-token'
import {
  type DictionaryCreateData,
  type DictionaryData,
  type DictionariesData,
  type DictionaryUpdateData,
  type DictionaryConfigData,
  type SwitchDictionaryData,
  type BatchSwitchDictionariesData,
  type BatchExportDictionariesData,
} from '../data/schemas'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const PAGE_SIZE = Number(import.meta.env.VITE_DICTIONARY_PAGE_SIZE || 50)

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

export const fetchDictionaries = async (
  dictionary_keyword: string | undefined,
  dictionary_enabled: boolean | undefined,
  page = 1,
  size = PAGE_SIZE,
  token: string | null
): Promise<DictionariesData> => {
  let url = `${API_BASE_URL}/dictionaries/?page=${page}&size=${size}`
  if (dictionary_keyword)
    url += `&dictionary_keyword=${encodeURIComponent(dictionary_keyword)}`
  if (dictionary_enabled !== undefined)
    url += `&dictionary_enabled=${dictionary_enabled}`
  const response = await fetch(url, {
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  })
  await handleResponse(response)
  const pagination = extracted_pagination(response)
  const dictionaries: DictionaryData[] = await response.json()
  return { dictionaries, pagination }
}

export const fetchDictionaryById = async (
  id: number,
  token: string | null
): Promise<DictionaryData> => {
  const response = await fetch(`${API_BASE_URL}/dictionaries/${id}/`, {
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  })
  await handleResponse(response)
  return response.json()
}

export const createDictionary = async (
  data: DictionaryCreateData,
  token: string | null
): Promise<DictionaryData> => {
  const response = await fetch(`${API_BASE_URL}/dictionaries/`, {
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

export const updateDictionary = async (
  id: number,
  data: DictionaryUpdateData,
  token: string | null
): Promise<DictionaryData> => {
  const response = await fetch(`${API_BASE_URL}/dictionaries/${id}/`, {
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

export const patchDictionary = async (
  id: number,
  data: DictionaryConfigData,
  token: string | null
): Promise<DictionaryData> => {
  const response = await fetch(`${API_BASE_URL}/dictionaries/${id}/`, {
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

export const deleteDictionary = async (
  id: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/dictionaries/${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  return await handleResponse(response)
}

export const batchDeleteDictionaries = async (
  ids: number[],
  token: string | null
): Promise<Response> => {
  const params = ids.map((id) => `dictionary_ids=${id}`).join('&')
  const response = await fetch(`${API_BASE_URL}/dictionaries/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  return await handleResponse(response)
}

export const switchDictionary = async (
  id: number,
  data: SwitchDictionaryData,
  token: string | null
): Promise<DictionaryData> => {
  const response = await fetch(`${API_BASE_URL}/dictionaries/${id}/switch/`, {
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

export const batchSwitchDictionaries = async (
  data: BatchSwitchDictionariesData,
  token: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/dictionaries/switch/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
}

export const syncDictionaries = async (
  data: { only_clear?: boolean },
  token: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/dictionaries/sync/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
}

export const exportDictionaries = async (
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/dictionaries/export/`, {
    method: 'POST',
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  })
  return await handleResponse(response)
}

export const batchExportDictionaries = async (
  data: BatchExportDictionariesData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/dictionaries/export/`, {
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

export const useDictionariesQuery = (
  dictionary_keyword: string | undefined,
  dictionary_enabled: boolean | undefined,
  page = 1,
  size = PAGE_SIZE
) => {
  return useQuery({
    queryKey: [
      'dictionaries',
      dictionary_keyword,
      dictionary_enabled,
      page,
      size,
    ],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchDictionaries(
        dictionary_keyword,
        dictionary_enabled,
        page,
        size,
        token
      )
    },
    placeholderData: (previousData) => previousData,
  })
}

export const useDictionaryQuery = (id: number) => {
  return useQuery({
    queryKey: ['dictionary', id],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchDictionaryById(id, token)
    },
    enabled: !!id,
  })
}

export const useCreateDictionaryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: DictionaryCreateData) => {
      const token = getAccessToken()
      return createDictionary(variables, token)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] }),
  })
}

export const useUpdateDictionaryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: {
      id: number
      data: DictionaryUpdateData
    }) => {
      const token = getAccessToken()
      return updateDictionary(variables.id, variables.data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] })
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.id] })
    },
  })
}

export const usePatchDictionaryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: {
      id: number
      data: DictionaryConfigData
    }) => {
      const token = getAccessToken()
      return patchDictionary(variables.id, variables.data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] })
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.id] })
    },
  })
}

export const useSwitchDictionaryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: {
      id: number
      data: SwitchDictionaryData
    }) => {
      const token = getAccessToken()
      return switchDictionary(variables.id, variables.data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] })
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.id] })
    },
  })
}

export const useBatchSwitchDictionariesMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: BatchSwitchDictionariesData) => {
      const token = getAccessToken()
      return batchSwitchDictionaries(variables, token)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] }),
  })
}

export const useSyncDictionariesMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: { only_clear?: boolean }) => {
      const token = getAccessToken()
      return syncDictionaries(variables, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] })
    },
  })
}

export const useExportDictionariesMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      const response = await exportDictionaries(token)
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'dictionaries_export.json'
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

export const useBatchExportDictionariesMutation = () => {
  return useMutation({
    mutationFn: async (variables: BatchExportDictionariesData) => {
      const token = getAccessToken()
      const response = await batchExportDictionaries(variables, token)
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'dictionaries_export.json'
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

export const useBatchDeleteDictionariesMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: number[]) => {
      const token = getAccessToken()
      return batchDeleteDictionaries(variables, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] })
      variables.forEach((id) =>
        queryClient.invalidateQueries({ queryKey: ['dictionary', id] })
      )
    },
  })
}

export const useDeleteDictionaryMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: { id: number }) => {
      const token = getAccessToken()
      return deleteDictionary(variables.id, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dictionaries'] })
      queryClient.invalidateQueries({ queryKey: ['dictionary', variables.id] })
    },
  })
}
