// 引入reactQuery依赖
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// 分页相关
import { extracted_pagination } from '@/config/pagination'
// Clerk 认证
import { getAccessToken } from '@/lib/auth-token'
import {
  type IndustryBatchExportData,
  type IndustryConfigData,
  type IndustryCreateData,
  type IndustryData,
  type IndustriesData,
  type IndustryUpdateData,
  type IndustrySyncData,
} from '../data/schemas.ts'

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const PAGE_SIZE: number = Number(import.meta.env.VITE_INDUSTRY_PAGE_SIZE || 50)

// 通用错误处理
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

/**
 * 获取行业列表
 *
 * 此函数用于从后端API获取行业列表，支持关键词搜索和分页功能
 *
 * @param industry_keyword - 可选参数，用于按关键词搜索行业（例如行业名称）
 * @param page - 页码，从1开始，默认为1
 * @param size - 每页返回的数据量，默认为 PAGE_SIZE 条
 *
 * @param token - 鉴权token
 * @returns Promise<IndustriesData> - 返回行业数据数组的Promise
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 获取所有行业，第一页，每页 PAGE_SIZE 条
 * const allIndustries = await fetchIndustries()
 *
 * // 搜索包含"test"关键词的行业
 * const searchResults = await fetchIndustries("test", 1, 20)
 */
export const fetchIndustries = async (
  industry_keyword: string | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE,
  token: string | null
): Promise<IndustriesData> => {
  // 构建基础URL，包含分页参数
  let url = `${API_BASE_URL}/industries/?page=${page}&size=${size}`

  // 如果提供了关键词参数，则添加到查询字符串中
  if (industry_keyword) {
    url += `&industry_keyword=${industry_keyword}`
  }

  // 发送GET请求获取数据
  const response = await fetch(url, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })

  // 检查响应状态，处理可能的错误
  await handleResponse(response)

  // 从响应头中提取分页信息
  const pagination = extracted_pagination(response)

  // 解析并返回JSON数据和分页信息
  const industries: IndustryData[] = await response.json()

  return {
    industries,
    pagination,
  }
}

/**
 * 根据ID获取行业详细信息
 *
 * 此函数用于从后端API根据行业ID获取指定行业的详细信息
 *
 * @param industryId - 需要获取的行业的唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的行业记录
 *
 * @param token - 鉴权token
 * @returns Promise<IndustryData> - 返回行业数据对象的Promise
 *                                包含行业的所有信息，如ID、名称、配置等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：行业ID不存在、网络错误、后端服务异常等
 *
 * 使用示例:
 * // 获取ID为1的行业信息
 * try {
 *   const industryData = await fetchIndustryById(1)
 *   console.log("行业信息:", industryData)
 * } catch (error) {
 *   console.error("获取行业信息失败:", error)
 * }
 */
