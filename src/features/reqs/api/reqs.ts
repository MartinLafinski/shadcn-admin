// 引入reactQuery依赖
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// 分页相关
import { extracted_pagination } from '@/config/pagination'
// Clerk 认证
import { useAuth } from '@clerk/clerk-react'
import { ReqData, ReqsData, ReqResultType } from '../data/schemas.ts'

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_REQ_PAGE_SIZE || 50
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
 * 获取请求列表
 *
 * 此函数用于从后端API获取请求列表，支持任务ID、结果类型、结果分类过滤和分页功能
 *
 * @param task_id - 可选参数，用于按任务ID过滤请求
 * @param result_type - 可选参数，用于过滤请求结果类型
 *                    "succeed": 成功的请求
 *                    "failed": 失败的请求
 *                    "discarded": 丢弃的请求
 *                    undefined: 返回所有请求（不考虑结果类型）
 * @param result_category - 可选参数，用于按结果分类过滤请求
 * @param page - 页码，从1开始，默认为1
 * @param size - 每页返回的数据量，默认为 DEFAULT_PAGE_SIZE 条
 *
 * @param token - 鉴权token（可选，reqs API 可能不需要认证）
 * @returns Promise<ReqsData> - 返回请求数据数组的Promise
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 获取所有请求，第一页，每页 DEFAULT_PAGE_SIZE 条
 * const allReqs = await fetchReqs()
 *
 * // 获取指定任务的成功请求
 * const succeedReqs = await fetchReqs(1, "succeed", undefined, 1, DEFAULT_PAGE_SIZE)
 *
 * // 获取指定结果分类的请求
 * const categoryReqs = await fetchReqs(undefined, undefined, "category1", 1, DEFAULT_PAGE_SIZE)
 */
