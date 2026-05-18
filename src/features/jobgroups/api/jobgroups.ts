import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  extracted_pagination,
  type PaginationInfoData,
} from '@/config/pagination'
import { getAccessToken } from '@/lib/auth-token'
import type {
  JobGroupCreateData,
  JobGroupItemData,
  JobGroupSwitchData,
  JobGroupUpdateData,
  BatchSwitchJobGroupsData,
  BatchExportJobGroupsData,
  PatchJobGroupData,
  BatchLockJobGroupsData,
  BatchPauseJobGroupsData,
  SyncJobGroupsData,
} from '../data/schemas.ts'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const PAGE_SIZE: number = Number(import.meta.env.VITE_JOBGROUP_PAGE_SIZE || 50)

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

export const fetchJobGroups = async (
  keyword: string | undefined = undefined,
  enabled: boolean | undefined = undefined,
  locked: boolean | undefined = undefined,
  paused: boolean | undefined = undefined,
  limited: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE,
  token: string | null
): Promise<{
  jobGroups: JobGroupItemData[]
  pagination: PaginationInfoData
}> => {
  let url = `${API_BASE_URL}/jobgroups/?page=${page}&size=${size}`
  if (keyword) url += `&keyword=${keyword}`
  if (enabled !== undefined) url += `&enabled=${enabled}`
  if (locked !== undefined) url += `&locked=${locked}`
  if (paused !== undefined) url += `&paused=${paused}`
  if (limited !== undefined) url += `&limited=${limited}`

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  await handleResponse(response)
  const pagination = extracted_pagination(response)
  const jobGroups: JobGroupItemData[] = await response.json()
  return { jobGroups, pagination }
}

export const fetchJobGroupById = async (
  id: number,
  token: string | null
): Promise<JobGroupItemData> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  await handleResponse(response)
  return response.json()
}

export const createJobGroup = async (
  data: JobGroupCreateData,
  token: string | null
): Promise<JobGroupItemData> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/`, {
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

export const updateJobGroup = async (
  id: number,
  data: JobGroupUpdateData,
  token: string | null
): Promise<JobGroupItemData> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/${id}/`, {
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

export const patchJobGroup = async (
  id: number,
  data: PatchJobGroupData,
  token: string | null
): Promise<JobGroupItemData> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/${id}/`, {
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

export const switchJobGroup = async (
  id: number,
  data: JobGroupSwitchData,
  token: string | null
): Promise<JobGroupItemData> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/${id}/switch/`, {
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

export const deleteJobGroup = async (
  id: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/${id}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return await handleResponse(response)
}

export const batchDeleteJobGroups = async (
  ids: number[],
  token: string | null
): Promise<Response> => {
  const params = ids.map((id) => `jobgroup_ids=${id}`).join('&')
  const response = await fetch(`${API_BASE_URL}/jobgroups/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

export const batchSwitchJobGroups = async (
  data: BatchSwitchJobGroupsData,
  token: string | null
): Promise<Record<number, JobGroupItemData>> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/switch/`, {
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

export const batchLockJobGroups = async (
  data: BatchLockJobGroupsData,
  token: string | null
): Promise<Record<number, JobGroupItemData>> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/lock/`, {
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

export const batchPauseJobGroups = async (
  data: BatchPauseJobGroupsData,
  token: string | null
): Promise<Record<number, JobGroupItemData>> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/pause/`, {
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

export const syncJobGroups = async (
  token: string | null,
  data: SyncJobGroupsData
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/sync/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
}

export const exportJobGroups = async (
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/export/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return await handleResponse(response)
}

export const batchExportJobGroups = async (
  data: BatchExportJobGroupsData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/jobgroups/export/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return await handleResponse(response)
}

// ==================================================================================================
// React Query Hooks
// ==================================================================================================

export const useJobGroupsQuery = (
  keyword: string | undefined = undefined,
  enabled: boolean | undefined = undefined,
  locked: boolean | undefined = undefined,
  paused: boolean | undefined = undefined,
  limited: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE
) => {
  return useQuery({
    queryKey: [
      'jobgroups',
      keyword,
      enabled,
      locked,
      paused,
      limited,
      page,
      size,
    ],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchJobGroups(
        keyword,
        enabled,
        locked,
        paused,
        limited,
        page,
        size,
        token
      )
    },
    placeholderData: (previousData) => previousData,
  })
}

export const useJobGroupQuery = (id: number) => {
  return useQuery({
    queryKey: ['jobgroup', id],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchJobGroupById(id, token)
    },
    enabled: !!id,
  })
}

export const useCreateJobGroupMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: JobGroupCreateData) => {
      const token = getAccessToken()
      return createJobGroup(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobgroups'] })
    },
  })
}

export const useUpdateJobGroupMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (v: { id: number; data: JobGroupUpdateData }) => {
      const token = getAccessToken()
      return updateJobGroup(v.id, v.data, token)
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['jobgroups'] })
      queryClient.invalidateQueries({ queryKey: ['jobgroup', v.id] })
    },
  })
}

