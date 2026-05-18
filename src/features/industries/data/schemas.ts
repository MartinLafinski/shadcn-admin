import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'
import {
  MiniParamFormSchema,
  EntitySpiderTasksCounterSchema,
  EntityMaterialCounterSchema,
} from '@/lib/base-schemas'

// =====================================================================================================================
// 行业的基础Schema
// =====================================================================================================================
// region Industry Schema
/**
 * 行业项目基础信息的 Zod 验证模式
 * 包含行业的基本元数据和状态信息
 */
export const IndustryItemSchema = z
  .object({
    // 行业唯一标识符
    industry_id: z.number().int(),
    // 创建时间戳
    created_at: z.string(),
    // 更新时间戳
    updated_at: z.string(),
    // 更新者标识
    updated_by: z.string(),
    // 创建者标识
    created_by: z.string(),
    // 行业所属入口点数量
    entrypoint_count: z.number().int().optional().nullable(),
    // 行业所属预备作业数量
    prejob_count: z.number().int().optional().nullable(),
    // 行业显示名称
    industry_name: z.string(),
    // 行业URL标识符（通常用于路由）
    industry_slug: z
      .string()
      .trim()
      .min(2, '行业标识长度不小于2')
      .max(32, '行业标识长度不大于32')
      .regex(
        /^[a-zA-Z0-9\-_]{2,32}$/,
        '行业标识应该是字母、数字、连字符或下划线，长度在2到32之间'
      ),
    // 行业配置对象，存储任意键值对配置信息
    industry_config: z.record(z.string(), z.any()),
    // 行业说明文档内容
    industry_readme: z.string(),
    // 行业自用参数要素包标识
    industry_self_param_slug: z.string().nullable().optional(),
    // 行业入口点参数要素包标识
    industry_entrypoint_param_slug: z.string().nullable().optional(),
    // 行业预备作业参数要素包标识
    industry_prejob_param_slug: z.string().nullable().optional(),
    // 行业自用参数要素包
    param_form_self: MiniParamFormSchema.nullable().optional(),
    // 行业指定入口点参数要素包
    param_form_entrypoint: MiniParamFormSchema.nullable().optional(),
    // 行业指定预备作业参数要素包
    param_form_prejob: MiniParamFormSchema.nullable().optional(),
  })
  .extend(EntitySpiderTasksCounterSchema.shape)
  .extend(EntityMaterialCounterSchema.shape)

/**
 * 完整行业信息的 Zod 验证模式
 * 继承基础行业信息，并扩展配置和说明文档字段
 * 适用于行业详细信息的完整数据结构验证
 */
export const IndustrySchema = IndustryItemSchema.extend({})

/**
 * IndustryItem 类型定义
 * 从 IndustryItemSchema 推断出的 TypeScript 类型
 * 用于行业基础信息的数据类型标注
 */
export type IndustryItemData = z.infer<typeof IndustryItemSchema>

/**
 * Industry 类型定义
 * 从 IndustrySchema 推断出的 TypeScript 类型
 * 用于完整行业信息的数据类型标注
 */
export type IndustryData = z.infer<typeof IndustrySchema>
// endregion

// =====================================================================================================================
// 行业批量导出Schema
// =====================================================================================================================
// region Industry Batch Export Schema

/**
 * 行业批量导出的 Zod 验证模式
 * 用于验证批量导出行业数据请求的数据结构
 * 包含需要导出的行业ID列表，用于批量操作多个行业的数据导出
 *
 * 使用场景：
 * - 行业管理页面的批量导出功能
 * - 批量获取多个行业的数据用于备份或迁移
 * - 批量导出行业配置和内容的API请求参数验证
 */
export const IndustryBatchExportSchema = z.object({
  // 需要批量导出的行业ID数组
  // 该字段包含一个或多个行业的唯一标识符，用于指定需要导出数据的行业
  // 数组中每个ID都应该是正整数，代表一个有效的行业记录
  industry_ids: z
    .array(z.number().int().positive('行业ID必须是正整数'))
    .min(1, '至少需要选择一个行业进行导出')
    .max(100, '单次批量导出的行业数量不能超过100个'),
})

/**
 * IndustryBatchExport 类型定义
 * 从 IndustryBatchExportSchema 推断出的 TypeScript 类型
 * 用于行业批量导出数据的类型标注，确保类型安全
 *
 * 该类型通常用于：
 * - 批量导出API请求体参数类型
 * - 批量导出组件的状态管理
 * - 批量导出表单数据验证结果
 */
export type IndustryBatchExportData = z.infer<typeof IndustryBatchExportSchema>
// endregion

// =====================================================================================================================
// 行业创建Schema
// =====================================================================================================================
// region Industry Creation Schema
export const IndustryCreateSchema = z.object({
  // 行业显示名称
  industry_name: z
    .string()
    .trim()
    .min(2, '行业名称长度不小于2')
    .max(32, '行业名称长度不大于32'),
  // 行业URL标识符（通常用于路由）
  industry_slug: z
    .string()
    .trim()
    .min(2, '行业标识长度不小于2')
    .max(32, '行业标识长度不大于32')
    .regex(
      /^[a-zA-Z0-9\-_]{2,32}$/,
      '行业标识应该是字母、数字、连字符或下划线，长度在2到32之间'
    ),
  // 行业配置对象，存储任意键值对配置信息
  industry_config: z.record(z.string(), z.any()).optional(),
  // 行业说明文档内容
  industry_readme: z.string().optional(),
  // 行业自用参数要素包标识
  industry_self_param_slug: z.string().optional(),
  // 行业入口点参数要素包标识
  industry_entrypoint_param_slug: z.string().optional(),
  // 行业预备作业参数要素包标识
  industry_prejob_param_slug: z.string().optional(),
})

