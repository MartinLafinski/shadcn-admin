// 引入reactQuery依赖
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// 分页相关
import { extracted_pagination } from '@/config/pagination'
// Clerk 认证
import { useAuth } from '@clerk/clerk-react'
import type {
  EntrypointBatchSwitchData,
  EntrypointBatchExportData,
  EntrypointConfigData,
  EntrypointCreateData,
  EntrypointData,
  EntrypointsData,
  EntrypointSwitchData,
  EntrypointUpdateData,
  EntrypointSpiderConfigData,
  EntrypointPeriodData,
  EntrypointBatchLockData,
  EntrypointBatchPauseData,
  CreatePrejobByEntrypointData,
  SyncEntrypointsData,
} from '../data/schemas.ts'

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_ENTRYPOINT_PAGE_SIZE || 50
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
 * 获取入口点列表
 *
 * 此函数用于从后端API获取入口点列表，支持关键词搜索、启用状态过滤和分页功能
 *
 * @param website_id - 可选参数，用于按网站ID过滤入口点
 * @param industry_id - 可选参数，用于按行业ID过滤入口点
 * @param entrypoint_keyword - 可选参数，用于按关键词搜索入口点（例如入口点名称或URL）
 * @param entrypoint_enabled - 可选参数，用于过滤入口点的启用状态
 *                    true: 只返回启用的入口点
 *                    false: 只返回禁用的入口点
 *                    undefined: 返回所有入口点（不考虑启用状态）
 * @param entrypoint_locked
 * @param entrypoint_paused
 * @param entrypoint_limited
 * @param page - 页码，从1开始，默认为1
 * @param size - 每页返回的数据量，默认为 DEFAULT_PAGE_SIZE 条
 *
 * @param token - 鉴权token
 * @returns Promise<EntrypointsData> - 返回入口点数据数组的Promise
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 获取所有入口点，第一页，每页 DEFAULT_PAGE_SIZE 条
 * const allEntrypoints = await fetchEntrypoints()
 *
 * // 搜索包含"test"关键词的启用入口点
 * const searchResults = await fetchEntrypoints(undefined, "test", true, 1, 20)
 *
 * // 获取所有禁用的入口点
 * const disabledEntrypoints = await fetchEntrypoints(undefined, undefined, false)
 */
export const fetchEntrypoints = async (
  website_id: number | undefined = undefined,
  industry_id: number | undefined = undefined,
  entrypoint_keyword: string | undefined = undefined,
  entrypoint_enabled: boolean | undefined = undefined,
  entrypoint_locked: boolean | undefined = undefined,
  entrypoint_paused: boolean | undefined = undefined,
  entrypoint_limited: boolean | undefined = undefined,
  deeply_search: boolean | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE,
  token: string | null
): Promise<EntrypointsData> => {
  // 构建基础URL，包含分页参数
  let url = `${API_BASE_URL}/entrypoints/?page=${page}&size=${size}`

  // 如果提供了网站ID参数，则添加到查询字符串中
  if (website_id) {
    url += `&website_id=${website_id}`
  }

  // 如果提供了行业ID参数，则添加到查询字符串中
  if (industry_id) {
    url += `&industry_id=${industry_id}`
  }

  // 如果提供了关键词参数，则添加到查询字符串中
  if (entrypoint_keyword) {
    url += `&entrypoint_keyword=${entrypoint_keyword}`
  }

  // 如果提供了启用状态参数（注意：undefined !== 某个布尔值），则添加到查询字符串中
  if (entrypoint_enabled !== undefined) {
    url += `&entrypoint_enabled=${entrypoint_enabled}`
  }

  // 如果提供了锁定状态参数，则添加到查询字符串中
  if (entrypoint_locked !== undefined) {
    url += `&entrypoint_locked=${entrypoint_locked}`
  }

  // 如果提供了暂停状态参数，则添加到查询字符串中
  if (entrypoint_paused !== undefined) {
    url += `&entrypoint_paused=${entrypoint_paused}`
  }

  // 如果提供了受限状态参数，则添加到查询字符串中
  if (entrypoint_limited !== undefined) {
    url += `&entrypoint_limited=${entrypoint_limited}`
  }

  // 如果提供了深度搜索参数，则添加到查询字符串中
  if (deeply_search !== undefined && deeply_search !== null) {
    url += `&deeply_search=${deeply_search}`
  }

  // 发送GET请求获取数据
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  // 检查响应状态，处理可能的错误
  await handleResponse(response)

  // 从响应头中提取分页信息
  const pagination = extracted_pagination(response)

  // 解析并返回JSON数据和分页信息
  const entrypoints: EntrypointData[] = await response.json()

  return {
    entrypoints,
    pagination,
  }
}

/**
 * 根据ID获取入口点详细信息
 *
 * 此函数用于从后端API根据入口点ID获取指定入口点的详细信息
 *
 * @param entrypointId - 需要获取的入口点的唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的入口点记录
 *
 * @param token - 鉴权token
 * @returns Promise<EntrypointData> - 返回入口点数据对象的Promise
 *                                包含入口点的所有信息，如ID、名称、URL、配置、启用状态等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：入口点ID不存在、网络错误、后端服务异常等
 *
 * 使用示例:
 * // 获取ID为1的入口点信息
 * try {
 *   const entrypointData = await fetchEntrypointById(1)
 *   console.log("入口点信息:", entrypointData)
 * } catch (error) {
 *   console.error("获取入口点信息失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/{entrypointId}/ 端点发送GET请求
 * - 如果entrypointId对应的入口点不存在，后端会返回404错误
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 返回的数据类型为EntrypointData，具体结构请参考相关接口定义
 */