export const usePatchJobGroupMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (v: { id: number; data: PatchJobGroupData }) => {
      const token = getAccessToken()
      return patchJobGroup(v.id, v.data, token)
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['jobgroups'] })
      queryClient.invalidateQueries({ queryKey: ['jobgroup', v.id] })
    },
  })
}

export const useSwitchJobGroupMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (v: { id: number; data: JobGroupSwitchData }) => {
      const token = getAccessToken()
      return switchJobGroup(v.id, v.data, token)
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['jobgroups'] })
      queryClient.invalidateQueries({ queryKey: ['jobgroup', v.id] })
    },
  })
}

export const useBatchSwitchJobGroupsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: BatchSwitchJobGroupsData) => {
      const token = getAccessToken()
      return batchSwitchJobGroups(data, token)
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['jobgroups'] })
      if (v.jobgroup_ids)
        v.jobgroup_ids.forEach((id: number) =>
          queryClient.invalidateQueries({ queryKey: ['jobgroup', id] })
        )
    },
  })
}

export const useBatchLockJobGroupsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: BatchLockJobGroupsData) => {
      const token = getAccessToken()
      return batchLockJobGroups(data, token)
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['jobgroups'] })
      if (v.jobgroup_ids)
        v.jobgroup_ids.forEach((id: number) =>
          queryClient.invalidateQueries({ queryKey: ['jobgroup', id] })
        )
    },
  })
}

export const useBatchPauseJobGroupsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: BatchPauseJobGroupsData) => {
      const token = getAccessToken()
      return batchPauseJobGroups(data, token)
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['jobgroups'] })
      if (v.jobgroup_ids)
        v.jobgroup_ids.forEach((id: number) =>
          queryClient.invalidateQueries({ queryKey: ['jobgroup', id] })
        )
    },
  })
}

export const useDeleteJobGroupMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (v: { id: number }) => {
      const token = getAccessToken()
      return deleteJobGroup(v.id, token)
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ['jobgroups'] })
      queryClient.invalidateQueries({ queryKey: ['jobgroup', v.id] })
    },
  })
}

export const useBatchDeleteJobGroupsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const token = getAccessToken()
      return batchDeleteJobGroups(ids, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobgroups'] })
    },
  })
}

export const useSyncJobGroupsMutation = () => {
  return useMutation({
    mutationFn: async (data: SyncJobGroupsData) => {
      const token = getAccessToken()
      return syncJobGroups(token, data)
    },
  })
}

export const useExportJobGroupsMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      return exportJobGroups(token)
    },
  })
}

export const useBatchExportJobGroupsMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: BatchExportJobGroupsData) => {
      const token = getAccessToken()
      return batchExportJobGroups(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobgroups'] })
    },
  })
}
