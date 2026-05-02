// 引入reactQuery依赖
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// 分页相关
import { extracted_pagination } from '@/config/pagination'
// Clerk 认证
import { useAuth } from '@clerk/clerk-react'
import {
  TemplateBatchSwitchData,
  TemplateBatchExportData,
  TemplateConfigData,
  TemplateCreateData,
  TemplateData,
  TemplatesData,
  TemplateSwitchData,
  TemplateUpdateData,
} from '../data/schemas.ts'

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'
const DEFAULT_PAGE_SIZE: number = Number(
  import.meta.env.VITE_TEMPLATE_PAGE_SIZE || 50
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
 * 获取模板列表
 *
 * 此函数用于从后端API获取模板列表，支持关键词搜索、启用状态过滤和分页功能
 *
 * @param template_keyword - 可选参数，用于按关键词搜索模板（例如模板名称或标识）
 * @param template_enabled - 可选参数，用于过滤模板的启用状态
 *                    true: 只返回启用的模板
 *                    false: 只返回禁用的模板
 *                    undefined: 返回所有模板（不考虑启用状态）
 * @param page - 页码，从1开始，默认为1
 * @param size - 每页返回的数据量，默认为 DEFAULT_PAGE_SIZE 条
 *
 * @param token - 鉴权token
 * @returns Promise<TemplatesData> - 返回模板数据数组的Promise
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 获取所有模板，第一页，每页 DEFAULT_PAGE_SIZE 条
 * const allTemplates = await fetchTemplates()
 *
 * // 搜索包含"test"关键词的启用模板
 * const searchResults = await fetchTemplates("test", true, 1, 20)
 *
 * // 获取所有禁用的模板
 * const disabledTemplates = await fetchTemplates(undefined, false)
 */
export const fetchTemplates = async (
  template_keyword: string | undefined = undefined,
  template_enabled: boolean | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE,
  token: string | null
): Promise<TemplatesData> => {
  // 构建基础URL，包含分页参数
  let url = `${API_BASE_URL}/templates/?page=${page}&size=${size}`

  // 如果提供了关键词参数，则添加到查询字符串中
  if (template_keyword) {
    url += `&template_keyword=${template_keyword}`
  }

  // 如果提供了启用状态参数（注意：undefined !== 某个布尔值），则添加到查询字符串中
  if (template_enabled !== undefined) {
    url += `&template_enabled=${template_enabled}`
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
  const templates: TemplateData[] = await response.json()

  return {
    templates,
    pagination,
  }
}

/**
 * 根据ID获取模板详细信息
 *
 * 此函数用于从后端API根据模板ID获取指定模板的详细信息
 *
 * @param templateId - 需要获取的模板的唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的模板记录
 *
 * @param token - 鉴权token
 * @returns Promise<TemplateData> - 返回模板数据对象的Promise
 *                                包含模板的所有信息，如ID、名称、标识、内容、启用状态等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：模板ID不存在、网络错误、后端服务异常等
 *
 * 使用示例:
 * // 获取ID为1的模板信息
 * try {
 *   const templateData = await fetchTemplateById(1)
 *   console.log("模板信息:", templateData)
 * } catch (error) {
 *   console.error("获取模板信息失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /templates/{templateId}/ 端点发送GET请求
 * - 如果templateId对应的模板不存在，后端会返回404错误
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 返回的数据类型为TemplateData，具体结构请参考相关接口定义
 */
export const fetchTemplateById = async (
  templateId: number,
  token: string | null
): Promise<TemplateData> => {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
  return response.json()
}

// 创建模板
/**
 * 创建新模板
 *
 * 此函数用于向后端API发送请求创建一个新的模板记录
 *
 * @param data - 模板创建所需的数据对象，必须符合TemplateCreateData接口定义
 *              通常包含模板名称、标识、内容、说明文档等必要字段
 *
 * @param token - 鉴权token
 * @returns Promise<TemplateData> - 返回创建成功的模板数据对象的Promise
 *                                包含新创建模板的所有信息，如ID、名称、内容等
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 创建一个新模板
 * const newTemplateData = {
 *   template_name: "我的模板",
 *   template_slug: "my-template",
 *   template_content: "模板内容",
 *   template_readme: "模板说明"
 * }
 * try {
 *   const createdTemplate = await createTemplate(newTemplateData)
 *   console.log("模板创建成功:", createdTemplate)
 * } catch (error) {
 *   console.error("模板创建失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /templates/ 端点发送POST请求
 * - 传入的data参数必须符合TemplateCreateData接口的结构要求
 * - 请求头设置为application/json格式
 * - 如果后端验证失败，会通过handleResponse函数抛出错误
 */
export const createTemplate = async (
  data: TemplateCreateData,
  token: string | null
): Promise<TemplateData> => {
  const response = await fetch(`${API_BASE_URL}/templates/`, {
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
 * 更新模板信息
 *
 * 此函数用于完全更新指定模板的所有信息，使用 PUT 方法替换整个模板资源
 * 注意：PUT 请求会完全替换目标资源，所以 data 对象应包含模板的所有必要字段
 *
 * @param templateId - 需要更新的模板的唯一标识符（ID）
 *                   必须是已存在的模板ID，否则会返回404错误或创建新资源（取决于后端实现）
 * @param data - 完整的模板更新数据对象，必须符合 TemplateUpdateData 接口定义
 *              应包含模板的所有信息，因为PUT请求会完全替换现有资源
 *              通常包括：模板名称、标识、内容、说明文档、启用状态等所有模板相关字段
 *
 * @param token - 鉴权token
 * @returns Promise<TemplateData> - 返回更新后的完整模板数据对象的Promise
 *                                包含模板的所有信息，包括更新后的字段和可能的服务器生成字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：模板ID不存在、数据验证失败、网络错误等
 *
 * 使用示例:
 * // 更新模板的全部信息
 * const templateUpdateData = {
 *   template_name: "更新后的模板名称",
 *   template_slug: "updated-template",
 *   template_content: "更新后的模板内容",
 *   template_readme: "更新后的模板说明"
 * }
 * try {
 *   const updatedTemplate = await updateTemplate(1, templateUpdateData)
 *   console.log("模板更新成功:", updatedTemplate)
 * } catch (error) {
 *   console.error("模板更新失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /templates/{templateId} 端点发送PUT请求
 * - PUT方法会完全替换目标资源，如果只想更新部分字段，请使用 patchTemplate 函数
 * - 传入的data参数必须是完整的TemplateUpdateData对象，缺少的字段可能会被置空或重置为默认值
 * - 请求头设置为application/json格式
 * - 如果后端验证失败（如字段格式不正确），会通过handleResponse函数抛出错误
 * - 确保templateId是有效的数字ID，且对应模板存在于数据库中
 */
export const updateTemplate = async (
  templateId: number,
  data: TemplateUpdateData,
  token: string | null
): Promise<TemplateData> => {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}/`, {
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
 * 部分更新模板配置
 *
 * 此函数用于部分更新指定模板的配置信息，只更新提供的字段，不会影响其他字段
 * 使用 PATCH 方法，允许单独更新模板内容或说明文档
 *
 * @param templateId - 需要更新的模板的唯一标识符（ID）
 * @param data - 包含需要更新的模板字段的对象，符合 TemplateConfigData 接口定义
 *              可包含以下可选字段：
 *              - template_content: string - 模板内容
 *              - template_readme: string - 模板说明文档内容
 *
 * @param token - 鉴权token
 * @returns Promise<TemplateData> - 返回更新后的完整模板数据对象的Promise
 *                                包含模板的所有信息，包括更新后的字段和未更改的原有字段
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 只更新模板内容
 * const updatedTemplate = await patchTemplate(1, {
 *   template_content: "新的模板内容"
 * })
 *
 * // 只更新模板说明文档
 * const updatedTemplate = await patchTemplate(1, {
 *   template_readme: "这是更新后的模板说明"
 * })
 *
 * // 同时更新内容和说明文档
 * const updatedTemplate = await patchTemplate(1, {
 *   template_content: "新的模板内容",
 *   template_readme: "新的说明文档"
 * })
 *
 * 注意事项:
 * - 该函数会向 /templates/{templateId}/ 端点发送PATCH请求
 * - 与PUT请求不同，PATCH只更新提供的字段，其他字段保持不变
 * - 传入的data参数必须符合TemplateConfigData接口的结构要求
 * - 请求头设置为application/json格式
 * - 如果后端验证失败，会通过handleResponse函数抛出错误
 */
export const patchTemplate = async (
  templateId: number,
  data: TemplateConfigData,
  token: string | null
): Promise<TemplateData> => {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}/`, {
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
 * 切换模板启用状态
 *
 * 此函数用于切换指定模板的启用状态，通过向后端API发送POST请求来更改模板的启用/禁用状态
 *
 * @param templateId - 需要切换启用状态的模板的唯一标识符（ID）
 * @param data - 包含切换状态的数据对象，通常包含启用状态信息
 *              例如: { template_enabled: true/false }
 *
 * @param token - 鉴权token
 * @returns Promise<TemplateData> - 返回更新后的模板数据对象的Promise
 *                                包含模板的所有信息，包括更新后的启用状态
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 启用ID为1的模板
 * const updatedTemplate = await switchTemplate(1, { template_enabled: true })
 *
 * // 禁用ID为5的模板
 * const updatedTemplate = await switchTemplate(5, { template_enabled: false })
 *
 * 注意事项:
 * - 该函数会向 /templates/{templateId}/switch/ 端点发送POST请求
 * - 确保传入的templateId是有效的模板ID
 * - data参数需要符合TemplateSwitchData接口定义的结构
 */
export const switchTemplate = async (
  templateId: number,
  data: TemplateSwitchData,
  token: string | null
): Promise<TemplateData> => {
  const response = await fetch(
    `${API_BASE_URL}/templates/${templateId}/switch/`,
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
 * 删除指定模板
 *
 * 此函数用于向后端API发送DELETE请求，删除指定ID的模板记录
 * 该操作会永久删除模板数据，请在调用前确认用户意图，建议配合确认对话框使用
 *
 * @param templateId - 需要删除的模板的唯一标识符（ID）
 *                   必须是有效的数字ID，对应数据库中存在的模板记录
 *                   删除操作不可逆，请谨慎操作
 *
 * @param token - 鉴权token
 *
 * @returns Promise<Response> - 返回原始响应对象
 *                如果删除成功，响应状态码通常为204 (No Content)
 *                如果删除失败，会通过handleResponse抛出错误
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *                   可能的错误情况：模板ID不存在、权限不足、网络错误等
 *
 * 使用示例:
 * // 删除ID为5的模板
 * try {
 *   const response = await deleteTemplate(5)
 *   console.log("模板删除成功")
 * } catch (error) {
 *   console.error("模板删除失败:", error)
 * }
 *
 * // 在实际应用中，通常与确认对话框结合使用
 * const handleDelete = async (templateId) => {
 *   if (confirm("确定要删除这个模板吗？此操作不可撤销。")) {
 *     try {
 *       await deleteTemplate(templateId)
 *       // 刷新模板列表
 *       refetch()
 *     } catch (error) {
 *       alert("删除失败: " + error.message)
 *     }
 *   }
 * }
 *
 * 注意事项:
 * - 该函数会向 /templates/{templateId}/ 端点发送DELETE请求
 * - 删除操作是永久性的，无法恢复，请确保用户明确意图后再执行
 * - 函数内部使用handleResponse进行错误处理，确保错误被正确抛出
 * - 成功删除后，后端通常返回204状态码，表示资源已成功删除且无响应体
 * - 在UI中建议添加二次确认机制，防止误删操作
 * - 删除后需要手动使相关查询缓存失效，以确保UI显示最新数据
 */
export const deleteTemplate = async (
  templateId: number,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 批量切换模板启用状态
 *
 * 此函数用于批量切换多个模板的启用状态，通过向后端API发送PUT请求来更改多个模板的启用/禁用状态
 *
 * @param data - 包含批量切换状态的数据对象，符合 TemplateBatchSwitchData 接口定义
 *              通常包含以下字段：
 *              - template_ids: number[] - 需要切换状态的模板ID数组
 *              - template_enabled: boolean - 目标启用状态，true为启用，false为禁用
 *
 * @param token - 鉴权token
 * @returns Promise<Record<number, TemplateData>> - 返回操作结果的Promise
 *                                包含模板ID到更新后模板数据的映射
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量启用ID为[1, 2, 3]的模板
 * const result = await batchSwitchTemplates({
 *   template_ids: [1, 2, 3],
 *   template_enabled: true
 * })
 *
 * // 批量禁用ID为[4, 5, 6]的模板
 * const result = await batchSwitchTemplates({
 *   template_ids: [4, 5, 6],
 *   template_enabled: false
 * })
 *
 * 注意事项:
 * - 该函数会向 /templates/switch/ 端点发送PUT请求
 * - 确保传入的template_ids数组中的ID都是有效的模板ID
 * - data参数需要符合TemplateBatchSwitchData接口定义的结构
 * - 此操作是批量操作，会影响多个模板的状态，请谨慎使用
 */
export const batchSwitchTemplates = async (
  data: TemplateBatchSwitchData,
  token: string | null
): Promise<Record<number, TemplateData>> => {
  const response = await fetch(`${API_BASE_URL}/templates/switch/`, {
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

export const batchDeleteTemplates = async (
  templateIds: number[],
  token: string | null
): Promise<Response> => {
  const params = templateIds.map((id) => `template_ids=${id}`).join('&')
  const response = await fetch(`${API_BASE_URL}/templates/?${params}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 同步模板数据
 *
 * 此函数用于触发后端模板数据同步操作，通常用于从外部源（如数据库、API或其他服务）同步最新的模板数据
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
 * // 触发模板数据同步
 * try {
 *   await syncTemplates()
 *   console.log("模板数据同步完成")
 * } catch (error) {
 *   console.error("模板数据同步失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /templates/sync/ 端点发送POST请求
 * - 同步操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，可能需要手动刷新模板列表以显示最新数据
 * - 根据后端实现，同步可能包括添加新模板、更新现有模板或删除不存在的模板
 */
export const syncTemplates = async (token: string | null): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/templates/sync/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
}

/**
 * 导出所有模板数据
 *
 * 此函数用于从后端API导出所有模板数据，通常返回一个包含模板数据的文件
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
 * // 导出所有模板数据
 * try {
 *   const response = await exportTemplates()
 *   // 将响应转换为blob并创建下载链接
 *   const blob = await response.blob()
 *   const url = window.URL.createObjectURL(blob)
 *   const a = document.createElement('a')
 *   a.href = url
 *   a.download = 'templates_export.json'
 *   a.click()
 *   window.URL.revokeObjectURL(url)
 * } catch (error) {
 *   console.error("模板数据导出失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /templates/export/ 端点发送POST请求
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 可能需要处理大文件下载，注意浏览器内存限制
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 */
export const exportTemplates = async (
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/templates/export/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return await handleResponse(response)
}

/**
 * 批量导出指定模板数据
 *
 * 此函数用于从后端API导出指定模板的数据，允许用户选择特定的模板进行导出
 * 适用于只需要导出部分模板数据的场景
 *
 * @param data - 包含批量导出所需数据的对象，必须符合 TemplateBatchExportData 接口定义
 *              通常包含需要导出的模板ID列表等信息
 *
 * @param token
 * @returns Promise<Response> - 返回包含导出数据的Response对象
 *                            可以进一步处理Response对象以获取实际的文件内容
 *
 * @throws {Error} - 当API响应不成功时，会抛出包含错误信息的Error对象
 *
 * 使用示例:
 * // 批量导出指定ID的模板数据
 * const exportData = {
 *   template_ids: [1, 2, 3]  // 需要导出的模板ID列表
 * }
 * try {
 *   const response = await batchExportTemplates(exportData)
 *   const blob = await response.blob()
 *   // 处理下载逻辑...
 * } catch (error) {
 *   console.error("批量导出模板数据失败:", error)
 * }
 *
 * 注意事项:
 * - 该函数会向 /templates/export/ 端点发送PUT请求
 * - 需要提供TemplateBatchExportData格式的数据作为请求体
 * - 请求头设置为application/json格式
 * - 返回的是Response对象，需要进一步处理才能获取文件内容
 * - 导出的文件可能只包含指定ID的模板数据，而不是所有模板
 */
export const batchExportTemplates = async (
  data: TemplateBatchExportData,
  token: string | null
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}/templates/export/`, {
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
 * 获取模板列表的自定义 Hook
 *
 * 此 Hook 封装了获取模板列表的查询逻辑，提供了关键词搜索、启用状态过滤和分页功能
 * 使用 TanStack Query 的 useQuery 来处理数据获取、缓存和状态管理
 *
 * @param template_keyword - 可选参数，用于按关键词搜索模板（例如模板名称或标识）
 *                        当值为 undefined 时，不进行关键词过滤
 * @param template_enabled - 可选参数，用于过滤模板的启用状态
 *                        true: 只返回启用的模板
 *                        false: 只返回禁用的模板
 *                        undefined: 返回所有模板（不考虑启用状态）
 * @param page - 页码，从1开始，默认为1，用于分页查询
 * @param size - 每页返回的数据量，默认为 DEFAULT_PAGE_SIZE 条，最大值取决于后端配置
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的模板数据数组 (TemplateData[])
 *          - isLoading: 数据加载状态
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 获取所有模板
 * const { data, isLoading } = useTemplatesQuery()
 *
 * // 搜索包含"test"关键词的启用模板
 * const { data, isLoading } = useTemplatesQuery("test", true, 1, 20)
 *
 * // 获取所有禁用的模板
 * const { data, isLoading } = useTemplatesQuery(undefined, false)
 *
 * 注意事项:
 * - 查询结果会被缓存，相同参数的查询会返回缓存数据
 * - 查询键(queryKey)包含了所有参数，确保不同参数的查询有独立的缓存
 * - 当参数变化时，会自动触发重新查询
 */
export const useTemplatesQuery = (
  template_keyword: string | undefined = undefined,
  template_enabled: boolean | undefined = undefined,
  page: number = 1,
  size: number = DEFAULT_PAGE_SIZE
) => {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['templates', template_keyword, template_enabled, page, size],
    queryFn: async () => {
      const token = await getToken()
      return fetchTemplates(
        template_keyword,
        template_enabled,
        page,
        size,
        token
      )
    },
    placeholderData: (previousData) => previousData,
  })
}

/**
 * 根据模板ID获取单个模板详细信息的自定义 Hook
 *
 * 此 Hook 封装了获取单个模板详细信息的查询逻辑，使用 TanStack Query 的 useQuery
 * 来处理数据获取、缓存和状态管理。该 Hook 会根据传入的 templateId 参数向后端
 * API 发起请求，获取指定模板的完整信息。
 *
 * @param templateId - 需要获取信息的模板唯一标识符（ID）
 *                    必须是有效的数字ID，对应数据库中存在的模板记录
 *                    如果传入 0 或无效ID，由于 enabled 条件设置，将不会发起请求
 *
 * @returns 返回 useQuery 的结果对象，包含以下主要属性：
 *          - data: 查询到的模板数据 (TemplateData 类型)
 *          - isLoading: 数据加载状态，true 表示正在请求中
 *          - isError: 查询是否出错
 *          - error: 错误信息（如果有的话）
 *          - isFetching: 是否正在获取数据（包括重新验证）
 *          - refetch: 手动重新查询函数
 *
 * 使用示例:
 * // 在组件中使用，获取ID为5的模板信息
 * const { data: template, isLoading, error } = useTemplateQuery(5)
 *
 * if (isLoading) return <div>加载中...</div>
 * if (error) return <div>错误: {error.message}</div>
 * if (template) return <div>模板名称: {template.template_name}</div>
 *
 * // 手动刷新数据
 * const { refetch } = useTemplateQuery(5)
 * const handleRefresh = () => refetch()
 *
 * 注意事项:
 * - 当 templateId 为 0 或无效值时，由于 enabled: !!templateId 设置，不会发起API请求
 * - 查询结果会被缓存，相同 templateId 的查询会返回缓存数据
 * - 查询键(queryKey) 包含 templateId，确保不同模板ID的查询有独立的缓存
 * - 自动集成 Clerk 认证，会在请求头中添加 Bearer Token
 * - 此 Hook 适用于需要显示单个模板详细信息的场景，如模板详情页
 */
export const useTemplateQuery = (templateId: number) => {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: ['template', templateId], // 查询键包含模板ID，确保不同ID有独立缓存
    queryFn: async () => {
      const token = await getToken() // 获取认证token
      return fetchTemplateById(templateId, token) // 调用API获取模板详情
    },
    enabled: !!templateId, // 只有当 templateId 存在且不为0时才启用查询
  })
}

/**
 * 创建模板的自定义 Mutation Hook
 *
 * 此 Hook 封装了创建模板的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 包含自动的数据缓存更新功能，当创建成功后会自动使模板列表缓存失效，触发重新查询
 *
 * 使用场景：
 * - 在表单中提交新模板创建请求
 * - 需要自动更新模板列表显示最新数据
 * - 提供加载状态、错误处理等状态管理功能
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发创建操作的函数
 *          - isLoading: 创建操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 创建成功的模板数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useCreateTemplateMutation()
 *
 * const handleSubmit = async (newTemplateData) => {
 *   try {
 *     const createdTemplate = await mutateAsync(newTemplateData)
 *     console.log('模板创建成功:', createdTemplate)
 *   } catch (err) {
 *     console.error('模板创建失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 创建成功后会自动使 ['templates'] 查询缓存失效，确保列表数据及时更新
 * - mutationFn 直接使用预定义的 createTemplate 函数，确保错误处理一致性
 * - 适用于需要创建单个模板并自动更新UI的场景
 */
export const useCreateTemplateMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: TemplateCreateData) => {
      const token = await getToken()
      return createTemplate(variables, token)
    },
    onSuccess: () => {
      // 创建成功后使模板列表缓存失效，触发重新获取数据
      // 这样可以确保UI显示最新的模板列表，包含新创建的模板
      queryClient.invalidateQueries({ queryKey: ['templates'] })
    },
  })
}

/**
 * 更新模板信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了更新模板的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持完整的模板信息更新（PUT 请求），包括模板名称、标识、内容等所有字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 *
 * 主要功能：
 * - 提交模板的完整更新数据（使用 PUT 方法替换整个资源）
 * - 自动处理缓存失效，确保UI显示最新的模板信息
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发更新操作的函数，需要传入 { templateId: number, data: TemplateUpdateData }
 *          - isLoading: 更新操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 更新成功的模板数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useUpdateTemplateMutation()
 *
 * const handleUpdate = async (templateId, templateData) => {
 *   try {
 *     const params = {
 *       templateId: templateId,
 *       data: templateData  // 符合 TemplateUpdateData 接口的完整模板数据
 *     }
 *     const updatedTemplate = await mutateAsync(params)
 *     console.log('模板更新成功:', updatedTemplate)
 *   } catch (err) {
 *     console.error('模板更新失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 使用 PUT 方法，会完全替换目标模板资源，请确保 data 参数包含模板的所有必要字段
 * - 更新成功后会自动使 ['templates'] 和 ['template', templateId] 查询缓存失效
 * - 适用于需要更新模板全部信息的场景，如果只需要更新部分字段，请使用 usePatchTemplateMutation
 * - templateId 必须是有效的数字ID，且对应模板存在于数据库中
 * - data 参数必须符合 TemplateUpdateData 接口的结构要求
 */
export const useUpdateTemplateMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      templateId: number
      data: TemplateUpdateData
    }) => {
      const token = await getToken()
      return updateTemplate(variables.templateId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使模板列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      // 同时使单个模板详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({
        queryKey: ['template', variables.templateId],
      })
    },
  })
}

/**
 * 部分更新模板信息的自定义 Mutation Hook
 *
 * 此 Hook 封装了部分更新模板的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持部分更新模板信息（PATCH 请求），仅更新提供的字段，不会影响其他字段
 * 包含自动的数据缓存更新功能，更新成功后会自动使相关缓存失效
 *
 * 主要功能：
 * - 提交模板的部分更新数据（使用 PATCH 方法仅更新指定字段）
 * - 自动处理缓存失效，确保UI显示最新的模板信息
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发更新操作的函数，需要传入 { templateId: number, data: TemplateConfigData }
 *          - isLoading: 更新操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 更新成功的模板数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = usePatchTemplateMutation()
 *
 * const handlePatch = async (templateId, patchData) => {
 *   try {
 *     const params = {
 *       templateId: templateId,
 *       data: {  // 符合 TemplateConfigData 接口的部分模板数据
 *         template_content: "更新的模板内容",  // 只更新内容
 *         // 或者
 *         template_readme: "更新的说明文档"  // 只更新说明文档
 *       }
 *     }
 *     const updatedTemplate = await mutateAsync(params)
 *     console.log('模板部分更新成功:', updatedTemplate)
 *   } catch (err) {
 *     console.error('模板部分更新失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 使用 PATCH 方法，只更新提供的字段，其他字段保持不变
 * - 适用于只需要更新模板部分信息的场景，如仅更新内容或说明文档
 * - 更新成功后会自动使 ['templates'] 和 ['template', templateId] 查询缓存失效
 * - templateId 必须是有效的数字ID，且对应模板存在于数据库中
 * - data 参数必须符合 TemplateConfigData 接口的结构要求，可以只包含需要更新的字段
 * - 与 useUpdateTemplateMutation 不同，此 Hook 允许只更新部分字段，不会重置其他字段
 */
export const usePatchTemplateMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      templateId: number
      data: TemplateConfigData
    }) => {
      const token = await getToken()
      return patchTemplate(variables.templateId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 更新成功后使模板列表缓存失效，确保列表显示最新数据
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      // 同时使单个模板详情缓存失效，确保详情页显示最新数据
      queryClient.invalidateQueries({
        queryKey: ['template', variables.templateId],
      })
    },
  })
}

