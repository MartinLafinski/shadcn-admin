import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  extracted_pagination,
  type PaginationInfoData,
} from '@/config/pagination'
import { getAccessToken } from '@/lib/auth-token'
import type {
  SpiderSessionCreateData,
  SpiderSessionItemData,
  SpiderSessionSwitchData,
  SpiderSessionUpdateData,
  BatchSwitchSpiderSessionsData,
  BatchExportSpiderSessionsData,
  PatchSpiderSessionData,
  BatchLockSpiderSessionsData,
  BatchPauseSpiderSessionsData,
  SyncSpiderSessionsData,
} from '../data/schemas.ts'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const PAGE_SIZE: number = Number(
  import.meta.env.VITE_SPIDER_SESSION_PAGE_SIZE || 50
)

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const e = await response.text()
    throw new Error(e || `HTTP ${response.status}`)
  }
  return response
}

export const fetchSpiderSessions = async (
  keyword: string | undefined,
  enabled: boolean | undefined,
  website_id: number | undefined,
  locked: boolean | undefined,
  paused: boolean | undefined,
  limited: boolean | undefined,
  expired: boolean | undefined,
  session_pool_id: number | undefined,
  page: number = 1,
  size: number = PAGE_SIZE,
  token: string | null
): Promise<{
  spiderSessions: SpiderSessionItemData[]
  pagination: PaginationInfoData
}> => {
  let url = `${API_BASE_URL}/spider/sessions/?page=${page}&size=${size}`
  if (keyword) url += `&keyword=${keyword}`
  if (enabled !== undefined) url += `&enabled=${enabled}`
  if (website_id) url += `&website_id=${website_id}`
  if (locked !== undefined) url += `&locked=${locked}`
  if (paused !== undefined) url += `&paused=${paused}`
  if (limited !== undefined) url += `&limited=${limited}`
  if (expired !== undefined) url += `&expired=${expired}`
  if (session_pool_id !== undefined)
    url += `&session_pool_id=${session_pool_id}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  await handleResponse(res)
  const pagination = extracted_pagination(res)
  const spiderSessions: SpiderSessionItemData[] = await res.json()
  return { spiderSessions, pagination }
}

export const fetchSpiderSessionById = async (
  id: number,
  token: string | null
): Promise<SpiderSessionItemData> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/${id}/`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  await handleResponse(res)
  return res.json()
}

export const createSpiderSession = async (
  data: SpiderSessionCreateData,
  token: string | null
): Promise<SpiderSessionItemData> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(res)
  return res.json()
}

export const updateSpiderSession = async (
  id: number,
  data: SpiderSessionUpdateData,
  token: string | null
): Promise<SpiderSessionItemData> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/${id}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(res)
  return res.json()
}

export const patchSpiderSession = async (
  id: number,
  data: PatchSpiderSessionData,
  token: string | null
): Promise<SpiderSessionItemData> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(res)
  return res.json()
}

export const switchSpiderSession = async (
  id: number,
  data: SpiderSessionSwitchData,
  token: string | null
): Promise<SpiderSessionItemData> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/${id}/switch/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(res)
  return res.json()
}

export const deleteSpiderSession = async (
  id: number,
  token: string | null
): Promise<Response> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/${id}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  return await handleResponse(res)
}

