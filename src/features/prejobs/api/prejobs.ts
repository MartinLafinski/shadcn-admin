// 引入reactQuery依赖
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// 分页相关
import {
  extracted_pagination,
  type PaginationInfoData,
} from '@/config/pagination'
import { getAccessToken } from '@/lib/auth-token'
import type {
  PrejobItemData,
  PrejobCreateData,
  PrejobSwitchData,
  PrejobUpdateData,
  BatchSwitchPrejobsData,
  BatchExportPrejobsData,
  PatchPrejobData,
  BatchLockPrejobsData,
  BatchPausePrejobsData,
  SyncPrejobsData,
} from '../data/schemas.ts'

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const PAGE_SIZE: number = Number(import.meta.env.VITE_PREJOB_PAGE_SIZE || 50)

// 通用错误处理
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

/**
 * 获取预备作业列表
 */
export const fetchPrejobs = async (
  industry_id: number | undefined = undefined,
  website_id: number | undefined = undefined,
  entrypoint_id: number | undefined = undefined,
  jobgroup_id: number | undefined = undefined,
  prejob_keyword: string | undefined = undefined,
  prejob_level: string | undefined = undefined,
  prejob_enabled: boolean | undefined = undefined,
  prejob_locked: boolean | undefined = undefined,
  prejob_paused: boolean | undefined = undefined,
  prejob_limited: boolean | undefined = undefined,
  deeply_search: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE,
  token: string | null
): Promise<{
  prejobs: PrejobItemData[]
  pagination: PaginationInfoData
}> => {
  let url = `${API_BASE_URL}/prejobs/?page=${page}&size=${size}`

  if (industry_id) {
    url += `&industry_id=${industry_id}`
  }

  if (website_id) {
    url += `&website_id=${website_id}`
  }

  if (entrypoint_id) {
    url += `&entrypoint_id=${entrypoint_id}`
  }

  if (jobgroup_id) {
    url += `&jobgroup_id=${jobgroup_id}`
  }

  if (prejob_keyword) {
    url += `&prejob_keyword=${prejob_keyword}`
  }

  if (prejob_level) {
    url += `&prejob_level=${prejob_level}`
  }

  if (prejob_enabled !== undefined) {
    url += `&prejob_enabled=${prejob_enabled}`
  }

  if (prejob_locked !== undefined) {
    url += `&prejob_locked=${prejob_locked}`
  }

  if (prejob_paused !== undefined) {
    url += `&prejob_paused=${prejob_paused}`
  }

  if (prejob_limited !== undefined) {
    url += `&prejob_limited=${prejob_limited}`
  }

  if (deeply_search !== undefined && deeply_search !== null) {
    url += `&deeply_search=${deeply_search}`
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  await handleResponse(response)

  const pagination = extracted_pagination(response)

  const prejobs: PrejobItemData[] = await response.json()

  return {
    prejobs,
    pagination,
  }
}

/**
 * 根据ID获取预备作业详细信息
 */
export const fetchPrejobById = async (
  prejobId: number,
  token: string | null
): Promise<PrejobItemData> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/${prejobId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
  return response.json()
}

// 创建预备作业
export const createPrejob = async (
  data: PrejobCreateData,
  token: string | null
): Promise<PrejobItemData> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/`, {
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

/**
 * 更新预备作业信息
 */
export const updatePrejob = async (
  prejobId: number,
  data: PrejobUpdateData,
  token: string | null
): Promise<PrejobItemData> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/${prejobId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}

/**
 * 部分更新预备作业配置
 */
export const patchPrejob = async (
  prejobId: number,
  data: PatchPrejobData,
  token: string | null
): Promise<PrejobItemData> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/${prejobId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}

/**
 * 切换预备作业启用状态
 */
export const switchPrejob = async (
  prejobId: number,
  data: PrejobSwitchData,
  token: string | null
): Promise<PrejobItemData> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/${prejobId}/switch/`, {
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

/**
 * 删除指定预备作业
 */
export const deletePrejob = async (
  prejobId: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/${prejobId}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 批量切换预备作业启用状态
 */
export const batchSwitchPrejobs = async (
  data: BatchSwitchPrejobsData,
  token: string | null
): Promise<Record<number, PrejobItemData>> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/switch/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}

export const batchDeletePrejobs = async (
  prejobIds: number[],
  token: string | null
): Promise<Response> => {
  const params = prejobIds.map((id) => `prejob_ids=${id}`).join('&')
  const response = await fetch(`${API_BASE_URL}/prejobs/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 同步预备作业数据
 */
export const syncPrejobs = async (
  token: string | null,
  data: SyncPrejobsData
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/sync/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
}

/**
 * 导出所有预备作业数据
 */
export const exportPrejobs = async (
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/export/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 批量导出指定预备作业数据
 */
export const batchExportPrejobs = async (
  data: BatchExportPrejobsData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/export/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return await handleResponse(response)
}

/**
 * 批量锁定/解锁预备作业
 *
 * 此函数用于批量切换多个预备作业的锁定状态，通过向后端API发送PUT请求来更改多个预备作业的锁定/解锁状态
 *
 * @param data - 包含批量锁定状态的数据对象，符合 BatchLockPrejobsData 接口定义
 *              通常包含以下字段：
 *              - prejob_ids: number[] - 需要切换状态的预备作业ID数组
 *              - prejob_locked: boolean - 目标锁定状态，true为锁定，false为解锁
 *
 * @param token - 鉴权token
 * @returns Promise<Record<number, PrejobItemData>> - 返回操作结果的Promise
 *                                返回一个对象，键为预备作业ID，值为完整预备作业信息
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 注意事项:
 * - 该函数会向 /prejobs/lock/ 端点发送PUT请求
 * - 确保传入的prejob_ids数组中的ID都是有效的预备作业ID
 * - data参数需要符合BatchLockPrejobsData接口定义的结构
 * - 此操作是批量操作，会影响多个预备作业的状态，请谨慎使用
 */
export const batchLockPrejobs = async (
  data: BatchLockPrejobsData,
  token: string | null
): Promise<Record<number, PrejobItemData>> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/lock/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}

/**
 * 批量暂停/恢复预备作业
 *
 * 此函数用于批量切换多个预备作业的暂停状态，通过向后端API发送PUT请求来更改多个预备作业的暂停/恢复状态
 *
 * @param data - 包含批量暂停状态的数据对象，符合 BatchPausePrejobsData 接口定义
 *              通常包含以下字段：
 *              - prejob_ids: number[] - 需要切换状态的预备作业ID数组
 *              - prejob_paused: boolean - 目标暂停状态，true为暂停，false为恢复
 *
 * @param token - 鉴权token
 * @returns Promise<Record<number, PrejobItemData>> - 返回操作结果的Promise
 *                                返回一个对象，键为预备作业ID，值为完整预备作业信息
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 注意事项:
 * - 该函数会向 /prejobs/pause/ 端点发送PUT请求
 * - 确保传入的prejob_ids数组中的ID都是有效的预备作业ID
 * - data参数需要符合BatchPausePrejobsData接口定义的结构
 * - 此操作是批量操作，会影响多个预备作业的状态，请谨慎使用
 */
export const batchPausePrejobs = async (
  data: BatchPausePrejobsData,
  token: string | null
): Promise<Record<number, PrejobItemData>> => {
  const response = await fetch(`${API_BASE_URL}/prejobs/pause/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}

/**
 * 获取预备作业列表的自定义 Hook
 */
export const usePrejobsQuery = (
  industry_id: number | undefined = undefined,
  website_id: number | undefined = undefined,
  entrypoint_id: number | undefined = undefined,
  jobgroup_id: number | undefined = undefined,
  prejob_keyword: string | undefined = undefined,
  prejob_level: string | undefined = undefined,
  prejob_enabled: boolean | undefined = undefined,
  prejob_locked: boolean | undefined = undefined,
  prejob_paused: boolean | undefined = undefined,
  prejob_limited: boolean | undefined = undefined,
  deeply_search: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE
) => {
  return useQuery({
    queryKey: [
      'prejobs',
      industry_id,
      website_id,
      entrypoint_id,
      jobgroup_id,
      prejob_keyword,
      prejob_level,
      prejob_enabled,
      prejob_locked,
      prejob_paused,
      prejob_limited,
      deeply_search,
      page,
      size,
    ],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchPrejobs(
        industry_id,
        website_id,
        entrypoint_id,
        jobgroup_id,
        prejob_keyword,
        prejob_level,
        prejob_enabled,
        prejob_locked,
        prejob_paused,
        prejob_limited,
        deeply_search,
        page,
        size,
        token
      )
    },
    placeholderData: (previousData) => previousData,
  })
}

/**
 * 根据预备作业ID获取单个预备作业详细信息的自定义 Hook
 */
export const usePrejobQuery = (prejobId: number) => {
  return useQuery({
    queryKey: ['prejob', prejobId],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchPrejobById(prejobId, token)
    },
    enabled: !!prejobId,
  })
}

/**
 * 创建预备作业的自定义 Mutation Hook
 */
export const useCreatePrejobMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: PrejobCreateData) => {
      const token = getAccessToken()
      return createPrejob(variables, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
    },
  })
}

