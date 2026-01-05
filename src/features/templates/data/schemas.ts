import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'

// =====================================================================================================================
// 模板的基础Schema
// =====================================================================================================================
// region Template Schema
/**
 * 模板项目基础信息的 Zod 验证模式
 * 包含模板的基本元数据和状态信息
 */
export const TemplateItemSchema = z.object({
    // 模板唯一标识符
    template_id: z.number().int(),
    // 创建时间戳
    created_at: z.string(),
    // 更新时间戳
    updated_at: z.string(),
    // 更新者标识
    updated_by: z.string(),
    // 模板是否启用状态
    template_enabled: z.boolean(),
    // 模板显示名称
    template_name: z.string(),
    // 模板URL标识符（通常用于路由）
    template_slug: z.string(),
    // 模板内容
    template_content: z.string().optional().nullable(),
    // 模板说明文档内容
    template_readme: z.string(),
})

/**
 * 完整模板信息的 Zod 验证模式
 * 继承基础模板信息，并扩展配置和说明文档字段
 * 适用于模板详细信息的完整数据结构验证
 */
export const TemplateSchema = TemplateItemSchema.extend({

})

/**
 * TemplateItem 类型定义
 * 从 TemplateItemSchema 推断出的 TypeScript 类型
 * 用于模板基础信息的数据类型标注
 */
export type TemplateItemData = z.infer<typeof TemplateItemSchema>

/**
 * Template 类型定义
 * 从 TemplateSchema 推断出的 TypeScript 类型
 * 用于完整模板信息的数据类型标注
 */
export type TemplateData = z.infer<typeof TemplateSchema>
// endregion


// =====================================================================================================================
// 模板的开关Schema
// =====================================================================================================================
// region Template Switch Schema

/**
 * 模板开关状态的 Zod 验證模式
 * 用于验证模板启用/禁用状态更新请求的数据结构
 * 仅包含模板启用状态字段，用于单独更新模板的启用状态
 * 
 * 使用场景：
 * - 模板列表页面的快速启用/禁用切换
 * - 单独更新模板状态而无需提供其他信息
 * - 状态切换API请求参数验证
 */
export const TemplateSwitchSchema = z.object({
    // 模板启用状态：true表示启用，false表示禁用
    // 该字段用于控制模板是否对用户可见和可访问
    template_enabled: z.boolean(),
})

/**
 * TemplateSwitch 类型定义
 * 从 TemplateSwitchSchema 推断出的 TypeScript 类型
 * 用于模板开关状态数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - API 请求体参数类型
 * - 组件状态管理
 * - 表单数据验证结果
 */
export type TemplateSwitchData = z.infer<typeof TemplateSwitchSchema>
// endregion


// =====================================================================================================================
// 模板批量开关Schema
// =====================================================================================================================
// region Template Batch Switch Schema

/**
 * 模板批量开关状态的 Zod 验證模式
 * 用于验证批量更新模板启用/禁用状态请求的数据结构
 * 包含多个模板ID和统一的状态值，用于批量操作多个模板的启用状态
 * 
 * 使用场景：
 * - 模板管理页面的批量启用/禁用功能
 * - 批量更新多个模板的可见性和可访问性状态
 * - 批量状态更新API请求参数验证
 */
export const TemplateBatchSwitchSchema = z.object({
    // 需要批量操作的模板ID数组
    // 该字段包含一个或多个模板的唯一标识符，用于指定需要更改状态的模板
    template_ids: z.array(z.number().int()),
    // 模板启用状态：true表示启用，false表示禁用
    // 该字段用于统一设置所有指定模板的启用状态
    template_enabled: z.boolean(),
})

/**
 * TemplateBatchSwitch 类型定义
 * 从 TemplateBatchSwitchSchema 推断出的 TypeScript 类型
 * 用于模板批量开关状态数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 批量操作API请求体参数类型
 * - 批量状态更新组件的状态管理
 * - 批量操作表单数据验证结果
 */
export type TemplateBatchSwitchData = z.infer<typeof TemplateBatchSwitchSchema>
// endregion


// =====================================================================================================================
// 模板批量导出Schema
// =====================================================================================================================
// region Template Batch Export Schema

/**
 * 模板批量导出的 Zod 验證模式
 * 用于验证批量导出模板数据请求的数据结构
 * 包含需要导出的模板ID列表，用于批量操作多个模板的数据导出
 * 
 * 使用场景：
 * - 模板管理页面的批量导出功能
 * - 批量获取多个模板的数据用于备份或迁移
 * - 批量导出模板配置和内容的API请求参数验证
 */
export const TemplateBatchExportSchema = z.object({
    // 需要批量导出的模板ID数组
    // 该字段包含一个或多个模板的唯一标识符，用于指定需要导出数据的模板
    // 数组中每个ID都应该是正整数，代表一个有效的模板记录
    template_ids: z.array(
        z.number()
          .int()
          .positive('模板ID必须是正整数')
    ).min(1, '至少需要选择一个模板进行导出')
     .max(100, '单次批量导出的模板数量不能超过100个'),
})

