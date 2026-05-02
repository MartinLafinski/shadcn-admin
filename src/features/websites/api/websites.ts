// 引入reactQuery依赖
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// 分页相关
import { extracted_pagination } from '@/config/pagination'
// Clerk 认证
import { useAuth } from '@clerk/clerk-react'
import {
  WebsiteBatchSwitchData,
  WebsiteBatchExportData,
  WebsiteConfigData,
  WebsiteCreateData,
  WebsiteData,
  WebsitesData,
  WebsiteSwitchData,
  WebsiteUpdateData,
  WebsiteSyncData,
  SpiderConfigData,
  WebsiteBatchLockData,
  WebsiteBatchPauseData,
} from '../data/schemas.ts'

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const PAGE_SIZE: number = Number(import.meta.env.VITE_WEBSITE_PAGE_SIZE || 20)

// 通用错误处理
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

/**
 * 获取网站列表
 *
 * 此函数用于从后端API获取网站列表，支持关键词搜索、启用状态过滤和分页功能
 *
 * @param website_keyword - 可选参数，用于按关键词搜索网站（例如网站名称或域名）
 * @param website_enabled - 可选参数，用于过滤网站的启用状态
 *                    true: 只返回启用的网站
 *                    false: 只返回禁用的网站
 *                    undefined: 返回所有网站（不考虑启用状态）
 * @param page - 页码，从1开始，默认为1
 * @param size - 每页返回的数据量，默认为 PAGE_SIZE 条
 *
 * @param token - 鉴权token
 * @returns Promise<WebsitesData> - 返回网站数据数组的Promise
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 获取所有网站，第一页，每页 PAGE_SIZE 条
 * const allSites = await fetchWebsites()
 *
 * // 搜索包含"test"关键词的启用网站
 * const searchResults = await fetchWebsites("test", true, 1, 20)
 *
 * // 获取所有禁用的网站
 * const disabledSites = await fetchWebsites(undefined, false)
 */
