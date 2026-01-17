// 引入reactQuery依赖
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// Clerk 认证
import { useAuth } from '@clerk/clerk-react'
// 分页相关
import { extracted_pagination } from '@/config/pagination'
import {
  JobApplyData,
  JobCompleteData,
  JobData,
  JobEnsureData,
  JobsData,
  TaskStatus
} from '../data/schemas.ts'


// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const DEFAULT_PAGE_SIZE: number = Number(import.meta.env.VITE_TASK_PAGE_SIZE || 50)

// 通用错误处理
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

/**
 * 获取任务列表
 *
 * 此函数用于从后端API获取任务列表，支持日期、网站ID、入口点ID、状态过滤和分页功能
 *
 * @param day - 可选参数，用于按爬虫开始日期(UTC)过滤任务
 * @param website_id - 可选参数，用于按网站ID过滤任务
 * @param entrypoint_id - 可选参数，用于按入口点ID过滤任务
 * @param status - 可选参数，用于过滤任务结果状态
 *                    "running": 运行中的任务
 *                    "completed": 已完成的任务
 *                    "canceled": 已取消的任务
 *                    undefined: 返回所有任务（不考虑状态）
 * @param page - 页码，从1开始，默认为1
 * @param size - 每页返回的数据量，默认为 PAGE_SIZE 条
 *
 * @param token - 鉴权token（可选，tasks API 可能不需要认证）
 * @returns Promise<JobsData> - 返回任务数据数组的Promise
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 获取所有任务，第一页，每页 PAGE_SIZE 条
 * const allJobs = await fetchJobs()
 *
 * // 获取指定日期的运行中任务
 * const runningJobs = await fetchJobs("2026-01-12", undefined, undefined, "running", 1, PAGE_SIZE)
 *
 * // 获取指定网站的所有任务
 * const websiteJobs = await fetchJobs(undefined, 1, undefined, undefined, 1, PAGE_SIZE)
 */