/**
 * 切换模板启用状态的自定义 Mutation Hook
 *
 * 此 Hook 封装了切换模板启用状态的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用切换模板的启用/禁用状态，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送切换模板状态的请求
 * - 自动处理缓存失效，确保UI显示最新的模板状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发切换操作的函数，需要传入 { templateId: number, data: TemplateSwitchData }
 *          - isLoading: 切换操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 切换成功后的模板数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useSwitchTemplateMutation()
 *
 * const handleToggle = async (templateId, enabled) => {
 *   try {
 *     const params = {
 *       templateId: templateId,
 *       data: { template_enabled: enabled }  // TemplateSwitchData 格式的数据
 *     }
 *     const updatedTemplate = await mutateAsync(params)
 *     console.log('模板状态切换成功:', updatedTemplate)
 *   } catch (err) {
 *     console.error('模板状态切换失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /templates/{templateId}/switch/ 端点发送POST请求来切换模板状态
 * - 切换成功后会自动使 ['templates'] 和 ['template', templateId] 查询缓存失效
 * - 适用于需要切换模板启用/禁用状态的场景
 * - templateId 必须是有效的数字ID，且对应模板存在于数据库中
 * - data 参数必须符合 TemplateSwitchData 接口的结构要求
 * - 代码中的 console.log 语句用于调试目的，在生产环境中可能需要移除
 */
