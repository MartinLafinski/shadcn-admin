import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { extracted_pagination } from '@/config/pagination'
import { getAccessToken } from '@/lib/auth-token'
import {
  type ParamFormCreateData,
  type ParamFormData,
  type ParamFormPatchData,
  type ParamFormUpdateData,
  type ParamFormSwitchData,
  type ParamFormBatchSwitchData,
  type ParamFormBatchDeleteData,
  type ParamFormsData,
  type BatchExportParamFormsData,
} from '../data/schemas.ts'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const PAGE_SIZE: number = Number(import.meta.env.VITE_PARAMFORM_PAGE_SIZE || 20)

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

export const fetchParamForms = async (
  keyword: string | undefined = undefined,
  enabled: boolean | undefined = undefined,
  paramType: string | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE,
  token: string | null
): Promise<ParamFormsData> => {
  let url = `${API_BASE_URL}/param-forms/?page=${page}&size=${size}`

  if (keyword) {
    url += `&keyword=${keyword}`
  }
  if (enabled !== undefined) {
    url += `&enabled=${enabled}`
  }
  if (paramType) {
    url += `&param_type=${paramType}`
  }

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  await handleResponse(response)
  const pagination = extracted_pagination(response)
  const param_forms: ParamFormData[] = await response.json()

  return { param_forms, pagination }
}

export const fetchParamFormById = async (
  paramFormId: number,
  token: string | null
): Promise<ParamFormData> => {
  const response = await fetch(`${API_BASE_URL}/param-forms/${paramFormId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  await handleResponse(response)
  return response.json()
}

export const createParamForm = async (
  data: ParamFormCreateData,
  token: string | null
): Promise<ParamFormData> => {
  const response = await fetch(`${API_BASE_URL}/param-forms/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  await handleResponse(response)
  return response.json()
}

export const updateParamForm = async (
  paramFormId: number,
  data: ParamFormUpdateData,
  token: string | null
): Promise<ParamFormData> => {
  const response = await fetch(`${API_BASE_URL}/param-forms/${paramFormId}/`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  await handleResponse(response)
  return response.json()
}

export const patchParamForm = async (
  paramFormId: number,
  data: ParamFormPatchData,
  token: string | null
): Promise<ParamFormData> => {
  const response = await fetch(`${API_BASE_URL}/param-forms/${paramFormId}/`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  await handleResponse(response)
  return response.json()
}

export const switchParamForm = async (
  paramFormId: number,
  data: ParamFormSwitchData,
  token: string | null
): Promise<ParamFormData> => {
  const response = await fetch(
    `${API_BASE_URL}/param-forms/${paramFormId}/switch/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  )

  await handleResponse(response)
  return response.json()
}

export const batchSwitchParamForms = async (
  data: ParamFormBatchSwitchData,
  token: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/param-forms/switch/`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  await handleResponse(response)
}

export const deleteParamForm = async (
  paramFormId: number,
  token: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/param-forms/${paramFormId}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  await handleResponse(response)
}

export const batchDeleteParamForms = async (
  data: ParamFormBatchDeleteData,
  token: string | null
): Promise<void> => {
  const ids = data.param_form_ids.map((id) => `param_form_ids=${id}`).join('&')
  const response = await fetch(`${API_BASE_URL}/param-forms/?${ids}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  await handleResponse(response)
}

export const useParamFormsQuery = (
  keyword: string | undefined = undefined,
  enabled: boolean | undefined = undefined,
  paramType: string | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE
) => {
  return useQuery({
    queryKey: ['paramForms', keyword, enabled, paramType, page, size],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchParamForms(keyword, enabled, paramType, page, size, token)
    },
    placeholderData: (previousData) => previousData,
  })
}

export const useParamFormQuery = (paramFormId: number) => {
  return useQuery({
    queryKey: ['paramForm', paramFormId],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchParamFormById(paramFormId, token)
    },
    enabled: paramFormId > 0,
  })
}

export const fetchParamFormBySlug = async (
  slug: string,
  token: string | null
): Promise<ParamFormData | undefined> => {
  const data = await fetchParamForms(slug, undefined, undefined, 1, 1, token)
  return data.param_forms.find((pf) => pf.param_form_slug === slug)
}

export const useParamFormBySlugQuery = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['paramFormBySlug', slug],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchParamFormBySlug(slug!, token)
    },
    enabled: !!slug,
  })
}

export const useCreateParamFormMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ParamFormCreateData) => {
      const token = getAccessToken()
      return createParamForm(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paramForms'] })
    },
  })
}

export const useUpdateParamFormMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      paramFormId,
      data,
    }: {
      paramFormId: number
      data: ParamFormUpdateData
    }) => {
      const token = getAccessToken()
      return updateParamForm(paramFormId, data, token)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['paramForms'] })
      queryClient.invalidateQueries({
        queryKey: ['paramForm', variables.paramFormId],
      })
    },
  })
}

export const usePatchParamFormMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      paramFormId,
      data,
    }: {
      paramFormId: number
      data: ParamFormPatchData
    }) => {
      const token = getAccessToken()
      return patchParamForm(paramFormId, data, token)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['paramForms'] })
      queryClient.invalidateQueries({
        queryKey: ['paramForm', variables.paramFormId],
      })
    },
  })
}

export const useSwitchParamFormMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      paramFormId,
      data,
    }: {
      paramFormId: number
      data: ParamFormSwitchData
    }) => {
      const token = getAccessToken()
      return switchParamForm(paramFormId, data, token)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['paramForms'] })
      queryClient.invalidateQueries({
        queryKey: ['paramForm', variables.paramFormId],
      })
    },
  })
}

export const useBatchSwitchParamFormsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ParamFormBatchSwitchData) => {
      const token = getAccessToken()
      return batchSwitchParamForms(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paramForms'] })
    },
  })
}

export const useDeleteParamFormMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (paramFormId: number) => {
      const token = getAccessToken()
      return deleteParamForm(paramFormId, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paramForms'] })
    },
  })
}

export const syncParamForms = async (
  data: { only_clear?: boolean },
  token: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/param-forms/sync/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
}

export const exportParamForms = async (
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/param-forms/export/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return await handleResponse(response)
}

export const batchExportParamForms = async (
  data: BatchExportParamFormsData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/param-forms/export/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return await handleResponse(response)
}

export const useSyncParamFormsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: { only_clear?: boolean }) => {
      const token = getAccessToken()
      return syncParamForms(variables, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paramForms'] })
    },
  })
}

export const useExportParamFormsMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      const response = await exportParamForms(token)
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'param_forms_export.json'
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

export const useBatchExportParamFormsMutation = () => {
  return useMutation({
    mutationFn: async (variables: BatchExportParamFormsData) => {
      const token = getAccessToken()
      const response = await batchExportParamForms(variables, token)
      const blob = await response.blob()
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : 'param_forms_export.json'
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

export const useBatchDeleteParamFormsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ParamFormBatchDeleteData) => {
      const token = getAccessToken()
      return batchDeleteParamForms(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paramForms'] })
    },
  })
}
