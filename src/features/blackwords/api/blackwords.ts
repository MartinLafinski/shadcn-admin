// 引入reactQuery依赖
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// Clerk 认证
import { useAuth } from '@clerk/clerk-react'
// 分页相关
import { extracted_pagination } from '@/config/pagination'
import {
  BlackwordBatchSwitchData,
  BlackwordBatchExportData,
  BlackwordConfigData,
  BlackwordCreateData,
  BlackwordData,
  BlackwordsData,
  BlackwordSwitchData,
  BlackwordUpdateData
} from '../data/schemas.ts'


// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'

// 通用错误处理
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

/**
 * 获取敏感词列表
 *
 * 此函数用于从后端API获取敏感词列表，支持关键词搜索、启用状态过滤和分页功能
 *
 * @param blackwords_keyword - 可选参数，用于按关键词搜索敏感词（例如敏感词集合名称或内容）
 * @param blackwords_enabled - 可选参数，用于过滤敏感词的启用状态
 *                    true: 只返回启用的敏感词
 *                    false: 只返回禁用的敏感词
 *                    undefined: 返回所有敏感词（不考虑启用状态）
 * @param page - 页码，从1开始，默认为1
 * @param size - 每页返回的数据量，默认为10条
 *
 * @param token - 鉴权token
 * @returns Promise<BlackwordsData> - 返回敏感词数据数组的Promise
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 获取所有敏感词，第一页，每页10条
 * const allBlackwords = await fetchBlackwords()
 *
 * // 搜索包含"test"关键词的启用敏感词
 * const searchResults = await fetchBlackwords("test", true, 1, 20)
 *
 * // 获取所有禁用的敏感词
 * const disabledBlackwords = await fetchBlackwords(undefined, false)
 */