export const batchDeleteSpiderSessions = async (
  ids: number[],
  token: string | null
): Promise<Response> => {
  const p = ids.map((id) => `session_ids=${id}`).join('&')
  const res = await fetch(`${API_BASE_URL}/spider/sessions/?${p}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(res)
}

export const batchSwitchSpiderSessions = async (
  data: BatchSwitchSpiderSessionsData,
  token: string | null
): Promise<Record<number, SpiderSessionItemData>> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/switch/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(res)
  return res.json()
}

export const batchLockSpiderSessions = async (
  data: BatchLockSpiderSessionsData,
  token: string | null
): Promise<Record<number, SpiderSessionItemData>> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/lock/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(res)
  return res.json()
}

export const batchPauseSpiderSessions = async (
  data: BatchPauseSpiderSessionsData,
  token: string | null
): Promise<Record<number, SpiderSessionItemData>> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/pause/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(res)
  return res.json()
}

export const syncSpiderSessions = async (
  token: string | null,
  data: SyncSpiderSessionsData
): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/sync/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  await handleResponse(res)
}

export const exportSpiderSessions = async (
  token: string | null
): Promise<Response> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/export/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  return await handleResponse(res)
}

export const batchExportSpiderSessions = async (
  data: BatchExportSpiderSessionsData,
  token: string | null
): Promise<Response> => {
  const res = await fetch(`${API_BASE_URL}/spider/sessions/export/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return await handleResponse(res)
}

// ==================================================================================================
// React Query Hooks
// ==================================================================================================

export const useSpiderSessionsQuery = (
  keyword?: string,
  enabled?: boolean,
  website_id?: number,
  locked?: boolean,
  paused?: boolean,
  limited?: boolean,
  expired?: boolean,
  session_pool_id?: number,
  page: number = 1,
  size: number = PAGE_SIZE
) => {
  return useQuery({
    queryKey: [
      'spider-sessions',
      keyword,
      enabled,
      website_id,
      locked,
      paused,
      limited,
      expired,
      session_pool_id,
      page,
      size,
    ],
    queryFn: async () => {
      const t = getAccessToken()
      return fetchSpiderSessions(
        keyword,
        enabled,
        website_id,
        locked,
        paused,
        limited,
        expired,
        session_pool_id,
        page,
        size,
        t
      )
    },
    placeholderData: (prev) => prev,
  })
}

export const useSpiderSessionQuery = (id: number) => {
  return useQuery({
    queryKey: ['spider-session', id],
    queryFn: async () => {
      const t = getAccessToken()
      return fetchSpiderSessionById(id, t)
    },
    enabled: !!id,
  })
}

export const useCreateSpiderSessionMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (d: SpiderSessionCreateData) => {
      const t = getAccessToken()
      return createSpiderSession(d, t)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spider-sessions'] }),
  })
}

export const useUpdateSpiderSessionMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (v: { id: number; data: SpiderSessionUpdateData }) => {
      const t = getAccessToken()
      return updateSpiderSession(v.id, v.data, t)
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['spider-sessions'] })
      qc.invalidateQueries({ queryKey: ['spider-session', v.id] })
    },
  })
}

export const usePatchSpiderSessionMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (v: { id: number; data: PatchSpiderSessionData }) => {
      const t = getAccessToken()
      return patchSpiderSession(v.id, v.data, t)
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['spider-sessions'] })
      qc.invalidateQueries({ queryKey: ['spider-session', v.id] })
    },
  })
}

export const useSwitchSpiderSessionMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (v: { id: number; data: SpiderSessionSwitchData }) => {
      const t = getAccessToken()
      return switchSpiderSession(v.id, v.data, t)
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['spider-sessions'] })
      qc.invalidateQueries({ queryKey: ['spider-session', v.id] })
    },
  })
}

export const useBatchSwitchSpiderSessionsMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (d: BatchSwitchSpiderSessionsData) => {
      const t = getAccessToken()
      return batchSwitchSpiderSessions(d, t)
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['spider-sessions'] })
      v.session_ids?.forEach((id: number) =>
        qc.invalidateQueries({ queryKey: ['spider-session', id] })
      )
    },
  })
}

export const useBatchLockSpiderSessionsMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (d: BatchLockSpiderSessionsData) => {
      const t = getAccessToken()
      return batchLockSpiderSessions(d, t)
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['spider-sessions'] })
      v.session_ids?.forEach((id: number) =>
        qc.invalidateQueries({ queryKey: ['spider-session', id] })
      )
    },
  })
}

export const useBatchPauseSpiderSessionsMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (d: BatchPauseSpiderSessionsData) => {
      const t = getAccessToken()
      return batchPauseSpiderSessions(d, t)
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['spider-sessions'] })
      v.session_ids?.forEach((id: number) =>
        qc.invalidateQueries({ queryKey: ['spider-session', id] })
      )
    },
  })
}

export const useDeleteSpiderSessionMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (v: { id: number }) => {
      const t = getAccessToken()
      return deleteSpiderSession(v.id, t)
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['spider-sessions'] })
      qc.invalidateQueries({ queryKey: ['spider-session', v.id] })
    },
  })
}

export const useBatchDeleteSpiderSessionsMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (ids: number[]) => {
      const t = getAccessToken()
      return batchDeleteSpiderSessions(ids, t)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spider-sessions'] }),
  })
}

export const useSyncSpiderSessionsMutation = () => {
  return useMutation({
    mutationFn: async (d: SyncSpiderSessionsData) => {
      const t = getAccessToken()
      return syncSpiderSessions(t, d)
    },
  })
}

export const useExportSpiderSessionsMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const t = getAccessToken()
      return exportSpiderSessions(t)
    },
  })
}

export const useBatchExportSpiderSessionsMutation = () => {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (d: BatchExportSpiderSessionsData) => {
      const t = getAccessToken()
      return batchExportSpiderSessions(d, t)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['spider-sessions'] }),
  })
}