export const fetchReqs = async (
  task_id: number | undefined = undefined,
  result_type: ReqResultType | undefined = undefined,
  result_category: string | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE,
  token: string | null = null
): Promise<ReqsData> => {
  // 构建基础URL，包含分页参数
  let url = `${API_BASE_URL}/reqs/?page=${page}&size=${size}`

  // 如果提供了任务ID参数，则添加到查询字符串中
  if (task_id) {
    url += `&task_id=${task_id}`
  }

  // 如果提供了结果类型参数，则添加到查询字符串中
  if (result_type) {
    url += `&result_type=${result_type}`
  }

  // 如果提供了结果分类参数，则添加到查询字符串中
  if (result_category) {
    url += `&result_category=${result_category}`
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
  const reqs: ReqData[] = await response.json()

  return {
    reqs,
    pagination,
  }
}

/**
 * 根据 req_id 获取请求
 *
 * 此函数用于根据请求ID获取单个请求的详细信息
 *
 * @param req_id - 需要获取的请求的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的请求记录
 *
 * @param token - 鉴权token（可选，reqs API 可能不需要认证）
 * @returns Promise<ReqData> - 返回请求数据对象的Promise
 *                                包含请求的所有信息
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 获取ID为1的请求
 * const req = await fetchReq(1)
 * console.log("请求详情:", req)
 *
 * 注意事项:
 * - 该函数会向 /reqs/{req_id}/ 端点发送GET请求
 * - 确保传入的req_id是有效的请求ID
 * - reqs API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const fetchReq = async (
  req_id: number,
  token: string | null = null
): Promise<ReqData> => {
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/reqs/${req_id}/`, {
    headers,
  })
  await handleResponse(response)
  return response.json()
}

/**
 * 清除请求
 *
 * 此函数用于向后端API发送DELETE请求，清除指定任务ID的所有请求记录
 *
 * @param task_id - 需要清除请求的任务的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的任务记录
 *
 * @param token - 鉴权token（可选，reqs API 可能不需要认证）
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果清除成功，响应状态码通常为204 (No Content)
 *                如果清除失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：任务ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 清除ID为1的任务的所有请求
 * try {
 *   const response = await clearReqs(1)
 *   console.log("请求清除成功")
 * } catch (error) {
 *   console.error("请求清除失败:", error)
 * }
 *
 * // 在实际应用中，通常与确认对话框结合使用
 * const handleClear = async (taskId) => {
 *   if (confirm("确定要清除这个任务的所有请求吗？")) {
 *     try {
 *       await clearReqs(taskId)
 *       // 刷新请求列表
 *       refetch()
 *     } catch (error) {
 *       alert("清除失败: " + error.message)
 *     }
 *   }
 * }
 *
 * 注意事项:
 * - 该函数会向 /reqs/tasks/{task_id}/ 端点发送DELETE请求
 * - 清除操作会永久删除指定任务的所有请求，请谨慎操作
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功清除后，后端通常返回204状态码，表示资源已成功处理且无响应体
 * - 在UI中建议添加二次确认机制，防止误操作
 * - 清除后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const clearReqs = async (
  task_id: number,
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/reqs/tasks/${task_id}/`, {
    method: 'DELETE',
    headers,
  })
  return await handleResponse(response)
}

/**
 * 获取请求列表的自定义 Hook
 *
 * 此 Hook 封装了获取请求列表的查询逻辑，提供了任务ID、结果类型、结果分类过滤和分页功能
 * 使用 TanStack Query 的 useQuery 来处理数据获取、缓存和状态管理
 *
 * @param task_id - 可选参数，用于按任务ID过滤请求
 *                        当值为 undefined 时，不进行任务ID过滤
 * @param result_type - 可选参数，用于过滤请求结果类型
 *                        "succeed": 只返回成功的请求
 *                        "failed": 只返回失败的请求
 *                        "discarded": 只返回丢弃的请求
 *                        undefined: 返回所有请求（不考虑结果类型）
 * @param result_category - 可选参数，用于按结果分类过滤请求
 *                        当值为 undefined 时，不进行结果分类过滤
 * @param page - 页码，从1开始，默认为1，用于分页查询
 * @param size - 每页返回的数据量，默认为 DEFAULT_PAGE_SIZE 条，最大值取决于后端配置
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的请求数据数组 (ReqData[])
 *          - isLoading: 数据加载状态
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 获取所有请求
 * const { data, isLoading } = useReqsQuery()
 *
 * // 获取指定任务的成功请求
 * const { data, isLoading } = useReqsQuery(1, "succeed", undefined, 1, DEFAULT_PAGE_SIZE)
 *
 * // 获取指定结果分类的请求
 * const { data, isLoading } = useReqsQuery(undefined, undefined, "category1", 1, DEFAULT_PAGE_SIZE)
 *
 * 注意事项:
 * - 查询结果会被缓存，相同参数的查询会返回缓存数据
 * - 查询键(queryKey)包含了所有参数，确保不同参数的查询有独立的缓存
 * - 当参数变化时，会自动触发重新查询
 * - reqs API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useReqsQuery = (
  task_id: number | undefined = undefined,
  result_type: ReqResultType | undefined = undefined,
  result_category: string | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE
) => {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['reqs', task_id, result_type, result_category, page, size],
    queryFn: async () => {
      const token = await getToken()
      return fetchReqs(task_id, result_type, result_category, page, size, token)
    },
    placeholderData: (previousData) => previousData, // 保持上一次的数据
  })
}

/**
 * 获取请求详情的自定义 Hook
 *
 * 此 Hook 封装了获取单个请求详情的查询逻辑
 * 使用 TanStack Query 的 useQuery 来处理数据获取、缓存和状态管理
 *
 * @param req_id - 请求的唯一标识符（ID）
 *                   必须是有效的数字ID
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的请求数据 (ReqData)
 *          - isLoading: 数据加载状态
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * const { data, isLoading, isError } = useReqQuery(1)
 *
 * if (isLoading) return <div>加载中...</div>
 * if (isError) return <div>加载失败</div>
 *
 * return (
 *   <div>
 *     <h3>{data?.title}</h3>
 *     <p>{data?.url}</p>
 *   </div>
 * )
 *
 * 注意事项:
 * - 查询结果会被缓存，避免重复请求
 * - 查询键为 ['req', req_id]
 * - reqs API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useReqQuery = (req_id: number) => {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['req', req_id],
    queryFn: async () => {
      const token = await getToken()
      return fetchReq(req_id, token)
    },
    enabled: !!req_id, // 只有当 req_id 存在时才执行查询
  })
}

/**
 * 清除请求的自定义 Mutation Hook
 *
 * 此 Hook 封装了清除请求的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用清除指定任务的所有请求，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送清除请求的请求
 * - 自动处理缓存失效，确保UI显示最新的请求状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发清除操作的函数，需要传入任务ID
 *          - isLoading: 清除操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 清除成功的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useClearReqsMutation()
 *
 * const handleClear = async (taskId) => {
 *   try {
 *     await mutateAsync(taskId)
 *     console.log('请求清除成功')
 *   } catch (err) {
 *     console.error('请求清除失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /reqs/tasks/{task_id}/ 端点发送DELETE请求来清除请求
 * - 清除成功后会自动使 ['reqs'] 查询缓存失效
 * - 适用于需要清除指定任务的所有请求的场景
 * - task_id 必须是有效的数字ID，且对应任务存在于数据库中
 * - 清除操作会永久删除指定任务的所有请求，请谨慎使用
 * - 建议在UI中添加二次确认机制，防止误操作
 * - reqs API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useClearReqsMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (task_id: number) => {
      const token = await getToken()
      return clearReqs(task_id, token)
    },
    onSuccess: () => {
      // 清除成功后使请求列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['reqs'] })
    },
  })
}

/**
 * 批量导出请求
 *
 * 此函数用于向后端API发送请求，批量导出指定ID的请求记录
 *
 * @param req_ids - 需要导出的请求ID列表
 *                   必须是有效的数字ID数组，对应数据库中存在的请求记录
 *
 * @param token - 鉴权token（可选，reqs API 可能不需要认证）
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果导出成功，响应状态码通常为200
 *                如果导出失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：请求ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 批量导出ID为1, 2, 3的请求
 * try {
 *   const response = await exportReqs([1, 2, 3])
 *   console.log("请求导出成功")
 * } catch (error) {
 *   console.error("请求导出失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /reqs/export/ 端点发送PUT请求
 * - 导出操作会生成导出文件，具体格式由后端决定
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功导出后，后端通常返回200状态码和空对象
 * - reqs API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const exportReqs = async (
  req_ids: number[],
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/reqs/export/`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ req_ids }),
  })
  return await handleResponse(response)
}

/**
 * 导出任务的所有请求
 *
 * 此函数用于向后端API发送请求，导出指定任务的所有请求记录
 *
 * @param task_id - 需要导出请求的任务的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的任务记录
 *
 * @param token - 鉴权token（可选，reqs API 可能不需要认证）
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果导出成功，响应状态码通常为200
 *                如果导出失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：任务ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 导出ID为1的任务的所有请求
 * try {
 *   const response = await exportReqsByTask(1)
 *   console.log("任务请求导出成功")
 * } catch (error) {
 *   console.error("任务请求导出失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /reqs/tasks/{task_id}/export/ 端点发送POST请求
 * - 导出操作会生成导出文件，包含该任务的所有请求记录
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功导出后，后端通常返回200状态码和空对象
 * - reqs API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const exportReqsByTask = async (
  task_id: number,
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_BASE_URL}/reqs/tasks/${task_id}/export/`,
    {
      method: 'POST',
      headers,
    }
  )
  return await handleResponse(response)
}

/**
 * 批量导出请求的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量导出请求的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用批量导出指定ID的请求
 *
 * 主要功能：
 * - 向后端API发送批量导出请求的请求
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发导出操作的函数，需要传入请求ID数组
 *          - isLoading: 导出操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 导出成功的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchExportReqsMutation()
 *
 * const handleExport = async (reqIds) => {
 *   try {
 *     await mutateAsync(reqIds)
 *     console.log('请求导出成功')
 *   } catch (err) {
 *     console.error('请求导出失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /reqs/export/ 端点发送PUT请求来批量导出请求
 * - req_ids 必须是有效的数字ID数组
 * - 适用于需要批量导出指定请求的场景
 * - reqs API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useBatchExportReqsMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (req_ids: number[]) => {
      const token = await getToken()
      const response = await exportReqs(req_ids, token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'reqs_export.json' // 使用更具描述性的默认文件名
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
 * 导出任务的所有请求的自定义 Mutation Hook
 *
 * 此 Hook 封装了导出任务的所有请求的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用导出指定任务的所有请求
 *
 * 主要功能：
 * - 向后端API发送导出任务请求的请求
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发导出操作的函数，需要传入任务ID
 *          - isLoading: 导出操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 导出成功的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useExportReqsByTaskMutation()
 *
 * const handleExport = async (taskId) => {
 *   try {
 *     await mutateAsync(taskId)
 *     console.log('任务请求导出成功')
 *   } catch (err) {
 *     console.error('任务请求导出失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /reqs/export/tasks/{task_id}/export 端点发送POST请求来导出任务的所有请求
 * - task_id 必须是有效的数字ID，且对应任务存在于数据库中
 * - 适用于需要导出某个任务所有请求的场景
 * - reqs API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useExportReqsByTaskMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (task_id: number) => {
      const token = await getToken()
      const response = await exportReqsByTask(task_id, token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'reqs_export.json' // 使用更具描述性的默认文件名
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
 * 清空作业请求结果
 *
 * 此函数用于向后端API发送DELETE请求，清空指定作业任务的所有请求结果
 *
 * @param task_id - 需要清空请求结果的作业任务的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的作业任务记录
 *
 * @param token - 鉴权token（可选，reqs API 可能不需要认证）
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果清空成功，响应状态码通常为204 (No Content)
 *                如果清空失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：作业任务ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 清空ID为1的作业任务的请求结果
 * try {
 *   const response = await cleartaskReqs(1)
 *   console.log("作业任务请求结果清空成功")
 * } catch (error) {
 *   console.error("作业任务请求结果清空失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /reqs/tasks/{task_id}/ 端点发送DELETE请求
 * - 清空操作会永久删除指定作业任务的所有请求结果，请谨慎操作
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功清空后，后端通常返回204状态码，表示资源已成功删除且无响应体
 * - 在UI中建议添加二次确认机制，防止误操作
 * - 清空后需要手动使相关查询缓存失效，以确保UI显示最新数据
 * - reqs API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const clearReqsByTask = async (
  task_id: number,
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/reqs/tasks/${task_id}/`, {
    method: 'DELETE',
    headers,
  })
  return await handleResponse(response)
}

/**
 * 清空作业任务请求结果的自定义 Mutation Hook
 *
 * 此 Hook 封装了清空作业任务请求结果的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用清空指定作业任务的所有请求结果
 *
 * 主要功能：
 * - 向后端API发送清空作业任务请求结果的请求
 * - 自动处理缓存更新，确保UI显示最新的请求状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发清空操作的函数，需要传入作业任务ID
 *          - isLoading: 清空操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 清空成功的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useCleartaskReqsMutation()
 *
 * const handleClear = async (taskId) => {
 *   try {
 *     await mutateAsync(taskId)
 *     console.log('作业任务请求结果清空成功')
 *   } catch (err) {
 *     console.error('作业任务请求结果清空失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /reqs/tasks/{task_id}/ 端点发送DELETE请求来清空作业任务请求结果
 * - 清空成功后会自动使 ['reqs'] 查询缓存失效，确保列表显示最新状态
 * - 适用于需要清空某个作业任务所有请求结果的场景
 * - task_id 必须是有效的数字ID，且对应作业任务存在于数据库中
 * - 清空操作会永久删除指定作业任务的所有请求结果，请谨慎使用
 * - 建议在UI中添加二次确认机制，防止误操作
 * - reqs API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useCleartaskReqsMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (task_id: number) => {
      const token = await getToken()
      return clearReqsByTask(task_id, token)
    },
    onSuccess: () => {
      // 清空成功后使请求列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['reqs'] })
    },
  })
}