export const fetchJobs = async (
  day: string | undefined = undefined,
  website_id: number | undefined = undefined,
  entrypoint_id: number | undefined = undefined,
  status: TaskStatus | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE,
  token: string | null = null
): Promise<JobsData> => {

  // 构建基础URL，包含分页参数
  let url = `${API_BASE_URL}/tasks/?page=${page}&size=${size}`

  // 如果提供了日期参数，则添加到查询字符串中
  if (day) {
    url += `&day=${day}`
  }

  // 如果提供了网站ID参数，则添加到查询字符串中
  if (website_id) {
    url += `&website_id=${website_id}`
  }

  // 如果提供了入口点ID参数，则添加到查询字符串中
  if (entrypoint_id) {
    url += `&entrypoint_id=${entrypoint_id}`
  }

  // 如果提供了状态参数，则添加到查询字符串中
  if (status) {
    url += `&status=${status}`
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
  const jobs: JobData[] = await response.json()

  return {
    jobs,
    pagination
  }
}


/**
 * 申请并创建新任务
 *
 * 此函数用于向后端API发送请求申请并创建一个新的任务记录
 * 节点通过此接口申请执行爬虫任务
 *
 * @param data - 任务申请所需的数据对象，必须符合 JobApplyData 接口定义
 *              通常包含节点ID、节点地址等必要字段
 *
 * @param token - 鉴权token（可选，tasks API 可能不需要认证）
 * @returns Promise<JobData> - 返回创建成功的任务数据对象的Promise
 *                                包含新创建任务的所有信息
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 创建一个新任务
 * const newJobData = {
 *   node_id: "node-123",
 *   node_address: "http://node.example.com",
 *   website_slugs: ["example-site"]
 * }
 * try {
 *   const createdJob = await createJob(newJobData)
 *   console.log("任务创建成功:", createdJob)
 * } catch (error) {
 *   console.error("任务创建失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /tasks/ 端点发送POST请求
 * - 传入的data参数必须符合JobApplyData接口的结构要求
 * - 请求头设置为application/json格式
 * - node_id 和 node_address 是必填字段
 * - website_slugs 是可选字段，用于指定需要爬取的网站列表
 */
export const createJob = async (
  data: JobApplyData,
  token: string | null = null
): Promise<JobData> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/tasks/`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}


/**
 * 确认任务
 *
 * 此函数用于确认任务，节点通过此接口确认接收并开始执行任务
 *
 * @param taskId - 需要确认的任务的唯一标识符（ID）
 * @param data - 包含确认任务的数据对象，必须符合 JobEnsureData 接口定义
 *              通常包含Actor ID和Actor地址
 *
 * @param token - 鉴权token（可选，tasks API 可能不需要认证）
 * @returns Promise<JobData> - 返回确认后的任务数据对象的Promise
 *                                包含任务的所有信息，包括确认后的状态
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 确认ID为1的任务
 * const ensureData = {
 *   uid: "actor-123",
 *   address: "http://actor.example.com"
 * }
 * try {
 *   const confirmedJob = await ensureJob(1, ensureData)
 *   console.log("任务确认成功:", confirmedJob)
 * } catch (error) {
 *   console.error("任务确认失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /tasks/{taskId}/ 端点发送PATCH请求
 * - 确保传入的taskId是有效的任务ID
 * - data参数需要符合JobEnsureData接口定义的结构
 * - uid 和 address 可以为空
 */
export const ensureJob = async (
  taskId: number,
  data: JobEnsureData,
  token: string | null = null
): Promise<JobData> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}


/**
 * 完成任务
 *
 * 此函数用于完成任务，节点通过此接口报告任务执行完成
 *
 * @param taskId - 需要完成的任务唯一标识符（ID）
 * @param data - 包含完成任务的数据对象，必须符合 JobCompleteData 接口定义
 *              通常包含任务结束的最早文章发布时间
 *
 * @param token - 鉴权token（可选，tasks API 可能不需要认证）
 * @returns Promise<JobData> - 返回完成后的任务数据对象的Promise
 *                                包含任务的所有信息，包括完成后的状态
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 完成ID为1的任务
 * const completeData = {
 *   end_at: "2026-01-12T10:00:00Z"
 * }
 * try {
 *   const completedJob = await completeJob(1, completeData)
 *   console.log("任务完成成功:", completedJob)
 * } catch (error) {
 *   console.error("任务完成失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /tasks/{taskId}/ 端点发送PUT请求
 * - 确保传入的taskId是有效的任务ID
 * - data参数需要符合JobCompleteData接口定义的结构
 * - end_at 表示任务结束的最早文章发布时间，可以为空
 */
export const completeJob = async (
  taskId: number,
  data: JobCompleteData,
  token: string | null = null
): Promise<JobData> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  })
  await handleResponse(response)
  return response.json()
}


/**
 * 取消任务
 *
 * 此函数用于向后端API发送DELETE请求，取消指定ID的任务记录
 *
 * @param taskId - 需要取消的任务的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的任务记录
 *
 * @param token - 鉴权token（可选，tasks API 可能不需要认证）
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果取消成功，响应状态码通常为204 (No Content)
 *                如果取消失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：任务ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 取消ID为5的任务
 * try {
 *   const response = await cancelJob(5)
 *   console.log("任务取消成功")
 * } catch (error) {
 *   console.error("任务取消失败:", error)
 * }
 *
 * // 在实际应用中，通常与确认对话框结合使用
 * const handleCancel = async (taskId) => {
 *   if (confirm("确定要取消这个任务吗？")) {
 *     try {
 *       await cancelJob(taskId)
 *       // 刷新任务列表
 *       refetch()
 *     } catch (error) {
 *       alert("取消失败: " + error.message)
 *     }
 *   }
 * }
 *
 * 注意事项:
 * - 该函数会向 /tasks/{taskId}/ 端点发送DELETE请求
 * - 取消操作会将任务状态设置为 canceled
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功取消后，后端通常返回204状态码，表示资源已成功处理且无响应体
 * - 在UI中建议添加二次确认机制，防止误操作
 * - 取消后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const cancelJob = async (
  taskId: number,
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/`, {
    method: 'DELETE',
    headers,
  })
  return await handleResponse(response)
}