export const fetchEntrypointById = async (
  entrypointId: number,
  token: string | null
): Promise<EntrypointData> => {
  const response = await fetch(`${API_BASE_URL}/entrypoints/${entrypointId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
  return response.json()
}

// 创建入口点
/**
 * 创建新入口点
 *
 * 此函数用于向后端API发送请求创建一个新的入口点记录
 *
 * @param data - 入口点创建所需的数据对象，必须符合EntrypointCreateData接口定义
 *              通常包含入口点名称、URL、配置信息等必要字段
 *
 * @param token - 鉴权token
 * @returns Promise<EntrypointData> - 返回创建成功的入口点数据对象的Promise
 *                                包含新创建入口点的所有信息，如ID、名称、URL、配置等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 创建一个新入口点
 * const newEntrypointData = {
 *   entrypoint_name: "我的入口点",
 *   entrypoint_slug: "myentrypoint",
 *   entrypoint_url: "https://example.com",
 *   entrypoint_config: { theme: "default" },
 *   entrypoint_readme: "入口点说明"
 * }
 * try {
 *   const createdEntrypoint = await createEntrypoint(newEntrypointData)
 *   console.log("入口点创建成功:", createdEntrypoint)
 * } catch (error) {
 *   console.error("入口点创建失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/ 端点发送POST请求
 * - 传入的data参数必须符合EntrypointCreateData接口的结构要求
 * - 请求头设置为application/json格式
 * - 如果后端验证失败，会通过handleResponse函数抛出错误
 */
export const createEntrypoint = async (
  data: EntrypointCreateData,
  token: string | null
): Promise<EntrypointData> => {
  const response = await fetch(`${API_BASE_URL}/entrypoints/`, {
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
 * 更新入口点信息
 *
 * 此函数用于完全更新指定入口点的所有信息，使用 PUT 方法替换整个入口点资源
 * 注意：PUT 请求会完全替换目标资源，所以 data 对象应包含入口点的所有必要字段
 *
 * @param entrypointId - 需要更新的入口点的唯一标识符（ID）
 *                   必须是已存在的入口点ID，否则会返回404错误或创建新资源（取决于后端实现）
 * @param data - 完整的入口点更新数据对象，必须符合 EntrypointUpdateData 接口定义
 *              应包含入口点的所有信息，因为PUT请求会完全替换现有资源
 *              通常包括：入口点名称、URL、配置信息、启用状态等所有入口点相关字段
 *
 * @param token - 鉴权token
 * @returns Promise<EntrypointData> - 返回更新后的完整入口点数据对象的Promise
 *                                包含入口点的所有信息，包括更新后的字段和可能的服务器生成字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：入口点ID不存在、数据验证失败、网络错误等
 *
 * 使用示例:
 * // 更新入口点的全部信息
 * const entrypointUpdateData = {
 *   website_id: 1,
 *   entrypoint_name: "更新后的入口点名称",
 *   entrypoint_slug: "updatedentrypoint",
 *   entrypoint_url: "https://newsite.com",
 *   entrypoint_config: { theme: "dark", language: "zh-CN" },
 *   entrypoint_readme: "更新后的入口点说明",
 *   entrypoint_enabled: true
 * }
 * try {
 *   const updatedEntrypoint = await updateEntrypoint(1, entrypointUpdateData)
 *   console.log("入口点更新成功:", updatedEntrypoint)
 * } catch (error) {
 *   console.error("入口点更新失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/{entrypointId} 端点发送PUT请求
 * - PUT方法会完全替换目标资源，如果只想更新部分字段，请使用 patchEntrypoint 函数
 * - 传入的data参数必须是完整的EntrypointUpdateData对象，缺少的字段可能会被置空或重置为默认值
 * - 请求头设置为application/json格式
 * - 如果后端验证失败（如字段格式不正确），会通过handleResponse函数抛出错误
 * - 确保entrypointId是有效的数字ID，且对应入口点存在于数据库中
 */
export const updateEntrypoint = async (
  entrypointId: number,
  data: EntrypointUpdateData,
  token: string | null
): Promise<EntrypointData> => {
  const response = await fetch(`${API_BASE_URL}/entrypoints/${entrypointId}/`, {
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
 * 部分更新入口点配置
 *
 * 此函数用于部分更新指定入口点的配置信息，只更新提供的字段，不会影响其他字段
 * 使用 PATCH 方法，允许单独更新入口点配置或说明文档
 *
 * @param entrypointId - 需要更新的入口点的唯一标识符（ID）
 * @param data - 包含需要更新的入口点字段的对象，符合 EntrypointConfigData 接口定义
 *              可包含以下可选字段：
 *              - entrypoint_url: string - 入口点URL
 *              - entrypoint_config: Record<string, any> - 入口点配置对象，可以包含任意配置项
 *              - entrypoint_readme: string - 入口点说明文档内容
 *
 * @param token - 鉴权token
 * @returns Promise<EntrypointData> - 返回更新后的完整入口点数据对象的Promise
 *                                包含入口点的所有信息，包括更新后的字段和未更改的原有字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 只更新入口点配置
 * const updatedEntrypoint = await patchEntrypoint(1, {
 *   entrypoint_config: { theme: "dark", language: "zh-CN" }
 * })
 *
 * // 只更新入口点说明文档
 * const updatedEntrypoint = await patchEntrypoint(1, {
 *   entrypoint_readme: "这是更新后的入口点说明"
 * })
 *
 * // 同时更新URL、配置和说明文档
 * const updatedEntrypoint = await patchEntrypoint(1, {
 *   entrypoint_url: "https://newsite.com",
 *   entrypoint_config: { theme: "light" },
 *   entrypoint_readme: "新的说明文档"
 * })
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/{entrypointId} 端点发送PATCH请求
 * - 与PUT请求不同，PATCH只更新提供的字段，其他字段保持不变
 * - 传入的data参数必须符合EntrypointConfigData接口的结构要求
 * - 请求头设置为application/json格式
 * - 如果后端验证失败，会通过handleResponse函数抛出错误
 */
export const patchEntrypoint = async (
  entrypointId: number,
  data: EntrypointConfigData,
  token: string | null
): Promise<EntrypointData> => {
  const response = await fetch(`${API_BASE_URL}/entrypoints/${entrypointId}/`, {
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
 * 切换入口点启用状态
 *
 * 此函数用于切换指定入口点的启用状态，通过向后端API发送POST请求来更改入口点的启用/禁用状态
 *
 * @param entrypointId - 需要切换启用状态的入口点的唯一标识符（ID）
 * @param data - 包含切换状态的数据对象，通常包含启用状态信息
 *              例如: { entrypoint_enabled: true/false }
 *
 * @param token - 鉴权token
 * @returns Promise<EntrypointData> - 返回更新后的入口点数据对象的Promise
 *                                包含入口点的所有信息，包括更新后的启用状态
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 启用ID为1的入口点
 * const updatedEntrypoint = await switchEntrypoint(1, { entrypoint_enabled: true })
 *
 * // 禁用ID为5的入口点
 * const updatedEntrypoint = await switchEntrypoint(5, { entrypoint_enabled: false })
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/{entrypointId}/switch/ 端点发送POST请求
 * - 确保传入的entrypointId是有效的入口点ID
 * - data参数需要符合EntrypointSwitchData接口定义的结构
 */
export const switchEntrypoint = async (
  entrypointId: number,
  data: EntrypointSwitchData,
  token: string | null
): Promise<EntrypointData> => {
  const response = await fetch(
    `${API_BASE_URL}/entrypoints/${entrypointId}/switch/`,
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

/**
 * 删除指定入口点
 *
 * 此函数用于向后端API发送DELETE请求，删除指定ID的入口点记录
 * 该操作会永久删除入口点数据，请在调用前确认用户意图，建议配合确认对话框使用
 *
 * @param entrypointId - 需要删除的入口点的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的入口点记录
 *                   删除操作不可逆，请谨慎操作
 *
 * @param token - 鉴权token
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果删除成功，响应状态码通常为204 (No Content)
 *                如果删除失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：入口点ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 删除ID为5的入口点
 * try {
 *   const response = await deleteEntrypoint(5)
 *   console.log("入口点删除成功")
 * } catch (error) {
 *   console.error("入口点删除失败:", error)
 * }
 *
 * // 在实际应用中，通常与确认对话框结合使用
 * const handleDelete = async (entrypointId) => {
 *   if (confirm("确定要删除这个入口点吗？此操作不可撤销。")) {
 *     try {
 *       await deleteEntrypoint(entrypointId)
 *       // 刷新入口点列表
 *       refetch()
 *     } catch (error) {
 *       alert("删除失败: " + error.message)
 *     }
 *   }
 * }
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/{entrypointId}/ 端点发送DELETE请求
 * - 删除操作是永久性的，无法恢复，请确保用户明确意图后再执行
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功删除后，后端通常返回204状态码，表示资源已成功删除且无响应体
 * - 在UI中建议添加二次确认机制，防止误删操作
 * - 删除后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const deleteEntrypoint = async (
  entrypointId: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/entrypoints/${entrypointId}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 批量切换入口点启用状态
 *
 * 此函数用于批量切换多个入口点的启用状态，通过向后端API发送PUT请求来更改多个入口点的启用/禁用状态
 *
 * @param data - 包含批量切换状态的数据对象，符合 EntrypointBatchSwitchData 接口定义
 *              通常包含以下字段：
 *              - entrypoint_ids: number[] - 需要切换状态的入口点ID数组
 *              - entrypoint_enabled: boolean - 目标启用状态，true为启用，false为禁用
 *
 * @param token - 鉴权token
 * @returns Promise<EntrypointData> - 返回操作结果的Promise
 *                                注意：根据API设计，可能返回最后一个处理的入口点数据或操作结果摘要
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量启用ID为[1, 2, 3]的入口点
 * const result = await batchSwitchEntrypoints({
 *   entrypoint_ids: [1, 2, 3],
 *   entrypoint_enabled: true
 * })
 *
 * // 批量禁用ID为[4, 5, 6]的入口点
 * const result = await batchSwitchEntrypoints({
 *   entrypoint_ids: [4, 5, 6],
 *   entrypoint_enabled: false
 * })
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/switch/ 端点发送PUT请求
 * - 确保传入的entrypoint_ids数组中的ID都是有效的入口点ID
 * - data参数需要符合EntrypointBatchSwitchData接口定义的结构
 * - 此操作是批量操作，会影响多个入口点的状态，请谨慎使用
 */
export const batchSwitchEntrypoints = async (
  data: EntrypointBatchSwitchData,
  token: string | null
): Promise<EntrypointData> => {
  const response = await fetch(`${API_BASE_URL}/entrypoints/switch/`, {
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

export const batchDeleteEntrypoints = async (
  entrypointIds: number[],
  token: string | null
): Promise<Response> => {
  const params = entrypointIds.map((id) => `entrypoint_ids=${id}`).join('&')
  const response = await fetch(`${API_BASE_URL}/entrypoints/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 同步入口点数据
 *
 * 此函数用于触发后端入口点数据同步操作，通常用于从外部源（如数据库、API或其他服务）同步最新的入口点数据
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
 * // 触发入口点数据同步
 * try {
 *   await syncEntrypoints()
 *   console.log("入口点数据同步完成")
 * } catch (error) {
 *   console.error("入口点数据同步失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/sync/ 端点发送POST请求
 * - 同步操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，可能需要手动刷新入口点列表以显示最新数据
 * - 根据后端实现，同步可能包括添加新入口点、更新现有入口点或删除不存在的入口点
 */
export const syncEntrypoints = async (
  token: string | null,
  data: SyncEntrypointsData
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/entrypoints/sync/`, {
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
 * 导出所有入口点数据
 *
 * 此函数用于从后端API导出所有入口点数据，通常返回一个包含入口点数据的文件
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
 * // 导出所有入口点数据
 * try {
 *   const response = await exportEntrypoints()
 *   // 将响应转换为blob并创建下载链接
 *   const blob = await response.blob()
 *   const url = window.URL.createObjectURL(blob)
 *   const a = document.createElement('a')
 *   a.href = url
 *   a.download = 'entrypoints_export.json'
 *   a.click()
 *   window.URL.revokeObjectURL(url)
 * } catch (error) {
 *   console.error("入口点数据导出失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/export/ 端点发送POST请求
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 可能需要处理大文件下载，注意浏览器内存限制
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 */
export const exportEntrypoints = async (
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/entrypoints/export/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 批量导出指定入口点数据
 *
 * 此函数用于从后端API导出指定入口点的数据，允许用户选择特定的入口点进行导出
 * 适用于只需要导出部分入口点数据的场景
 *
 * @param data - 包含批量导出所需数据的对象，必须符合 EntrypointBatchExportData 接口定义
 *              通常包含需要导出的入口点ID列表等信息
 *
 * @param token
 * @returns Promise<Response> - 返回包含导出数据的Response对象
 *                            可以进一步处理Response对象以获取实际的文件内容
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量导出指定ID的入口点数据
 * const exportData = {
 *   entrypoint_ids: [1, 2, 3]  // 需要导出的入口点ID列表
 * }
 * try {
 *   const response = await batchExportEntrypoints(exportData)
 *   const blob = await response.blob()
 *   // 处理下载逻辑...
 * } catch (error) {
 *   console.error("批量导出入口点数据失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/export/ 端点发送PUT请求
 * - 需要提供EntrypointBatchExportData格式的数据作为请求体
 * - 请求头设置为application/json格式
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 导出的文件可能只包含指定ID的入口点数据，而不是所有入口点
 */
export const batchExportEntrypoints = async (
  data: EntrypointBatchExportData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/entrypoints/export/`, {
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
 * 批量锁定/解锁入口点
 *
 * 此函数用于批量切换多个入口点的锁定状态，通过向后端API发送PUT请求来更改多个入口点的锁定/解锁状态
 *
 * @param data - 包含批量锁定状态的数据对象，符合 EntrypointBatchLockData 接口定义
 *              通常包含以下字段：
 *              - entrypoint_ids: number[] - 需要切换状态的入口点ID数组
 *              - is_locked: boolean - 目标锁定状态，true为锁定，false为解锁
 *
 * @param token - 鉴权token
 * @returns Promise<EntrypointData> - 返回操作结果的Promise
 *                                注意：根据API设计，可能返回最后一个处理的入口点数据或操作结果摘要
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/lock/ 端点发送PUT请求
 * - 确保传入的entrypoint_ids数组中的ID都是有效的入口点ID
 * - data参数需要符合EntrypointBatchLockData接口定义的结构
 * - 此操作是批量操作，会影响多个入口点的状态，请谨慎使用
 */
export const batchLockEntrypoints = async (
  data: EntrypointBatchLockData,
  token: string | null
): Promise<EntrypointData> => {
  const response = await fetch(`${API_BASE_URL}/entrypoints/lock/`, {
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
 * 批量暂停/恢复入口点
 *
 * 此函数用于批量切换多个入口点的暂停状态，通过向后端API发送PUT请求来更改多个入口点的暂停/恢复状态
 *
 * @param data - 包含批量暂停状态的数据对象，符合 EntrypointBatchPauseData 接口定义
 *              通常包含以下字段：
 *              - entrypoint_ids: number[] - 需要切换状态的入口点ID数组
 *              - is_paused: boolean - 目标暂停状态，true为暂停，false为恢复
 *
 * @param token - 鉴权token
 * @returns Promise<EntrypointData> - 返回操作结果的Promise
 *                                注意：根据API设计，可能返回最后一个处理的入口点数据或操作结果摘要
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 注意事项:
 * - 该函数会向 /entrypoints/pause/ 端点发送PUT请求
 * - 确保传入的entrypoint_ids数组中的ID都是有效的入口点ID
 * - data参数需要符合EntrypointBatchPauseData接口定义的结构
 * - 此操作是批量操作，会影响多个入口点的状态，请谨慎使用
 */
export const batchPauseEntrypoints = async (
  data: EntrypointBatchPauseData,
  token: string | null
): Promise<EntrypointData> => {
  const response = await fetch(`${API_BASE_URL}/entrypoints/pause/`, {
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
 * 获取入口点列表的自定义 Hook
 *
 * 此 Hook 封装了获取入口点列表的查询逻辑，提供了关键词搜索、启用状态过滤和分页功能
 * 使用 TanStack Query 的 useQuery 来处理数据获取、缓存和状态管理
 *
 * @param website_id - 可选参数，用于按网站ID过滤入口点
 *                        当值为 undefined 时，不进行网站ID过滤
 * @param industry_id - 可选参数，用于按行业ID过滤入口点
 *                        当值为 undefined 时，不进行行业ID过滤
 * @param entrypoint_keyword - 可选参数，用于按关键词搜索入口点（例如入口点名称或URL）
 *                        当值为 undefined 时，不进行关键词过滤
 * @param entrypoint_enabled - 可选参数，用于过滤入口点的启用状态
 *                        true: 只返回启用的入口点
 *                        false: 只返回禁用的入口点
 *                        undefined: 返回所有入口点（不考虑启用状态）
 * @param page - 页码，从1开始，默认为1，用于分页查询
 * @param size - 每页返回的数据量，默认为 DEFAULT_PAGE_SIZE 条，最大值取决于后端配置
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的入口点数据数组 (EntrypointData[])
 *          - isLoading: 数据加载状态
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 获取所有入口点
 * const { data, isLoading } = useEntrypointsQuery()
 *
 * // 搜索包含"test"关键词的启用入口点
 * const { data, isLoading } = useEntrypointsQuery(undefined, "test", true, 1, 20)
 *
 * // 获取所有禁用的入口点
 * const { data, isLoading } = useEntrypointsQuery(undefined, undefined, false)
 *
 * 注意事项:
 * - 查询结果会被缓存，相同参数的查询会返回缓存数据
 * - 查询键(queryKey)包含了所有参数，确保不同参数的查询有独立的缓存
 * - 当参数变化时，会自动触发重新查询
 */
export const useEntrypointsQuery = (
  website_id: number | undefined = undefined,
  industry_id: number | undefined = undefined,
  entrypoint_keyword: string | undefined = undefined,
  entrypoint_enabled: boolean | undefined = undefined,
  entrypoint_locked: boolean | undefined = undefined,
  entrypoint_paused: boolean | undefined = undefined,
  entrypoint_limited: boolean | undefined = undefined,
  deeply_search: boolean | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE
) => {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: [
      'entrypoints',
      website_id,
      industry_id,
      entrypoint_keyword,
      entrypoint_enabled,
      entrypoint_locked,
      entrypoint_paused,
      entrypoint_limited,
      deeply_search,
      page,
      size,
    ],
    queryFn: async () => {
      const token = await getToken()
      return fetchEntrypoints(
        website_id,
        industry_id,
        entrypoint_keyword,
        entrypoint_enabled,
        entrypoint_locked,
        entrypoint_paused,
        entrypoint_limited,
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
 * 根据入口点ID获取单个入口点详细信息的自定义 Hook
 *
 * 此 Hook 封装了获取单个入口点详细信息的查询逻辑，使用 TanStack Query 的 useQuery
 * 来处理数据获取、缓存和状态管理。该 Hook 会根据传入的 entrypointId 参数向后端
 * API 发起请求，获取指定入口点的完整信息。
 *
 * @param entrypointId - 需要获取信息的入口点唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的入口点记录
 *                    如果传入 0 或无效ID，由于 enabled 条件设置，将不会发起请求
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的入口点数据 (EntrypointData 类型)
 *          - isLoading: 数据加载状态，true 表示正在请求中
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - isFetching: 是否正在获取数据（包括重新验证）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 在组件中使用，获取ID为5的入口点信息
 * const { data: entrypoint, isLoading, error } = useEntrypointQuery(5)
 *
 * if (isLoading) return <div>加载中...</div>
 * if (error) return <div>错误: {error.message}</div>
 * if (entrypoint) return <div>入口点名称: {entrypoint.entrypoint_name}</div>
 *
 * // 手动刷新数据
 * const { refetch } = useEntrypointQuery(5)
 * const handleRefresh = () => refetch()
 *
 * 注意事项:
 * - 当 entrypointId 为 0 或无效值时，由于 enabled: !!entrypointId 设置，不会发起API请求
 * - 查询结果会被缓存，相同 entrypointId 的查询会返回缓存数据
 * - 查询键(queryKey) 包含 entrypointId，确保不同入口点ID的查询有独立的缓存
 * - 自动集成 Clerk 认证，会在请求头中添加 Bearer Token
 * - 此 Hook 适用于需要显示单个入口点详细信息的场景，如入口点详情页
 */
export const useEntrypointQuery = (entrypointId: number) => {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['entrypoint', entrypointId], // 查询键包含入口点ID，确保不同ID有独立缓存
    queryFn: async () => {
      const token = await getToken() // 获取认证token
      return fetchEntrypointById(entrypointId, token) // 调用API获取入口点详情
    },
    enabled: !!entrypointId, // 只有当 entrypointId 存在且不为0时才启用查询
  })
}

/**
 * 创建入口点的自定义 Mutation Hook
 *
 * 此 Hook 封装了创建入口点的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 包含自动的数据缓存更新功能，当创建成功后会自动使入口点列表缓存失效，触发重新查询
 *
 * 使用场景：
 * - 在表单中提交新入口点创建请求
 * - 需要自动更新入口点列表显示最新数据
 * - 提供加载状态、错误处理等状态管理功能
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发创建操作的函数
 *          - isLoading: 创建操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 创建成功的入口点数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useCreateEntrypointMutation()
 *
 * const handleSubmit = async (newEntrypointData) => {
 *   try {
 *     const createdEntrypoint = await mutateAsync(newEntrypointData)
 *     console.log('入口点创建成功:', createdEntrypoint)
 *   } catch (err) {
 *     console.error('入口点创建失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 创建成功后会自动使 ['entrypoints'] 查询缓存失效，确保列表数据及时更新
 * - mutationFn 直接使用预定义的 createEntrypoint 函数，确保错误处理一致性
 * - 适用于需要创建单个入口点并自动更新UI的场景
 */
export const useCreateEntrypointMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: EntrypointCreateData) => {
      const token = await getToken()
      return createEntrypoint(variables, token)
    },
    onSuccess: () => {
      // 创建成功后使入口点列表缓存失效，触发重新获取数据
      // 这样可以确保UI显示最新的入口点列表，包含新创建的入口点
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
    },
  })
}

/**
 * 更新入口点信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了更新入口点的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持完整的入口点信息更新（PUT 请求），包括入口点名称、URL、配置等所有字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 *
 * 主要功能：
 * - 提交入口点的完整更新数据（使用 PUT 方法替换整个资源）
 * - 自动处理缓存失效，确保UI显示最新的入口点信息
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发更新操作的函数，需要传入 { entrypointId: number, data: EntrypointUpdateData }
 *          - isLoading: 更新操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 更新成功的入口点数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useUpdateEntrypointMutation()
 *
 * const handleUpdate = async (entrypointId, entrypointData) => {
 *   try {
 *     const params = {
 *       entrypointId: entrypointId,
 *       data: entrypointData  // 符合 EntrypointUpdateData 接口的完整入口点数据
 *     }
 *     const updatedEntrypoint = await mutateAsync(params)
 *     console.log('入口点更新成功:', updatedEntrypoint)
 *   } catch (err) {
 *     console.error('入口点更新失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 使用 PUT 方法，会完全替换目标入口点资源，请确保 data 参数包含入口点的所有必要字段
 * - 更新成功后会自动使 ['entrypoints'] 和 ['entrypoint', entrypointId] 查询缓存失效
 * - 适用于需要更新入口点全部信息的场景，如果只需要更新部分字段，请使用 usePatchEntrypointMutation
 * - entrypointId 必须是有效的数字ID，且对应入口点存在于数据库中
 * - data 参数必须符合 EntrypointUpdateData 接口的结构要求
 */
export const useUpdateEntrypointMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      entrypointId: number
      data: EntrypointUpdateData
    }) => {
      const token = await getToken()
      return updateEntrypoint(variables.entrypointId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使入口点列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
      // 同时使单个入口点详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({
        queryKey: ['entrypoint', variables.entrypointId],
      })
    },
  })
}

/**
 * 部分更新入口点信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了部分更新入口点的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持部分更新入口点信息（PATCH 请求），仅更新提供的字段，不会影响其他字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 *
 * 主要功能：
 * - 提交入口点的部分更新数据（使用 PATCH 方法仅更新指定字段）
 * - 自动处理缓存失效，确保UI显示最新的入口点信息
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发更新操作的函数，需要传入 { entrypointId: number, data: EntrypointConfigData }
 *          - isLoading: 更新操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 更新成功的入口点数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = usePatchEntrypointMutation()
 *
 * const handlePatch = async (entrypointId, patchData) => {
 *   try {
 *     const params = {
 *       entrypointId: entrypointId,
 *       data: {  // 符合 EntrypointConfigData 接口的部分入口点数据
 *         entrypoint_config: { theme: "dark" },  // 只更新配置
 *         // 或者
 *         entrypoint_readme: "更新的说明文档"  // 只更新说明文档
 *       }
 *     }
 *     const updatedEntrypoint = await mutateAsync(params)
 *     console.log('入口点部分更新成功:', updatedEntrypoint)
 *   } catch (err) {
 *     console.error('入口点部分更新失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 使用 PATCH 方法，只更新提供的字段，其他字段保持不变
 * - 适用于只需要更新入口点部分信息的场景，如仅更新配置或说明文档
 * - 更新成功后会自动使 ['entrypoints'] 和 ['entrypoint', entrypointId] 查询缓存失效
 * - entrypointId 必须是有效的数字ID，且对应入口点存在于数据库中
 * - data 参数必须符合 EntrypointConfigData 接口的结构要求，可以只包含需要更新的字段
 * - 与 useUpdateEntrypointMutation 不同，此 Hook 允许只更新部分字段，不会重置其他字段
 */
export const usePatchEntrypointMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      entrypointId: number
      data: EntrypointConfigData
    }) => {
      const token = await getToken()
      return patchEntrypoint(variables.entrypointId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使入口点列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
      // 同时使单个入口点详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({
        queryKey: ['entrypoint', variables.entrypointId],
      })
    },
  })
}