export const fetchWebsites = async (
  website_keyword: string | undefined = undefined,
  website_enabled: boolean | undefined = undefined,
  website_locked: boolean | undefined = undefined,
  website_paused: boolean | undefined = undefined,
  website_limited: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE,
  token: string | null
): Promise<WebsitesData> => {
  // 构建基础URL，包含分页参数
  let url = `${API_BASE_URL}/websites/?page=${page}&size=${size}`

  // 如果提供了关键词参数，则添加到查询字符串中
  if (website_keyword) {
    url += `&website_keyword=${website_keyword}`
  }

  // 如果提供了启用状态参数（注意：undefined !== 某个布尔值），则添加到查询字符串中
  if (website_enabled !== undefined) {
    url += `&website_enabled=${website_enabled}`
  }

  // 如果提供了锁定状态参数（注意：undefined !== 某个布尔值），则添加到查询字符串中
  if (website_locked !== undefined) {
    url += `&website_locked=${website_locked}`
  }

  // 如果提供了暂停状态参数（注意：undefined !== 某个布尔值），则添加到查询字符串中
  if (website_paused !== undefined) {
    url += `&website_paused=${website_paused}`
  }

  // 如果提供了限制状态参数（注意：undefined !== 某个布尔值），则添加到查询字符串中
  if (website_limited !== undefined) {
    url += `&website_limited=${website_limited}`
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
  const websites: WebsiteData[] = await response.json()

  return {
    websites,
    pagination,
  }
}

/**
 * 根据ID获取网站详细信息
 *
 * 此函数用于从后端API根据网站ID获取指定网站的详细信息
 *
 * @param websiteId - 需要获取的网站的唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的网站记录
 *
 * @param token - 鉴权token
 * @returns Promise<WebsiteData> - 返回网站数据对象的Promise
 *                                包含网站的所有信息，如ID、名称、域名、配置、启用状态等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：网站ID不存在、网络错误、后端服务异常等
 *
 * 使用示例:
 * // 获取ID为1的网站信息
 * try {
 *   const websiteData = await fetchWebsiteById(1)
 *   console.log("网站信息:", websiteData)
 * } catch (error) {
 *   console.error("获取网站信息失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /websites/{websiteId}/ 端点发送GET请求
 * - 如果websiteId对应的网站不存在，后端会返回404错误
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 返回的数据类型为WebsiteData，具体结构请参考相关接口定义
 */
export const fetchWebsiteById = async (
  websiteId: number,
  token: string | null
): Promise<WebsiteData> => {
  const response = await fetch(`${API_BASE_URL}/websites/${websiteId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
  return response.json()
}

// 创建网站
/**
 * 创建新网站
 *
 * 此函数用于向后端API发送请求创建一个新的网站记录
 *
 * @param data - 网站创建所需的数据对象，必须符合WebsiteCreateData接口定义
 *              通常包含网站名称、域名、配置信息等必要字段
 *
 * @param token - 鉴权token
 * @returns Promise<WebsiteData> - 返回创建成功的网站数据对象的Promise
 *                                包含新创建网站的所有信息，如ID、名称、配置等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 创建一个新网站
 * const newWebsiteData = {
 *   name: "我的网站",
 *   domain: "mywebsite.com",
 *   config: { theme: "default" },
 *   readme: "网站说明"
 * }
 * try {
 *   const createdSite = await createWebsite(newWebsiteData)
 *   console.log("网站创建成功:", createdSite)
 * } catch (error) {
 *   console.error("网站创建失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /websites/ 端点发送POST请求
 * - 传入的data参数必须符合WebsiteCreateData接口的结构要求
 * - 请求头设置为application/json格式
 * - 如果后端验证失败，会通过handleResponse函数抛出错误
 */
export const createWebsite = async (
  data: WebsiteCreateData,
  token: string | null
): Promise<WebsiteData> => {
  const response = await fetch(`${API_BASE_URL}/websites/`, {
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
 * 更新网站信息
 *
 * 此函数用于完全更新指定网站的所有信息，使用 PUT 方法替换整个网站资源
 * 注意：PUT 请求会完全替换目标资源，所以 data 对象应包含网站的所有必要字段
 *
 * @param websiteId - 需要更新的网站的唯一标识符（ID）
 *                   必须是已存在的网站ID，否则会返回404错误或创建新资源（取决于后端实现）
 * @param data - 完整的网站更新数据对象，必须符合 WebsiteUpdateData 接口定义
 *              应包含网站的所有信息，因为PUT请求会完全替换现有资源
 *              通常包括：网站名称、域名、配置信息、启用状态等所有网站相关字段
 *
 * @param token - 鉴权token
 * @returns Promise<WebsiteData> - 返回更新后的完整网站数据对象的Promise
 *                                包含网站的所有信息，包括更新后的字段和可能的服务器生成字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：网站ID不存在、数据验证失败、网络错误等
 *
 * 使用示例:
 * // 更新网站的全部信息
 * const websiteUpdateData = {
 *   name: "更新后的网站名称",
 *   domain: "newdomain.com",
 *   config: { theme: "dark", language: "zh-CN" },
 *   readme: "更新后的网站说明",
 *   enabled: true
 * }
 * try {
 *   const updatedSite = await updateWebsite(1, websiteUpdateData)
 *   console.log("网站更新成功:", updatedSite)
 * } catch (error) {
 *   console.error("网站更新失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /websites/{websiteId} 端点发送PUT请求
 * - PUT方法会完全替换目标资源，如果只想更新部分字段，请使用 patchWebsite 函数
 * - 传入的data参数必须是完整的WebsiteUpdateData对象，缺少的字段可能会被置空或重置为默认值
 * - 请求头设置为application/json格式
 * - 如果后端验证失败（如字段格式不正确），会通过handleResponse函数抛出错误
 * - 确保websiteId是有效的数字ID，且对应网站存在于数据库中
 */
export const updateWebsite = async (
  websiteId: number,
  data: WebsiteUpdateData,
  token: string | null
): Promise<WebsiteData> => {
  const response = await fetch(`${API_BASE_URL}/websites/${websiteId}/`, {
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
 * 部分更新网站配置
 *
 * 此函数用于部分更新指定网站的配置信息，只更新提供的字段，不会影响其他字段
 * 使用 PATCH 方法，允许单独更新网站配置或说明文档
 *
 * @param websiteId - 需要更新的网站的唯一标识符（ID）
 * @param data - 包含需要更新的网站字段的对象，符合 WebsiteConfigData 接口定义
 *              可包含以下可选字段：
 *              - website_config: Record<string, any> - 网站配置对象，可以包含任意配置项
 *              - website_readme: string - 网站说明文档内容
 *
 * @param token - 鉴权token
 * @returns Promise<WebsiteData> - 返回更新后的完整网站数据对象的Promise
 *                                包含网站的所有信息，包括更新后的字段和未更改的原有字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 只更新网站配置
 * const updatedSite = await patchWebsite(1, {
 *   website_config: { theme: "dark", language: "zh-CN" }
 * })
 *
 * // 只更新网站说明文档
 * const updatedSite = await patchWebsite(1, {
 *   website_readme: "这是更新后的网站说明"
 * })
 *
 * // 同时更新配置和说明文档
 * const updatedSite = await patchWebsite(1, {
 *   website_config: { theme: "light" },
 *   website_readme: "新的说明文档"
 * })
 *
 * 注意事项:
 * - 该函数会向 /websites/{websiteId} 端点发送PATCH请求
 * - 与PUT请求不同，PATCH只更新提供的字段，其他字段保持不变
 * - 传入的data参数必须符合WebsiteConfigData接口的结构要求
 * - 请求头设置为application/json格式
 * - 如果后端验证失败，会通过handleResponse函数抛出错误
 */
export const patchWebsite = async (
  websiteId: number,
  data: WebsiteConfigData,
  token: string | null
): Promise<WebsiteData> => {
  const response = await fetch(`${API_BASE_URL}/websites/${websiteId}/`, {
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
 * 切换网站启用状态
 *
 * 此函数用于切换指定网站的启用状态，通过向后端API发送POST请求来更改网站的启用/禁用状态
 *
 * @param websiteId - 需要切换启用状态的网站的唯一标识符（ID）
 * @param data - 包含切换状态的数据对象，通常包含启用状态信息
 *              例如: { enabled: true/false }
 *
 * @param token - 鉴权token
 * @returns Promise<WebsiteData> - 返回更新后的网站数据对象的Promise
 *                                包含网站的所有信息，包括更新后的启用状态
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 启用ID为1的网站
 * const updatedSite = await switchWebsite(1, { enabled: true })
 *
 * // 禁用ID为5的网站
 * const updatedSite = await switchWebsite(5, { enabled: false })
 *
 * 注意事项:
 * - 该函数会向 /websites/{websiteId}/switch/ 端点发送POST请求
 * - 确保传入的websiteId是有效的网站ID
 * - data参数需要符合WebsiteSwitchData接口定义的结构
 */
export const switchWebsite = async (
  websiteId: number,
  data: WebsiteSwitchData,
  token: string | null
): Promise<WebsiteData> => {
  const response = await fetch(
    `${API_BASE_URL}/websites/${websiteId}/switch/`,
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
 * 删除指定网站
 *
 * 此函数用于向后端API发送DELETE请求，删除指定ID的网站记录
 * 该操作会永久删除网站数据，请在调用前确认用户意图，建议配合确认对话框使用
 *
 * @param websiteId - 需要删除的网站的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的网站记录
 *                   删除操作不可逆，请谨慎操作
 *
 * @param token - 鉴权token
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果删除成功，响应状态码通常为204 (No Content)
 *                如果删除失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：网站ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 删除ID为5的网站
 * try {
 *   const response = await deleteWebsite(5)
 *   console.log("网站删除成功")
 * } catch (error) {
 *   console.error("网站删除失败:", error)
 * }
 *
 * // 在实际应用中，通常与确认对话框结合使用
 * const handleDelete = async (websiteId) => {
 *   if (confirm("确定要删除这个网站吗？此操作不可撤销。")) {
 *     try {
 *       await deleteWebsite(websiteId)
 *       // 刷新网站列表
 *       refetch()
 *     } catch (error) {
 *       alert("删除失败: " + error.message)
 *     }
 *   }
 * }
 *
 * 注意事项:
 * - 该函数会向 /websites/{websiteId}/ 端点发送DELETE请求
 * - 删除操作是永久性的，无法恢复，请确保用户明确意图后再执行
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功删除后，后端通常返回204状态码，表示资源已成功删除且无响应体
 * - 在UI中建议添加二次确认机制，防止误删操作
 * - 删除后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const deleteWebsite = async (
  websiteId: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/websites/${websiteId}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 批量切换网站启用状态
 *
 * 此函数用于批量切换多个网站的启用状态，通过向后端API发送POST请求来更改多个网站的启用/禁用状态
 *
 * @param data - 包含批量切换状态的数据对象，符合 WebsiteBatchSwitchData 接口定义
 *              通常包含以下字段：
 *              - website_ids: number[] - 需要切换状态的网站ID数组
 *              - enabled: boolean - 目标启用状态，true为启用，false为禁用
 *
 * @param token - 鉴权token
 * @returns Promise<WebsiteData> - 返回操作结果的Promise
 *                                注意：根据API设计，可能返回最后一个处理的网站数据或操作结果摘要
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量启用ID为[1, 2, 3]的网站
 * const result = await batchSwitchWebsites({
 *   website_ids: [1, 2, 3],
 *   enabled: true
 * })
 *
 * // 批量禁用ID为[4, 5, 6]的网站
 * const result = await batchSwitchWebsites({
 *   website_ids: [4, 5, 6],
 *   enabled: false
 * })
 *
 * 注意事项:
 * - 该函数会向 /websites/switch/ 端点发送POST请求
 * - 确保传入的website_ids数组中的ID都是有效的网站ID
 * - data参数需要符合WebsiteBatchSwitchData接口定义的结构
 * - 此操作是批量操作，会影响多个网站的状态，请谨慎使用
 */
export const batchSwitchWebsites = async (
  data: WebsiteBatchSwitchData,
  token: string | null
): Promise<WebsiteData> => {
  const response = await fetch(`${API_BASE_URL}/websites/switch/`, {
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
 * 批量锁定/解销网站
 *
 * 此函数用于批量锁定多个网站，通过向后端API发送PUT请求来更改多个网站的锁定状态
 * 通常用于防止特定网站被意外修改或执行某些操作
 *
 * @param data - 包含批量锁定所需数据的对象，符合 WebsiteBatchLockData 接口定义
 *              通常包含以下字段：
 *              - website_ids: number[] - 需要锁定的网站ID数组
 *              - locked: boolean - 目标锁定状态，true为锁定，false为解锁
 *
 * @param token - 鉴权token
 * @returns Promise<WebsiteData> - 返回操作结果的Promise
 *                                注意：根据API设计，可能返回最后一个处理的网站数据或操作结果摘要
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 注意事项:
 * - 该函数会向 /websites/lock/ 端点发送PUT请求
 * - 确保传入的website_ids数组中的ID都是有效的网站ID
 * - data参数需要符合WebsiteBatchLockData接口定义的结构
 * - 此操作是批量操作，会影响多个网站的状态，请谨慎使用
 */
export const batchLockWebsites = async (
  data: WebsiteBatchLockData,
  token: string | null
): Promise<WebsiteData> => {
  const response = await fetch(`${API_BASE_URL}/websites/lock/`, {
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
 * 批量暂停/恢复网站
 *
 * 此函数用于批量暂停多个网站的运行状态，通过向后端API发送PUT请求来更改多个网站的暂停状态
 * 通常用于临时停止特定网站的爬取或处理任务，而不改变其启用/禁用状态
 *
 * @param data - 包含批量暂停所需数据的对象，符合 WebsiteBatchPauseData 接口定义
 *              通常包含以下字段：
 *              - website_ids: number[] - 需要暂停的网站ID数组
 *              - paused: boolean - 目标暂停状态，true为暂停，false为恢复运行
 *
 * @param token - 鉴权token
 * @returns Promise<WebsiteData> - 返回操作结果的Promise
 *                                注意：根据API设计，可能返回最后一个处理的网站数据或操作结果摘要
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 注意事项:
 * - 该函数会向 /websites/pause/ 端点发送PUT请求
 * - 确保传入的website_ids数组中的ID都是有效的网站ID
 * - data参数需要符合WebsiteBatchPauseData接口定义的结构
 * - 此操作是批量操作，会影响多个网站的运行状态，请谨慎使用
 * - 暂停状态通常独立于启用状态，启用的网站也可以处于暂停状态
 */
export const batchPauseWebsites = async (
  data: WebsiteBatchPauseData,
  token: string | null
): Promise<WebsiteData> => {
  const response = await fetch(`${API_BASE_URL}/websites/pause/`, {
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
 * 批量删除网站
 *
 * 此函数用于向后端API发送DELETE请求，批量删除指定ID列表的网站记录
 * 该操作会永久删除多个网站数据，请在调用前确认用户意图，建议配合确认对话框使用
 *
 * @param websiteIds - 需要删除的网站的唯一标识符（ID）数组
 *                     必须是有效的数字ID数组，对应数据库中存在的网站记录
 *                     删除操作不可逆，请谨慎操作
 *
 * @param token - 鉴权token
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果删除成功，响应状态码通常为204 (No Content) 或 200
 *                如果删除失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：部分或全部网站ID不存在、权限不足、网络错误等
 *
 * 注意事项:
 * - 该函数会向 /websites/ 端点发送DELETE请求，并通过查询参数传递网站ID列表
 * - 删除操作是永久性的，无法恢复，请确保用户明确意图后再执行
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 在UI中建议添加二次确认机制，防止误删操作
 * - 删除后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const batchDeleteWebsites = async (
  websiteIds: number[],
  token: string | null
): Promise<Response> => {
  // 将网站ID数组转换为查询参数字符串，例如: website_ids=1&website_ids=2&website_ids=3
  const params = websiteIds.map((id) => `website_ids=${id}`).join('&')

  // 发送DELETE请求，通过URL查询参数传递待删除的网站ID列表
  const response = await fetch(`${API_BASE_URL}/websites/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  // 检查响应状态并返回响应对象
  return await handleResponse(response)
}

/**
 * 同步网站数据
 *
 * 此函数用于从后端API同步网站数据，通常用于更新本地缓存或获取最新数据
 * 适用于数据不一致、定期同步、手动刷新等场景
 *
 * @param data - 同步选项数据，包含是否清空入口点、预备作业、锁定、暂停信息的标志
 * @param token - 鉴权token
 *
 * @returns Promise<void> - 无返回值，仅触发同步操作
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 同步网站数据，不清空任何关联
 * try {
 *   await syncWebsites({
 *     clear_entrypoints: false,
 *     clear_prejobs: false,
 *     clear_locked: false,
 *     clear_paused: false
 *   })
 *   console.log("网站数据同步完成")
 * } catch (error) {
 *   console.error("网站数据同步失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /websites/sync/ 端点发送POST请求
 * - 需要传入同步选项参数来控制同步行为
 * - 同步操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，可能需要手动刷新网站列表以显示最新数据
 * - 根据后端实现，同步可能包括添加新网站、更新现有网站或删除不存在的网站
 */
export const syncWebsites = async (
  data: WebsiteSyncData,
  token: string | null
): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/websites/sync/`, {
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
 * 导出所有网站数据
 *
 * 此函数用于从后端API导出所有网站数据，通常返回一个包含网站数据的文件
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
 * // 导出所有网站数据
 * try {
 *   const response = await exportWebsites()
 *   // 将响应转换为blob并创建下载链接
 *   const blob = await response.blob()
 *   const url = window.URL.createObjectURL(blob)
 *   const a = document.createElement('a')
 *   a.href = url
 *   a.download = 'websites_export.json'
 *   a.click()
 *   window.URL.revokeObjectURL(url)
 * } catch (error) {
 *   console.error("网站数据导出失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /websites/export/ 端点发送POST请求
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 可能需要处理大文件下载，注意浏览器内存限制
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 */
export const exportWebsites = async (
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/websites/export/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 批量导出指定网站数据
 *
 * 此函数用于从后端API导出指定网站的数据，允许用户选择特定的网站进行导出
 * 适用于只需要导出部分网站数据的场景
 *
 * @param data - 包含批量导出所需数据的对象，必须符合 WebsiteBatchExportData 接口定义
 *              通常包含需要导出的网站ID列表等信息
 *
 * @param token
 * @returns Promise<Response> - 返回包含导出数据的Response对象
 *                            可以进一步处理Response对象以获取实际的文件内容
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量导出指定ID的网站数据
 * const exportData = {
 *   website_ids: [1, 2, 3]  // 需要导出的网站ID列表
 * }
 * try {
 *   const response = await batchExportWebsites(exportData)
 *   const blob = await response.blob()
 *   // 处理下载逻辑...
 * } catch (error) {
 *   console.error("批量导出网站数据失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /websites/export/ 端点发送PUT请求
 * - 需要提供WebsiteBatchExportData格式的数据作为请求体
 * - 请求头设置为application/json格式
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 导出的文件可能只包含指定ID的网站数据，而不是所有网站
 */
export const batchExportWebsites = async (
  data: WebsiteBatchExportData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/websites/export/`, {
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
 * 获取网站列表的自定义 Hook
 *
 * 此 Hook 封装了获取网站列表的查询逻辑，提供了关键词搜索、启用状态过滤和分页功能
 * 使用 TanStack Query 的 useQuery 来处理数据获取、缓存和状态管理
 *
 * @param website_keyword - 可选参数，用于按关键词搜索网站（例如网站名称或域名）
 *                        当值为 undefined 时，不进行关键词过滤
 * @param website_enabled - 可选参数，用于过滤网站的启用状态
 *                        true: 只返回启用的网站
 *                        false: 只返回禁用的网站
 *                        undefined: 返回所有网站（不考虑启用状态）
 * @param page - 页码，从1开始，默认为1，用于分页查询
 * @param size - 每页返回的数据量，默认为 PAGE_SIZE 条，最大值取决于后端配置
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的网站数据数组 (WebsiteData[])
 *          - isLoading: 数据加载状态
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 获取所有网站
 * const { data, isLoading } = useWebsitesQuery()
 *
 * // 搜索包含"test"关键词的启用网站
 * const { data, isLoading } = useWebsitesQuery("test", true, 1, 20)
 *
 * // 获取所有禁用的网站
 * const { data, isLoading } = useWebsitesQuery(undefined, false)
 *
 * 注意事项:
 * - 查询结果会被缓存，相同参数的查询会返回缓存数据
 * - 查询键(queryKey)包含了所有参数，确保不同参数的查询有独立的缓存
 * - 当参数变化时，会自动触发重新查询
 */
export const useWebsitesQuery = (
  website_keyword: string | undefined = undefined,
  website_enabled: boolean | undefined = undefined,
  website_locked: boolean | undefined = undefined,
  website_paused: boolean | undefined = undefined,
  website_limited: boolean | undefined = undefined,
  page: number = 1,
  size: number = PAGE_SIZE
) => {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: [
      'websites',
      website_keyword,
      website_enabled,
      website_locked,
      website_paused,
      website_limited,
      page,
      size,
    ],
    queryFn: async () => {
      const token = await getToken()
      return fetchWebsites(
        website_keyword,
        website_enabled,
        website_locked,
        website_paused,
        website_limited,
        page,
        size,
        token
      )
    },
    placeholderData: (previousData) => previousData, // 保持上一次的数据
  })
}

/**
 * 根据网站ID获取单个网站详细信息的自定义 Hook
 *
 * 此 Hook 封装了获取单个网站详细信息的查询逻辑，使用 TanStack Query 的 useQuery
 * 来处理数据获取、缓存和状态管理。该 Hook 会根据传入的 websiteId 参数向后端
 * API 发起请求，获取指定网站的完整信息。
 *
 * @param websiteId - 需要获取信息的网站唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的网站记录
 *                    如果传入 0 或无效ID，由于 enabled 条件设置，将不会发起请求
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的网站数据 (WebsiteData 类型)
 *          - isLoading: 数据加载状态，true 表示正在请求中
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - isFetching: 是否正在获取数据（包括重新验证）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 在组件中使用，获取ID为5的网站信息
 * const { data: website, isLoading, error } = useWebsiteQuery(5)
 *
 * if (isLoading) return <div>加载中...</div>
 * if (error) return <div>错误: {error.message}</div>
 * if (website) return <div>网站名称: {website.name}</div>
 *
 * // 手动刷新数据
 * const { refetch } = useWebsiteQuery(5)
 * const handleRefresh = () => refetch()
 *
 * 注意事项:
 * - 当 websiteId 为 0 或无效值时，由于 enabled: !!websiteId 设置，不会发起API请求
 * - 查询结果会被缓存，相同 websiteId 的查询会返回缓存数据
 * - 查询键(queryKey) 包含 websiteId，确保不同网站ID的查询有独立的缓存
 * - 自动集成 Clerk 认证，会在请求头中添加 Bearer Token
 * - 此 Hook 适用于需要显示单个网站详细信息的场景，如网站详情页
 */
export const useWebsiteQuery = (websiteId: number) => {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['website', websiteId], // 查询键包含网站ID，确保不同ID有独立缓存
    queryFn: async () => {
      const token = await getToken() // 获取认证token
      return fetchWebsiteById(websiteId, token) // 调用API获取网站详情
    },
    enabled: !!websiteId, // 只有当 websiteId 存在且不为0时才启用查询
  })
}

