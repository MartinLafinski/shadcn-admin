// 引入reactQuery依赖
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// 分页相关
import { extracted_pagination } from '@/config/pagination'
// Clerk 认证
import { getAccessToken } from '@/lib/auth-token'
import {
  type PreTaskData,
  type PreTasksData,
  type PreTaskBatchExportData,
} from '../data/schemas.ts'

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_PRE_TASK_PAGE_SIZE || 50
)

// 通用错误处理
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

/**
 * 获取准任务列表
 *
 * 此函数用于从后端API获取准任务列表，支持网站ID过滤和分页功能
 *
 * @param website_id - 可选参数，用于按网站ID过滤准任务
 * @param page - 页码，从1开始，默认为1
 * @param size - 每页返回的数据量，默认为 DEFAULT_PAGE_SIZE 条
 *
 * @param token - 鉴权token（可选，pre-tasks API 可能不需要认证）
 * @returns Promise<PreTasksData> - 返回准任务数据数组的Promise
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 获取所有准任务，第一页，每页 DEFAULT_PAGE_SIZE 条
 * const allPreTasks = await fetchPreTasks()
 *
 * // 获取指定网站的准任务
 * const websitePreTasks = await fetchPreTasks(1, 1, DEFAULT_PAGE_SIZE)
 *
 * 注意事项:
 * - 该函数会向 /pre_tasks/ 端点发送GET请求
 * - website_id 为可选参数，用于过滤特定网站的准任务
 * - pre-tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const fetchPreTasks = async (
  website_id: number | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE,
  token: string | null = null
): Promise<PreTasksData> => {
  // 构建基础URL，包含分页参数
  let url = `${API_BASE_URL}/pre_tasks/?page=${page}&size=${size}`

  // 如果提供了网站ID参数，则添加到查询字符串中
  if (website_id) {
    url += `&website_id=${website_id}`
  }

  // 发送GET请求获取数据
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    headers,
  })

  // 检查响应状态，处理可能的错误
  await handleResponse(response)

  // 从响应头中提取分页信息
  const pagination = extracted_pagination(response)

  // 解析并返回JSON数据和分页信息
  const preTasks: PreTaskData[] = await response.json()

  return {
    preTasks,
    pagination,
  }
}

/**
 * 重置所有准任务
 *
 * 此函数用于向后端API发送请求重置所有准任务
 *
 * @param token - 鉴权token（可选，pre-tasks API 可能不需要认证）
 * @returns Promise<Response> - 返回原始响应对象
 *                如果重置成功，响应状态码通常为200
 *                如果重置失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：准任务未找到、权限不足、网络错误等
 *
 * 使用示例:
 * // 重置所有准任务
 * try {
 *   const response = await resetAllPreTasks()
 *   console.log("准任务重置成功")
 * } catch (error) {
 *   console.error("准任务重置失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /pre_tasks/ 端点发送PUT请求
 * - 重置操作会将所有准任务的状态重置
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功重置后，后端通常返回200状态码和重置结果
 * - 在UI中建议添加二次确认机制，防止误操作
 * - 重置后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const resetAllPreTasks = async (
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/pre_tasks/`, {
    method: 'PUT',
    headers,
  })
  return await handleResponse(response)
}

/**
 * 清空所有准任务
 *
 * 此函数用于向后端API发送DELETE请求，清空所有准任务
 *
 * @param token - 鉴权token（可选，pre-tasks API 可能不需要认证）
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果清空成功，响应状态码通常为204 (No Content)
 *                如果清空失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：准任务未找到、权限不足、网络错误等
 *
 * 使用示例:
 * // 清空所有准任务
 * try {
 *   const response = await clearAllPreTasks()
 *   console.log("准任务清空成功")
 * } catch (error) {
 *   console.error("准任务清空失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /pre_tasks/ 端点发送DELETE请求
 * - 清空操作会永久删除所有准任务，请谨慎操作
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功清空后，后端通常返回204状态码，表示资源已成功处理且无响应体
 * - 在UI中建议添加二次确认机制，防止误操作
 * - 清空后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const clearAllPreTasks = async (
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/pre_tasks/`, {
    method: 'DELETE',
    headers,
  })
  return await handleResponse(response)
}

/**
 * 重置网站准任务
 *
 * 此函数用于向后端API发送请求重置指定网站的准任务
 *
 * @param website_id - 需要重置准任务的网站的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的网站记录
 *
 * @param token - 鉴权token（可选，pre-tasks API 可能不需要认证）
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果重置成功，响应状态码通常为200
 *                如果重置失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：网站ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 重置ID为1的网站的准任务
 * try {
 *   const response = await resetWebsitePreTasks(1)
 *   console.log("网站准任务重置成功")
 * } catch (error) {
 *   console.error("网站准任务重置失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /pre_tasks/{website_id}/ 端点发送PUT请求
 * - 重置操作会将指定网站的所有准任务状态重置
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功重置后，后端通常返回200状态码和重置结果
 * - 在UI中建议添加二次确认机制，防止误操作
 * - 重置后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const resetWebsitePreTasks = async (
  website_id: number,
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_BASE_URL}/pre_tasks/websites/${website_id}/`,
    {
      method: 'PUT',
      headers,
    }
  )
  return await handleResponse(response)
}

/**
 * 清空网站准任务
 *
 * 此函数用于向后端API发送DELETE请求，清空指定网站的准任务
 *
 * @param website_id - 需要清空准任务的网站的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的网站记录
 *
 * @param token - 鉴权token（可选，pre-tasks API 可能不需要认证）
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果清空成功，响应状态码通常为204 (No Content)
 *                如果清空失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：网站ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 清空ID为1的网站的准任务
 * try {
 *   const response = await clearWebsitePreTasks(1)
 *   console.log("网站准任务清空成功")
 * } catch (error) {
 *   console.error("网站准任务清空失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /pre_tasks/websites/{website_id}/ 端点发送DELETE请求
 * - 清空操作会永久删除指定网站的所有准任务，请谨慎操作
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功清空后，后端通常返回204状态码，表示资源已成功删除且无响应体
 * - 在UI中建议添加二次确认机制，防止误操作
 * - 清空后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const clearWebsitePreTasks = async (
  website_id: number,
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_BASE_URL}/pre_tasks/websites/${website_id}/`,
    {
      method: 'DELETE',
      headers,
    }
  )
  return await handleResponse(response)
}

/**
 * 获取准任务列表的自定义 Hook
 *
 * 此 Hook 封装了获取准任务列表的查询逻辑，提供了网站ID过滤和分页功能
 * 使用 TanStack Query 的 useQuery 来处理数据获取、缓存和状态管理
 *
 * @param website_id - 可选参数，用于按网站ID过滤准任务
 *                        当值为 undefined 时，不进行网站ID过滤
 * @param page - 页码，从1开始，默认为1，用于分页查询
 * @param size - 每页返回的数据量，默认为DEFAULT_PAGE_SIZE条，最大值取决于后端配置
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的准任务数据数组 (PreTaskData[])
 *          - isLoading: 数据加载状态
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 获取所有准任务
 * const { data, isLoading } = usePreTasksQuery()
 *
 * // 获取指定网站的准任务
 * const { data, isLoading } = usePreTasksQuery(1, 1, DEFAULT_PAGE_SIZE)
 *
 * 注意事项:
 * - 查询结果会被缓存，相同参数的查询会返回缓存数据
 * - 查询键(queryKey)包含了所有参数，确保不同参数的查询有独立的缓存
 * - 当参数变化时，会自动触发重新查询
 * - pre-tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const usePreTasksQuery = (
  website_id: number | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE
) => {
  return useQuery({
    queryKey: ['preTasks', website_id, page, size],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchPreTasks(website_id, page, size, token)
    },
    placeholderData: (previousData) => previousData, // 保持上一次的数据
  })
}

/**
 * 重置所有准任务的自定义 Mutation Hook
 *
 * 此 Hook 封装了重置所有准任务的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用重置所有准任务，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送重置所有准任务的请求
 * - 自动处理缓存失效，确保UI显示最新的准任务状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发重置操作的函数
 *          - isLoading: 重置操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 重置成功的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useResetAllPreTasksMutation()
 *
 * const handleResetAll = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('所有准任务重置成功')
 *   } catch (err) {
 *     console.error('所有准任务重置失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /pre_tasks/ 端点发送PUT请求来重置所有准任务
 * - 重置成功后会自动使 ['preTasks'] 查询缓存失效
 * - 适用于需要重置所有准任务的场景
 * - 重置操作会将所有准任务的状态重置
 * - 建议在UI中添加二次确认机制，防止误操作
 * - pre-tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useResetAllPreTasksMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      return resetAllPreTasks(token)
    },
    onSuccess: () => {
      // 重置成功后使准任务列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['preTasks'] })
    },
  })
}

/**
 * 清空所有准任务的自定义 Mutation Hook
 *
 * 此 Hook 封装了清空所有准任务的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用清空所有准任务，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送清空所有准任务的请求
 * - 自动处理缓存失效，确保UI显示最新的准任务状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发清空操作的函数
 *          - isLoading: 清空操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 清空成功的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useClearAllPreTasksMutation()
 *
 * const handleClearAll = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('所有准任务清空成功')
 *   } catch (err) {
 *     console.error('所有准任务清空失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /pre_tasks/ 端点发送DELETE请求来清空所有准任务
 * - 清空成功后会自动使 ['preTasks'] 查询缓存失效
 * - 适用于需要清空所有准任务的场景
 * - 清空操作会永久删除所有准任务，请谨慎使用
 * - 建议在UI中添加二次确认机制，防止误操作
 * - pre-tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useClearAllPreTasksMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      return clearAllPreTasks(token)
    },
    onSuccess: () => {
      // 清空成功后使准任务列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['preTasks'] })
    },
  })
}

/**
 * 重置网站准任务的自定义 Mutation Hook
 *
 * 此 Hook 封装了重置网站准任务的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用重置网站准任务，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送重置网站准任务的请求
 * - 自动处理缓存失效，确保UI显示最新的准任务状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发重置操作的函数，需要传入网站ID
 *          - isLoading: 重置操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 重置成功的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useResetWebsitePreTasksMutation()
 *
 * const handleResetWebsite = async (websiteId) => {
 *   try {
 *     await mutateAsync(websiteId)
 *     console.log('网站准任务重置成功')
 *   } catch (err) {
 *     console.error('网站准任务重置失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /pre_tasks/websites/{website_id}/ 端点发送PUT请求来重置网站准任务
 * - 重置成功后会自动使 ['preTasks'] 查询缓存失效
 * - 适用于需要重置特定网站准任务的场景
 * - websiteId 必须是有效的数字ID，且对应网站存在于数据库中
 * - 建议在UI中添加二次确认机制，防止误操作
 * - pre-tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useResetWebsitePreTasksMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (websiteId: number) => {
      const token = getAccessToken()
      return resetWebsitePreTasks(websiteId, token)
    },
    onSuccess: () => {
      // 重置成功后使准任务列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['preTasks'] })
    },
  })
}

/**
 * 清空网站准任务的自定义 Mutation Hook
 *
 * 此 Hook 封装了清空网站准任务的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用清空网站准任务，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送清空网站准任务的请求
 * - 自动处理缓存失效，确保UI显示最新的准任务状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发清空操作的函数，需要传入网站ID
 *          - isLoading: 清空操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 清空成功的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useClearWebsitePreTasksMutation()
 *
 * const handleClearWebsite = async (websiteId) => {
 *   try {
 *     await mutateAsync(websiteId)
 *     console.log('网站准任务清空成功')
 *   } catch (err) {
 *     console.error('网站准任务清空失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /pre_tasks/{website_id}/ 端点发送DELETE请求来清空网站准任务
 * - 清空成功后会自动使 ['preTasks'] 查询缓存失效
 * - 适用于需要清空特定网站准任务的场景
 * - websiteId 必须是有效的数字ID，且对应网站存在于数据库中
 * - 清空操作会永久删除指定网站的所有准任务，请谨慎使用
 * - 建议在UI中添加二次确认机制，防止误操作
 * - pre-tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useClearWebsitePreTasksMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (websiteId: number) => {
      const token = getAccessToken()
      return clearWebsitePreTasks(websiteId, token)
    },
    onSuccess: () => {
      // 清空成功后使准任务列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['preTasks'] })
    },
  })
}

/**
 * 导出所有准任务数据
 *
 * 此函数用于从后端API导出所有准任务数据，通常返回一个包含准任务数据的文件
 * 适用于备份、迁移或离线分析等场景
 *
 * @param token - 鉴权token（可选，pre-tasks API 可能不需要认证）
 *
 * @returns Promise<Response> - 返回包含导出数据的Response对象
 *                            可以进一步处理Response对象以获取实际的文件内容
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 导出所有准任务数据
 * try {
 *   const response = await exportPreTasks()
 *   // 将响应转换为blob并创建下载链接
 *   const blob = await response.blob()
 *   const url = window.URL.createObjectURL(blob)
 *   const a = document.createElement('a')
 *   a.href = url
 *   a.download = 'pre_tasks_export.json'
 *   a.click()
 *   window.URL.revokeObjectURL(url)
 * } catch (error) {
 *   console.error("准任务数据导出失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /pre_tasks/export/ 端点发送POST请求
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 可能需要处理大文件下载，注意浏览器内存限制
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 * - pre-tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const exportPreTasks = async (
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/pre_tasks/export/`, {
    method: 'POST',
    headers,
  })
  return await handleResponse(response)
}

/**
 * 批量导出指定准任务数据
 *
 * 此函数用于从后端API导出指定准任务的数据，允许用户选择特定的准任务进行导出
 * 适用于只需要导出部分准任务数据的场景
 *
 * @param data - 包含批量导出所需数据的对象，必须符合 PreTaskBatchExportData 接口定义
 *              通常包含需要导出的准任务ID列表等信息
 *
 * @param token - 鉴权token（可选，pre-tasks API 可能不需要认证）
 * @returns Promise<Response> - 返回包含导出数据的Response对象
 *                            可以进一步处理Response对象以获取实际的文件内容
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量导出指定ID的准任务数据
 * const exportData = {
 *   pre_task_ids: [1, 2, 3]  // 需要导出的准任务ID列表
 * }
 * try {
 *   const response = await batchExportPreTasks(exportData)
 *   const blob = await response.blob()
 *   // 处理下载逻辑...
 * } catch (error) {
 *   console.error("批量导出准任务数据失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /pre_tasks/export/ 端点发送PUT请求
 * - 需要提供PreTaskBatchExportData格式的数据作为请求体
 * - 请求头设置为application/json格式
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 导出的文件可能只包含指定ID的准任务数据，而不是所有准任务
 * - pre-tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const batchExportPreTasks = async (
  data: PreTaskBatchExportData,
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/pre_tasks/export/`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })
  return await handleResponse(response)
}

/**
 * 导出所有准任务数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了导出所有准任务数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持将准任务数据导出为文件并自动下载到本地，通常用于备份或离线分析
 *
 * 主要功能：
 * - 触发后端准任务数据导出操作
 * - 自动处理导出文件的下载
 * - 从响应头中提取文件名（如果后端提供）
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * 使用场景：
 * - 需要从后端导出所有准任务数据时
 * - 定期备份准任务数据
 * - 手动触发数据导出操作
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发导出操作的函数
 *          - isLoading: 导出操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 导出成功后的文件数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useExportPreTasksMutation()
 *
 * const handleExport = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('准任务数据导出完成')
 *   } catch (err) {
 *     console.error('准任务数据导出失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 导出操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，会自动触发文件下载
 * - 此操作会调用 exportPreTasks API 函数，向后端发起导出请求
 * - pre-tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useExportPreTasksMutation = () => {
  return useMutation({
    mutationFn: async () => {
      const token = getAccessToken()
      const response = await exportPreTasks(token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'pre_tasks_export.json' // 使用更具描述性的默认文件名
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
 * 批量导出指定准任务数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量导出指定准任务数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持将指定准任务数据导出为文件并自动下载到本地，通常用于备份或离线分析
 *
 * 主要功能：
 * - 触发后端批量准任务数据导出操作
 * - 自动处理导出文件的下载
 * - 从响应头中提取文件名（如果后端提供）
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * 使用场景：
 * - 需要从后端导出指定准任务数据时
 * - 定期备份特定准任务数据
 * - 手动触发批量数据导出操作
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发导出操作的函数，需要传入 PreTaskBatchExportData 格式的数据
 *          - isLoading: 导出操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 导出成功后的文件数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchExportPreTasksMutation()
 *
 * const handleBatchExport = async (preTaskIds) => {
 *   try {
 *     const exportData = {
 *       pre_task_ids: preTaskIds  // 准任务ID数组，例如 [1, 2, 3]
 *     }
 *     await mutateAsync(exportData)
 *     console.log('批量导出准任务数据完成')
 *   } catch (err) {
 *     console.error('批量导出准任务数据失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 导出操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，会自动触发文件下载
 * - 此操作会调用 batchExportPreTasks API 函数，向后端发起批量导出请求
 * - 需要提供 PreTaskBatchExportData 格式的数据作为请求体
 * - pre-tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useBatchExportPreTasksMutation = () => {
  return useMutation({
    mutationFn: async (variables: PreTaskBatchExportData) => {
      const token = getAccessToken()
      const response = await batchExportPreTasks(variables, token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'pre_tasks_export.json' // 使用更具描述性的默认文件名
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
