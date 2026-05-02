import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'

// =====================================================================================================================
// 敏感词的基础Schema
// =====================================================================================================================
// region Blackword Schema
/**
 * 敏感词项目基础信息的 Zod 验证模式
 * 包含敏感词的基本元数据和状态信息
 */
export const BlackwordItemSchema = z.object({
  // 敏感词唯一标识符
  blackwords_id: z.number().int(),
  // 创建时间戳
  created_at: z.string(),
  // 更新时间戳
  updated_at: z.string(),
  // 更新者标识
  updated_by: z.string(),
  // 敏感词是否启用状态
  blackwords_enabled: z.boolean(),
  // 敏感词集合名称
  blackwords_name: z.string(),
  // 敏感词集合URL标识符（通常用于路由）
  blackwords_slug: z.string(),
  // 敏感词集合
  blackwords_collection: z.array(z.string()),
  // 敏感词说明文档内容
  blackwords_readme: z.string(),
})

/**
 * 完整敏感词信息的 Zod 验证模式
 * 继承基础敏感词信息，并扩展配置和说明文档字段
 * 适用于敏感词详细信息的完整数据结构验证
 */
export const BlackwordSchema = BlackwordItemSchema.extend({})

/**
 * BlackwordItem 类型定义
 * 从 BlackwordItemSchema 推断出的 TypeScript 类型
 * 用于敏感词基础信息的数据类型标注
 */
export type BlackwordItemData = z.infer<typeof BlackwordItemSchema>

/**
 * Blackword 类型定义
 * 从 BlackwordSchema 推断出的 TypeScript 类型
 * 用于完整敏感词信息的数据类型标注
 */
export type BlackwordData = z.infer<typeof BlackwordSchema>
// endregion

// =====================================================================================================================
// 敏感词的开关Schema
// =====================================================================================================================
// region Blackword Switch Schema

/**
 * 敏感词开关状态的 Zod 验证模式
 * 用于验证敏感词启用/禁用状态更新请求的数据结构
 * 仅包含敏感词启用状态字段，用于单独更新敏感词的启用状态
 *
 * 使用场景：
 * - 敏感词列表页面的快速启用/禁用切换
 * - 单独更新敏感词状态而无需提供其他信息
 * - 状态切换API请求参数验证
 */
export const BlackwordSwitchSchema = z.object({
  // 敏感词启用状态：true表示启用，false表示禁用
  // 该字段用于控制敏感词是否对用户可见和可访问
  blackwords_enabled: z.boolean(),
})

/**
 * BlackwordSwitch 类型定义
 * 从 BlackwordSwitchSchema 推断出的 TypeScript 类型
 * 用于敏感词开关状态数据的类型标注，确保类型安全
 *
 * 该类型通常用于：
 * - API 请求体参数类型
 * - 组件状态管理
 * - 表单数据验证结果
 */
export type BlackwordSwitchData = z.infer<typeof BlackwordSwitchSchema>
// endregion

// =====================================================================================================================
// 敏感词批量开关Schema
// =====================================================================================================================
// region Blackword Batch Switch Schema

/**
 * 敏感词批量开关状态的 Zod 验证模式
 * 用于验证批量更新敏感词启用/禁用状态请求的数据结构
 * 包含多个敏感词ID和统一的状态值，用于批量操作多个敏感词的启用状态
 *
 * 使用场景：
 * - 敏感词管理页面的批量启用/禁用功能
 * - 批量更新多个敏感词的可见性和可访问性状态
 * - 批量状态更新API请求参数验证
 */
export const BlackwordBatchSwitchSchema = z.object({
  // 需要批量操作的敏感词ID数组
  // 该字段包含一个或多个敏感词的唯一标识符，用于指定需要更改状态的敏感词
  blackwords_ids: z.array(z.number().int()),
  // 敏感词启用状态：true表示启用，false表示禁用
  // 该字段用于统一设置所有指定敏感词的启用状态
  blackwords_enabled: z.boolean(),
})

/**
 * BlackwordBatchSwitch 类型定义
 * 从 BlackwordBatchSwitchSchema 推断出的 TypeScript 类型
 * 用于敏感词批量开关状态数据的类型标注，确保类型安全
 *
 * 该类型通常用于：
 * - 批量操作API请求体参数类型
 * - 批量状态更新组件的状态管理
 * - 批量操作表单数据验证结果
 */
export type BlackwordBatchSwitchData = z.infer<
  typeof BlackwordBatchSwitchSchema