/**
 * 创建网站的自定义 Mutation Hook
 *
 * 此 Hook 封装了创建网站的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 包含自动的数据缓存更新功能，当创建成功后会自动使网站列表缓存失效，触发重新查询
 *
 * 使用场景：
 * - 在表单中提交新网站创建请求
 * - 需要自动更新网站列表显示最新数据
 * - 提供加载状态、错误处理等状态管理功能
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发创建操作的函数
 *          - isLoading: 创建操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 创建成功的网站数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useCreateWebsiteMutation()
 *
 * const handleSubmit = async (newWebsiteData) => {
 *   try {
 *     const createdWebsite = await mutateAsync(newWebsiteData)
 *     console.log('网站创建成功:', createdWebsite)
 *   } catch (err) {
 *     console.error('网站创建失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 创建成功后会自动使 ['websites'] 查询缓存失效，确保列表数据及时更新
 * - mutationFn 直接使用预定义的 createWebsite 函数，确保错误处理一致性
 * - 适用于需要创建单个网站并自动更新UI的场景
 */
export const useCreateWebsiteMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: WebsiteCreateData) => {
      const token = await getToken()
      return createWebsite(variables, token)
    },
    onSuccess: () => {
      // 创建成功后使网站列表缓存失效，触发重新获取数据
      // 这样可以确保UI显示最新的网站列表，包含新创建的网站
      queryClient.invalidateQueries({ queryKey: ['websites'] })
    },
  })
}