/**
 * 切换入口点启用状态的自定义 Mutation Hook
 *
 * 此 Hook 封装了切换入口点启用状态的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用切换入口点的启用/禁用状态，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送切换入口点状态的请求
 * - 自动处理缓存失效，确保UI显示最新的入口点状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发切换操作的函数，需要传入 { entrypointId: number, data: EntrypointSwitchData }
 *          - isLoading: 切换操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 切换成功后的入口点数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useSwitchEntrypointMutation()
 *
 * const handleToggle = async (entrypointId, enabled) => {
 *   try {
 *     const params = {
 *       entrypointId: entrypointId,
 *       data: { entrypoint_enabled: enabled }  // EntrypointSwitchData 格式的数据
 *     }
 *     const updatedEntrypoint = await mutateAsync(params)
 *     console.log('入口点状态切换成功:', updatedEntrypoint)
 *   } catch (err) {
 *     console.error('入口点状态切换失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /entrypoints/{entrypointId}/switch/ 端点发送POST请求来切换入口点状态
 * - 切换成功后会自动使 ['entrypoints'] 和 ['entrypoint', entrypointId] 查询缓存失效
 * - 适用于需要切换入口点启用/禁用状态的场景
 * - entrypointId 必须是有效的数字ID，且对应入口点存在于数据库中
 * - data 参数必须符合 EntrypointSwitchData 接口的结构要求
 */