>
// endregion

// =====================================================================================================================
// 敏感词批量导出Schema
// =====================================================================================================================
// region Blackword Batch Export Schema

/**
 * 敏感词批量导出的 Zod 验证模式
 * 用于验证批量导出敏感词数据请求的数据结构
 * 包含需要导出的敏感词ID列表，用于批量操作多个敏感词的数据导出
 *
 * 使用场景：
 * - 敏感词管理页面的批量导出功能
 * - 批量获取多个敏感词的数据用于备份或迁移
 * - 批量导出敏感词配置和内容的API请求参数验证
 */
export const BlackwordBatchExportSchema = z.object({
  // 需要批量导出的敏感词ID数组
  // 该字段包含一个或多个敏感词的唯一标识符，用于指定需要导出数据的敏感词
  // 数组中每个ID都应该是正整数，代表一个有效的敏感词记录
  blackwords_ids: z
    .array(z.number().int().positive('敏感词ID必须是正整数'))
    .min(1, '至少需要选择一个敏感词进行导出')
    .max(100, '单次批量导出的敏感词数量不能超过100个'),
})

/**
 * BlackwordBatchExport 类型定义
 * 从 BlackwordBatchExportSchema 推断出的 TypeScript 类型
 * 用于敏感词批量导出数据的类型标注，确保类型安全
 *
 * 该类型通常用于：
 * - 批量导出API请求体参数类型
 * - 批量导出组件的状态管理
 * - 批量导出表单数据验证结果
 */
export type BlackwordBatchExportData = z.infer<
  typeof BlackwordBatchExportSchema
>
// endregion

// =====================================================================================================================
// 敏感词创建Schema
// =====================================================================================================================
// region Blackword Creation Schema
export const BlackwordCreateSchema = z.object({
  // 敏感词集合名称
  blackwords_name: z
    .string()
    .trim()
    .min(2, '敏感词集合名称长度不小于2')
    .max(32, '敏感词集合名称长度不大于32'),
  // 敏感词集合URL标识符（通常用于路由）
  blackwords_slug: z
    .string()
    .trim()
    .min(2, '敏感词标识长度不小于2')
    .max(32, '敏感词标识长度不大于32')
    .regex(
      /^[a-zA-Z0-9\-_]{2,32}$/,
      '敏感词标识应该是字母、数字、连字符或下划线，长度在2到32之间'
    ),
  // 敏感词集合
  blackwords_collection: z.array(z.string()),
  // 敏感词说明文档内容
  blackwords_readme: z.string(),
})

export type BlackwordCreateData = z.infer<typeof BlackwordCreateSchema>
// endregion

// =====================================================================================================================
// 敏感词更新Schema
// =====================================================================================================================
// region Blackword Update Schema
export const BlackwordUpdateSchema = z.object({
  // 敏感词集合名称
  blackwords_name: z
    .string()
    .trim()
    .min(2, '敏感词集合名称长度不小于2')
    .max(32, '敏感词集合名称长度不大于32'),
  // 敏感词集合URL标识符（通常用于路由）
  blackwords_slug: z
    .string()
    .trim()
    .min(2, '敏感词标识长度不小于2')
    .max(32, '敏感词标识长度不大于32')
    .regex(
      /^[a-zA-Z0-9\-_]{2,32}$/,
      '敏感词标识应该是字母、数字、连字符或下划线，长度在2到32之间'
    ),
  // 敏感词集合
  blackwords_collection: z.array(z.string()),
  // 敏感词说明文档内容
  blackwords_readme: z.string(),
})

export type BlackwordUpdateData = z.infer<typeof BlackwordUpdateSchema>
// endregion

// =====================================================================================================================
// 敏感词配置Schema
// =====================================================================================================================
// region Blackword Config Schema
export const BlackwordConfigSchema = z.object({
  // 敏感词集合
  blackwords_collection: z.array(z.string()),
  // 敏感词说明文档内容
  blackwords_readme: z.string(),
})

export type BlackwordConfigData = z.infer<typeof BlackwordConfigSchema>
// endregion

// =====================================================================================================================
// 敏感词集合Schema
// =====================================================================================================================
// region Blackword Collection Schema
export const BlackwordsSchema = z.object({
  // 敏感词列表
  blackwords: z.array(BlackwordSchema),
  // 分页信息
  pagination: PaginationInfoSchema,
})

export type BlackwordsData = z.infer<typeof BlackwordsSchema>
// endregion