export const useSwitchTemplateMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: {
      templateId: number
      data: TemplateSwitchData
    }) => {
      const token = await getToken()
      return switchTemplate(variables.templateId, variables.data, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使模板列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      // 同时使单个模板详情缓存失效，确保详情页显示最新状态
      queryClient.invalidateQueries({
        queryKey: ['template', variables.templateId],
      })
    },
  })
}

/**
 * 批量切换模板启用状态的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量切换多个模板启用状态的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许前端通过 API 调用批量切换多个模板的启用/禁用状态，并自动处理缓存更新
 *
 * 主要功能：
 * - 向后端API发送批量切换模板状态的请求
 * - 自动处理缓存失效，确保UI显示最新的模板状态
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量切换操作的函数，需要传入 TemplateBatchSwitchData 格式的数据
 *          - isLoading: 批量切换操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 批量切换成功后的模板数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchSwitchTemplatesMutation()
 *
 * const handleBatchToggle = async (templateIds, enabled) => {
 *   try {
 *     const params = {
 *       template_ids: templateIds,  // 模板ID数组，例如 [1, 2, 3]
 *       template_enabled: enabled          // 目标启用状态，true为启用，false为禁用
 *     }
 *     const result = await mutateAsync(params)
 *     console.log('批量切换模板状态成功:', result)
 *   } catch (err) {
 *     console.error('批量切换模板状态失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /templates/switch/ 端点发送PUT请求来批量切换模板状态
 * - 批量操作成功后会自动使 ['templates'] 列表查询缓存失效
 * - 同时会使所有被操作的模板详情缓存失效，确保详情页显示最新状态
 * - 适用于需要批量切换多个模板启用/禁用状态的场景
 * - 传入的参数必须符合 TemplateBatchSwitchData 接口的结构要求
 * - 代码会检查 variables.template_ids 是否存在且为数组，确保安全遍历
 */
export const useBatchSwitchTemplatesMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: TemplateBatchSwitchData) => {
      const token = await getToken()
      return batchSwitchTemplates(variables, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使模板列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      // 同时使单个模板详情缓存失效，确保详情页显示最新状态
      if (variables.template_ids && Array.isArray(variables.template_ids)) {
        variables.template_ids.forEach((template_id) => {
          queryClient.invalidateQueries({ queryKey: ['template', template_id] })
        })
      }
    },
  })
}

/**
 * 同步模板数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了同步模板数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 主要功能是触发后端的模板数据同步过程，通常用于从外部源同步最新的模板数据
 *
 * 使用场景：
 * - 需要从外部源同步最新模板数据时
 * - 定期更新模板数据以保持数据一致性
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
 * const { mutateAsync, isLoading, error } = useSyncTemplatesMutation()
 *
 * const handleSync = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('模板数据同步完成')
 *   } catch (err) {
 *     console.error('模板数据同步失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 同步操作可能耗时较长，建议在UI中提供加载状态提示
 * - 操作完成后，可能需要手动刷新模板列表以显示最新数据
 * - 此操作会调用 syncTemplates API 函数，向后端发起同步请求
 */
export const useSyncTemplatesMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      return syncTemplates(token)
    },
  })
}

/**
 * 导出所有模板数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了导出所有模板数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持将模板数据导出为文件并自动下载到本地，通常用于备份或离线分析
 *
 * 主要功能：
 * - 触发后端模板数据导出操作
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
 * const { mutateAsync, isLoading, error } = useExportTemplatesMutation()
 *
 * const handleExport = async () => {
 *   try {
 *     await mutateAsync()
 *     console.log('模板数据导出完成')
 *   } catch (err) {
 *     console.error('模板数据导出失败:', err)
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
export const useExportTemplatesMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async () => {
      const token = await getToken()
      const response = await exportTemplates(token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'templates_export.json' // 使用更具描述性的默认文件名
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
 * 批量导出指定模板数据的自定义 Mutation Hook
 *
 * 此 Hook 封装了批量导出指定模板数据的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 允许用户选择特定的模板进行导出，适用于只需要导出部分模板数据的场景
 *
 * 主要功能：
 * - 触发后端指定模板数据的导出操作
 * - 自动处理导出文件的下载
 * - 从响应头中提取文件名（如果后端提供）
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发批量导出操作的函数，需要传入 TemplateBatchExportData 格式的参数
 *          - isLoading: 导出操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 导出成功后的文件数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useBatchExportTemplatesMutation()
 *
 * const handleBatchExport = async () => {
 *   const exportData = {
 *     template_ids: [1, 2, 3]  // 需要导出的模板ID列表
 *   }
 *   try {
 *     await mutateAsync(exportData)
 *     console.log('批量导出模板数据完成')
 *   } catch (err) {
 *     console.error('批量导出模板数据失败:', err)
 *   }
 * }
 *
 * 注意事项:
 * - 需要传入 TemplateBatchExportData 格式的参数，包含要导出的模板ID列表
 * - 此 Hook 会自动处理文件下载逻辑，包括从响应头获取文件名
 * - 导出的文件格式取决于后端实现，通常为JSON格式
 * - 如果后端没有提供文件名，默认使用 'download.json'
 * - 会自动创建下载链接并触发下载，完成后清理URL对象
 * - 可能需要处理大文件下载，注意浏览器内存限制
 * - 确保传入的 template_ids 数组中的ID都是有效的模板ID
 */