export type IndustryCreateData = z.infer<typeof IndustryCreateSchema>
// endregion

// =====================================================================================================================
// 行业更新Schema
// =====================================================================================================================
// region Industry Update Schema
export const IndustryUpdateSchema = z.object({
  // 行业显示名称
  industry_name: z
    .string()
    .trim()
    .min(2, '行业名称长度不小于2')
    .max(32, '行业名称长度不大于32'),
  // 行业URL标识符（通常用于路由）
  industry_slug: z
    .string()
    .trim()
    .min(2, '行业标识长度不小于2')
    .max(32, '行业标识长度不大于32')
    .regex(
      /^[a-zA-Z0-9\-_]{2,32}$/,
      '行业标识应该是字母、数字、连字符或下划线，长度在2到32之间'
    ),
  // 行业自用参数要素包标识
  industry_self_param_slug: z.string().optional(),
  // 行业入口点参数要素包标识
  industry_entrypoint_param_slug: z.string().optional(),
  // 行业预备作业参数要素包标识
  industry_prejob_param_slug: z.string().optional(),
})

export type IndustryUpdateData = z.infer<typeof IndustryUpdateSchema>
// endregion

// =====================================================================================================================
// 行业配置Schema
// =====================================================================================================================
// region Industry Config Schema
/**
 * 行业配置信息的 Zod 验证模式
 * 用于验证行业配置更新请求的数据结构
 * 包含行业的配置信息和说明文档内容
 *
 * 使用场景：
 * - 行业配置页面的表单验证
 * - 更新行业配置信息的API请求参数验证
 * - 行业设置功能的数据验证
 */
export const IndustryConfigSchema = z.object({
  // 行业配置对象，存储任意键值对配置信息
  // 用于存储行业的特定配置参数，如主题设置、功能开关等
  industry_config: z.record(z.string(), z.any()).optional(),
  // 行业说明文档内容
  // 用于存储行业的说明文档或描述信息，通常用于展示行业的用途和使用方法
  industry_readme: z.string().optional(),
})

/**
 * IndustryConfig 类型定义
 * 从 IndustryConfigSchema 推断出的 TypeScript 类型
 * 用于行业配置信息数据的类型标注，确保类型安全
 *
 * 该类型通常用于：
 * - 行业配置相关API响应数据类型
 * - 配置编辑组件的props类型
 * - 配置表单的初始值和验证结果类型
 */
export type IndustryConfigData = z.infer<typeof IndustryConfigSchema>
// endregion

// =====================================================================================================================
// 行业集合Schema
// =====================================================================================================================
// region Industry Collection Schema
/**
 * 行业列表集合的 Zod 验证模式
 * 用于验证包含多个行业信息及分页数据的复合数据结构
 * 适用于行业列表查询API响应数据的验证，包含行业数据数组和分页信息
 *
 * 使用场景：
 * - 行业列表页面的数据获取API响应
 * - 分页查询多个行业的场景
 * - 行业管理后台的列表展示功能
 * - 批量获取行业信息的数据结构验证
 */
export const IndustriesSchema = z.object({
  // 行业数据列表
  // 包含多个行业的详细信息，每个元素都是符合IndustrySchema格式的完整行业对象
  industries: z.array(IndustrySchema),
  // 分页信息对象
  // 包含当前页码、总条数、页大小等分页相关的元数据，用于前端分页组件展示
  pagination: PaginationInfoSchema,
})

/**
 * Industries 类型定义
 * 从 IndustriesSchema 推断出的 TypeScript 类型
 * 用于行业列表集合数据的类型标注，确保类型安全
 *
 * 该类型通常用于：
 * - 行业列表API响应数据类型
 * - 行业列表组件的props类型定义
 * - 列表数据状态管理的类型约束
 * - 分页数据处理函数的参数类型
 */
export type IndustriesData = z.infer<typeof IndustriesSchema>

/**
 * 生成一个空的用于充当原始数据的industriesData对象
 * 用于初始化行业列表数据，提供默认的空数组和分页信息
 */
export const emptyIndustriesData: IndustriesData = {
  industries: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    size: 50,
    length: 0,
  },
}
// endregion

// =====================================================================================================================
// 行业同步Schema
// =====================================================================================================================
// region Industry Sync Schema
/**
 * 行业同步操作的 Zod 验证模式
 * 用于验证行业同步请求的数据结构
 */
export const IndustrySyncSchema = z.object({
  clear_entrypoints: z.boolean(),
  clear_prejobs: z.boolean(),
  clear_spider_tasks: z.boolean(),
  only_clear: z.boolean(),
})

/**
 * IndustrySync 类型定义
 * 从 IndustrySyncSchema 推断出的 TypeScript 类型
 */
export type IndustrySyncData = z.infer<typeof IndustrySyncSchema>
// endregion