/**
 * 更新预备作业信息的自定义 Mutation Hook
 */
export const useUpdatePrejobMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      prejobId: number
      data: PrejobUpdateData
    }) => {
      const token = getAccessToken()
      return updatePrejob(variables.prejobId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
      queryClient.invalidateQueries({
        queryKey: ['prejob', variables.prejobId],
      })
    },
  })
}

/**
 * 部分更新预备作业信息的自定义 Mutation Hook
 */
export const usePatchPrejobMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      prejobId: number
      data: PatchPrejobData
    }) => {
      const token = getAccessToken()
      return patchPrejob(variables.prejobId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
      queryClient.invalidateQueries({
        queryKey: ['prejob', variables.prejobId],
      })
    },
  })
}

/**
 * 切换预备作业启用状态的自定义 Mutation Hook
 */
export const useSwitchPrejobMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      prejobId: number
      data: PrejobSwitchData
    }) => {
      const token = getAccessToken()
      return switchPrejob(variables.prejobId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
      queryClient.invalidateQueries({
        queryKey: ['prejob', variables.prejobId],
      })
    },
  })
}

/**
 * 批量切换预备作业启用状态的自定义 Mutation Hook
 */
export const useBatchSwitchPrejobsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: BatchSwitchPrejobsData) => {
      const token = getAccessToken()
      return batchSwitchPrejobs(variables, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
      if (variables.prejob_ids && Array.isArray(variables.prejob_ids)) {
        variables.prejob_ids.forEach((prejob_id) => {
          queryClient.invalidateQueries({ queryKey: ['prejob', prejob_id] })
        })
      }
    },
  })
}