export const useBatchExportTemplatesMutation = () => {
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: TemplateBatchExportData) => {
      const token = await getToken()
      const response = await batchExportTemplates(variables, token)
      const blob = await response.blob()
      // 从响应头中提取文件名（如果后端提供）
      // Content-Disposition 格式通常为 "attachment; filename=filename.json"
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') // 移除可能的引号
        : 'templates_export.json' // 使用更具描述性的默认文件名
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
 * 删除模板的自定义 Mutation Hook
 *
 * 此 Hook 封装了删除模板的逻辑，使用 TanStack Query 的 useMutation 来处理异步操作
 * 支持删除指定ID的模板，并自动处理相关的缓存更新，确保UI界面及时反映数据变化
 *
 * 主要功能：
 * - 向后端API发送删除指定模板的请求
 * - 自动处理缓存失效，确保UI显示最新的模板列表
 * - 提供完整的状态管理（加载中、错误、成功等状态）
 *
 * @returns 返回 useMutation 的结果对象，包含以下主要属性：
 *          - mutate/mutateAsync: 触发删除操作的函数，需要传入 { templateId: number }
 *          - isLoading: 删除操作的加载状态
 *          - isError: 是否发生错误
 *          - error: 错误对象（如果有的话）
 *          - data: 删除操作的响应数据（如果有的话）
 *
 * 使用示例:
 * const { mutateAsync, isLoading, error } = useDeleteTemplateMutation()
 *
 * const handleDelete = async (templateId) => {
 *   try {
 *     await mutateAsync({ templateId })
 *     console.log('模板删除成功')
 *   } catch (err) {
 *     console.error('模板删除失败:', err)
 *   }
 * }
 *
 * // 在组件中结合确认对话框使用
 * const handleDeleteWithConfirm = async (templateId) => {
 *   if (window.confirm('确定要删除这个模板吗？此操作不可撤销。')) {
 *     try {
 *       await mutateAsync({ templateId })
 *       // 可以添加删除成功的提示信息
 *       toast.success('模板删除成功')
 *     } catch (err) {
 *       toast.error('模板删除失败: ' + err.message)
 *     }
 *   }
 * }
 *
 * 注意事项:
 * - 此 Hook 向 /templates/{templateId}/ 端点发送DELETE请求来删除模板
 * - 删除成功后会自动使 ['templates'] 列表查询缓存失效，确保列表显示最新数据
 * - 同时会使 ['template', templateId] 单个模板详情查询缓存失效，避免访问已删除的模板详情
 * - 适用于需要删除单个模板并自动更新UI的场景
 * - templateId 必须是有效的数字ID，且对应模板存在于数据库中
 * - 删除操作是不可逆的，建议在UI中添加确认机制以防止误删
 * - 在实际使用中，通常需要与确认对话框等UI组件配合，以避免意外删除操作
 */
export const useDeleteTemplateMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: { templateId: number }) => {
      const token = await getToken()
      return deleteTemplate(variables.templateId, token)
    },
    onSuccess: (_, variables) => {
      // 删除成功后使模板列表缓存失效，确保列表显示最新状态（已移除被删除的模板）
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      // 同时使单个模板详情缓存失效，确保详情页不会显示已删除的模板信息
      queryClient.invalidateQueries({
        queryKey: ['template', variables.templateId],
      })
    },
  })
}

export const useBatchDeleteTemplatesMutation = () => {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (variables: number[]) => {
      const token = await getToken()
      return batchDeleteTemplates(variables, token)
    },
    onSuccess: (_, variables) => {
      // 状态切换成功后使模板列表缓存失效，确保列表显示最新状态
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      // 同时使单个模板详情缓存失效，确保详情页显示最新状态
      if (variables && Array.isArray(variables)) {
        variables.forEach((templateId) => {
          queryClient.invalidateQueries({ queryKey: ['template', templateId] })
        })
      }
    },
  })
}
