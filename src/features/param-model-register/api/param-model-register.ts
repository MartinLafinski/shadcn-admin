import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { extracted_pagination } from '@/config/pagination'
import { getAccessToken } from '@/lib/auth-token'
import {
  type ParamModelRegisterCreateData,
  type ParamModelRegisterData,
  type ParamModelRegistersData,
  type ParamModelRegisterUpdateData,
  type RegisterShardData,
} from '../data/schemas'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const PAGE_SIZE: number = Number(
  import.meta.env.VITE_PARAM_MODEL_REGISTER_PAGE_SIZE || 50
)

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

export const fetchParamModelRegisters = async (
  spider_slug: string | undefined = undefined,
  category_type: string | undefined = undefined,
  category_slug: string | undefined = undefined,
  param_form_slug: string | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE,
  token: string | null
): Promise<ParamModelRegistersData> => {
  let url = `${API_BASE_URL}/param-model-register/?page=${page}&size=${size}`
  if (spider_slug) url += `&spider_slug=${encodeURIComponent(spider_slug)}`
  if (category_type)
    url += `&category_type=${encodeURIComponent(category_type)}`
  if (category_slug)
    url += `&category_slug=${encodeURIComponent(category_slug)}`
  if (param_form_slug)
    url += `&param_form_slug=${encodeURIComponent(param_form_slug)}`
  const response = await fetch(url, {
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  })
  await handleResponse(response)
  const pagination = extracted_pagination(response)
  const registers: ParamModelRegisterData[] = await response.json()
  return { registers, pagination }
}

export const fetchParamModelRegisterById = async (
  registerId: number,
  token: string | null
): Promise<ParamModelRegisterData> => {
  const response = await fetch(
    `${API_BASE_URL}/param-model-register/${registerId}/`,
    { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
  )
  await handleResponse(response)
  return response.json()
}

export const createParamModelRegister = async (
  data: ParamModelRegisterCreateData,
  token: string | null
): Promise<ParamModelRegisterData> => {
  const response = await fetch(`${API_BASE_URL}/param-model-register/`, {
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

export const updateParamModelRegister = async (
  registerId: number,
  data: ParamModelRegisterUpdateData,
  token: string | null
): Promise<ParamModelRegisterData> => {
  const response = await fetch(
    `${API_BASE_URL}/param-model-register/${registerId}/`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    }
  )
  await handleResponse(response)
  return response.json()
}

export const deleteParamModelRegister = async (
  registerId: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(
    `${API_BASE_URL}/param-model-register/${registerId}/`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    }
  )
  return await handleResponse(response)
}

export const syncParamModelRegisters = async (
  token: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/param-model-register/sync/`, {
    method: 'POST',
    headers: { ...(token && { Authorization: `Bearer ${token}` }) },
  })
  await handleResponse(response)
}

export const registerShard = async (
  registerId: number,
  data: RegisterShardData,
  token: string | null
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/param-model-register/${registerId}/shards/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    }
  )
  await handleResponse(response)
}

export const fetchShards = async (
  registerId: number,
  token: string | null
): Promise<string[]> => {
  const response = await fetch(
    `${API_BASE_URL}/param-model-register/${registerId}/shards/`,
    { headers: { ...(token && { Authorization: `Bearer ${token}` }) } }
  )
  await handleResponse(response)
  return response.json()
}

export const nextShard = async (
  registerId: number,
  token: string | null
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/param-model-register/${registerId}/shards/next/`,
    {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    }
  )
  await handleResponse(response)
}

// =============================================================================
// TanStack Query Hooks
// =============================================================================

export const useParamModelRegistersQuery = (
  spider_slug: string | undefined = undefined,
  category_type: string | undefined = undefined,
  category_slug: string | undefined = undefined,
  param_form_slug: string | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE
) => {
  return useQuery({
    queryKey: [
      'param-model-register',
      spider_slug,
      category_type,
      category_slug,
      param_form_slug,
      page,
      size,
    ],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchParamModelRegisters(
        spider_slug,
        category_type,
        category_slug,
        param_form_slug,
        page,
        size,
        token
      )
    },
    placeholderData: (previousData) => previousData,
  })
}

export const useParamModelRegisterQuery = (registerId: number) => {
  return useQuery({
    queryKey: ['param-model-register', registerId],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchParamModelRegisterById(registerId, token)
    },
    enabled: !!registerId,
  })
}

export const useCreateParamModelRegisterMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: ParamModelRegisterCreateData) => {
      const token = getAccessToken()
      return createParamModelRegister(variables, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['param-model-register'] })
    },
  })
}

export const useUpdateParamModelRegisterMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: {
      registerId: number
      data: ParamModelRegisterUpdateData
    }) => {
      const token = getAccessToken()
      return updateParamModelRegister(
        variables.registerId,
        variables.data,
        token
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['param-model-register'] })
      queryClient.invalidateQueries({
        queryKey: ['param-model-register', variables.registerId],
      })
    },
  })
}

export const useDeleteParamModelRegisterMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (variables: { registerId: number }) => {
      const token = getAccessToken()
      return deleteParamModelRegister(variables.registerId, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['param-model-register'] })
      queryClient.invalidateQueries({
        queryKey: ['param-model-register', variables.registerId],
      })
    },
  })
}

export const useSyncParamModelRegistersMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      return syncParamModelRegisters(token)
    },
  })
}

export const useRegisterShardMutation = () => {
  return useMutation({
    mutationFn: async (variables: {
      registerId: number
      data: RegisterShardData
    }) => {
      const token = getAccessToken()
      return registerShard(variables.registerId, variables.data, token)
    },
  })
}

export const useShardsQuery = (registerId: number) => {
  return useQuery({
    queryKey: ['param-model-register', registerId, 'shards'],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchShards(registerId, token)
    },
    enabled: !!registerId,
  })
}

export const useNextShardMutation = () => {
  return useMutation({
    mutationFn: async (registerId: number) => {
      const token = getAccessToken()
      return nextShard(registerId, token)
    },
  })
}