export const fetchIndustryById = async (
  industryId: number,
  token: string | null
): Promise<IndustryData> => {
  const response = await fetch(`${API_BASE_URL}/industries/${industryId}/`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  await handleResponse(response)
  return response.json()
}

// 创建行业
/**
 * 创建新行业
 *
 * 此函数用于向后端API发送请求创建一个新的行业记录
 *
 * @param data - 行业创建所需的数据对象，必须符合IndustryCreateData接口定义
 *              通常包含行业名称、标识、配置信息等必要字段
 *
 * @param token - 鉴权token
 * @returns Promise<IndustryData> - 返回创建成功的行业数据对象的Promise
 *                                包含新创建行业的所有信息，如ID、名称、配置等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 创建一个新行业
 * const newIndustryData = {
 *   industry_name: "我的行业",
 *   industry_slug: "my-industry",
 *   config: { theme: "default" },
 *   readme: "行业说明"
 * }
 * try {
 *   const createdIndustry = await createIndustry(newIndustryData)
 *   console.log("行业创建成功:", createdIndustry)
 * } catch (error) {
 *   console.error("行业创建失败:", error)
 * }
 */
export const createIndustry = async (
  data: IndustryCreateData,
  token: string | null
): Promise<IndustryData> => {
  const response = await fetch(`${API_BASE_URL}/industries/`, {
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

/**
 * 更新行业信息
 *
 * 此函数用于完全更新指定行业的所有信息，使用 PUT 方法替换整个行业资源
 * 注意：PUT 请求会完全替换目标资源，所以 data 对象应包含行业的所有必要字段
 *
 * @param industryId - 需要更新的行业的唯一标识符（ID）
 *                   必须是已存在的行业ID，否则会返回404错误或创建新资源（取决于后端实现）
 * @param data - 完整的行业更新数据对象，必须符合 IndustryUpdateData 接口定义
 *              应包含行业的所有信息，因为PUT请求会完全替换现有资源
 *              通常包括：行业名称、标识、配置信息、说明等所有行业相关字段
 *
 * @param token - 鉴权token
 * @returns Promise<IndustryData> - 返回更新后的完整行业数据对象的Promise
 *                                包含行业的所有信息，包括更新后的字段和可能的服务器生成字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：行业ID不存在、数据验证失败、网络错误等
 *
 * 使用示例:
 * // 更新行业的全部信息
 * const industryUpdateData = {
 *   industry_name: "更新后的行业名称",
 *   industry_slug: "new-industry-slug",
 *   industry_config: { theme: "dark", language: "zh-CN" },
 *   industry_readme: "更新后的行业说明"
 * }
 * try {
 *   const updatedIndustry = await updateIndustry(1, industryUpdateData)
 *   console.log("行业更新成功:", updatedIndustry)
 * } catch (error) {
 *   console.error("行业更新失败:", error)
 * }
 */
export const updateIndustry = async (
  industryId: number,
  data: IndustryUpdateData,
  token: string | null
): Promise<IndustryData> => {
  const response = await fetch(`${API_BASE_URL}/industries/${industryId}/`, {
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

/**
 * 部分更新行业配置
 *
 * 此函数用于部分更新指定行业的配置信息，只更新提供的字段，不会影响其他字段
 * 使用 PATCH 方法，允许单独更新行业配置或说明文档
 *
 * @param industryId - 需要更新的行业的唯一标识符（ID）
 * @param data - 包含需要更新的行业字段的对象，符合 IndustryConfigData 接口定义
 *              可包含以下可选字段：
 *              - industry_config: Record<string, any> - 行业配置对象，可以包含任意配置项
 *              - industry_readme: string - 行业说明文档内容
 *
 * @param token - 鉴权token
 * @returns Promise<IndustryData> - 返回更新后的完整行业数据对象的Promise
 *                                包含行业的所有信息，包括更新后的字段和未更改的原有字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 只更新行业配置
 * const updatedIndustry = await patchIndustry(1, {
 *   industry_config: { theme: "dark", language: "zh-CN" }
 * })
 *
 * // 只更新行业说明文档
 * const updatedIndustry = await patchIndustry(1, {
 *   industry_readme: "这是更新后的行业说明"
 * })
 *
 * // 同时更新配置和说明文档
 * const updatedIndustry = await patchIndustry(1, {
 *   industry_config: { theme: "light" },
 *   industry_readme: "新的说明文档"
 * })
 */
export const patchIndustry = async (
  industryId: number,
  data: IndustryConfigData,
  token: string | null
): Promise<IndustryData> => {
  const response = await fetch(`${API_BASE_URL}/industries/${industryId}/`, {
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

/**
 * 删除指定行业
 *
 * 此函数用于向后端API发送DELETE请求，删除指定ID的行业记录
 * 该操作会永久删除行业数据，请在调用前确认用户意图，建议配合确认对话框使用
 *
 * @param industryId - 需要删除的行业的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的行业记录
 *                   删除操作不可逆，请谨慎操作
 *
 * @param token - 鉴权token
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果删除成功，响应状态码通常为204 (No Content)
 *                如果删除失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：行业ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 删除ID为5的行业
 * try {
 *   const response = await deleteIndustry(5)
 *   console.log("行业删除成功")
 * } catch (error) {
 *   console.error("行业删除失败:", error)
 * }
 */
export const deleteIndustry = async (
  industryId: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/industries/${industryId}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  return await handleResponse(response)
}

export const batchDeleteIndustries = async (
  industryIds: number[],
  token: string | null
): Promise<Response> => {
  const params = industryIds.map((id) => `industry_ids=${id}`).join('&')
  const response = await fetch(`${API_BASE_URL}/industries/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  return await handleResponse(response)
}

/**
 * 同步行业数据
 *
 * 此函数用于触发后端行业数据同步操作，通常用于从外部源（如数据库、API或其他服务）同步最新的行业数据
 * 该操作会向后端发起同步请求，可能涉及大量数据处理，具体同步逻辑由后端实现
 *
 * @param token - 鉴权token
 *
 * @returns Promise<void> - 返回一个Promise，表示同步操作是否完成
 *                        注意：此函数返回void，表示操作完成但不返回具体数据
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 触发行业数据同步
 * try {
 *   await syncIndustries()
 *   console.log("行业数据同步完成")
 * } catch (error) {
 *   console.error("行业数据同步失败:", error)
 * }
 */
export const syncIndustries = async (
  data: IndustrySyncData,
  token: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/industries/sync/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  })
  await handleResponse(response)
}

/**
 * 导出所有行业数据
 *
 * 此函数用于从后端API导出所有行业数据，通常返回一个包含行业数据的文件
 * 适用于备份、迁移或离线分析等场景
 *
 * @param token - 鉴权token
 *
 * @returns Promise<Response> - 返回包含导出数据的Response对象
 *                            可以进一步处理Response对象以获取实际的文件内容
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 导出所有行业数据
 * try {
 *   const response = await exportIndustries()
 *   // 将响应转换为blob并创建下载链接
 *   const blob = await response.blob()
 *   const url = window.URL.createObjectURL(blob)
 *   const a = document.createElement('a')
 *   a.href = url
 *   a.download = 'industries_export.json'
 *   a.click()
 *   window.URL.revokeObjectURL(url)
 * } catch (error) {
 *   console.error("行业数据导出失败:", error)
 * }
 */
export const exportIndustries = async (
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/industries/export/`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  })
  return await handleResponse(response)
}

/**
 * 批量导出指定行业数据
 *
 * 此函数用于从后端API导出指定行业的数据，允许用户选择特定的行业进行导出
 * 适用于只需要导出部分行业数据的场景
 *
 * @param data - 包含批量导出所需数据的对象，必须符合 IndustryBatchExportData 接口定义
 *              通常包含需要导出的行业ID列表等信息
 *
 * @param token
 * @returns Promise<Response> - 返回包含导出数据的Response对象
 *                            可以进一步处理Response对象以获取实际的文件内容
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量导出指定ID的行业数据
 * const exportData = {
 *   industry_ids: [1, 2, 3]  // 需要导出的行业ID列表
 * }
 * try {
 *   const response = await batchExportIndustries(exportData)
 *   const blob = await response.blob()
 *   // 处理下载逻辑...
 * } catch (error) {
 *   console.error("批量导出行业数据失败:", error)
 * }
 */
export const batchExportIndustries = async (
  data: IndustryBatchExportData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/industries/export/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  })
  return await handleResponse(response)
}

/**
 * 获取行业列表的自定义 Hook
 *
 * 此 Hook 封装了获取行业列表的查询逻辑，提供了关键词搜索和分页功能
 * 使用 TanStack Query 的 useQuery 来处理数据获取、缓存和状态管理
 *
 * @param industry_keyword - 可选参数，用于按关键词搜索行业（例如行业名称）
 *                        当值为 undefined 时，不进行关键词过滤
 * @param page - 页码，从1开始，默认为1，用于分页查询
 * @param size - 每页返回的数据量，默认为 PAGE_SIZE 条，最大值取决于后端配置
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的行业数据数组 (IndustryData[])
 *          - isLoading: 数据加载状态
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 获取所有行业
 * const { data, isLoading } = useIndustriesQuery()
 *
 * // 搜索包含"test"关键词的行业
 * const { data, isLoading } = useIndustriesQuery("test", 1, 20)
 */
export const useIndustriesQuery = (
  industry_keyword: string | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE
) => {
  return useQuery({
    queryKey: ['industries', industry_keyword, page, size],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchIndustries(industry_keyword, page, size, token)
    },
    placeholderData: (previousData) => previousData, // 保持上一次的数据
  })
}

/**
 * 根据行业ID获取单个行业详细信息的自定义 Hook
 *
 * 此 Hook 封装了获取单个行业详细信息的查询逻辑，使用 TanStack Query 的 useQuery
 * 来处理数据获取、缓存和状态管理。该 Hook 会根据传入的 industryId 参数向后端
 * API 发起请求，获取指定行业的完整信息。
 *
 * @param industryId - 需要获取信息的行业唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的行业记录
 *                    如果传入 0 或无效ID，由于 enabled 条件设置，将不会发起请求
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的行业数据 (IndustryData 类型)
 *          - isLoading: 数据加载状态，true 表示正在请求中
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - isFetching: 是否正在获取数据（包括重新验证）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 在组件中使用，获取ID为5的行业信息
 * const { data: industry, isLoading, error } = useIndustryQuery(5)
 *
 * if (isLoading) return <div>加载中...</div>
 * if (error) return <div>错误: {error.message}</div>
 * if (industry) return <div>行业名称: {industry.industry_name}</div>
 */
export const useIndustryQuery = (industryId: number) => {
  return useQuery({
    queryKey: ['industry', industryId], // 查询键包含行业ID，确保不同ID有独立缓存
    queryFn: async () => {
      const token = getAccessToken() // 获取认证token
      return fetchIndustryById(industryId, token) // 调用API获取行业详情
    },
    enabled: !!industryId, // 只有当 industryId 存在且不为0时才启用查询
  })
}

/**
 * 创建行业的自定义 Mutation Hook
 *
 * 此 Hook 封装了创建行业的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 包含自动的数据缓存更新功能，当创建成功后会自动使行业列表缓存失效，触发重新查询
 */
export const useCreateIndustryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: IndustryCreateData) => {
      const token = getAccessToken()
      return createIndustry(variables, token)
    },
    onSuccess: () => {
      // 创建成功后使行业列表缓存失效，触发重新获取数据
      queryClient.invalidateQueries({ queryKey: ['industries'] })
    },
  })
}

/**
 * 更新行业信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了更新行业的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持完整的行业信息更新（PUT 请求），包括行业名称、标识、配置等所有字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 */
export const useUpdateIndustryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      industryId: number
      data: IndustryUpdateData
    }) => {
      const token = getAccessToken()
      return updateIndustry(variables.industryId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使行业列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['industries'] })
      // 同时使单个行业详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({
        queryKey: ['industry', variables.industryId],
      })
    },
  })
}

