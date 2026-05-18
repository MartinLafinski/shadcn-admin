import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  extracted_pagination,
  type PaginationInfoData,
} from '@/config/pagination'
import { getAccessToken } from '@/lib/auth-token'
import type {
  SpiderPackageCreateData,
  SpiderPackageItemData,
  SpiderPackageSwitchData,
  SpiderPackageUpdateData,
  BatchSwitchSpiderPackagesData,
  BatchExportSpiderPackagesData,
  PatchSpiderPackageData,
  SpiderPackageReleaseData,
  CreateSpiderPackageReleaseData,
  UpdateSpiderPackageReleaseData,
} from '../data/schemas.ts'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const PAGE_SIZE: number = Number(
  import.meta.env.VITE_SPIDER_PACKAGE_PAGE_SIZE || 50
)

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

// ==================================================================================================
// 获取爬虫包列表
// ==================================================================================================
export const fetchSpiderPackages = async (
  spider_package_keyword: string | undefined = undefined,
  spider_package_enabled: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE,
  token: string | null
): Promise<{
  spiderPackages: SpiderPackageItemData[]
  pagination: PaginationInfoData
}> => {
  let url = `${API_BASE_URL}/spider/packages/?page=${page}&size=${size}`

  if (spider_package_keyword) {
    url += `&spider_package_keyword=${spider_package_keyword}`
  }

  if (spider_package_enabled !== undefined) {
    url += `&spider_package_enabled=${spider_package_enabled}`
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  await handleResponse(response)

  const pagination = extracted_pagination(response)
  const spiderPackages: SpiderPackageItemData[] = await response.json()

  return {
    spiderPackages,
    pagination,
  }
}

// ==================================================================================================
// 根据ID获取爬虫包
// ==================================================================================================
export const fetchSpiderPackageById = async (
  spiderPackageId: number,
  token: string | null
): Promise<SpiderPackageItemData> => {
  const response = await fetch(
    `${API_BASE_URL}/spider/packages/${spiderPackageId}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  await handleResponse(response)
  return response.json()
}

// ==================================================================================================
// 创建爬虫包
// ==================================================================================================
export const createSpiderPackage = async (
  data: SpiderPackageCreateData,
  token: string | null
): Promise<SpiderPackageItemData> => {
  const response = await fetch(`${API_BASE_URL}/spider/packages/`, {
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

// ==================================================================================================
// 更新爬虫包
// ==================================================================================================
export const updateSpiderPackage = async (
  spiderPackageId: number,
  data: SpiderPackageUpdateData,
  token: string | null
): Promise<SpiderPackageItemData> => {
  const response = await fetch(
    `${API_BASE_URL}/spider/packages/${spiderPackageId}/`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )
  await handleResponse(response)
  return response.json()
}

// ==================================================================================================
// 部分更新爬虫包配置
// ==================================================================================================
export const patchSpiderPackage = async (
  spiderPackageId: number,
  data: PatchSpiderPackageData,
  token: string | null
): Promise<SpiderPackageItemData> => {
  const response = await fetch(
    `${API_BASE_URL}/spider/packages/${spiderPackageId}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )
  await handleResponse(response)
  return response.json()
}

// ==================================================================================================
// 切换爬虫包启用状态
// ==================================================================================================
export const switchSpiderPackage = async (
  spiderPackageId: number,
  data: SpiderPackageSwitchData,
  token: string | null
): Promise<SpiderPackageItemData> => {
  const response = await fetch(
    `${API_BASE_URL}/spider/packages/${spiderPackageId}/switch/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )
  await handleResponse(response)
  return response.json()
}

// ==================================================================================================
// 删除爬虫包
// ==================================================================================================
export const deleteSpiderPackage = async (
  spiderPackageId: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(
    `${API_BASE_URL}/spider/packages/${spiderPackageId}/`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return await handleResponse(response)
}

// ==================================================================================================
// 批量删除爬虫包
// ==================================================================================================
export const batchDeleteSpiderPackages = async (
  spiderPackageIds: number[],
  token: string | null
): Promise<Response> => {
  const params = spiderPackageIds
    .map((id) => `spider_package_ids=${id}`)
    .join('&')
  const response = await fetch(`${API_BASE_URL}/spider/packages/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

// ==================================================================================================
// 批量切换爬虫包
// ==================================================================================================
export const batchSwitchSpiderPackages = async (
  data: BatchSwitchSpiderPackagesData,
  token: string | null
): Promise<Record<number, SpiderPackageItemData>> => {
  const response = await fetch(`${API_BASE_URL}/spider/packages/switch/`, {
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

// ==================================================================================================
// 同步爬虫包
// ==================================================================================================
export const syncSpiderPackages = async (
  token: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/spider/packages/sync/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
}

// ==================================================================================================
// 导出全部爬虫包
// ==================================================================================================
export const exportSpiderPackages = async (
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/spider/packages/export/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

// ==================================================================================================
// 批量导出爬虫包
// ==================================================================================================
export const batchExportSpiderPackages = async (
  data: BatchExportSpiderPackagesData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/spider/packages/export/`, {
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

export const useSpiderPackagesQuery = (
  spider_package_keyword: string | undefined = undefined,
  spider_package_enabled: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE
) => {
  return useQuery({
    queryKey: [
      'spider-packages',
      spider_package_keyword,
      spider_package_enabled,
      page,
      size,
    ],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchSpiderPackages(
        spider_package_keyword,
        spider_package_enabled,
        page,
        size,
        token
      )
    },
    placeholderData: (previousData) => previousData,
  })
}

export const useSpiderPackageQuery = (spiderPackageId: number) => {
  return useQuery({
    queryKey: ['spider-package', spiderPackageId],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchSpiderPackageById(spiderPackageId, token)
    },
    enabled: !!spiderPackageId,
  })
}

export const useCreateSpiderPackageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SpiderPackageCreateData) => {
      const token = getAccessToken()
      return createSpiderPackage(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
    },
  })
}

export const useUpdateSpiderPackageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      spiderPackageId: number
      data: SpiderPackageUpdateData
    }) => {
      const token = getAccessToken()
      return updateSpiderPackage(
        variables.spiderPackageId,
        variables.data,
        token
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
      queryClient.invalidateQueries({
        queryKey: ['spider-package', variables.spiderPackageId],
      })
    },
  })
}

export const usePatchSpiderPackageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      spiderPackageId: number
      data: PatchSpiderPackageData
    }) => {
      const token = getAccessToken()
      return patchSpiderPackage(
        variables.spiderPackageId,
        variables.data,
        token
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
      queryClient.invalidateQueries({
        queryKey: ['spider-package', variables.spiderPackageId],
      })
    },
  })
}

export const useSwitchSpiderPackageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      spiderPackageId: number
      data: SpiderPackageSwitchData
    }) => {
      const token = getAccessToken()
      return switchSpiderPackage(
        variables.spiderPackageId,
        variables.data,
        token
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
      queryClient.invalidateQueries({
        queryKey: ['spider-package', variables.spiderPackageId],
      })
    },
  })
}

export const useBatchSwitchSpiderPackagesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BatchSwitchSpiderPackagesData) => {
      const token = getAccessToken()
      return batchSwitchSpiderPackages(data, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
      if (
        variables.spider_package_ids &&
        Array.isArray(variables.spider_package_ids)
      ) {
        variables.spider_package_ids.forEach((id) => {
          queryClient.invalidateQueries({ queryKey: ['spider-package', id] })
        })
      }
    },
  })
}

export const useDeleteSpiderPackageMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: { spiderPackageId: number }) => {
      const token = getAccessToken()
      return deleteSpiderPackage(variables.spiderPackageId, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
      queryClient.invalidateQueries({
        queryKey: ['spider-package', variables.spiderPackageId],
      })
    },
  })
}

export const useBatchDeleteSpiderPackagesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (spiderPackageIds: number[]) => {
      const token = getAccessToken()
      return batchDeleteSpiderPackages(spiderPackageIds, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
    },
  })
}

export const useSyncSpiderPackagesMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      return syncSpiderPackages(token)
    },
  })
}

export const useExportSpiderPackagesMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      return exportSpiderPackages(token)
    },
  })
}

export const useBatchExportSpiderPackagesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BatchExportSpiderPackagesData) => {
      const token = getAccessToken()
      return batchExportSpiderPackages(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
    },
  })
}

// ==================================================================================================
// Release API
// ==================================================================================================

export const fetchReleases = async (
  spiderPackageId: number,
  token: string | null
): Promise<SpiderPackageReleaseData[]> => {
  const res = await fetch(
    `${API_BASE_URL}/spider/packages/${spiderPackageId}/releases/`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  await handleResponse(res)
  return res.json()
}

export const fetchLatestRelease = async (
  spiderPackageId: number,
  token: string | null
): Promise<SpiderPackageReleaseData> => {
  const res = await fetch(
    `${API_BASE_URL}/spider/packages/${spiderPackageId}/releases/latest/`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  await handleResponse(res)
  return res.json()
}

export const createRelease = async (
  spiderPackageId: number,
  data: CreateSpiderPackageReleaseData,
  token: string | null
): Promise<SpiderPackageReleaseData> => {
  const res = await fetch(
    `${API_BASE_URL}/spider/packages/${spiderPackageId}/releases/`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )
  await handleResponse(res)
  return res.json()
}

export const updateRelease = async (
  spiderPackageId: number,
  releaseId: number,
  data: UpdateSpiderPackageReleaseData,
  token: string | null
): Promise<SpiderPackageReleaseData> => {
  const res = await fetch(
    `${API_BASE_URL}/spider/packages/${spiderPackageId}/releases/${releaseId}/`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  )
  await handleResponse(res)
  return res.json()
}

export const deleteRelease = async (
  spiderPackageId: number,
  releaseId: number,
  token: string | null
): Promise<Response> => {
  const res = await fetch(
    `${API_BASE_URL}/spider/packages/${spiderPackageId}/releases/${releaseId}/`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return await handleResponse(res)
}

export const useReleasesQuery = (spiderPackageId: number) => {
  return useQuery({
    queryKey: ['spider-package-releases', spiderPackageId],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchReleases(spiderPackageId, token)
    },
    enabled: !!spiderPackageId,
  })
}

export const useLatestReleaseQuery = (spiderPackageId: number) => {
  return useQuery({
    queryKey: ['spider-package-latest-release', spiderPackageId],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchLatestRelease(spiderPackageId, token)
    },
    enabled: !!spiderPackageId,
  })
}

export const useCreateReleaseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (v: {
      spiderPackageId: number
      data: CreateSpiderPackageReleaseData
    }) => {
      const token = getAccessToken()
      return createRelease(v.spiderPackageId, v.data, token)
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({
        queryKey: ['spider-package-releases', v.spiderPackageId],
      })
      queryClient.invalidateQueries({
        queryKey: ['spider-package-latest-release', v.spiderPackageId],
      })
      queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
    },
  })
}

export const useUpdateReleaseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (v: {
      spiderPackageId: number
      releaseId: number
      data: UpdateSpiderPackageReleaseData
    }) => {
      const token = getAccessToken()
      return updateRelease(v.spiderPackageId, v.releaseId, v.data, token)
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({
        queryKey: ['spider-package-releases', v.spiderPackageId],
      })
      queryClient.invalidateQueries({
        queryKey: ['spider-package-latest-release', v.spiderPackageId],
      })
      queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
    },
  })
}

export const useDeleteReleaseMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (v: { spiderPackageId: number; releaseId: number }) => {
      const token = getAccessToken()
      return deleteRelease(v.spiderPackageId, v.releaseId, token)
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({
        queryKey: ['spider-package-releases', v.spiderPackageId],
      })
      queryClient.invalidateQueries({
        queryKey: ['spider-package-latest-release', v.spiderPackageId],
      })
      queryClient.invalidateQueries({ queryKey: ['spider-packages'] })
    },
  })
}