/**
 * 清空任务
 *
 * 此函数用于清空指定日期之前的所有任务记录
 *
 * @param day - 需要清空的日期字符串（格式：YYYY-MM-DD）
 *                   将清空此日期之前的所有任务
 *
 * @param token - 鉴权token（可选，tasks API 可能不需要认证）
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果清空成功，响应状态码通常为204 (No Content)
 *                如果清空失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：日期格式错误、权限不足、网络错误等
 *
 * 使用示例:
 * // 清空2026-01-01之前的所有任务
 * try {
 *   const response = await clearJobs("2026-01-01")
 *   console.log("任务清空成功")
 * } catch (error) {
 *   console.error("任务清空失败:", error)
 * }
 *
 * // 在实际应用中，通常与确认对话框结合使用
 * const handleClear = async (day) => {
 *   if (confirm(`确定要清空${day}之前的所有任务吗？此操作不可撤销。`)) {
 *     try {
 *       await clearJobs(day)
 *       // 刷新任务列表
 *       refetch()
 *     } catch (error) {
 *       alert("清空失败: " + error.message)
 *     }
 *   }
 * }
 *
 * 注意事项:
 * - 该函数会向 /tasks/before/{day}/ 端点发送DELETE请求
 * - 清空操作会永久删除指定日期之前的所有任务，请谨慎操作
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功清空后，后端通常返回204状态码，表示资源已成功删除且无响应体
 * - 在UI中建议添加二次确认机制，防止误操作
 * - 清空后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const clearJobs = async (
  day: string,
  token: string | null = null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/tasks/before/${day}/`, {
    method: 'DELETE',
    headers,
  })
  return await handleResponse(response)
}


/**
 * 获取任务日期列表
 *
 * 此函数用于从后端API获取所有有任务的日期列表
 * 返回的日期格式为字符串数组
 *
 * @param token - 鉴权token（可选，tasks API 可能不需要认证）
 * @returns Promise<string[]> - 返回日期字符串数组的Promise
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 获取所有任务日期
 * const days = await fetchTaskDays()
 * console.log('任务日期列表:', days)
 *
 * 注意事项:
 * - 该函数会向 /tasks/days/ 端点发送GET请求
 * - 返回的日期列表可以用于前端日期筛选
 * - tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const fetchTaskDays = async (
  token: string | null = null
): Promise<string[]> => {
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/tasks/days/`, {
    headers,
  })

  await handleResponse(response)

  return response.json()
}


/**
 * 获取任务列表的自定义 Hook
 *
 * 此 Hook 封装了获取任务列表的查询逻辑，提供了日期、网站ID、入口点ID、状态过滤和分页功能
 * 使用 TanStack Query 的 useQuery 来处理数据获取、缓存和状态管理
 *
 * @param day - 可选参数，用于按爬虫开始日期(UTC)过滤任务
 *                        当值为 undefined 时，不进行日期过滤
 * @param website_id - 可选参数，用于按网站ID过滤任务
 *                        当值为 undefined 时，不进行网站ID过滤
 * @param entrypoint_id - 可选参数，用于按入口点ID过滤任务
 *                        当值为 undefined 时，不进行入口点ID过滤
 * @param status - 可选参数，用于过滤任务结果状态
 *                        "running": 只返回运行中的任务
 *                        "completed": 只返回已完成的任务
 *                        "canceled": 只返回已取消的任务
 *                        undefined: 返回所有任务（不考虑状态）
 * @param page - 页码，从1开始，默认为1，用于分页查询
 * @param size - 每页返回的数据量，默认为 PAGE_SIZE 条，最大值取决于后端配置
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的任务数据数组 (JobData[])
 *          - isLoading: 数据加载状态
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 获取所有任务
 * const { data, isLoading } = useJobsQuery()
 *
 * // 获取指定日期的运行中任务
 * const { data, isLoading } = useJobsQuery("2026-01-12", undefined, undefined, "running", 1, PAGE_SIZE)
 *
 * // 获取指定网站的所有任务
 * const { data, isLoading } = useJobsQuery(undefined, 1, undefined, undefined, 1, PAGE_SIZE)
 *
 * 注意事项:
 * - 查询结果会被缓存，相同参数的查询会返回缓存数据
 * - 查询键(queryKey)包含了所有参数，确保不同参数的查询有独立的缓存
 * - 当参数变化时，会自动触发重新查询
 * - tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useJobsQuery = (
  day: string | undefined = undefined,
  website_id: number | undefined = undefined,
  entrypoint_id: number | undefined = undefined,
  status: TaskStatus | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE
) => {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['jobs', day, website_id, entrypoint_id, status, page, size],
    queryFn: async () => {
      const token = await getToken()
      return fetchJobs(day, website_id, entrypoint_id, status, page, size, token)
    },
    placeholderData: (previousData) => previousData,  // 保持上一次的数据
  })
}


/**
 * 申请并创建任务的自定义 Mutation Hook
 *
 * 此 Hook 封装了申请并创建任务的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 包含自动的数据缓存更新功能，当创建成功后会自动使任务列表缓存失效，触发重新查询
 *
 * 使用场景：
 * - 节点申请执行爬虫任务
 * - 需要自动更新任务列表显示最新数据
 * - 提供加载状态、错误处理等状态管理功能
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发创建操作的函数
 *          - isLoading: 创建操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 创建成功的任务数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useCreateJobMutation()
 *
 * const handleSubmit = async (newJobData) => {
 *   try {
 *     const createdJob = await mutateAsync(newJobData)
 *     console.log('任务创建成功:', createdJob)
 *   } catch (err) {
 *     console.error('任务创建失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 创建成功后会自动使 ['jobs'] 查询缓存失效，确保列表数据及时更新
 * - mutationFn 直接使用预定义的 createJob 函数，确保错误处理一致性
 * - 适用于需要创建单个任务并自动更新UI的场景
 * - tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useCreateJobMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: JobApplyData) => {
      const token = await getToken()
      return createJob(variables, token)
    },
    onSuccess: () => {
      // 创建成功后使任务列表缓存失效，触发重新获取数据
      // 这样可以确保UI显示最新的任务列表，包含新创建的任务
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}


/**
 * 确认任务的自定义 Mutation Hook
 *
 * 此 Hook 封装了确认任务的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用确认任务，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送确认任务的请求
 * - 自动处理缓存失效，确保UI显示最新的任务状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发确认操作的函数，需要传入 { taskId: number, data: JobEnsureData }
 *          - isLoading: 确认操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 确认成功后的任务数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useEnsureJobMutation()
 *
 * const handleEnsure = async (taskId, ensureData) => {
 *   try {
 *     const params = {
 *       taskId: taskId,
 *       data: {  // JobEnsureData 格式的数据
 *         uid: "actor-123",
 *         address: "http://actor.example.com"
 *       }
 *     }
 *     const confirmedJob = await mutateAsync(params)
 *     console.log('任务确认成功:', confirmedJob)
 *   } catch (err) {
 *     console.error('任务确认失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /tasks/{taskId}/ 端点发送PATCH请求来确认任务
 * - 确认成功后会自动使 ['jobs'] 查询缓存失效
 * - 适用于需要确认任务的场景
 * - taskId 必须是有效的数字ID，且对应任务存在于数据库中
 * - data 参数必须符合 JobEnsureData 接口的结构要求
 * - tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useEnsureJobMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { taskId: number; data: JobEnsureData }) => {
      const token = await getToken()
      return ensureJob(variables.taskId, variables.data, token)
    },
    onSuccess: () => {
      // 确认成功后使任务列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}


/**
 * 完成任务的自定义 Mutation Hook
 *
 * 此 Hook 封装了完成任务的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用完成任务，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送完成任务的请求
 * - 自动处理缓存失效，确保UI显示最新的任务状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发完成操作的函数，需要传入 { taskId: number, data: JobCompleteData }
 *          - isLoading: 完成操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 完成成功后的任务数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useCompleteJobMutation()
 *
 * const handleComplete = async (taskId, completeData) => {
 *   try {
 *     const params = {
 *       taskId: taskId,
 *       data: {  // JobCompleteData 格式的数据
 *         end_at: "2026-01-12T10:00:00Z"
 *       }
 *     }
 *     const completedJob = await mutateAsync(params)
 *     console.log('任务完成成功:', completedJob)
 *   } catch (err) {
 *     console.error('任务完成失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /tasks/{taskId}/ 端点发送PUT请求来完成任务
 * - 完成成功后会自动使 ['jobs'] 查询缓存失效
 * - 适用于需要完成任务的场景
 * - taskId 必须是有效的数字ID，且对应任务存在于数据库中
 * - data 参数必须符合 JobCompleteData 接口的结构要求
 * - tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useCompleteJobMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { taskId: number; data: JobCompleteData }) => {
      const token = await getToken()
      return completeJob(variables.taskId, variables.data, token)
    },
    onSuccess: () => {
      // 完成成功后使任务列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}


/**
 * 取消任务的自定义 Mutation Hook
 *
 * 此 Hook 封装了取消任务的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用取消任务，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送取消任务的请求
 * - 自动处理缓存失效，确保UI显示最新的任务状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发取消操作的函数，需要传入任务ID
 *          - isLoading: 取消操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 取消成功的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useCancelJobMutation()
 *
 * const handleCancel = async (taskId) => {
 *   try {
 *     await mutateAsync(taskId)
 *     console.log('任务取消成功')
 *   } catch (err) {
 *     console.error('任务取消失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /tasks/{taskId}/ 端点发送DELETE请求来取消任务
 * - 取消成功后会自动使 ['jobs'] 查询缓存失效
 * - 适用于需要取消任务的场景
 * - taskId 必须是有效的数字ID，且对应任务存在于数据库中
 * - 取消操作会将任务状态设置为 canceled
 * - tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useCancelJobMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (taskId: number) => {
      const token = await getToken()
      return cancelJob(taskId, token)
    },
    onSuccess: () => {
      // 取消成功后使任务列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}


/**
 * 获取任务日期列表的自定义 Hook
 *
 * 此 Hook 封装了获取任务日期列表的查询逻辑
 * 使用 TanStack Query 的 useQuery 来处理数据获取、缓存和状态管理
 *
 * 主要功能：
 * - 向后端API发送获取任务日期列表的请求
 * - 返回所有有任务的日期列表
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的日期列表数据 (string[])
 *          - isLoading: 数据加载状态
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * const { data, isLoading, isError } = useTaskDaysQuery()
 *
 * if (isLoading) return <div>加载中...</div>
 * if (isError) return <div>加载失败</div>
 *
 * return (
 *   <ul>
 *     {data?.map(day => (
 *       <li key={day}>{day}</li>
 *     ))}
 *   </ul>
 * )
 *
 * 注意事项:
 * - 查询结果会被缓存，避免重复请求
 * - 查询键为 ['taskDays']
 * - tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 * - 返回的日期列表可以用于日期筛选下拉框
 */
