import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'

// =====================================================================================================================
// 友链的基础Schema
// =====================================================================================================================
// region Link Schema
/**
 * 友链项目基础信息的 Zod 验证模式
 * 包含友链的基本元数据和状态信息
 */
export const LinkItemSchema = z.object({
    // 友链唯一标识符
    links_id: z.number().int(),
    // 创建时间戳
    created_at: z.string(),
    // 更新时间戳
    updated_at: z.string(),
    // 更新者标识
    updated_by: z.string(),
    // 友链是否启用状态
    links_enabled: z.boolean(),
    // 友链集合名称
    links_name: z.string(),
    // 友链集合标识符（通常用于路由）
    links_slug: z.string(),
    // 友链集合，包含友链URL数组
    links_collection: z.array(z.string()),
    // 友链说明文档内容
    links_readme: z.string(),
})

/**
 * 完整友链信息的 Zod 验证模式
 * 继承基础友链信息，并扩展配置和说明文档字段
 * 适用于友链详细信息的完整数据结构验证
 */
export const LinkSchema = LinkItemSchema.extend({

})

/**
 * LinkItem 类型定义
 * 从 LinkItemSchema 推断出的 TypeScript 类型
 * 用于友链基础信息的数据类型标注
 */
export type LinkItemData = z.infer<typeof LinkItemSchema>

/**
 * Link 类型定义
 * 从 LinkSchema 推断出的 TypeScript 类型
 * 用于完整友链信息的数据类型标注
 */
export type LinkData = z.infer<typeof LinkSchema>
// endregion


// =====================================================================================================================
// 友链的开关Schema
// =====================================================================================================================
// region Link Switch Schema

/**
 * 友链开关状态的 Zod 验证模式
 * 用于验证友链启用/禁用状态更新请求的数据结构
 * 仅包含友链启用状态字段，用于单独更新友链的启用状态
 * 
 * 使用场景：
 * - 友链列表页面的快速启用/禁用切换
 * - 单独更新友链状态而无需提供其他信息
 * - 状态切换API请求参数验证
 */
export const LinkSwitchSchema = z.object({
    // 友链启用状态：true表示启用，false表示禁用
    // 该字段用于控制友链是否对用户可见和可访问
    links_enabled: z.boolean(),
})

/**
 * LinkSwitch 类型定义
 * 从 LinkSwitchSchema 推断出的 TypeScript 类型
 * 用于友链开关状态数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - API 请求体参数类型
 * - 组件状态管理
 * - 表单数据验证结果
 */
export type LinkSwitchData = z.infer<typeof LinkSwitchSchema>
// endregion


// =====================================================================================================================
// 友链批量开关Schema
// =====================================================================================================================
// region Link Batch Switch Schema

/**
 * 友链批量开关状态的 Zod 验证模式
 * 用于验证批量更新友链启用/禁用状态请求的数据结构
 * 包含多个友链ID和统一的状态值，用于批量操作多个友链的启用状态
 * 
 * 使用场景：
 * - 友链管理页面的批量启用/禁用功能
 * - 批量更新多个友链的可见性和可访问性状态
 * - 批量状态更新API请求参数验证
 */
export const LinkBatchSwitchSchema = z.object({
    // 需要批量操作的友链ID数组
    // 该字段包含一个或多个友链的唯一标识符，用于指定需要更改状态的友链
    links_ids: z.array(z.number().int()),
    // 友链启用状态：true表示启用，false表示禁用
    // 该字段用于统一设置所有指定友链的启用状态
    links_enabled: z.boolean(),
})

/**
 * LinkBatchSwitch 类型定义
 * 从 LinkBatchSwitchSchema 推断出的 TypeScript 类型
 * 用于友链批量开关状态数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 批量操作API请求体参数类型
 * - 批量状态更新组件的状态管理
 * - 批量操作表单数据验证结果
 */
export type LinkBatchSwitchData = z.infer<typeof LinkBatchSwitchSchema>
// endregion


// =====================================================================================================================
// 友链批量导出Schema
// =====================================================================================================================
// region Link Batch Export Schema

/**
 * 友链批量导出的 Zod 验证模式
 * 用于验证批量导出友链数据请求的数据结构
 * 包含需要导出的友链ID列表，用于批量操作多个友链的数据导出
 * 
 * 使用场景：
 * - 友链管理页面的批量导出功能
 * - 批量获取多个友链的数据用于备份或迁移
 * - 批量导出友链配置和内容的API请求参数验证
 */
export const LinkBatchExportSchema = z.object({
    // 需要批量导出的友链ID数组
    // 该字段包含一个或多个友链的唯一标识符，用于指定需要导出数据的友链
    // 数组中每个ID都应该是正整数，代表一个有效的友链记录
    links_ids: z.array(
        z.number()
          .int()
          .positive('友链ID必须是正整数')
    ).min(1, '至少需要选择一个友链进行导出')
     .max(100, '单次批量导出的友链数量不能超过100个'),
})