/**
 * 部分更新行业信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了部分更新行业的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持部分更新行业信息（PATCH 请求），仅更新提供的字段，不会影响其他字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 */
export const usePatchIndustryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: {
      industryId: number
      data: IndustryConfigData
    }) => {
      const token = getAccessToken()
      return patchIndustry(variables.industryId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使行业列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['industries'] })
      // 同时使单个行业详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({
        queryKey: ['industry', variables.industryId],
      })
    },
  })
}

/**
 * 同步行业数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了同步行业数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 主要功能是触发后端的行业数据同步过程，通常用于从外部源同步最新的行业数据
 */
export const useSyncIndustriesMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: IndustrySyncData) => {
      const token = getAccessToken()
      return syncIndustries(data, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['industries'] })
    },
  })
}

/**
 * 导出所有行业数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了导出所有行业数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持将行业数据导出为文件并自动下载到本地，通常用于备份或离线分析
 */
export const useExportIndustriesMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      const response = await exportIndustries(token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'industries_export.json' // 使用更具描述性的默认文件名
      return { blob, filename }
    },
    onSuccess: ({ blob, filename }) => {
      // 创建临时URL用于下载
      const url = window.URL.createObjectURL(blob)
      // 创建临时的下载链接元素
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      // 触发下载操作
      a.click()
      // 清理内存：释放URL对象
      window.URL.revokeObjectURL(url)
    },
  })
}

