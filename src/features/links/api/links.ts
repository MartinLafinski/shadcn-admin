// 引入reactQuery依赖
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// Clerk 认证
import { useAuth } from '@clerk/clerk-react'
// 分页相关
import { extracted_pagination } from '@/config/pagination'
import {
  LinkBatchSwitchData,
  LinkBatchExportData,
  LinkConfigData,
  LinkCreateData,
  LinkData,
  LinksData,
  LinkSwitchData,
  LinkUpdateData
} from '../data/schemas.ts'


// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const DEFAULT_PAGE_SIZE: number = Number(import.meta.env.VITE_LINKS_PAGE_SIZE || 50)

// 通用错误处理
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

/**
 * 获取友链列表
 *
 * 此函数用于从后端API获取友链列表，支持关键词搜索、启用状态过滤和分页功能
 *
 * @param links_keyword - 可选参数，用于按关键词搜索友链（例如友链名称或集合名称）
 * @param links_enabled - 可选参数，用于过滤友链的启用状态
 *                    true: 只返回启用的友链
 *                    false: 只返回禁用的友链
 *                    undefined: 返回所有友链（不考虑启用状态）
 * @param page - 页码，从1开始，默认为1
 * @param size - 每页返回的数据量，默认为 DEFAULT_PAGE_SIZE 条
 *
 * @param token - 鉴权token
 * @returns Promise<LinksData> - 返回友链数据数组的Promise
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 获取所有友链，第一页，每页 DEFAULT_PAGE_SIZE 条
 * const allLinks = await fetchLinks()
 *
 * // 搜索包含"test"关键词的启用友链
 * const searchResults = await fetchLinks("test", true, 1, 20)
 *
 * // 获取所有禁用的友链
 * const disabledLinks = await fetchLinks(undefined, false)
 */