/**
 * 同步预备作业数据的自定义 Mutation Hook
 */
export const useSyncPrejobsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: SyncPrejobsData) => {
      const token = getAccessToken()
      return syncPrejobs(token, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
    },
  })
}

/**
 * 导出所有预备作业数据的自定义 Mutation Hook
 */
export const useExportPrejobsMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      return exportPrejobs(token)
    },
  })
}

/**
 * 批量导出指定预备作业数据的自定义 Mutation Hook
 */
export const useBatchExportPrejobsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: BatchExportPrejobsData) => {
      const token = getAccessToken()
      return batchExportPrejobs(variables, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
    },
  })
}

/**
 * 批量删除预备作业的自定义 Mutation Hook
 */
export const useBatchDeletePrejobsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: number[]) => {
      const token = getAccessToken()
      return batchDeletePrejobs(variables, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
    },
  })
}

/**
 * 删除预备作业的自定义 Mutation Hook
 */
export const useDeletePrejobMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: { prejobId: number }) => {
      const token = getAccessToken()
      return deletePrejob(variables.prejobId, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
      queryClient.invalidateQueries({
        queryKey: ['prejob', variables.prejobId],
      })
    },
  })
}

/**
 * 批量锁定/解锁预备作业的自定义 Mutation Hook
 */
export const useBatchLockPrejobsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: BatchLockPrejobsData) => {
      const token = getAccessToken()
      return batchLockPrejobs(variables, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
      if (variables.prejob_ids && Array.isArray(variables.prejob_ids)) {
        variables.prejob_ids.forEach((prejob_id) => {
          queryClient.invalidateQueries({ queryKey: ['prejob', prejob_id] })
        })
      }
    },
  })
}

/**
 * 批量暂停/恢复预备作业的自定义 Mutation Hook
 */
export const useBatchPausePrejobsMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: BatchPausePrejobsData) => {
      const token = getAccessToken()
      return batchPausePrejobs(variables, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
      if (variables.prejob_ids && Array.isArray(variables.prejob_ids)) {
        variables.prejob_ids.forEach((prejob_id) => {
          queryClient.invalidateQueries({ queryKey: ['prejob', prejob_id] })
        })
      }
    },
  })
}