export const fetchBlackwords = async (
  blackwords_keyword: string | undefined = undefined,
  blackwords_enabled: boolean | undefined = undefined,
  page: number = 1,
  size: number = 10,
  token: string | null
): Promise<BlackwordsData> => {

  // 构建基础URL，包含分页参数
  let url = `${API_BASE_URL}/blackwords/?page=${page}&size=${size}`

  // 如果提供了关键词参数，则添加到查询字符串中
  if (blackwords_keyword) {
    url += `&blackwords_keyword=${blackwords_keyword}`
  }

  // 如果提供了启用状态参数（注意：undefined !== 某个布尔值），则添加到查询字符串中
  if (blackwords_enabled !== undefined) {
    url += `&blackwords_enabled=${blackwords_enabled}`
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
  const blackwords: BlackwordData[] = await response.json()

  return {
    blackwords,
    pagination
  }
}


/**
 * 根据ID获取敏感词详细信息
 *
 * 此函数用于从后端API根据敏感词ID获取指定敏感词的详细信息
 *
 * @param blackwordsId - 需要获取的敏感词的唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的敏感词记录
 *
 * @param token - 鉴权token
 * @returns Promise<BlackwordData> - 返回敏感词数据对象的Promise
 *                                包含敏感词的所有信息，如ID、名称、集合、启用状态等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：敏感词ID不存在、网络错误、后端服务异常等
 *
 * 使用示例:
 * // 获取ID为1的敏感词信息
 * try {
 *   const blackwordData = await fetchBlackwordById(1)
 *   console.log("敏感词信息:", blackwordData)
 * } catch (error) {
 *   console.error("获取敏感词信息失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /blackwords/{blackwordsId}/ 端点发送GET请求
 * - 如果blackwordsId对应的敏感词不存在，后端会返回404错误
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 返回的数据类型为BlackwordData，具体结构请参考相关接口定义
 */
export const fetchBlackwordById = async (
  blackwordsId: number,
  token: string | null
): Promise<BlackwordData> => {
  const response = await fetch(`${API_BASE_URL}/blackwords/${blackwordsId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
  return response.json()
}

// 创建敏感词
/**
 * 创建新敏感词
 *
 * 此函数用于向后端API发送请求创建一个新的敏感词记录
 *
 * @param data - 敏感词创建所需的数据对象，必须符合BlackwordCreateData接口定义
 *              通常包含敏感词名称、集合、配置信息等必要字段
 *
 * @param token - 鉴权token
 * @returns Promise<BlackwordData> - 返回创建成功的敏感词数据对象的Promise
 *                                包含新创建敏感词的所有信息，如ID、名称、集合等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 创建一个新敏感词
 * const newBlackwordData = {
 *   blackwords_name: "违禁词库",
 *   blackwords_slug: "forbidden-words",
 *   blackwords_collection: ["违禁词1", "违禁词2"],
 *   blackwords_readme: "违禁词库说明"
 * }
 * try {
 *   const createdBlackword = await createBlackword(newBlackwordData)
 *   console.log("敏感词创建成功:", createdBlackword)
 * } catch (error) {
 *   console.error("敏感词创建失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /blackwords/ 端点发送POST请求
 * - 传入的data参数必须符合BlackwordCreateData接口的结构要求
 * - 请求头设置为application/json格式
 * - 如果后端验证失败，会通过handleResponse函数抛出错误
 */
export const createBlackword = async (
  data: BlackwordCreateData,
  token: string | null
): Promise<BlackwordData> => {
  const response = await fetch(`${API_BASE_URL}/blackwords/`, {
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
 * 更新敏感词信息
 *
 * 此函数用于完全更新指定敏感词的所有信息，使用 PUT 方法替换整个敏感词资源
 * 注意：PUT 请求会完全替换目标资源，所以 data 对象应包含敏感词的所有必要字段
 *
 * @param blackwordsId - 需要更新的敏感词的唯一标识符（ID）
 *                   必须是已存在的敏感词ID，否则会返回404错误或创建新资源（取决于后端实现）
 * @param data - 完整的敏感词更新数据对象，必须符合 BlackwordUpdateData 接口定义
 *              应包含敏感词的所有信息，因为PUT请求会完全替换现有资源
 *              通常包括：敏感词名称、集合、启用状态等所有敏感词相关字段
 *
 * @param token - 鉴权token
 * @returns Promise<BlackwordData> - 返回更新后的完整敏感词数据对象的Promise
 *                                包含敏感词的所有信息，包括更新后的字段和可能的服务器生成字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：敏感词ID不存在、数据验证失败、网络错误等
 *
 * 使用示例:
 * // 更新敏感词的全部信息
 * const blackwordUpdateData = {
 *   blackwords_name: "更新后的敏感词库",
 *   blackwords_slug: "updated-blackwords",
 *   blackwords_collection: ["新敏感词1", "新敏感词2"],
 *   blackwords_readme: "更新后的敏感词库说明",
 *   enabled: true
 * }
 * try {
 *   const updatedBlackword = await updateBlackword(1, blackwordUpdateData)
 *   console.log("敏感词更新成功:", updatedBlackword)
 * } catch (error) {
 *   console.error("敏感词更新失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /blackwords/{blackwordsId} 端点发送PUT请求
 * - PUT方法会完全替换目标资源，如果只想更新部分字段，请使用 patchBlackword 函数
 * - 传入的data参数必须是完整的BlackwordUpdateData对象，缺少的字段可能会被置空或重置为默认值
 * - 请求头设置为application/json格式
 * - 如果后端验证失败（如字段格式不正确），会通过handleResponse函数抛出错误
 * - 确保blackwordsId是有效的数字ID，且对应敏感词存在于数据库中
 */
export const updateBlackword = async (
  blackwordsId: number,
  data: BlackwordUpdateData,
  token: string | null
): Promise<BlackwordData> => {
  const response = await fetch(`${API_BASE_URL}/blackwords/${blackwordsId}`, {
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
 * 部分更新敏感词配置
 *
 * 此函数用于部分更新指定敏感词的配置信息，只更新提供的字段，不会影响其他字段
 * 使用 PATCH 方法，允许单独更新敏感词集合或说明文档
 *
 * @param blackwordsId - 需要更新的敏感词的唯一标识符（ID）
 * @param data - 包含需要更新的敏感词字段的对象，符合 BlackwordConfigData 接口定义
 *              可包含以下可选字段：
 *              - blackwords_collection: string[] - 敏感词集合数组
 *              - blackwords_readme: string - 敏感词说明文档内容
 *
 * @param token - 鉴权token
 * @returns Promise<BlackwordData> - 返回更新后的完整敏感词数据对象的Promise
 *                                包含敏感词的所有信息，包括更新后的字段和未更改的原有字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 只更新敏感词集合
 * const updatedBlackword = await patchBlackword(1, {
 *   blackwords_collection: ["敏感词1", "敏感词2", "敏感词3"]
 * })
 *
 * // 只更新敏感词说明文档
 * const updatedBlackword = await patchBlackword(1, {
 *   blackwords_readme: "这是更新后的敏感词说明"
 * })
 *
 * // 同时更新集合和说明文档
 * const updatedBlackword = await patchBlackword(1, {
 *   blackwords_collection: ["新敏感词"],
 *   blackwords_readme: "新的说明文档"
 * })
 *
 * 注意事项:
 * - 该函数会向 /blackwords/{blackwordsId} 端点发送PATCH请求
 * - 与PUT请求不同，PATCH只更新提供的字段，其他字段保持不变
 * - 传入的data参数必须符合BlackwordConfigData接口的结构要求
 * - 请求头设置为application/json格式
 * - 如果后端验证失败，会通过handleResponse函数抛出错误
 */
export const patchBlackword = async (
  blackwordsId: number,
  data: BlackwordConfigData,
  token: string | null
): Promise<BlackwordData> => {
  const response = await fetch(`${API_BASE_URL}/blackwords/${blackwordsId}`, {
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
 * 切换敏感词启用状态
 *
 * 此函数用于切换指定敏感词的启用状态，通过向后端API发送POST请求来更改敏感词的启用/禁用状态
 *
 * @param blackwordsId - 需要切换启用状态的敏感词的唯一标识符（ID）
 * @param data - 包含切换状态的数据对象，通常包含启用状态信息
 *              例如: { blackwords_enabled: true/false }
 *
 * @param token - 鉴权token
 * @returns Promise<BlackwordData> - 返回更新后的敏感词数据对象的Promise
 *                                包含敏感词的所有信息，包括更新后的启用状态
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 启用ID为1的敏感词
 * const updatedBlackword = await switchBlackword(1, { blackwords_enabled: true })
 *
 * // 禁用ID为5的敏感词
 * const updatedBlackword = await switchBlackword(5, { blackwords_enabled: false })
 *
 * 注意事项:
 * - 该函数会向 /blackwords/{blackwordsId}/switch/ 端点发送POST请求
 * - 确保传入的blackwordsId是有效的敏感词ID
 * - data参数需要符合BlackwordSwitchData接口定义的结构
 */
export const switchBlackword = async (
  blackwordsId: number,
  data: BlackwordSwitchData,
  token: string | null
): Promise<BlackwordData> => {
  const response = await fetch(`${API_BASE_URL}/blackwords/${blackwordsId}/switch/`, {
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
 * 删除指定敏感词
 *
 * 此函数用于向后端API发送DELETE请求，删除指定ID的敏感词记录
 * 该操作会永久删除敏感词数据，请在调用前确认用户意图，建议配合确认对话框使用
 *
 * @param blackwordsId - 需要删除的敏感词的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的敏感词记录
 *                   删除操作不可逆，请谨慎操作
 *
 * @param token - 鉴权token
 * 
 * @returns Promise<Response> - 返回原始响应对象
 *                如果删除成功，响应状态码通常为204 (No Content)
 *                如果删除失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：敏感词ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 删除ID为5的敏感词
 * try {
 *   const response = await deleteBlackword(5)
 *   console.log("敏感词删除成功")
 * } catch (error) {
 *   console.error("敏感词删除失败:", error)
 * }
 *
 * // 在实际应用中，通常与确认对话框结合使用
 * const handleDelete = async (blackwordsId) => {
 *   if (confirm("确定要删除这个敏感词吗？此操作不可撤销。")) {
 *     try {
 *       await deleteBlackword(blackwordsId)
 *       // 刷新敏感词列表
 *       refetch()
 *     } catch (error) {
 *       alert("删除失败: " + error.message)
 *     }
 *   }
 * }
 *
 * 注意事项:
 * - 该函数会向 /blackwords/{blackwordsId}/ 端点发送DELETE请求
 * - 删除操作是永久性的，无法恢复，请确保用户明确意图后再执行
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功删除后，后端通常返回204状态码，表示资源已成功删除且无响应体
 * - 在UI中建议添加二次确认机制，防止误删操作
 * - 删除后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const deleteBlackword = async (
  blackwordsId: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/blackwords/${blackwordsId}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}


/**
 * 批量切换敏感词启用状态
 *
 * 此函数用于批量切换多个敏感词的启用状态，通过向后端API发送PUT请求来更改多个敏感词的启用/禁用状态
 *
 * @param data - 包含批量切换状态的数据对象，符合 BlackwordBatchSwitchData 接口定义
 *              通常包含以下字段：
 *              - blackwords_ids: number[] - 需要切换状态的敏感词ID数组
 *              - blackwords_enabled: boolean - 目标启用状态，true为启用，false为禁用
 *
 * @param token - 鉴权token
 * @returns Promise<BlackwordData> - 返回操作结果的Promise
 *                                注意：根据API设计，可能返回最后一个处理的敏感词数据或操作结果摘要
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量启用ID为[1, 2, 3]的敏感词
 * const result = await batchSwitchBlackwords({
 *   blackwords_ids: [1, 2, 3],
 *   blackwords_enabled: true
 * })
 *
 * // 批量禁用ID为[4, 5, 6]的敏感词
 * const result = await batchSwitchBlackwords({
 *   blackwords_ids: [4, 5, 6],
 *   blackwords_enabled: false
 * })
 *
 * 注意事项:
 * - 该函数会向 /blackwords/switch/ 端点发送PUT请求
 * - 确保传入的blackwords_ids数组中的ID都是有效的敏感词ID
 * - data参数需要符合BlackwordBatchSwitchData接口定义的结构
 * - 此操作是批量操作，会影响多个敏感词的状态，请谨慎使用
 */
export const batchSwitchBlackwords = async (
  data: BlackwordBatchSwitchData,
  token: string | null
): Promise<BlackwordData> => {
  const response = await fetch(`${API_BASE_URL}/blackwords/switch/`, {
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


export const batchDeleteBlackwords = async (
  blackwordsIds: number[],
  token: string | null
): Promise<Response> => {
  const params = blackwordsIds.map(id => `blackwords_ids=${id}`).join('&')
  const response = await fetch(`${API_BASE_URL}/blackwords/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}


/**
 * 同步敏感词数据
 *
 * 此函数用于触发后端敏感词数据同步操作，通常用于从外部源（如数据库、API或其他服务）同步最新的敏感词数据
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
 * // 触发敏感词数据同步
 * try {
 *   await syncBlackwords()
 *   console.log("敏感词数据同步完成")
 * } catch (error) {
 *   console.error("敏感词数据同步失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /blackwords/sync/ 端点发送POST请求
 * - 同步操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，可能需要手动刷新敏感词列表以显示最新数据
 * - 根据后端实现，同步可能包括添加新敏感词、更新现有敏感词或删除不存在的敏感词
 */
export const syncBlackwords = async (token: string | null): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/blackwords/sync/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
}

/**
 * 导出所有敏感词数据
 *
 * 此函数用于从后端API导出所有敏感词数据，通常返回一个包含敏感词数据的文件
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
 * // 导出所有敏感词数据
 * try {
 *   const response = await exportBlackwords()
 *   // 将响应转换为blob并创建下载链接
 *   const blob = await response.blob()
 *   const url = window.URL.createObjectURL(blob)
 *   const a = document.createElement('a')
 *   a.href = url
 *   a.download = 'blackwords_export.json'
 *   a.click()
 *   window.URL.revokeObjectURL(url)
 * } catch (error) {
 *   console.error("敏感词数据导出失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /blackwords/export/ 端点发送POST请求
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 可能需要处理大文件下载，注意浏览器内存限制
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 */
export const exportBlackwords = async (token: string | null): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/blackwords/export/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 批量导出指定敏感词数据
 *
 * 此函数用于从后端API导出指定敏感词的数据，允许用户选择特定的敏感词进行导出
 * 适用于只需要导出部分敏感词数据的场景
 *
 * @param data - 包含批量导出所需数据的对象，必须符合 BlackwordBatchExportData 接口定义
 *              通常包含需要导出的敏感词ID列表等信息
 *
 * @param token
 * @returns Promise<Response> - 返回包含导出数据的Response对象
 *                            可以进一步处理Response对象以获取实际的文件内容
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量导出指定ID的敏感词数据
 * const exportData = {
 *   blackwords_ids: [1, 2, 3]  // 需要导出的敏感词ID列表
 * }
 * try {
 *   const response = await batchExportBlackwords(exportData)
 *   const blob = await response.blob()
 *   // 处理下载逻辑...
 * } catch (error) {
 *   console.error("批量导出敏感词数据失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /blackwords/export/ 端点发送PUT请求
 * - 需要提供BlackwordBatchExportData格式的数据作为请求体
 * - 请求头设置为application/json格式
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 导出的文件可能只包含指定ID的敏感词数据，而不是所有敏感词
 */
export const batchExportBlackwords = async (
  data: BlackwordBatchExportData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/blackwords/export/`, {
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
 * 获取敏感词列表的自定义 Hook
 *
 * 此 Hook 封装了获取敏感词列表的查询逻辑，提供了关键词搜索、启用状态过滤和分页功能
 * 使用 TanStack Query 的 useQuery 来处理数据获取、缓存和状态管理
 *
 * @param blackwords_keyword - 可选参数，用于按关键词搜索敏感词（例如敏感词集合名称或内容）
 *                        当值为 undefined 时，不进行关键词过滤
 * @param blackwords_enabled - 可选参数，用于过滤敏感词的启用状态
 *                        true: 只返回启用的敏感词
 *                        false: 只返回禁用的敏感词
 *                        undefined: 返回所有敏感词（不考虑启用状态）
 * @param page - 页码，从1开始，默认为1，用于分页查询
 * @param size - 每页返回的数据量，默认为10条，最大值取决于后端配置
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的敏感词数据数组 (BlackwordData[])
 *          - isLoading: 数据加载状态
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 获取所有敏感词
 * const { data, isLoading } = useBlackwordsQuery()
 *
 * // 搜索包含"test"关键词的启用敏感词
 * const { data, isLoading } = useBlackwordsQuery("test", true, 1, 20)
 *
 * // 获取所有禁用的敏感词
 * const { data, isLoading } = useBlackwordsQuery(undefined, false)
 *
 * 注意事项:
 * - 查询结果会被缓存，相同参数的查询会返回缓存数据
 * - 查询键(queryKey)包含了所有参数，确保不同参数的查询有独立的缓存
 * - 当参数变化时，会自动触发重新查询
 */
export const useBlackwordsQuery = (
  blackwords_keyword: string | undefined = undefined,
  blackwords_enabled: boolean | undefined = undefined,
  page: number = 1,
  size: number = 10
) => {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['blackwords', blackwords_keyword, blackwords_enabled, page, size],
    queryFn: async () => {
      const token = await getToken()
      return fetchBlackwords(blackwords_keyword, blackwords_enabled, page, size, token)
    },
  })
}

/**
 * 根据敏感词ID获取单个敏感词详细信息的自定义 Hook
 *
 * 此 Hook 封装了获取单个敏感词详细信息的查询逻辑，使用 TanStack Query 的 useQuery
 * 来处理数据获取、缓存和状态管理。该 Hook 会根据传入的 blackwordsId 参数向后端
 * API 发起请求，获取指定敏感词的完整信息。
 *
 * @param blackwordsId - 需要获取信息的敏感词唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的敏感词记录
 *                    如果传入 0 或无效ID，由于 enabled 条件设置，将不会发起请求
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的敏感词数据 (BlackwordData 类型)
 *          - isLoading: 数据加载状态，true 表示正在请求中
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - isFetching: 是否正在获取数据（包括重新验证）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 在组件中使用，获取ID为5的敏感词信息
 * const { data: blackword, isLoading, error } = useBlackwordQuery(5)
 *
 * if (isLoading) return <div>加载中...</div>
 * if (error) return <div>错误: {error.message}</div>
 * if (blackword) return <div>敏感词名称: {blackword.blackwords_name}</div>
 *
 * // 手动刷新数据
 * const { refetch } = useBlackwordQuery(5)
 * const handleRefresh = () => refetch()
 *
 * 注意事项:
 * - 当 blackwordsId 为 0 或无效值时，由于 enabled: !!blackwordsId 设置，不会发起API请求
 * - 查询结果会被缓存，相同 blackwordsId 的查询会返回缓存数据
 * - 查询键(queryKey) 包含 blackwordsId，确保不同敏感词ID的查询有独立的缓存
 * - 自动集成 Clerk 认证，会在请求头中添加 Bearer Token
 * - 此 Hook 适用于需要显示单个敏感词详细信息的场景，如敏感词详情页
 */
export const useBlackwordQuery = (blackwordsId: number) => {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['blackword', blackwordsId],  // 查询键包含敏感词ID，确保不同ID有独立缓存
    queryFn: async () => {
      const token = await getToken()  // 获取认证token
      return fetchBlackwordById(blackwordsId, token)  // 调用API获取敏感词详情
    },
    enabled: !!blackwordsId,  // 只有当 blackwordsId 存在且不为0时才启用查询
  })
}


/**
 * 创建敏感词的自定义 Mutation Hook
 *
 * 此 Hook 封装了创建敏感词的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 包含自动的数据缓存更新功能，当创建成功后会自动使敏感词列表缓存失效，触发重新查询
 *
 * 使用场景：
 * - 在表单中提交新敏感词创建请求
 * - 需要自动更新敏感词列表显示最新数据
 * - 提供加载状态、错误处理等状态管理功能
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发创建操作的函数
 *          - isLoading: 创建操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 创建成功的敏感词数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useCreateBlackwordMutation()
 *
 * const handleSubmit = async (newBlackwordData) => {
 *   try {
 *     const createdBlackword = await mutateAsync(newBlackwordData)
 *     console.log('敏感词创建成功:', createdBlackword)
 *   } catch (err) {
 *     console.error('敏感词创建失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 创建成功后会自动使 ['blackwords'] 查询缓存失效，确保列表数据及时更新
 * - mutationFn 直接使用预定义的 createBlackword 函数，确保错误处理一致性
 * - 适用于需要创建单个敏感词并自动更新UI的场景
 */
export const useCreateBlackwordMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: BlackwordCreateData) => {
      const token = await getToken()
      return createBlackword(variables, token)
    },
    onSuccess: () => {
      // 创建成功后使敏感词列表缓存失效，触发重新获取数据
      // 这样可以确保UI显示最新的敏感词列表，包含新创建的敏感词
      queryClient.invalidateQueries({ queryKey: ['blackwords'] })
    },
  })
}


/**
 * 更新敏感词信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了更新敏感词的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持完整的敏感词信息更新（PUT 请求），包括敏感词名称、集合等所有字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 *
 * 主要功能：
 * - 提交敏感词的完整更新数据（使用 PUT 方法替换整个资源）
 * - 自动处理缓存失效，确保UI显示最新的敏感词信息
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发更新操作的函数，需要传入 { blackwordsId: number, data: BlackwordUpdateData }
 *          - isLoading: 更新操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 更新成功的敏感词数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useUpdateBlackwordMutation()
 *
 * const handleUpdate = async (blackwordsId, blackwordData) => {
 *   try {
 *     const params = {
 *       blackwordsId: blackwordsId,
 *       data: blackwordData  // 符合 BlackwordUpdateData 接口的完整敏感词数据
 *     }
 *     const updatedBlackword = await mutateAsync(params)
 *     console.log('敏感词更新成功:', updatedBlackword)
 *   } catch (err) {
 *     console.error('敏感词更新失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 使用 PUT 方法，会完全替换目标敏感词资源，请确保 data 参数包含敏感词的所有必要字段
 * - 更新成功后会自动使 ['blackwords'] 和 ['blackword', blackwordsId] 查询缓存失效
 * - 适用于需要更新敏感词全部信息的场景，如果只需要更新部分字段，请使用 usePatchBlackwordMutation
 * - blackwordsId 必须是有效的数字ID，且对应敏感词存在于数据库中
 * - data 参数必须符合 BlackwordUpdateData 接口的结构要求
 */
export const useUpdateBlackwordMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { blackwordsId: number; data: BlackwordUpdateData }) => {
      const token = await getToken()
      return updateBlackword(variables.blackwordsId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使敏感词列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['blackwords'] })
      // 同时使单个敏感词详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({ queryKey: ['blackword', variables.blackwordsId] })
    },
  })
}


/**
 * 部分更新敏感词信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了部分更新敏感词的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持部分更新敏感词信息（PATCH 请求），仅更新提供的字段，不会影响其他字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 *
 * 主要功能：
 * - 提交敏感词的部分更新数据（使用 PATCH 方法仅更新指定字段）
 * - 自动处理缓存失效，确保UI显示最新的敏感词信息
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发更新操作的函数，需要传入 { blackwordsId: number, data: BlackwordConfigData }
 *          - isLoading: 更新操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 更新成功的敏感词数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = usePatchBlackwordMutation()
 *
 * const handlePatch = async (blackwordsId, patchData) => {
 *   try {
 *     const params = {
 *       blackwordsId: blackwordsId,
 *       data: {  // 符合 BlackwordConfigData 接口的部分敏感词数据
 *         blackwords_collection: ["新敏感词"],  // 只更新集合
 *         // 或者
 *         blackwords_readme: "更新的说明文档"  // 只更新说明文档
 *       }
 *     }
 *     const updatedBlackword = await mutateAsync(params)
 *     console.log('敏感词部分更新成功:', updatedBlackword)
 *   } catch (err) {
 *     console.error('敏感词部分更新失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 使用 PATCH 方法，只更新提供的字段，其他字段保持不变
 * - 适用于只需要更新敏感词部分信息的场景，如仅更新集合或说明文档
 * - 更新成功后会自动使 ['blackwords'] 和 ['blackword', blackwordsId] 查询缓存失效
 * - blackwordsId 必须是有效的数字ID，且对应敏感词存在于数据库中
 * - data 参数必须符合 BlackwordConfigData 接口的结构要求，可以只包含需要更新的字段
 * - 与 useUpdateBlackwordMutation 不同，此 Hook 允许只更新部分字段，不会重置其他字段
 */
export const usePatchBlackwordMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { blackwordsId: number; data: BlackwordConfigData }) => {
      const token = await getToken()
      return patchBlackword(variables.blackwordsId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使敏感词列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['blackwords'] })
      // 同时使单个敏感词详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({ queryKey: ['blackword', variables.blackwordsId] })
    },
  })
}


/**
 * 切换敏感词启用状态的自定义 Mutation Hook
 *
 * 此 Hook 封装了切换敏感词启用状态的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用切换敏感词的启用/禁用状态，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送切换敏感词状态的请求
 * - 自动处理缓存失效，确保UI显示最新的敏感词状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发切换操作的函数，需要传入 { blackwordsId: number, data: BlackwordSwitchData }
 *          - isLoading: 切换操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 切换成功后的敏感词数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useSwitchBlackwordMutation()
 *
 * const handleToggle = async (blackwordsId, enabled) => {
 *   try {
 *     const params = {
 *       blackwordsId: blackwordsId,
 *       data: { blackwords_enabled: enabled }  // BlackwordSwitchData 格式的数据
 *     }
 *     const updatedBlackword = await mutateAsync(params)
 *     console.log('敏感词状态切换成功:', updatedBlackword)
 *   } catch (err) {
 *     console.error('敏感词状态切换失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /blackwords/{blackwordsId}/switch/ 端点发送POST请求来切换敏感词状态
 * - 切换成功后会自动使 ['blackwords'] 和 ['blackword', blackwordsId] 查询缓存失效
 * - 适用于需要切换敏感词启用/禁用状态的场景
 * - blackwordsId 必须是有效的数字ID，且对应敏感词存在于数据库中
 * - data 参数必须符合 BlackwordSwitchData 接口的结构要求
 */
export const useSwitchBlackwordMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { blackwordsId: number; data: BlackwordSwitchData }) => {
      const token = await getToken()
      return switchBlackword(variables.blackwordsId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使敏感词列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['blackwords'] })
      // 同时使单个敏感词详情缓存失效，确保详情页显示最新状态
      queryClient.invalidateQueries({ queryKey: ['blackword', variables.blackwordsId] })
    },
  })
}


/**
 * 批量切换敏感词启用状态的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量切换多个敏感词启用状态的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用批量切换多个敏感词的启用/禁用状态，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送批量切换敏感词状态的请求
 * - 自动处理缓存失效，确保UI显示最新的敏感词状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量切换操作的函数，需要传入 BlackwordBatchSwitchData 格式的数据
 *          - isLoading: 批量切换操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量切换成功后的敏感词数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchSwitchBlackwordsMutation()
 *
 * const handleBatchToggle = async (blackwordsIds, enabled) => {
 *   try {
 *     const params = {
 *       blackwords_ids: blackwordsIds,  // 敏感词ID数组，例如 [1, 2, 3]
 *       blackwords_enabled: enabled          // 目标启用状态，true为启用，false为禁用
 *     }
 *     const result = await mutateAsync(params)
 *     console.log('批量切换敏感词状态成功:', result)
 *   } catch (err) {
 *     console.error('批量切换敏感词状态失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /blackwords/switch/ 端点发送PUT请求来批量切换敏感词状态
 * - 批量操作成功后会自动使 ['blackwords'] 列表查询缓存失效
 * - 同时会使所有被操作的敏感词详情缓存失效，确保详情页显示最新状态
 * - 适用于需要批量切换多个敏感词启用/禁用状态的场景
 * - 传入的参数必须符合 BlackwordBatchSwitchData 接口的结构要求
 * - 代码会检查 variables.blackwords_ids 是否存在且为数组，确保安全遍历
 */
export const useBatchSwitchBlackwordsMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: BlackwordBatchSwitchData) => {
      const token = await getToken()
      return batchSwitchBlackwords(variables, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使敏感词列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['blackwords'] })
      // 同时使单个敏感词详情缓存失效，确保详情页显示最新状态
      if (variables.blackwords_ids && Array.isArray(variables.blackwords_ids)) {
        variables.blackwords_ids.forEach(blackwords_id => {
          queryClient.invalidateQueries({ queryKey: ['blackword', blackwords_id] })
        })
      }
    },
  })
}


/**
 * 同步敏感词数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了同步敏感词数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 主要功能是触发后端的敏感词数据同步过程，通常用于从外部源同步最新的敏感词数据
 *
 * 使用场景：
 * - 需要从外部源同步最新敏感词数据时
 * - 定期更新敏感词数据以保持数据一致性
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
 * const { mutateAsync, isLoading, error } = useSyncBlackwordsMutation()
 *
 * const handleSync = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('敏感词数据同步完成')
 *   } catch (err) {
 *     console.error('敏感词数据同步失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 同步操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，可能需要手动刷新敏感词列表以显示最新数据
 * - 此操作会调用 syncBlackwords API 函数，向后端发起同步请求
 */
export const useSyncBlackwordsMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async() => {
      const token = await getToken()
      return syncBlackwords(token)
    }
  })
}


/**
 * 导出所有敏感词数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了导出所有敏感词数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持将敏感词数据导出为文件并自动下载到本地，通常用于备份或离线分析
 *
 * 主要功能：
 * - 触发后端敏感词数据导出操作
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
 * const { mutateAsync, isLoading, error } = useExportBlackwordsMutation()
 *
 * const handleExport = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('敏感词数据导出完成')
 *   } catch (err) {
 *     console.error('敏感词数据导出失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 会自动处理文件下载逻辑，包括从响应头获取文件名
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 * - 如果后端没有提供文件名，默认使用 'download.json'
 * - 会自动创建下载链接并触发下载，完成后清理URL对象
 * - 可能需要处理大文件下载，注意浏览器内存限制
 */
export const useExportBlackwordsMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      const response = await exportBlackwords(token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'blackwords_export.json' // 使用更具描述性的默认文件名
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
 * 批量导出指定敏感词数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量导出指定敏感词数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许用户选择特定的敏感词进行导出，适用于只需要导出部分敏感词数据的场景
 *
 * 主要功能：
 * - 触发后端指定敏感词数据的导出操作
 * - 自动处理导出文件的下载
 * - 从响应头中提取文件名（如果后端提供）
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量导出操作的函数，需要传入 BlackwordBatchExportData 格式的参数
 *          - isLoading: 导出操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 导出成功后的文件数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchExportBlackwordsMutation()
 *
 * const handleBatchExport = async () => {
 *   const exportData = {
 *     blackwords_ids: [1, 2, 3]  // 需要导出的敏感词ID列表
 *   }
 *   try {
 *     await mutateAsync(exportData)
 *     console.log('批量导出敏感词数据完成')
 *   } catch (err) {
 *     console.error('批量导出敏感词数据失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 需要传入 BlackwordBatchExportData 格式的参数，包含要导出的敏感词ID列表
 * - 此 Hook 会自动处理文件下载逻辑，包括从响应头获取文件名
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 * - 如果后端没有提供文件名，默认使用 'download.json'
 * - 会自动创建下载链接并触发下载，完成后清理URL对象
 * - 可能需要处理大文件下载，注意浏览器内存限制
 * - 确保传入的 blackwords_ids 数组中的ID都是有效的敏感词ID
 */
export const useBatchExportBlackwordsMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: BlackwordBatchExportData) => {
      const token = await getToken()
      const response = await batchExportBlackwords(variables, token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'blackwords_export.json' // 使用更具描述性的默认文件名
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
 * 删除敏感词的自定义 Mutation Hook
 *
 * 此 Hook 封装了删除敏感词的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持删除指定ID的敏感词，并自动处理相关的缓存更新，确保UI界面及时反映数据变化
 *
 * 主要功能：
 * - 向后端API发送删除指定敏感词的请求
 * - 自动处理缓存失效，确保UI显示最新的敏感词列表
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发删除操作的函数，需要传入 { blackwordsId: number }
 *          - isLoading: 删除操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 删除操作的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useDeleteBlackwordMutation()
 *
 * const handleDelete = async (blackwordsId) => {
 *   try {
 *     await mutateAsync({ blackwordsId })
 *     console.log('敏感词删除成功')
 *   } catch (err) {
 *     console.error('敏感词删除失败:', err)
 *   }
 * }
 *
 * // 在组件中结合确认对话框使用
 * const handleDeleteWithConfirm = async (blackwordsId) => {
 *   if (window.confirm('确定要删除这个敏感词吗？此操作不可撤销。')) {
 *     try {
 *       await mutateAsync({ blackwordsId })
 *       // 可以添加删除成功的提示信息
 *       toast.success('敏感词删除成功')
 *     } catch (err) {
 *       toast.error('敏感词删除失败: ' + err.message)
 *     }
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /blackwords/{blackwordsId}/ 端点发送DELETE请求来删除敏感词
 * - 删除成功后会自动使 ['blackwords'] 列表查询缓存失效，确保列表显示最新数据
 * - 同时会使 ['blackword', blackwordsId] 单个敏感词详情查询缓存失效，避免访问已删除的敏感词详情
 * - 适用于需要删除单个敏感词并自动更新UI的场景
 * - blackwordsId 必须是有效的数字ID，且对应敏感词存在于数据库中
 * - 删除操作是不可逆的，建议在UI中添加确认机制以防止误删
 * - 在实际使用中，通常需要与确认对话框等UI组件配合，以避免意外删除操作
 */
export const useDeleteBlackwordMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { blackwordsId: number; }) => {
      const token = await getToken()
      return deleteBlackword(variables.blackwordsId, token)
    },
    onSuccess: (_, variables) => {
      // 删除成功后使敏感词列表缓存失效，确保列表显示最新状态（已移除被删除的敏感词）
      queryClient.invalidateQueries({ queryKey: ['blackwords'] })
      // 同时使单个敏感词详情缓存失效，确保详情页不会显示已删除的敏感词信息
      queryClient.invalidateQueries({ queryKey: ['blackword', variables.blackwordsId] })
    },
  })
}


export const useBatchDeleteBlackwordsMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: number[]) => {
      const token = await getToken()
      return batchDeleteBlackwords(variables, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使敏感词列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['blackwords'] })
      // 同时使单个敏感词详情缓存失效，确保详情页显示最新状态
      if (variables && Array.isArray(variables)) {
        variables.forEach(blackwordsId => {
          queryClient.invalidateQueries({ queryKey: ['blackword', blackwordsId] })
        })
      }
    },
  })
}