export const useTaskDaysQuery = () => {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['taskDays'],
    queryFn: async () => {
      const token = await getToken()
      return fetchTaskDays(token)
    },
    staleTime: 5 * 60 * 1000, // 5分钟内认为数据是新鲜的
  })
}


/**
 * 清空任务的自定义 Mutation Hook
 *
 * 此 Hook 封装了清空任务的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用清空指定日期之前的所有任务，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送清空任务的请求
 * - 自动处理缓存失效，确保UI显示最新的任务状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发清空操作的函数，需要传入日期字符串
 *          - isLoading: 清空操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 清空成功的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useClearJobsMutation()
 *
 * const handleClear = async (day) => {
 *   try {
 *     await mutateAsync(day)
 *     console.log('任务清空成功')
 *   } catch (err) {
 *     console.error('任务清空失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /tasks/before/{day}/ 端点发送DELETE请求来清空任务
 * - 清空成功后会自动使 ['jobs'] 查询缓存失效
 * - 适用于需要清空历史任务的场景
 * - day 参数必须是有效的日期字符串（格式：YYYY-MM-DD）
 * - 清空操作会永久删除指定日期之前的所有任务，请谨慎使用
 * - 建议在UI中添加二次确认机制，防止误操作
 * - tasks API 可能不需要认证，但为了兼容性，仍然集成了 Clerk 认证
 */
export const useClearJobsMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (day: string) => {
      const token = await getToken()
      return clearJobs(day, token)
    },
    onSuccess: () => {
      // 清空成功后使任务列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
  })
}