/**
 * 更新网站信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了更新网站的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持完整的网站信息更新（PUT 请求），包括网站名称、域名、配置等所有字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 *
 * 主要功能：
 * - 提交网站的完整更新数据（使用 PUT 方法替换整个资源）
 * - 自动处理缓存失效，确保UI显示最新的网站信息
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发更新操作的函数，需要传入 { websiteId: number, data: WebsiteUpdateData }
 *          - isLoading: 更新操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 更新成功的网站数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useUpdateWebsiteMutation()
 *
 * const handleUpdate = async (websiteId, websiteData) => {
 *   try {
 *     const params = {
 *       websiteId: websiteId,
 *       data: websiteData  // 符合 WebsiteUpdateData 接口的完整网站数据
 *     }
 *     const updatedWebsite = await mutateAsync(params)
 *     console.log('网站更新成功:', updatedWebsite)
 *   } catch (err) {
 *     console.error('网站更新失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 使用 PUT 方法，会完全替换目标网站资源，请确保 data 参数包含网站的所有必要字段
 * - 更新成功后会自动使 ['websites'] 和 ['website', websiteId] 查询缓存失效
 * - 适用于需要更新网站全部信息的场景，如果只需要更新部分字段，请使用 usePatchWebsiteMutation
 * - websiteId 必须是有效的数字ID，且对应网站存在于数据库中
 * - data 参数必须符合 WebsiteUpdateData 接口的结构要求
 */