/**
 * 批量导出指定行业数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量导出行业数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持将选中的行业数据导出为文件并自动下载到本地，通常用于备份或离线分析
 */
export const useBatchExportIndustriesMutation = () => {
  return useMutation({
    mutationFn: async (variables: IndustryBatchExportData) => {
      const token = getAccessToken()
      const response = await batchExportIndustries(variables, token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'industries_export.json' // 使用更具描述性的默认文件名
      return { blob, filename }
    },
    onSuccess: ({ blob, filename }) => {
      // 创建临时URL用于下载
      const url = window.URL.createObjectURL(blob)
      // 创建临时的下载链接元素
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      // 触发下载操作
      a.click()
      // 清理内存：释放URL对象
      window.URL.revokeObjectURL(url)
    },
  })
}

/**
 * 批量删除行业的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量删除行业的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持删除多个行业，包含自动的数据缓存更新功能
 */
export const useBatchDeleteIndustriesMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: number[]) => {
      const token = getAccessToken()
      return batchDeleteIndustries(variables, token)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['industries'] })
      if (variables && Array.isArray(variables)) {
        variables.forEach((id) => {
          queryClient.invalidateQueries({ queryKey: ['industry', id] })
        })
      }
    },
  })
}

/**
 * 删除行业的自定义 Mutation Hook
 *
 * 此 Hook 封装了删除行业的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持删除单个行业，包含自动的数据缓存更新功能
 */
export const useDeleteIndustryMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables: { industryId: number }) => {
      const token = getAccessToken()
      return deleteIndustry(variables.industryId, token)
    },
    onSuccess: (_, variables) => {
      // 删除成功后使行业列表缓存失效
      queryClient.invalidateQueries({ queryKey: ['industries'] })
      // 同时使单个行业详情缓存失效
      queryClient.invalidateQueries({
        queryKey: ['industry', variables.industryId],
      })
    },
  })
}