export const useSwitchEntrypointMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      entrypointId: number
      data: EntrypointSwitchData
    }) => {
      const token = await getToken()
      return switchEntrypoint(variables.entrypointId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使入口点列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
      // 同时使单个入口点详情缓存失效，确保详情页显示最新状态
      queryClient.invalidateQueries({
        queryKey: ['entrypoint', variables.entrypointId],
      })
    },
  })
}

/**
 * 批量切换入口点启用状态的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量切换多个入口点启用状态的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用批量切换多个入口点的启用/禁用状态，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送批量切换入口点状态的请求
 * - 自动处理缓存失效，确保UI显示最新的入口点状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量切换操作的函数，需要传入 EntrypointBatchSwitchData 格式的数据
 *          - isLoading: 批量切换操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量切换成功后的入口点数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchSwitchEntrypointsMutation()
 *
 * const handleBatchToggle = async (entrypointIds, enabled) => {
 *   try {
 *     const params = {
 *       entrypoint_ids: entrypointIds,  // 入口点ID数组，例如 [1, 2, 3]
 *       entrypoint_enabled: enabled          // 目标启用状态，true为启用，false为禁用
 *     }
 *     const result = await mutateAsync(params)
 *     console.log('批量切换入口点状态成功:', result)
 *   } catch (err) {
 *     console.error('批量切换入口点状态失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /entrypoints/switch/ 端点发送PUT请求来批量切换入口点状态
 * - 批量操作成功后会自动使 ['entrypoints'] 列表查询缓存失效
 * - 同时会使所有被操作的入口点详情缓存失效，确保详情页显示最新状态
 * - 适用于需要批量切换多个入口点启用/禁用状态的场景
 * - 传入的参数必须符合 EntrypointBatchSwitchData 接口的结构要求
 * - 代码会检查 variables.entrypoint_ids 是否存在且为数组，确保安全遍历
 */
export const useBatchSwitchEntrypointsMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: EntrypointBatchSwitchData) => {
      const token = await getToken()
      return batchSwitchEntrypoints(variables, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使入口点列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
      // 同时使单个入口点详情缓存失效，确保详情页显示最新状态
      if (variables.entrypoint_ids && Array.isArray(variables.entrypoint_ids)) {
        variables.entrypoint_ids.forEach((entrypoint_id) => {
          queryClient.invalidateQueries({
            queryKey: ['entrypoint', entrypoint_id],
          })
        })
      }
    },
  })
}

/**
 * 批量锁定/解锁入口点的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量锁定或解锁多个入口点的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用批量更改多个入口点的锁定状态（锁定或解锁），并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送批量锁定/解锁入口点的请求
 * - 自动处理缓存失效，确保UI显示最新的入口点锁定状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量锁定/解锁操作的函数，需要传入 EntrypointBatchLockData 格式的数据
 *          - isLoading: 批量锁定/解锁操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量锁定/解锁成功后的入口点数据（如果有的话）
 *
 * 注意事项:
 * - 此 Hook 向 /entrypoints/lock/ 端点发送PUT请求来批量切换入口点锁定状态
 * - 批量操作成功后会自动使 ['entrypoints'] 列表查询缓存失效
 * - 同时会使所有被操作的入口点详情缓存失效，确保详情页显示最新状态
 * - 适用于需要批量锁定或解锁多个入口点的场景
 * - 传入的参数必须符合 EntrypointBatchLockData 接口的结构要求，通常包含 entrypoint_ids 数组和 is_locked 布尔值
 */
export const useBatchLockEntrypointsMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: EntrypointBatchLockData) => {
      const token = await getToken()
      return batchLockEntrypoints(variables, token)
    },
    onSuccess: (_, variables) => {
      // 批量锁定/解锁成功后使入口点列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
      // 同时使单个入口点详情缓存失效，确保详情页显示最新状态
      if (variables.entrypoint_ids && Array.isArray(variables.entrypoint_ids)) {
        variables.entrypoint_ids.forEach((entrypoint_id) => {
          queryClient.invalidateQueries({
            queryKey: ['entrypoint', entrypoint_id],
          })
        })
      }
    },
  })
}

/**
 * 批量暂停/恢复入口点的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量暂停或恢复多个入口点的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用批量更改多个入口点的暂停状态（暂停或恢复），并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送批量暂停/恢复入口点的请求
 * - 自动处理缓存失效，确保UI显示最新的入口点暂停状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量暂停/恢复操作的函数，需要传入 EntrypointBatchPauseData 格式的数据
 *          - isLoading: 批量暂停/恢复操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量暂停/恢复成功后的入口点数据（如果有的话）
 *
 * 注意事项:
 * - 此 Hook 向 /entrypoints/pause/ 端点发送PUT请求来批量切换入口点暂停状态
 * - 批量操作成功后会自动使 ['entrypoints'] 列表查询缓存失效
 * - 同时会使所有被操作的入口点详情缓存失效，确保详情页显示最新状态
 * - 适用于需要批量暂停或恢复多个入口点的场景
 * - 传入的参数必须符合 EntrypointBatchPauseData 接口的结构要求，通常包含 entrypoint_ids 数组和 is_paused 布尔值
 */
export const useBatchPauseEntrypointsMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: EntrypointBatchPauseData) => {
      const token = await getToken()
      return batchPauseEntrypoints(variables, token)
    },
    onSuccess: (_, variables) => {
      // 批量暂停/恢复成功后使入口点列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
      // 同时使单个入口点详情缓存失效，确保详情页显示最新状态
      if (variables.entrypoint_ids && Array.isArray(variables.entrypoint_ids)) {
        variables.entrypoint_ids.forEach((entrypoint_id) => {
          queryClient.invalidateQueries({
            queryKey: ['entrypoint', entrypoint_id],
          })
        })
      }
    },
  })
}

/**
 * 同步入口点数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了同步入口点数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 主要功能是触发后端的入口点数据同步过程，通常用于从外部源同步最新的入口点数据
 *
 * 使用场景：
 * - 需要从外部源同步最新入口点数据时
 * - 定期更新入口点数据以保持数据一致性
 * - 手动触发数据同步操作
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发同步操作的函数
 *          - isLoading: 同步操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 同步操作的结果数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useSyncEntrypointsMutation()
 *
 * const handleSync = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('入口点数据同步完成')
 *   } catch (err) {
 *     console.error('入口点数据同步失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 同步操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，可能需要手动刷新入口点列表以显示最新数据
 * - 此操作会调用 syncEntrypoints API 函数，向后端发起同步请求
 */
export const useSyncEntrypointsMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (data: SyncEntrypointsData) => {
      const token = await getToken()
      return syncEntrypoints(token, data)
    },
  })
}

/**
 * 导出所有入口点数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了导出所有入口点数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持将入口点数据导出为文件并自动下载到本地，通常用于备份或离线分析
 *
 * 主要功能：
 * - 触发后端入口点数据导出操作
 * - 自动处理导出文件的下载
 * - 从响应头中提取文件名（如果后端提供）
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发导出操作的函数
 *          - isLoading: 导出操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 导出成功后的文件数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useExportEntrypointsMutation()
 *
 * const handleExport = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('入口点数据导出完成')
 *   } catch (err) {
 *     console.error('入口点数据导出失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 会自动处理文件下载逻辑，包括从响应头获取文件名
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 * - 如果后端没有提供文件名，默认使用 'download.json'
 */
export const useExportEntrypointsMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      return exportEntrypoints(token)
    },
    onSuccess: (data) => {
      // 从响应头中提取文件名
      const contentDisposition = data.headers.get('content-disposition')
      let fileName = 'entrypoints_export.json'
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1]
        }
      }

      // 将响应转换为blob并创建下载链接
      data.blob().then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        window.URL.revokeObjectURL(url)
      })
    },
  })
}

/**
 * 批量导出指定入口点数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量导出入口点数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持将指定的入口点数据导出为文件并自动下载到本地，通常用于备份或离线分析
 *
 * 主要功能：
 * - 触发后端入口点数据批量导出操作
 * - 自动处理导出文件的下载
 * - 从响应头中提取文件名（如果后端提供）
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量导出操作的函数，需要传入 EntrypointBatchExportData 格式的参数
 *          - isLoading: 批量导出操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量导出成功后的文件数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchExportEntrypointsMutation()
 *
 * const handleBatchExport = async () => {
 *   const exportData = {
 *     entrypoint_ids: [1, 2, 3]  // 需要导出的入口点ID列表
 *   }
 *   try {
 *     await mutateAsync(exportData)
 *     console.log('批量导出入口点数据完成')
 *   } catch (err) {
 *     console.error('批量导出入口点数据失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 需要传入 EntrypointBatchExportData 格式的参数，包含要导出的入口点ID列表
 * - 此 Hook 会自动处理文件下载逻辑，包括从响应头获取文件名
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 * - 如果后端没有提供文件名，默认使用 'download.json'
 * - 会自动创建下载链接并触发下载，完成后清理URL对象
 * - 可能需要处理大文件下载，注意浏览器内存限制
 * - 确保传入的 entrypoint_ids 数组中的ID都是有效的入口点ID
 */
export const useBatchExportEntrypointsMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: EntrypointBatchExportData) => {
      const token = await getToken()
      const response = await batchExportEntrypoints(variables, token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'entrypoints_export.json' // 使用更具描述性的默认文件名
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
 * 删除指定入口点的自定义 Mutation Hook
 *
 * 此 Hook 封装了删除入口点的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持删除指定ID的入口点，并自动处理相关的缓存更新，确保UI界面及时反映数据变化
 *
 * 主要功能：
 * - 向后端API发送删除指定入口点的请求
 * - 自动处理缓存失效，确保UI显示最新的入口点列表
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发删除操作的函数，需要传入 { entrypointId: number } 格式的参数
 *          - isLoading: 删除操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 删除成功后的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useDeleteEntrypointMutation()
 *
 * const handleDelete = async (entrypointId) => {
 *   try {
 *     await mutateAsync({ entrypointId: entrypointId })
 *     console.log('入口点删除成功')
 *   } catch (err) {
 *     console.error('入口点删除失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /entrypoints/{entrypointId}/ 端点发送DELETE请求来删除入口点
 * - 删除操作成功后会自动使 ['entrypoints'] 列表查询缓存失效
 * - 同时会使对应入口点详情缓存失效，确保详情页不会显示已删除的入口点信息
 * - 适用于需要删除单个入口点的场景
 * - 传入的参数必须包含有效的入口点ID
 */
export const useDeleteEntrypointMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { entrypointId: number }) => {
      const token = await getToken()
      return deleteEntrypoint(variables.entrypointId, token)
    },
    onSuccess: (_, variables) => {
      // 删除成功后使入口点列表缓存失效，确保列表显示最新状态（已移除被删除的入口点）
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
      // 同时使单个入口点详情缓存失效，确保详情页不会显示已删除的入口点信息
      queryClient.invalidateQueries({
        queryKey: ['entrypoint', variables.entrypointId],
      })
    },
  })
}

/**
 * 批量删除入口点的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量删除入口点的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持批量删除多个入口点，并自动处理相关的缓存更新，确保UI界面及时反映数据变化
 *
 * 主要功能：
 * - 向后端API发送批量删除入口点的请求
 * - 自动处理缓存失效，确保UI显示最新的入口点列表
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量删除操作的函数，需要传入 number[] 格式的入口点ID数组
 *          - isLoading: 批量删除操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量删除成功后的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchDeleteEntrypointsMutation()
 *
 * const handleBatchDelete = async (entrypointIds) => {
 *   try {
 *     const params = [1, 2, 3]  // 入口点ID数组，例如 [1, 2, 3]
 *     await mutateAsync(params)
 *     console.log('批量删除入口点成功')
 *   } catch (err) {
 *     console.error('批量删除入口点失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /entrypoints/ 端点发送DELETE请求来批量删除入口点
 * - 批量操作成功后会自动使 ['entrypoints'] 列表查询缓存失效
 * - 同时会使所有被删除的入口点详情缓存失效，确保详情页显示最新状态
 * - 适用于需要批量删除多个入口点的场景
 * - 传入的参数必须是入口点ID的数组
 */
export const useBatchDeleteEntrypointsMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: number[]) => {
      const token = await getToken()
      return batchDeleteEntrypoints(variables, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使入口点列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
      // 同时使单个入口点详情缓存失效，确保详情页显示最新状态
      if (variables && Array.isArray(variables)) {
        variables.forEach((entrypointId) => {
          queryClient.invalidateQueries({
            queryKey: ['entrypoint', entrypointId],
          })
        })
      }
    },
  })
}

/**
 * 获取入口点爬虫配置
 *
 * 此函数用于从后端API获取指定入口点的爬虫配置信息
 *
 * @param entrypointId - 入口点ID
 * @param token - 鉴权token
 * @returns Promise<EntrypointSpiderConfigData> - 返回爬虫配置数据
 */
export const fetchEntrypointSpiderConfig = async (
  entrypointId: number,
  token: string | null
): Promise<EntrypointSpiderConfigData> => {
  const response = await fetch(
    `${API_BASE_URL}/entrypoints/${entrypointId}/config/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
  await handleResponse(response)
  return response.json()
}

/**
 * 更新入口点爬虫配置
 *
 * 此函数用于更新指定入口点的爬虫配置信息
 *
 * @param entrypointId - 入口点ID
 * @param data - 爬虫配置数据
 * @param token - 鉴权token
 * @returns Promise<EntrypointData> - 返回更新后的入口点数据
 */
export const updateEntrypointSpiderConfig = async (
  entrypointId: number,
  data: EntrypointSpiderConfigData,
  token: string | null
): Promise<EntrypointData> => {
  const response = await fetch(
    `${API_BASE_URL}/entrypoints/${entrypointId}/config/`,
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

/**
 * 更新入口点日期区间
 *
 * 此函数用于更新指定入口点的日期区间
 *
 * @param entrypointId - 入口点ID
 * @param data - 日期区间数据
 * @param token - 鉴权token
 * @returns Promise<Response> - 返回响应
 */
export const updateEntrypointPeriod = async (
  entrypointId: number,
  data: EntrypointPeriodData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(
    `${API_BASE_URL}/entrypoints/${entrypointId}/period/`,
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
  return response
}

/**
 * 获取入口点爬虫配置的自定义 Hook
 *
 * @param entrypointId - 入口点ID
 * @returns 返回 useQuery 的结果对象
 */
export const useEntrypointSpiderConfigQuery = (entrypointId: number) => {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['entrypoint', entrypointId, 'config'],
    queryFn: async () => {
      const token = await getToken()
      return fetchEntrypointSpiderConfig(entrypointId, token)
    },
    enabled: !!entrypointId,
  })
}

/**
 * 更新入口点爬虫配置的自定义 Mutation Hook
 *
 * @returns 返回 useMutation 的结果对象
 */
export const useUpdateEntrypointSpiderConfigMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      entrypointId: number
      data: EntrypointSpiderConfigData
    }) => {
      const token = await getToken()
      return updateEntrypointSpiderConfig(
        variables.entrypointId,
        variables.data,
        token
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['entrypoint', variables.entrypointId, 'config'],
      })
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
    },
  })
}

/**
 * 更新入口点日期区间的自定义 Mutation Hook
 *
 * @returns 返回 useMutation 的结果对象
 */
export const useUpdateEntrypointPeriodMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      entrypointId: number
      data: EntrypointPeriodData
    }) => {
      const token = await getToken()
      return updateEntrypointPeriod(
        variables.entrypointId,
        variables.data,
        token
      )
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['entrypoint', variables.entrypointId],
      })
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
    },
  })
}

/**
 * 通过入口点创建预备作业
 *
 * @param entrypoint_id - 入口点ID
 * @param prelog_slug_suffix - 预备作业标识后缀
 * @param prelog_name_suffix - 预备作业名称后缀
 * @param token - 认证令牌
 * @returns 返回创建的预备作业数据
 */
export const createPrejobByEntrypoint = async (
  entrypoint_id: number,
  prelog_slug_suffix: string,
  prelog_name_suffix: string,
  token: string | null
) => {
  const url = `${API_BASE_URL}/prejobs/entrypoints/`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      entrypoint_id,
      prelog_slug_suffix,
      prelog_name_suffix,
    }),
  })

  await handleResponse(response)
  return response.json()
}

/**
 * 通过入口点创建预备作业的自定义 Mutation Hook
 *
 * @returns 返回 useMutation 的结果对象
 */
export const useCreatePrejobByEntrypointMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: CreatePrejobByEntrypointData) => {
      const token = await getToken()
      return createPrejobByEntrypoint(
        variables.entrypoint_id,
        variables.prelog_slug_suffix,
        variables.prelog_name_suffix,
        token
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prejobs'] })
      queryClient.invalidateQueries({ queryKey: ['entrypoints'] })
    },
  })
}