/**
 * TemplateBatchExport 类型定义
 * 从 TemplateBatchExportSchema 推断出的 TypeScript 类型
 * 用于模板批量导出数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 批量导出API请求体参数类型
 * - 批量导出组件的状态管理
 * - 批量导出表单数据验证结果
 */
export type TemplateBatchExportData = z.infer<typeof TemplateBatchExportSchema>
// endregion



// =====================================================================================================================
// 模板创建Schema
// =====================================================================================================================
// region Template Creation Schema
export const TemplateCreateSchema = z.object({
    // 模板显示名称
    template_name: z.string()
      .trim()
      .min(2, '模板名称长度不小于2')
      .max(32, '模板名称长度不大于32'),
    // 模板URL标识符（通常用于路由）
    template_slug: z.string()
      .trim()
      .min(2, '模板标识长度不小于2')
      .max(32, '模板标识长度不大于32')
      .regex(/^[a-zA-Z0-9\-_]{2,32}$/, '模板标识应该是字母、数字、连字符或下划线，长度在2到32之间'),
    // 模板内容
    template_content: z.string().optional(),
    // 模板说明文档内容
    template_readme: z.string(),
})

export type TemplateCreateData = z.infer<typeof TemplateCreateSchema>
// endregion


// =====================================================================================================================
// 模板更新Schema
// =====================================================================================================================
// region Template Update Schema
export const TemplateUpdateSchema = z.object({
    // 模板显示名称
    template_name: z.string()
      .trim()
      .min(2, '模板名称长度不小于2')
      .max(32, '模板名称长度不大于32'),
    // 模板URL标识符（通常用于路由）
    template_slug: z.string()
      .trim()
      .min(2, '模板标识长度不小于2')
      .max(32, '模板标识长度不大于32')
      .regex(/^[a-zA-Z0-9\-_]{2,32}$/, '模板标识应该是字母、数字、连字符或下划线，长度在2到32之间'),
    // 模板内容
    template_content: z.string().optional(),
    // 模板说明文档内容
    template_readme: z.string(),
})

export type TemplateUpdateData = z.infer<typeof TemplateUpdateSchema>
// endregion


// =====================================================================================================================
// 模板配置Schema
// =====================================================================================================================
// region Template Config Schema
/**
 * 模板配置信息的 Zod 验证模式
 * 用于验证模板的配置内容和说明文档数据结构
 * 
 * 该 Schema 专门用于模板内容和说明文档的更新操作
 * 不包含模板的元数据（如ID、名称、状态等），仅关注模板的具体配置内容
 * 
 * 使用场景：
 * - 模板内容编辑页面的表单验证
 * - 模板配置更新API请求参数验证
 * - 模板说明文档更新操作
 * - 模板配置数据的类型安全校验
 */
export const TemplateConfigSchema = z.object({
    // 模板内容字段 - 可选字段
    // 存储模板的实际内容数据，可以是HTML、JSON或其他格式的模板内容
    // 在某些场景下可能为空（例如仅更新说明文档时），所以设置为可选
    template_content: z.string().optional(),
    // 模板说明文档内容 - 必填字段
    // 存储模板的使用说明、开发文档或其他相关说明信息
    // 通常以Markdown格式存储，用于指导用户如何使用该模板
    template_readme: z.string(),
})

/**
 * TemplateConfig 类型定义
 * 从 TemplateConfigSchema 推断出的 TypeScript 类型
 * 用于模板配置信息数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 模板配置编辑表单的数据类型
 * - 模板配置更新API的请求/响应数据类型
 * - 模板内容编辑器组件的props类型
 * - 模板配置相关的状态管理类型定义
 */
export type TemplateConfigData = z.infer<typeof TemplateConfigSchema>
// endregion


// =====================================================================================================================
// 模板集合Schema
// =====================================================================================================================
// region Template Collection Schema
/**
 * 模板集合的 Zod 验证模式
 * 用于验证包含多个模板数据和分页信息的响应结构
 * 
 * 该 Schema 适用于以下场景：
 * - 模板列表页面的 API 响应数据验证
 * - 分页查询模板数据的结果验证
 * - 模板管理页面的批量数据传输验证
 * 
 * 数据结构包括：
 * - templates: TemplateSchema 对象的数组，包含当前页的所有模板数据
 * - pagination: PaginationInfoSchema 对象，包含分页相关信息（总数量、当前页、页大小等）
 */
export const TemplatesSchema = z.object({
    // 模板数据列表 - 包含当前页所有模板的数组
    // 数组中的每个元素都是符合 TemplateSchema 验证规则的完整模板信息对象
    templates: z.array(TemplateSchema),
    // 分页信息 - 包含当前查询结果的分页相关数据
    // 使用 PaginationInfoSchema 验证分页参数的格式和类型，确保分页数据的准确性
    pagination: PaginationInfoSchema,
})

/**
 * Templates 类型定义
 * 从 TemplatesSchema 推断出的 TypeScript 类型
 * 用于模板集合数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 模板列表 API 响应数据类型
 * - 模板列表组件的 props 类型
 * - 模板数据状态管理的类型定义
 * - 模板分页数据的类型验证
 */
export type TemplatesData = z.infer<typeof TemplatesSchema>
// endregion