export const useUpdateWebsiteMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      websiteId: number
      data: WebsiteUpdateData
    }) => {
      const token = await getToken()
      return updateWebsite(variables.websiteId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使网站列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      // 同时使单个网站详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({
        queryKey: ['website', variables.websiteId],
      })
    },
  })
}

/**
 * 部分更新网站信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了部分更新网站的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持部分更新网站信息（PATCH 请求），仅更新提供的字段，不会影响其他字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 *
 * 主要功能：
 * - 提交网站的部分更新数据（使用 PATCH 方法仅更新指定字段）
 * - 自动处理缓存失效，确保UI显示最新的网站信息
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发更新操作的函数，需要传入 { websiteId: number, data: WebsiteConfigData }
 *          - isLoading: 更新操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 更新成功的网站数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = usePatchWebsiteMutation()
 *
 * const handlePatch = async (websiteId, patchData) => {
 *   try {
 *     const params = {
 *       websiteId: websiteId,
 *       data: {  // 符合 WebsiteConfigData 接口的部分网站数据
 *         website_config: { theme: "dark" },  // 只更新配置
 *         // 或者
 *         website_readme: "更新的说明文档"  // 只更新说明文档
 *       }
 *     }
 *     const updatedWebsite = await mutateAsync(params)
 *     console.log('网站部分更新成功:', updatedWebsite)
 *   } catch (err) {
 *     console.error('网站部分更新失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 使用 PATCH 方法，只更新提供的字段，其他字段保持不变
 * - 适用于只需要更新网站部分信息的场景，如仅更新配置或说明文档
 * - 更新成功后会自动使 ['websites'] 和 ['website', websiteId] 查询缓存失效
 * - websiteId 必须是有效的数字ID，且对应网站存在于数据库中
 * - data 参数必须符合 WebsiteConfigData 接口的结构要求，可以只包含需要更新的字段
 * - 与 useUpdateWebsiteMutation 不同，此 Hook 允许只更新部分字段，不会重置其他字段
 */
export const usePatchWebsiteMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      websiteId: number
      data: WebsiteConfigData
    }) => {
      const token = await getToken()
      return patchWebsite(variables.websiteId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使网站列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      // 同时使单个网站详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({
        queryKey: ['website', variables.websiteId],
      })
    },
  })
}