export const fetchLinks = async (
  links_keyword: string | undefined = undefined,
  links_enabled: boolean | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE,
  token: string | null
): Promise<LinksData> => {

  // 构建基础URL，包含分页参数
  let url = `${API_BASE_URL}/links/?page=${page}&size=${size}`

  // 如果提供了关键词参数，则添加到查询字符串中
  if (links_keyword) {
    url += `&links_keyword=${links_keyword}`
  }

  // 如果提供了启用状态参数（注意：undefined !== 某个布尔值），则添加到查询字符串中
  if (links_enabled !== undefined) {
    url += `&links_enabled=${links_enabled}`
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
  const links: LinkData[] = await response.json()

  return {
    links,
    pagination
  }
}


/**
 * 根据ID获取友链详细信息
 *
 * 此函数用于从后端API根据友链ID获取指定友链的详细信息
 *
 * @param linkId - 需要获取的友链的唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的友链记录
 *
 * @param token - 鉴权token
 * @returns Promise<LinkData> - 返回友链数据对象的Promise
 *                                包含友链的所有信息，如ID、名称、集合、启用状态等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：友链ID不存在、网络错误、后端服务异常等
 *
 * 使用示例:
 * // 获取ID为1的友链信息
 * try {
 *   const linkData = await fetchLinkById(1)
 *   console.log("友链信息:", linkData)
 * } catch (error) {
 *   console.error("获取友链信息失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /links/{linkId}/ 端点发送GET请求
 * - 如果linkId对应的友链不存在，后端会返回404错误
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 返回的数据类型为LinkData，具体结构请参考相关接口定义
 */
export const fetchLinkById = async (
  linkId: number,
  token: string | null
): Promise<LinkData> => {
  const response = await fetch(`${API_BASE_URL}/links/${linkId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
  return response.json()
}

// 创建友链
/**
 * 创建新友链
 *
 * 此函数用于向后端API发送请求创建一个新的友链记录
 *
 * @param data - 友链创建所需的数据对象，必须符合LinkCreateData接口定义
 *              通常包含友链名称、集合、配置信息等必要字段
 *
 * @param token - 鉴权token
 * @returns Promise<LinkData> - 返回创建成功的友链数据对象的Promise
 *                                包含新创建友链的所有信息，如ID、名称、集合等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 创建一个新友链
 * const newLinkData = {
 *   links_name: "我的友链",
 *   links_slug: "mylinks",
 *   links_collection: ["https://example.com"],
 *   links_readme: "友链说明"
 * }
 * try {
 *   const createdLink = await createLink(newLinkData)
 *   console.log("友链创建成功:", createdLink)
 * } catch (error) {
 *   console.error("友链创建失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /links/ 端点发送POST请求
 * - 传入的data参数必须符合LinkCreateData接口的结构要求
 * - 请求头设置为application/json格式
 * - 如果后端验证失败，会通过handleResponse函数抛出错误
 */
export const createLink = async (
  data: LinkCreateData,
  token: string | null
): Promise<LinkData> => {
  const response = await fetch(`${API_BASE_URL}/links/`, {
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
 * 更新友链信息
 *
 * 此函数用于完全更新指定友链的所有信息，使用 PUT 方法替换整个友链资源
 * 注意：PUT 请求会完全替换目标资源，所以 data 对象应包含友链的所有必要字段
 *
 * @param linkId - 需要更新的友链的唯一标识符（ID）
 *                   必须是已存在的友链ID，否则会返回404错误或创建新资源（取决于后端实现）
 * @param data - 完整的友链更新数据对象，必须符合 LinkUpdateData 接口定义
 *              应包含友链的所有信息，因为PUT请求会完全替换现有资源
 *              通常包括：友链名称、集合、配置信息、启用状态等所有友链相关字段
 *
 * @param token - 鉴权token
 * @returns Promise<LinkData> - 返回更新后的完整友链数据对象的Promise
 *                                包含友链的所有信息，包括更新后的字段和可能的服务器生成字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：友链ID不存在、数据验证失败、网络错误等
 *
 * 使用示例:
 * // 更新友链的全部信息
 * const linkUpdateData = {
 *   links_name: "更新后的友链名称",
 *   links_slug: "updatedlinks",
 *   links_collection: ["https://newsite.com"],
 *   links_readme: "更新后的友链说明",
 *   links_enabled: true
 * }
 * try {
 *   const updatedLink = await updateLink(1, linkUpdateData)
 *   console.log("友链更新成功:", updatedLink)
 * } catch (error) {
 *   console.error("友链更新失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /links/{linkId} 端点发送PUT请求
 * - PUT方法会完全替换目标资源，如果只想更新部分字段，请使用 patchLink 函数
 * - 传入的data参数必须是完整的LinkUpdateData对象，缺少的字段可能会被置空或重置为默认值
 * - 请求头设置为application/json格式
 * - 如果后端验证失败（如字段格式不正确），会通过handleResponse函数抛出错误
 * - 确保linkId是有效的数字ID，且对应友链存在于数据库中
 */
export const updateLink = async (
  linkId: number,
  data: LinkUpdateData,
  token: string | null
): Promise<LinkData> => {
  const response = await fetch(`${API_BASE_URL}/links/${linkId}/`, {
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
 * 部分更新友链配置
 *
 * 此函数用于部分更新指定友链的配置信息，只更新提供的字段，不会影响其他字段
 * 使用 PATCH 方法，允许单独更新友链配置或说明文档
 *
 * @param linkId - 需要更新的友链的唯一标识符（ID）
 * @param data - 包含需要更新的友链字段的对象，符合 LinkConfigData 接口定义
 *              可包含以下可选字段：
 *              - links_collection: string[] - 友链集合，包含友链URL数组
 *              - links_readme: string - 友链说明文档内容
 *
 * @param token - 鉴权token
 * @returns Promise<LinkData> - 返回更新后的完整友链数据对象的Promise
 *                                包含友链的所有信息，包括更新后的字段和未更改的原有字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 只更新友链集合
 * const updatedLink = await patchLink(1, {
 *   links_collection: ["https://site1.com", "https://site2.com"]
 * })
 *
 * // 只更新友链说明文档
 * const updatedLink = await patchLink(1, {
 *   links_readme: "这是更新后的友链说明"
 * })
 *
 * // 同时更新集合和说明文档
 * const updatedLink = await patchLink(1, {
 *   links_collection: ["https://newsite.com"],
 *   links_readme: "新的说明文档"
 * })
 *
 * 注意事项:
 * - 该函数会向 /links/{linkId} 端点发送PATCH请求
 * - 与PUT请求不同，PATCH只更新提供的字段，其他字段保持不变
 * - 传入的data参数必须符合LinkConfigData接口的结构要求
 * - 请求头设置为application/json格式
 * - 如果后端验证失败，会通过handleResponse函数抛出错误
 */
export const patchLink = async (
  linkId: number,
  data: LinkConfigData,
  token: string | null
): Promise<LinkData> => {
  const response = await fetch(`${API_BASE_URL}/links/${linkId}/`, {
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
 * 切换友链启用状态
 *
 * 此函数用于切换指定友链的启用状态，通过向后端API发送POST请求来更改友链的启用/禁用状态
 *
 * @param linkId - 需要切换启用状态的友链的唯一标识符（ID）
 * @param data - 包含切换状态的数据对象，通常包含启用状态信息
 *              例如: { links_enabled: true/false }
 *
 * @param token - 鉴权token
 * @returns Promise<LinkData> - 返回更新后的友链数据对象的Promise
 *                                包含友链的所有信息，包括更新后的启用状态
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 启用ID为1的友链
 * const updatedLink = await switchLink(1, { links_enabled: true })
 *
 * // 禁用ID为5的友链
 * const updatedLink = await switchLink(5, { links_enabled: false })
 *
 * 注意事项:
 * - 该函数会向 /links/{linkId}/switch/ 端点发送POST请求
 * - 确保传入的linkId是有效的友链ID
 * - data参数需要符合LinkSwitchData接口定义的结构
 */
export const switchLink = async (
  linkId: number,
  data: LinkSwitchData,
  token: string | null
): Promise<LinkData> => {
  const response = await fetch(`${API_BASE_URL}/links/${linkId}/switch/`, {
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
 * 删除指定友链
 *
 * 此函数用于向后端API发送DELETE请求，删除指定ID的友链记录
 * 该操作会永久删除友链数据，请在调用前确认用户意图，建议配合确认对话框使用
 *
 * @param linkId - 需要删除的友链的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的友链记录
 *                   删除操作不可逆，请谨慎操作
 *
 * @param token - 鉴权token
 * 
 * @returns Promise<Response> - 返回原始响应对象
 *                如果删除成功，响应状态码通常为204 (No Content)
 *                如果删除失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：友链ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 删除ID为5的友链
 * try {
 *   const response = await deleteLink(5)
 *   console.log("友链删除成功")
 * } catch (error) {
 *   console.error("友链删除失败:", error)
 * }
 *
 * // 在实际应用中，通常与确认对话框结合使用
 * const handleDelete = async (linkId) => {
 *   if (confirm("确定要删除这个友链吗？此操作不可撤销。")) {
 *     try {
 *       await deleteLink(linkId)
 *       // 刷新友链列表
 *       refetch()
 *     } catch (error) {
 *       alert("删除失败: " + error.message)
 *     }
 *   }
 * }
 *
 * 注意事项:
 * - 该函数会向 /links/{linkId}/ 端点发送DELETE请求
 * - 删除操作是永久性的，无法恢复，请确保用户明确意图后再执行
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功删除后，后端通常返回204状态码，表示资源已成功删除且无响应体
 * - 在UI中建议添加二次确认机制，防止误删操作
 * - 删除后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const deleteLink = async (
  linkId: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/links/${linkId}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}


/**
 * 批量切换友链启用状态
 *
 * 此函数用于批量切换多个友链的启用状态，通过向后端API发送PUT请求来更改多个友链的启用/禁用状态
 *
 * @param data - 包含批量切换状态的数据对象，符合 LinkBatchSwitchData 接口定义
 *              通常包含以下字段：
 *              - links_ids: number[] - 需要切换状态的友链ID数组
 *              - links_enabled: boolean - 目标启用状态，true为启用，false为禁用
 *
 * @param token - 鉴权token
 * @returns Promise<LinkData> - 返回操作结果的Promise
 *                                注意：根据API设计，可能返回最后一个处理的友链数据或操作结果摘要
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量启用ID为[1, 2, 3]的友链
 * const result = await batchSwitchLinks({
 *   links_ids: [1, 2, 3],
 *   links_enabled: true
 * })
 *
 * // 批量禁用ID为[4, 5, 6]的友链
 * const result = await batchSwitchLinks({
 *   links_ids: [4, 5, 6],
 *   links_enabled: false
 * })
 *
 * 注意事项:
 * - 该函数会向 /links/switch/ 端点发送PUT请求
 * - 确保传入的links_ids数组中的ID都是有效的友链ID
 * - data参数需要符合LinkBatchSwitchData接口定义的结构
 * - 此操作是批量操作，会影响多个友链的状态，请谨慎使用
 */
export const batchSwitchLinks = async (
  data: LinkBatchSwitchData,
  token: string | null
): Promise<LinkData> => {
  const response = await fetch(`${API_BASE_URL}/links/switch/`, {
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


export const batchDeleteLinks = async (
  linkIds: number[],
  token: string | null
): Promise<Response> => {
  const params = linkIds.map(id => `links_ids=${id}`).join('&')
  const response = await fetch(`${API_BASE_URL}/links/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}


/**
 * 同步友链数据
 *
 * 此函数用于触发后端友链数据同步操作，通常用于从外部源（如数据库、API或其他服务）同步最新的友链数据
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
 * // 触发友链数据同步
 * try {
 *   await syncLinks()
 *   console.log("友链数据同步完成")
 * } catch (error) {
 *   console.error("友链数据同步失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /links/sync/ 端点发送POST请求
 * - 同步操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，可能需要手动刷新友链列表以显示最新数据
 * - 根据后端实现，同步可能包括添加新友链、更新现有友链或删除不存在的友链
 */
export const syncLinks = async (token: string | null): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/links/sync/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
}

/**
 * 导出所有友链数据
 *
 * 此函数用于从后端API导出所有友链数据，通常返回一个包含友链数据的文件
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
 * // 导出所有友链数据
 * try {
 *   const response = await exportLinks()
 *   // 将响应转换为blob并创建下载链接
 *   const blob = await response.blob()
 *   const url = window.URL.createObjectURL(blob)
 *   const a = document.createElement('a')
 *   a.href = url
 *   a.download = 'links_export.json'
 *   a.click()
 *   window.URL.revokeObjectURL(url)
 * } catch (error) {
 *   console.error("友链数据导出失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /links/export/ 端点发送POST请求
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 可能需要处理大文件下载，注意浏览器内存限制
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 */
export const exportLinks = async (token: string | null): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/links/export/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 批量导出指定友链数据
 *
 * 此函数用于从后端API导出指定友链的数据，允许用户选择特定的友链进行导出
 * 适用于只需要导出部分友链数据的场景
 *
 * @param data - 包含批量导出所需数据的对象，必须符合 LinkBatchExportData 接口定义
 *              通常包含需要导出的友链ID列表等信息
 *
 * @param token
 * @returns Promise<Response> - 返回包含导出数据的Response对象
 *                            可以进一步处理Response对象以获取实际的文件内容
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量导出指定ID的友链数据
 * const exportData = {
 *   links_ids: [1, 2, 3]  // 需要导出的友链ID列表
 * }
 * try {
 *   const response = await batchExportLinks(exportData)
 *   const blob = await response.blob()
 *   // 处理下载逻辑...
 * } catch (error) {
 *   console.error("批量导出友链数据失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /links/export/ 端点发送PUT请求
 * - 需要提供LinkBatchExportData格式的数据作为请求体
 * - 请求头设置为application/json格式
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 导出的文件可能只包含指定ID的友链数据，而不是所有友链
 */
export const batchExportLinks = async (
  data: LinkBatchExportData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/links/export/`, {
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
 * 获取友链列表的自定义 Hook
 *
 * 此 Hook 封装了获取友链列表的查询逻辑，提供了关键词搜索、启用状态过滤和分页功能
 * 使用 TanStack Query 的 useQuery 来处理数据获取、缓存和状态管理
 *
 * @param links_keyword - 可选参数，用于按关键词搜索友链（例如友链名称或集合名称）
 *                        当值为 undefined 时，不进行关键词过滤
 * @param links_enabled - 可选参数，用于过滤友链的启用状态
 *                        true: 只返回启用的友链
 *                        false: 只返回禁用的友链
 *                        undefined: 返回所有友链（不考虑启用状态）
 * @param page - 页码，从1开始，默认为1，用于分页查询
 * @param size - 每页返回的数据量，默认为 DEFAULT_PAGE_SIZE 条，最大值取决于后端配置
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的友链数据数组 (LinkData[])
 *          - isLoading: 数据加载状态
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 获取所有友链
 * const { data, isLoading } = useLinksQuery()
 *
 * // 搜索包含"test"关键词的启用友链
 * const { data, isLoading } = useLinksQuery("test", true, 1, 20)
 *
 * // 获取所有禁用的友链
 * const { data, isLoading } = useLinksQuery(undefined, false)
 *
 * 注意事项:
 * - 查询结果会被缓存，相同参数的查询会返回缓存数据
 * - 查询键(queryKey)包含了所有参数，确保不同参数的查询有独立的缓存
 * - 当参数变化时，会自动触发重新查询
 */
export const useLinksQuery = (
  links_keyword: string | undefined = undefined,
  links_enabled: boolean | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE
) => {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['links', links_keyword, links_enabled, page, size],
    queryFn: async () => {
      const token = await getToken()
      return fetchLinks(links_keyword, links_enabled, page, size, token)
    },
    placeholderData: (previousData) => previousData,
  })
}

/**
 * 根据友链ID获取单个友链详细信息的自定义 Hook
 *
 * 此 Hook 封装了获取单个友链详细信息的查询逻辑，使用 TanStack Query 的 useQuery
 * 来处理数据获取、缓存和状态管理。该 Hook 会根据传入的 linkId 参数向后端
 * API 发起请求，获取指定友链的完整信息。
 *
 * @param linkId - 需要获取信息的友链唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的友链记录
 *                    如果传入 0 或无效ID，由于 enabled 条件设置，将不会发起请求
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的友链数据 (LinkData 类型)
 *          - isLoading: 数据加载状态，true 表示正在请求中
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - isFetching: 是否正在获取数据（包括重新验证）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 在组件中使用，获取ID为5的友链信息
 * const { data: link, isLoading, error } = useLinkQuery(5)
 *
 * if (isLoading) return <div>加载中...</div>
 * if (error) return <div>错误: {error.message}</div>
 * if (link) return <div>友链名称: {link.links_name}</div>
 *
 * // 手动刷新数据
 * const { refetch } = useLinkQuery(5)
 * const handleRefresh = () => refetch()
 *
 * 注意事项:
 * - 当 linkId 为 0 或无效值时，由于 enabled: !!linkId 设置，不会发起API请求
 * - 查询结果会被缓存，相同 linkId 的查询会返回缓存数据
 * - 查询键(queryKey) 包含 linkId，确保不同友链ID的查询有独立的缓存
 * - 自动集成 Clerk 认证，会在请求头中添加 Bearer Token
 * - 此 Hook 适用于需要显示单个友链详细信息的场景，如友链详情页
 */
export const useLinkQuery = (linkId: number) => {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['link', linkId],  // 查询键包含友链ID，确保不同ID有独立缓存
    queryFn: async () => {
      const token = await getToken()  // 获取认证token
      return fetchLinkById(linkId, token)  // 调用API获取友链详情
    },
    enabled: !!linkId,  // 只有当 linkId 存在且不为0时才启用查询
  })
}


/**
 * 创建友链的自定义 Mutation Hook
 *
 * 此 Hook 封装了创建友链的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 包含自动的数据缓存更新功能，当创建成功后会自动使友链列表缓存失效，触发重新查询
 *
 * 使用场景：
 * - 在表单中提交新友链创建请求
 * - 需要自动更新友链列表显示最新数据
 * - 提供加载状态、错误处理等状态管理功能
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发创建操作的函数
 *          - isLoading: 创建操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 创建成功的友链数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useCreateLinkMutation()
 *
 * const handleSubmit = async (newLinkData) => {
 *   try {
 *     const createdLink = await mutateAsync(newLinkData)
 *     console.log('友链创建成功:', createdLink)
 *   } catch (err) {
 *     console.error('友链创建失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 创建成功后会自动使 ['links'] 查询缓存失效，确保列表数据及时更新
 * - mutationFn 直接使用预定义的 createLink 函数，确保错误处理一致性
 * - 适用于需要创建单个友链并自动更新UI的场景
 */
export const useCreateLinkMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: LinkCreateData) => {
      const token = await getToken()
      return createLink(variables, token)
    },
    onSuccess: () => {
      // 创建成功后使友链列表缓存失效，触发重新获取数据
      // 这样可以确保UI显示最新的友链列表，包含新创建的友链
      queryClient.invalidateQueries({ queryKey: ['links'] })
    },
  })
}


/**
 * 更新友链信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了更新友链的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持完整的友链信息更新（PUT 请求），包括友链名称、集合、配置等所有字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 *
 * 主要功能：
 * - 提交友链的完整更新数据（使用 PUT 方法替换整个资源）
 * - 自动处理缓存失效，确保UI显示最新的友链信息
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发更新操作的函数，需要传入 { linkId: number, data: LinkUpdateData }
 *          - isLoading: 更新操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 更新成功的友链数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useUpdateLinkMutation()
 *
 * const handleUpdate = async (linkId, linkData) => {
 *   try {
 *     const params = {
 *       linkId: linkId,
 *       data: linkData  // 符合 LinkUpdateData 接口的完整友链数据
 *     }
 *     const updatedLink = await mutateAsync(params)
 *     console.log('友链更新成功:', updatedLink)
 *   } catch (err) {
 *     console.error('友链更新失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 使用 PUT 方法，会完全替换目标友链资源，请确保 data 参数包含友链的所有必要字段
 * - 更新成功后会自动使 ['links'] 和 ['link', linkId] 查询缓存失效
 * - 适用于需要更新友链全部信息的场景，如果只需要更新部分字段，请使用 usePatchLinkMutation
 * - linkId 必须是有效的数字ID，且对应友链存在于数据库中
 * - data 参数必须符合 LinkUpdateData 接口的结构要求
 */
export const useUpdateLinkMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { linkId: number; data: LinkUpdateData }) => {
      const token = await getToken()
      return updateLink(variables.linkId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使友链列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['links'] })
      // 同时使单个友链详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({ queryKey: ['link', variables.linkId] })
    },
  })
}


/**
 * 部分更新友链信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了部分更新友链的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持部分更新友链信息（PATCH 请求），仅更新提供的字段，不会影响其他字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 *
 * 主要功能：
 * - 提交友链的部分更新数据（使用 PATCH 方法仅更新指定字段）
 * - 自动处理缓存失效，确保UI显示最新的友链信息
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发更新操作的函数，需要传入 { linkId: number, data: LinkConfigData }
 *          - isLoading: 更新操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 更新成功的友链数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = usePatchLinkMutation()
 *
 * const handlePatch = async (linkId, patchData) => {
 *   try {
 *     const params = {
 *       linkId: linkId,
 *       data: {  // 符合 LinkConfigData 接口的部分友链数据
 *         links_collection: ["https://site1.com", "https://site2.com"],  // 只更新集合
 *         // 或者
 *         links_readme: "更新的说明文档"  // 只更新说明文档
 *       }
 *     }
 *     const updatedLink = await mutateAsync(params)
 *     console.log('友链部分更新成功:', updatedLink)
 *   } catch (err) {
 *     console.error('友链部分更新失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 使用 PATCH 方法，只更新提供的字段，其他字段保持不变
 * - 适用于只需要更新友链部分信息的场景，如仅更新集合或说明文档
 * - 更新成功后会自动使 ['links'] 和 ['link', linkId] 查询缓存失效
 * - linkId 必须是有效的数字ID，且对应友链存在于数据库中
 * - data 参数必须符合 LinkConfigData 接口的结构要求，可以只包含需要更新的字段
 * - 与 useUpdateLinkMutation 不同，此 Hook 允许只更新部分字段，不会重置其他字段
 */
export const usePatchLinkMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { linkId: number; data: LinkConfigData }) => {
      const token = await getToken()
      return patchLink(variables.linkId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使友链列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['links'] })
      // 同时使单个友链详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({ queryKey: ['link', variables.linkId] })
    },
  })
}


/**
 * 切换友链启用状态的自定义 Mutation Hook
 *
 * 此 Hook 封装了切换友链启用状态的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用切换友链的启用/禁用状态，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送切换友链状态的请求
 * - 自动处理缓存失效，确保UI显示最新的友链状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发切换操作的函数，需要传入 { linkId: number, data: LinkSwitchData }
 *          - isLoading: 切换操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 切换成功后的友链数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useSwitchLinkMutation()
 *
 * const handleToggle = async (linkId, enabled) => {
 *   try {
 *     const params = {
 *       linkId: linkId,
 *       data: { links_enabled: enabled }  // LinkSwitchData 格式的数据
 *     }
 *     const updatedLink = await mutateAsync(params)
 *     console.log('友链状态切换成功:', updatedLink)
 *   } catch (err) {
 *     console.error('友链状态切换失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /links/{linkId}/switch/ 端点发送POST请求来切换友链状态
 * - 切换成功后会自动使 ['links'] 和 ['link', linkId] 查询缓存失效
 * - 适用于需要切换友链启用/禁用状态的场景
 * - linkId 必须是有效的数字ID，且对应友链存在于数据库中
 * - data 参数必须符合 LinkSwitchData 接口的结构要求
 * - 代码中的 console.log 语句用于调试目的，在生产环境中可能需要移除
 */
export const useSwitchLinkMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { linkId: number; data: LinkSwitchData }) => {
      const token = await getToken()
      return switchLink(variables.linkId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使友链列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['links'] })
      // 同时使单个友链详情缓存失效，确保详情页显示最新状态
      queryClient.invalidateQueries({ queryKey: ['link', variables.linkId] })
    },
  })
}


/**
 * 批量切换友链启用状态的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量切换多个友链启用状态的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用批量切换多个友链的启用/禁用状态，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送批量切换友链状态的请求
 * - 自动处理缓存失效，确保UI显示最新的友链状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量切换操作的函数，需要传入 LinkBatchSwitchData 格式的数据
 *          - isLoading: 批量切换操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量切换成功后的友链数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchSwitchLinksMutation()
 *
 * const handleBatchToggle = async (linkIds, enabled) => {
 *   try {
 *     const params = {
 *       links_ids: linkIds,  // 友链ID数组，例如 [1, 2, 3]
 *       links_enabled: enabled          // 目标启用状态，true为启用，false为禁用
 *     }
 *     const result = await mutateAsync(params)
 *     console.log('批量切换友链状态成功:', result)
 *   } catch (err) {
 *     console.error('批量切换友链状态失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /links/switch/ 端点发送PUT请求来批量切换友链状态
 * - 批量操作成功后会自动使 ['links'] 列表查询缓存失效
 * - 同时会使所有被操作的友链详情缓存失效，确保详情页显示最新状态
 * - 适用于需要批量切换多个友链启用/禁用状态的场景
 * - 传入的参数必须符合 LinkBatchSwitchData 接口的结构要求
 * - 代码会检查 variables.links_ids 是否存在且为数组，确保安全遍历
 */
export const useBatchSwitchLinksMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: LinkBatchSwitchData) => {
      const token = await getToken()
      return batchSwitchLinks(variables, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使友链列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['links'] })
      // 同时使单个友链详情缓存失效，确保详情页显示最新状态
      if (variables.links_ids && Array.isArray(variables.links_ids)) {
        variables.links_ids.forEach(link_id => {
          queryClient.invalidateQueries({ queryKey: ['link', link_id] })
        })
      }
    },
  })
}


/**
 * 同步友链数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了同步友链数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 主要功能是触发后端的友链数据同步过程，通常用于从外部源同步最新的友链数据
 *
 * 使用场景：
 * - 需要从外部源同步最新友链数据时
 * - 定期更新友链数据以保持数据一致性
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
 * const { mutateAsync, isLoading, error } = useSyncLinksMutation()
 *
 * const handleSync = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('友链数据同步完成')
 *   } catch (err) {
 *     console.error('友链数据同步失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 同步操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，可能需要手动刷新友链列表以显示最新数据
 * - 此操作会调用 syncLinks API 函数，向后端发起同步请求
 */
export const useSyncLinksMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async() => {
      const token = await getToken()
      return syncLinks(token)
    }
  })
}


/**
 * 导出所有友链数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了导出所有友链数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持将友链数据导出为文件并自动下载到本地，通常用于备份或离线分析
 *
 * 主要功能：
 * - 触发后端友链数据导出操作
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
 * const { mutateAsync, isLoading, error } = useExportLinksMutation()
 *
 * const handleExport = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('友链数据导出完成')
 *   } catch (err) {
 *     console.error('友链数据导出失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 会自动处理文件下载逻辑，包括从响应头获取文件名
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 * - 如果后端没有提供文件名，默认使用 'download.json'
 */
export const useExportLinksMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async() => {
      const token = await getToken()
      return exportLinks(token)
    },
    onSuccess: (data) => {
      // 从响应头中提取文件名
      const contentDisposition = data.headers.get('content-disposition')
      let fileName = 'links_export.json'
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/i)
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1]
        }
      }

      // 将响应转换为blob并创建下载链接
      data.blob().then(blob => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        window.URL.revokeObjectURL(url)
      })
    }
  })
}

/**
 * 批量删除友链的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量删除多个友链的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用批量删除多个友链，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送批量删除友链的请求
 * - 自动处理缓存失效，确保UI显示最新的友链状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量删除操作的函数，需要传入 number[] 格式的友链ID数组
 *          - isLoading: 批量删除操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量删除成功后的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchDeleteLinksMutation()
 *
 * const handleBatchDelete = async (linkIds) => {
 *   try {
 *     const params = [1, 2, 3]  // 友链ID数组，例如 [1, 2, 3]
 *     await mutateAsync(params)
 *     console.log('批量删除友链成功')
 *   } catch (err) {
 *     console.error('批量删除友链失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /links/ 端点发送DELETE请求来批量删除友链
 * - 批量操作成功后会自动使 ['links'] 列表查询缓存失效
 * - 同时会使所有被删除的友链详情缓存失效，确保详情页显示最新状态
 * - 适用于需要批量删除多个友链的场景
 * - 传入的参数必须是友链ID的数组
 */
export const useBatchDeleteLinksMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: number[]) => {
      const token = await getToken()
      return batchDeleteLinks(variables, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使友链列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['links'] })
      // 同时使单个友链详情缓存失效，确保详情页显示最新状态
      if (variables && Array.isArray(variables)) {
        variables.forEach(linkId => {
          queryClient.invalidateQueries({ queryKey: ['link', linkId] })
        })
      }
    },
  })
}

/**
 * 批量导出指定友链数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量导出友链数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持将指定的友链数据导出为文件并自动下载到本地，通常用于备份或离线分析
 *
 * 主要功能：
 * - 触发后端友链数据批量导出操作
 * - 自动处理导出文件的下载
 * - 从响应头中提取文件名（如果后端提供）
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量导出操作的函数，需要传入 LinkBatchExportData 格式的参数
 *          - isLoading: 批量导出操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量导出成功后的文件数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchExportLinksMutation()
 *
 * const handleBatchExport = async () => {
 *   const exportData = {
 *     links_ids: [1, 2, 3]  // 需要导出的友链ID列表
 *   }
 *   try {
 *     await mutateAsync(exportData)
 *     console.log('批量导出友链数据完成')
 *   } catch (err) {
 *     console.error('批量导出友链数据失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 需要传入 LinkBatchExportData 格式的参数，包含要导出的友链ID列表
 * - 此 Hook 会自动处理文件下载逻辑，包括从响应头获取文件名
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 * - 如果后端没有提供文件名，默认使用 'download.json'
 * - 会自动创建下载链接并触发下载，完成后清理URL对象
 * - 可能需要处理大文件下载，注意浏览器内存限制
 * - 确保传入的 links_ids 数组中的ID都是有效的友链ID
 */
export const useBatchExportLinksMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: LinkBatchExportData) => {
      const token = await getToken()
      const response = await batchExportLinks(variables, token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'links_export.json' // 使用更具描述性的默认文件名
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
 * 删除指定友链的自定义 Mutation Hook
 *
 * 此 Hook 封装了删除友链的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持删除指定ID的友链，并自动处理相关的缓存更新，确保UI界面及时反映数据变化
 *
 * 主要功能：
 * - 向后端API发送删除指定友链的请求
 * - 自动处理缓存失效，确保UI显示最新的友链列表
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发删除操作的函数，需要传入 { linkId: number } 格式的参数
 *          - isLoading: 删除操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 删除成功后的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useDeleteLinkMutation()
 *
 * const handleDelete = async (linkId) => {
 *   try {
 *     await mutateAsync({ linkId: linkId })
 *     console.log('友链删除成功')
 *   } catch (err) {
 *     console.error('友链删除失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /links/{linkId}/ 端点发送DELETE请求来删除友链
 * - 删除操作成功后会自动使 ['links'] 列表查询缓存失效
 * - 同时会使对应友链详情缓存失效，确保详情页不会显示已删除的友链信息
 * - 适用于需要删除单个友链的场景
 * - 传入的参数必须包含有效的友链ID
 */
export const useDeleteLinkMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { linkId: number; }) => {
      const token = await getToken()
      return deleteLink(variables.linkId, token)
    },
    onSuccess: (_, variables) => {
      // 删除成功后使友链列表缓存失效，确保列表显示最新状态（已移除被删除的友链）
      queryClient.invalidateQueries({ queryKey: ['links'] })
      // 同时使单个友链详情缓存失效，确保详情页不会显示已删除的友链信息
      queryClient.invalidateQueries({ queryKey: ['link', variables.linkId] })
    },
  })
}