/**
 * LinkBatchExport 类型定义
 * 从 LinkBatchExportSchema 推断出的 TypeScript 类型
 * 用于友链批量导出数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 批量导出API请求体参数类型
 * - 批量导出组件的状态管理
 * - 批量导出表单数据验证结果
 */
export type LinkBatchExportData = z.infer<typeof LinkBatchExportSchema>
// endregion



// =====================================================================================================================
// 友链创建Schema
// =====================================================================================================================
// region Link Creation Schema
export const LinkCreateSchema = z.object({
    // 友链集合名称
    links_name: z.string()
      .trim()
      .min(2, '友链集合名称长度不小于2')
      .max(32, '友链集合名称长度不大于32'),
    // 友链集合标识符（通常用于路由）
    links_slug: z.string()
      .trim()
      .min(2, '友链集合标识长度不小于2')
      .max(32, '友链集合标识长度不大于32')
      .regex(/^[a-zA-Z0-9\-_]{2,64}$/, '友链集合标识应该是字母、数字、连字符或下划线，长度在2到64之间'),
    // 友链集合，包含友链URL数组
    links_collection: z.array(z.string()).optional(),
    // 友链说明文档内容
    links_readme: z.string().optional().default(""),
})

export type LinkCreateData = z.infer<typeof LinkCreateSchema>
// endregion


// =====================================================================================================================
// 友链更新Schema
// =====================================================================================================================
// region Link Update Schema
export const LinkUpdateSchema = z.object({
    // 友链集合名称
    links_name: z.string()
      .trim()
      .min(2, '友链集合名称长度不小于2')
      .max(32, '友链集合名称长度不大于32'),
    // 友链集合标识符（通常用于路由）
    links_slug: z.string()
      .trim()
      .min(2, '友链集合标识长度不小于2')
      .max(32, '友链集合标识长度不大于32')
      .regex(/^[a-zA-Z0-9\-_]{2,64}$/, '友链集合标识应该是字母、数字、连字符或下划线，长度在2到64之间'),
    // 友链集合，包含友链URL数组
    links_collection: z.array(z.string()),
    // 友链说明文档内容
    links_readme: z.string().optional(),
})

export type LinkUpdateData = z.infer<typeof LinkUpdateSchema>
// endregion


// =====================================================================================================================
// 友链配置Schema
// =====================================================================================================================
// region Link Config Schema
/**
 * 友链配置信息的 Zod 验证模式
 * 用于验证友链配置更新请求的数据结构
 * 包含友链的集合和说明文档内容
 * 
 * 使用场景：
 * - 友链配置页面的表单验证
 * - 更新友链配置信息的API请求参数验证
 * - 友链设置功能的数据验证
 */
export const LinkConfigSchema = z.object({
    // 友链集合，包含友链URL数组
    // 用于存储友链的URL集合，可以包含任意数量的友链地址
    links_collection: z.array(z.string()).optional(),
    // 友链说明文档内容
    // 用于存储友链的说明文档或描述信息，通常用于展示友链的用途和使用方法
    links_readme: z.string().optional(),
})

/**
 * LinkConfig 类型定义
 * 从 LinkConfigSchema 推断出的 TypeScript 类型
 * 用于友链配置信息数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 友链配置相关API响应数据类型
 * - 配置编辑组件的props类型
 * - 配置表单的初始值和验证结果类型
 */
export type LinkConfigData = z.infer<typeof LinkConfigSchema>
// endregion


// =====================================================================================================================
// 友链集合Schema
// =====================================================================================================================
// region Link Collection Schema
/**
 * 友链列表集合的 Zod 验证模式
 * 用于验证包含多个友链信息及分页数据的复合数据结构
 * 适用于友链列表查询API响应数据的验证，包含友链数据数组和分页信息
 * 
 * 使用场景：
 * - 友链列表页面的数据获取API响应
 * - 分页查询多个友链的场景
 * - 友链管理后台的列表展示功能
 * - 批量获取友链信息的数据结构验证
 */
export const LinksSchema = z.object({
    // 友链数据列表
    // 包含多个友链的详细信息，每个元素都是符合LinkSchema格式的完整友链对象
    links: z.array(LinkSchema),
    // 分页信息对象
    // 包含当前页码、总条数、页大小等分页相关的元数据，用于前端分页组件展示
    pagination: PaginationInfoSchema,
})

/**
 * Links 类型定义
 * 从 LinksSchema 推断出的 TypeScript 类型
 * 用于友链列表集合数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 友链列表API响应数据类型
 * - 友链列表组件的props类型定义
 * - 列表数据状态管理的类型约束
 * - 分页数据处理函数的参数类型
 */
export type LinksData = z.infer<typeof LinksSchema>
// endregion