/**
 * 切换网站启用状态的自定义 Mutation Hook
 *
 * 此 Hook 封装了切换网站启用状态的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用切换网站的启用/禁用状态，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送切换网站状态的请求
 * - 自动处理缓存失效，确保UI显示最新的网站状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发切换操作的函数，需要传入 { websiteId: number, data: WebsiteSwitchData }
 *          - isLoading: 切换操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 切换成功后的网站数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useSwitchWebsiteMutation()
 *
 * const handleToggle = async (websiteId, enabled) => {
 *   try {
 *     const params = {
 *       websiteId: websiteId,
 *       data: { enabled: enabled }  // WebsiteSwitchData 格式的数据
 *     }
 *     const updatedWebsite = await mutateAsync(params)
 *     console.log('网站状态切换成功:', updatedWebsite)
 *   } catch (err) {
 *     console.error('网站状态切换失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /websites/{websiteId}/switch/ 端点发送POST请求来切换网站状态
 * - 切换成功后会自动使 ['websites'] 和 ['website', websiteId] 查询缓存失效
 * - 适用于需要切换网站启用/禁用状态的场景
 * - websiteId 必须是有效的数字ID，且对应网站存在于数据库中
 * - data 参数必须符合 WebsiteSwitchData 接口的结构要求
 * - 代码中的 console.log 语句用于调试目的，在生产环境中可能需要移除
 */
export const useSwitchWebsiteMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      websiteId: number
      data: WebsiteSwitchData
    }) => {
      const token = await getToken()
      return switchWebsite(variables.websiteId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使网站列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      // 同时使单个网站详情缓存失效，确保详情页显示最新状态
      queryClient.invalidateQueries({
        queryKey: ['website', variables.websiteId],
      })
    },
  })
}

/**
 * 批量切换网站启用状态的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量切换多个网站启用状态的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用批量切换多个网站的启用/禁用状态，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送批量切换网站状态的请求
 * - 自动处理缓存失效，确保UI显示最新的网站状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量切换操作的函数，需要传入 WebsiteBatchSwitchData 格式的数据
 *          - isLoading: 批量切换操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量切换成功后的网站数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchSwitchWebsitesMutation()
 *
 * const handleBatchToggle = async (websiteIds, enabled) => {
 *   try {
 *     const params = {
 *       website_ids: websiteIds,  // 网站ID数组，例如 [1, 2, 3]
 *       enabled: enabled          // 目标启用状态，true为启用，false为禁用
 *     }
 *     const result = await mutateAsync(params)
 *     console.log('批量切换网站状态成功:', result)
 *   } catch (err) {
 *     console.error('批量切换网站状态失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /websites/switch/ 端点发送POST请求来批量切换网站状态
 * - 批量操作成功后会自动使 ['websites'] 列表查询缓存失效
 * - 同时会使所有被操作的网站详情缓存失效，确保详情页显示最新状态
 * - 适用于需要批量切换多个网站启用/禁用状态的场景
 * - 传入的参数必须符合 WebsiteBatchSwitchData 接口的结构要求
 * - 代码会检查 variables.website_ids 是否存在且为数组，确保安全遍历
 */
export const useBatchSwitchWebsitesMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: WebsiteBatchSwitchData) => {
      const token = await getToken()
      return batchSwitchWebsites(variables, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使网站列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      // 同时使单个网站详情缓存失效，确保详情页显示最新状态
      if (variables.website_ids && Array.isArray(variables.website_ids)) {
        variables.website_ids.forEach((website_id) => {
          queryClient.invalidateQueries({ queryKey: ['website', website_id] })
        })
      }
    },
  })
}

/**
 * 批量锁定/解锁网站的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量锁定或解锁多个网站的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用批量更改多个网站的锁定状态，并自动处理相关的缓存更新
 *
 * 主要功能：
 * - 向后端API发送批量锁定/解锁网站的请求
 * - 自动处理缓存失效，确保UI显示最新的网站锁定状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量锁定操作的函数，需要传入 WebsiteBatchLockData 格式的数据
 *          - isLoading: 批量锁定操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量锁定成功后的网站数据（如果有的话）
 *
 * 注意事项：
 * - 此 Hook 向 /websites/lock/ 端点发送PUT请求来批量锁定/解锁网站
 * - 批量操作成功后会自动使 ['websites'] 列表查询缓存失效
 * - 同时会使所有被操作的网站详情缓存失效，确保详情页显示最新状态
 * - 适用于需要批量锁定或解锁多个网站的场景
 * - 传入的参数必须符合 WebsiteBatchLockData 接口的结构要求，通常包含 website_ids 数组和 locked 布尔值
 * - 代码会检查 variables.website_ids 是否存在且为数组，确保安全遍历并使对应缓存失效
 */
export const useBatchLockWebsitesMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: WebsiteBatchLockData) => {
      const token = await getToken()
      return batchLockWebsites(variables, token)
    },
    onSuccess: (_, variables) => {
      // 批量锁定/解锁成功后使网站列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      // 同时使单个网站详情缓存失效，确保详情页显示最新状态
      if (variables.website_ids && Array.isArray(variables.website_ids)) {
        variables.website_ids.forEach((website_id) => {
          queryClient.invalidateQueries({ queryKey: ['website', website_id] })
        })
      }
    },
  })
}

/**
 * 批量暂停/恢复网站的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量暂停或恢复多个网站运行状态的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用批量更改多个网站的暂停状态（paused），并自动处理相关的缓存更新
 *
 * 主要功能：
 * - 向后端API发送批量暂停/恢复网站的请求
 * - 自动处理缓存失效，确保UI显示最新的网站运行状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量暂停/恢复操作的函数，需要传入 WebsiteBatchPauseData 格式的数据
 *          - isLoading: 批量操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量操作成功后的网站数据（如果有的话）
 *
 * 注意事项：
 * - 此 Hook 向 /websites/pause/ 端点发送PUT请求来批量暂停/恢复网站
 * - 批量操作成功后会自动使 ['websites'] 列表查询缓存失效
 * - 同时会使所有被操作的网站详情缓存失效，确保详情页显示最新状态
 * - 适用于需要批量暂停或恢复多个网站爬取任务的场景
 * - 传入的参数必须符合 WebsiteBatchPauseData 接口的结构要求，通常包含 website_ids 数组和 paused 布尔值
 * - 代码会检查 variables.website_ids 是否存在且为数组，确保安全遍历并使对应缓存失效
 */
export const useBatchPauseWebsitesMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: WebsiteBatchPauseData) => {
      const token = await getToken()
      return batchPauseWebsites(variables, token)
    },
    onSuccess: (_, variables) => {
      // 批量暂停/恢复成功后使网站列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      // 同时使单个网站详情缓存失效，确保详情页显示最新状态
      if (variables.website_ids && Array.isArray(variables.website_ids)) {
        variables.website_ids.forEach((website_id) => {
          queryClient.invalidateQueries({ queryKey: ['website', website_id] })
        })
      }
    },
  })
}

/**
 * 同步网站数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了同步网站数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 主要功能是触发后端的网站数据同步过程，通常用于从外部源同步最新的网站数据
 *
 * 使用场景：
 * - 需要从外部源同步最新网站数据时
 * - 定期更新网站数据以保持数据一致性
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
 * const { mutateAsync, isLoading, error } = useSyncWebsitesMutation()
 *
 * const handleSync = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('网站数据同步完成')
 *   } catch (err) {
 *     console.error('网站数据同步失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 同步操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，可能需要手动刷新网站列表以显示最新数据
 * - 此操作会调用 syncWebsites API 函数，向后端发起同步请求
 */
export const useSyncWebsitesMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (data: WebsiteSyncData) => {
      const token = await getToken()
      return syncWebsites(data, token)
    },
  })
}

/**
 * 导出所有网站数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了导出所有网站数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持将网站数据导出为文件并自动下载到本地，通常用于备份或离线分析
 *
 * 主要功能：
 * - 触发后端网站数据导出操作
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
 * const { mutateAsync, isLoading, error } = useExportWebsitesMutation()
 *
 * const handleExport = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('网站数据导出完成')
 *   } catch (err) {
 *     console.error('网站数据导出失败:', err)
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
export const useExportWebsitesMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      const response = await exportWebsites(token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'websites_export.json' // 使用更具描述性的默认文件名
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
 * 批量导出指定网站数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量导出指定网站数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许用户选择特定的网站进行导出，适用于只需要导出部分网站数据的场景
 *
 * 主要功能：
 * - 触发后端指定网站数据的导出操作
 * - 自动处理导出文件的下载
 * - 从响应头中提取文件名（如果后端提供）
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量导出操作的函数，需要传入 WebsiteBatchExportData 格式的参数
 *          - isLoading: 导出操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 导出成功后的文件数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchExportWebsitesMutation()
 *
 * const handleBatchExport = async () => {
 *   const exportData = {
 *     website_ids: [1, 2, 3]  // 需要导出的网站ID列表
 *   }
 *   try {
 *     await mutateAsync(exportData)
 *     console.log('批量导出网站数据完成')
 *   } catch (err) {
 *     console.error('批量导出网站数据失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 需要传入 WebsiteBatchExportData 格式的参数，包含要导出的网站ID列表
 * - 此 Hook 会自动处理文件下载逻辑，包括从响应头获取文件名
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 * - 如果后端没有提供文件名，默认使用 'download.json'
 * - 会自动创建下载链接并触发下载，完成后清理URL对象
 * - 可能需要处理大文件下载，注意浏览器内存限制
 * - 确保传入的 website_ids 数组中的ID都是有效的网站ID
 */
export const useBatchExportWebsitesMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: WebsiteBatchExportData) => {
      const token = await getToken()
      const response = await batchExportWebsites(variables, token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'websites_export.json' // 使用更具描述性的默认文件名
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
 * 删除网站的自定义 Mutation Hook
 *
 * 此 Hook 封装了删除网站的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持删除指定ID的网站，并自动处理相关的缓存更新，确保UI界面及时反映数据变化
 *
 * 主要功能：
 * - 向后端API发送删除指定网站的请求
 * - 自动处理缓存失效，确保UI显示最新的网站列表
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发删除操作的函数，需要传入 { websiteId: number }
 *          - isLoading: 删除操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 删除操作的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useDeleteWebsiteMutation()
 *
 * const handleDelete = async (websiteId) => {
 *   try {
 *     await mutateAsync({ websiteId })
 *     console.log('网站删除成功')
 *   } catch (err) {
 *     console.error('网站删除失败:', err)
 *   }
 * }
 *
 * // 在组件中结合确认对话框使用
 * const handleDeleteWithConfirm = async (websiteId) => {
 *   if (window.confirm('确定要删除这个网站吗？此操作不可撤销。')) {
 *     try {
 *       await mutateAsync({ websiteId })
 *       // 可以添加删除成功的提示信息
 *       toast.success('网站删除成功')
 *     } catch (err) {
 *       toast.error('网站删除失败: ' + err.message)
 *     }
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /websites/{websiteId}/ 端点发送DELETE请求来删除网站
 * - 删除成功后会自动使 ['websites'] 列表查询缓存失效，确保列表显示最新数据
 * - 同时会使 ['website', websiteId] 单个网站详情查询缓存失效，避免访问已删除的网站详情
 * - 适用于需要删除单个网站并自动更新UI的场景
 * - websiteId 必须是有效的数字ID，且对应网站存在于数据库中
 * - 删除操作是不可逆的，建议在UI中添加确认机制以防止误删
 * - 在实际使用中，通常需要与确认对话框等UI组件配合，以避免意外删除操作
 */
export const useDeleteWebsiteMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { websiteId: number }) => {
      const token = await getToken()
      return deleteWebsite(variables.websiteId, token)
    },
    onSuccess: (_, variables) => {
      // 删除成功后使网站列表缓存失效，确保列表显示最新状态（已移除被删除的网站）
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      // 同时使单个网站详情缓存失效，确保详情页不会显示已删除的网站信息
      queryClient.invalidateQueries({
        queryKey: ['website', variables.websiteId],
      })
    },
  })
}

export const useBatchDeleteWebsitesMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: number[]) => {
      const token = await getToken()
      return batchDeleteWebsites(variables, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使网站列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      // 同时使单个网站详情缓存失效，确保详情页显示最新状态
      if (variables && Array.isArray(variables)) {
        variables.forEach((websiteId) => {
          queryClient.invalidateQueries({ queryKey: ['website', websiteId] })
        })
      }
    },
  })
}

/**
 * 单独更新网站爬虫配置
 *
 * 此函数用于单独更新指定网站的爬虫配置信息，使用 PUT 方法
 * 只更新网站的爬虫配置，不影响其他字段
 *
 * @param websiteId - 需要更新爬虫配置的网站的唯一标识符（ID）
 * @param data - 爬虫配置数据对象，符合 SpiderConfigData 接口定义
 *              包含爬虫抓取、内容提取、并发控制等配置项
 *
 * @param token - 鉴权token
 * @returns Promise<WebsiteData> - 返回更新后的完整网站数据对象的Promise
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 更新网站的爬虫配置
 * const spiderConfig = {
 *   max_list_pages: 5000,
 *   max_article_pages: 50000,
 *   desired_concurrency: 10,
 *   remain_img: true
 * }
 * try {
 *   const updatedSite = await updateWebsiteSpiderConfig(1, spiderConfig)
 *   console.log("网站爬虫配置更新成功:", updatedSite)
 * } catch (error) {
 *   console.error("网站爬虫配置更新失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /websites/config/{websiteId}/ 端点发送PUT请求
 * - PUT方法会完全替换目标配置，请确保 data 参数包含需要更新的所有配置项
 * - 传入的data参数必须符合SpiderConfigData接口的结构要求
 * - 请求头设置为application/json格式
 * - 确保websiteId是有效的数字ID，且对应网站存在于数据库中
 */
export const updateWebsiteSpiderConfig = async (
  websiteId: number,
  data: SpiderConfigData,
  token: string | null
): Promise<WebsiteData> => {
  const response = await fetch(
    `${API_BASE_URL}/websites/${websiteId}/config/`,
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
 * 单独更新网站爬虫配置的自定义 Mutation Hook
 *
 * 此 Hook 封装了单独更新网站爬虫配置的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持单独更新网站的爬虫配置（PUT 请求），只更新爬虫配置，不影响其他字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 *
 * 主要功能：
 * - 提交网站的爬虫配置更新数据（使用 PUT 方法）
 * - 自动处理缓存失效，确保UI显示最新的网站信息
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发更新操作的函数，需要传入 { websiteId: number, data: SpiderConfigData }
 *          - isLoading: 更新操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 更新成功的网站数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useUpdateWebsiteSpiderConfigMutation()
 *
 * const handleUpdateSpiderConfig = async (websiteId, spiderConfig) => {
 *   try {
 *     const params = {
 *       websiteId: websiteId,
 *       data: spiderConfig  // 符合 SpiderConfigData 接口的爬虫配置数据
 *     }
 *     const updatedWebsite = await mutateAsync(params)
 *     console.log('网站爬虫配置更新成功:', updatedWebsite)
 *   } catch (err) {
 *     console.error('网站爬虫配置更新失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 使用 PUT 方法，会完全替换目标爬虫配置，请确保 data 参数包含所有需要的配置项
 * - 更新成功后会自动使 ['websites'] 和 ['website', websiteId] 查询缓存失效
 * - 适用于需要单独更新网站爬虫配置的场景
 * - websiteId 必须是有效的数字ID，且对应网站存在于数据库中
 * - data 参数必须符合 SpiderConfigData 接口的结构要求
 * - 只更新爬虫配置，不影响网站的其他字段（如名称、URL等）
 */
export const useUpdateWebsiteSpiderConfigMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      websiteId: number
      data: SpiderConfigData
    }) => {
      const token = await getToken()
      return updateWebsiteSpiderConfig(
        variables.websiteId,
        variables.data,
        token
      )
    },
    onSuccess: (_, variables) => {
      // 更新成功后使网站列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      // 同时使单个网站详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({
        queryKey: ['website', variables.websiteId],
      })
    },
  })
}

/**
 * 重置网站准任务
 *
 * 此函数用于向后端API发送请求重置指定网站的准任务
 *
 * @param websiteId - 需要重置准任务的网站的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的网站记录
 *
 * @param token - 鉴权token
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
 * - 该函数会向 /pre_tasks/websites/{websiteId}/ 端点发送PUT请求
 * - 重置操作会将指定网站的所有准任务状态重置
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功重置后，后端通常返回200状态码和重置结果
 * - 在UI中建议添加二次确认机制，防止误操作
 * - 重置后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const resetWebsitePreTasks = async (
  websiteId: number,
  token: string | null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_BASE_URL}/pre_tasks/websites/${websiteId}/`,
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
 * @param websiteId - 需要清空准任务的网站的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的网站记录
 *
 * @param token - 鉴权token
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
 * - 该函数会向 /pre_tasks/websites/{websiteId}/ 端点发送DELETE请求
 * - 清空操作会永久删除指定网站的所有准任务，请谨慎操作
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功清空后，后端通常返回204状态码，表示资源已成功删除且无响应体
 * - 在UI中建议添加二次确认机制，防止误操作
 * - 清空后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const clearWebsitePreTasks = async (
  websiteId: number,
  token: string | null
): Promise<Response> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(
    `${API_BASE_URL}/pre_tasks/websites/${websiteId}/`,
    {
      method: 'DELETE',
      headers,
    }
  )
  return await handleResponse(response)
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
 * - 此 Hook 向 /pre_tasks/websites/{websiteId}/ 端点发送PUT请求来重置网站准任务
 * - 重置成功后会自动使 ['preTasks'] 查询缓存失效
 * - 适用于需要重置特定网站准任务的场景
 * - websiteId 必须是有效的数字ID，且对应网站存在于数据库中
 * - 建议在UI中添加二次确认机制，防止误操作
 */
export const useResetWebsitePreTasksMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (websiteId: number) => {
      const token = await getToken()
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
 * - 此 Hook 向 /pre_tasks/websites/{websiteId}/ 端点发送DELETE请求来清空网站准任务
 * - 清空成功后会自动使 ['preTasks'] 查询缓存失效
 * - 适用于需要清空特定网站准任务的场景
 * - websiteId 必须是有效的数字ID，且对应网站存在于数据库中
 * - 清空操作会永久删除指定网站的所有准任务，请谨慎使用
 * - 建议在UI中添加二次确认机制，防止误操作
 */
export const useClearWebsitePreTasksMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (websiteId: number) => {
      const token = await getToken()
      return clearWebsitePreTasks(websiteId, token)
    },
    onSuccess: () => {
      // 清空成功后使准任务列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['preTasks'] })
    },
  })
}
