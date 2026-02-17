import { z } from 'zod'
import { WebsiteItemSchema } from '@/features/websites/data/schemas'
import { PaginationInfoSchema } from '@/config/pagination'

// =====================================================================================================================
// 入口点的基础Schema
// =====================================================================================================================
// region Entrypoint Schema
/**
 * 入口点项目基础信息的 Zod 验证模式
 * 包含入口点的基本元数据和状态信息
 */
export const EntrypointItemSchema = z.object({
    // 入口点唯一标识符
    entrypoint_id: z.number().int(),
    // 创建时间戳
    created_at: z.string(),
    // 更新时间戳
    updated_at: z.string(),
    // 更新者标识
    updated_by: z.string(),
    // 抓取开始时间
    begin_at: z.string().nullable(),
    // 抓取结束时间
    end_at: z.string().nullable(),
    // 最小可用间隔（只读）
    min_available_interval: z.number(),
    // 触发时间（只读）
    triggered_at: z.string().nullable(),
    // 入口点是否启用状态
    entrypoint_enabled: z.boolean(),
    // 网站ID
    website_id: z.number().int().nullable(),
    // 网站信息
    website: WebsiteItemSchema.nullable(),
    // 入口点名称
    entrypoint_name: z.string(),
    // 入口点URL标识符（通常用于路由）
    entrypoint_slug: z.string()
      .trim()
      .min(2, '入口点标识长度不小于2')
      .max(64, '入口点标识长度不大于64')
      .regex(/^[a-zA-Z0-9\-_]{2,64}$/, '入口点标识应该是字母、数字、连字符或下划线，长度在2到64之间'),
    // 入口点URL
    entrypoint_url: z.url().optional().nullable(),
    // 入口点配置对象，存储任意键值对配置信息
    entrypoint_config: z.record(z.string(), z.any()),
    // 入口点说明文档内容
    entrypoint_readme: z.string(),
})

/**
 * 完整入口点信息的 Zod 验证模式
 * 继承基础入口点信息，并扩展配置和说明文档字段
 * 适用于入口点详细信息的完整数据结构验证
 */
export const EntrypointSchema = EntrypointItemSchema.extend({

})

/**
 * EntrypointItem 类型定义
 * 从 EntrypointItemSchema 推断出的 TypeScript 类型
 * 用于入口点基础信息的数据类型标注
 */
export type EntrypointItemData = z.infer<typeof EntrypointItemSchema>

/**
 * Entrypoint 类型定义
 * 从 EntrypointSchema 推断出的 TypeScript 类型
 * 用于完整入口点信息的数据类型标注
 */
export type EntrypointData = z.infer<typeof EntrypointSchema>
// endregion


// =====================================================================================================================
// 入口点的开关Schema
// =====================================================================================================================
// region Entrypoint Switch Schema

/**
 * 入口点开关状态的 Zod 验证模式
 * 用于验证入口点启用/禁用状态更新请求的数据结构
 * 仅包含入口点启用状态字段，用于单独更新入口点的启用状态
 * 
 * 使用场景：
 * - 入口点列表页面的快速启用/禁用切换
 * - 单独更新入口点状态而无需提供其他信息
 * - 状态切换API请求参数验证
 */
export const EntrypointSwitchSchema = z.object({
    // 入口点启用状态：true表示启用，false表示禁用
    // 该字段用于控制入口点是否对用户可见和可访问
    entrypoint_enabled: z.boolean(),
})

/**
 * EntrypointSwitch 类型定义
 * 从 EntrypointSwitchSchema 推断出的 TypeScript 类型
 * 用于入口点开关状态数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - API 请求体参数类型
 * - 组件状态管理
 * - 表单数据验证结果
 */
export type EntrypointSwitchData = z.infer<typeof EntrypointSwitchSchema>
// endregion


// =====================================================================================================================
// 入口点批量开关Schema
// =====================================================================================================================
// region Entrypoint Batch Switch Schema

/**
 * 入口点批量开关状态的 Zod 验证模式
 * 用于验证批量更新入口点启用/禁用状态请求的数据结构
 * 包含多个入口点ID和统一的状态值，用于批量操作多个入口点的启用状态
 * 
 * 使用场景：
 * - 入口点管理页面的批量启用/禁用功能
 * - 批量更新多个入口点的可见性和可访问性状态
 * - 批量状态更新API请求参数验证
 */
export const EntrypointBatchSwitchSchema = z.object({
    // 需要批量操作的入口点ID数组
    // 该字段包含一个或多个入口点的唯一标识符，用于指定需要更改状态的入口点
    entrypoint_ids: z.array(z.number().int()),
    // 入口点启用状态：true表示启用，false表示禁用
    // 该字段用于统一设置所有指定入口点的启用状态
    entrypoint_enabled: z.boolean(),
})

/**
 * EntrypointBatchSwitch 类型定义
 * 从 EntrypointBatchSwitchSchema 推断出的 TypeScript 类型
 * 用于入口点批量开关状态数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 批量操作API请求体参数类型
 * - 批量状态更新组件的状态管理
 * - 批量操作表单数据验证结果
 */
export type EntrypointBatchSwitchData = z.infer<typeof EntrypointBatchSwitchSchema>
// endregion


// =====================================================================================================================
// 入口点批量导出Schema
// =====================================================================================================================
// region Entrypoint Batch Export Schema

/**
 * 入口点批量导出的 Zod 验证模式
 * 用于验证批量导出入口点数据请求的数据结构
 * 包含需要导出的入口点ID列表，用于批量操作多个入口点的数据导出
 * 
 * 使用场景：
 * - 入口点管理页面的批量导出功能
 * - 批量获取多个入口点的数据用于备份或迁移
 * - 批量导出入口点配置和内容的API请求参数验证
 */
export const EntrypointBatchExportSchema = z.object({
    // 需要批量导出的入口点ID数组
    // 该字段包含一个或多个入口点的唯一标识符，用于指定需要导出数据的入口点
    // 数组中每个ID都应该是正整数，代表一个有效的入口点记录
    entrypoint_ids: z.array(
        z.number()
          .int()
          .positive('入口点ID必须是正整数')
    ).min(1, '至少需要选择一个入口点进行导出')
     .max(100, '单次批量导出的入口点数量不能超过100个'),
})

/**
 * EntrypointBatchExport 类型定义
 * 从 EntrypointBatchExportSchema 推断出的 TypeScript 类型
 * 用于入口点批量导出数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 批量导出API请求体参数类型
 * - 批量导出组件的状态管理
 * - 批量导出表单数据验证结果
 */
export type EntrypointBatchExportData = z.infer<typeof EntrypointBatchExportSchema>
// endregion



// =====================================================================================================================
// 入口点创建Schema
// =====================================================================================================================
// region Entrypoint Creation Schema
export const EntrypointCreateSchema = z.object({
    // 网站ID
    website_id: z
      .int("请选择正确的网站"),
    // 入口点名称
    entrypoint_name: z.string()
      .trim()
      .min(2, '入口点名称长度不小于2')
      .max(32, '入口点名称长度不大于32'),
    // 入口点URL标识符（通常用于路由）
    entrypoint_slug: z.string()
      .trim()
      .min(2, '入口点标识长度不小于2')
      .max(64, '入口点标识长度不大于64')
      .regex(/^[a-zA-Z0-9\-_]{2,64}$/, '入口点标识应该是字母、数字、连字符或下划线，长度在2到64之间'),
    // 入口点URL
    entrypoint_url: z.url("请输入正确的网址"),
    // 入口点配置对象，存储任意键值对配置信息
    entrypoint_config: z.record(z.string(), z.any()).optional(),
    // 入口点说明文档内容
    entrypoint_readme: z.string().optional(),
})

export type EntrypointCreateData = z.infer<typeof EntrypointCreateSchema>
// endregion


// =====================================================================================================================
// 入口点更新Schema
// =====================================================================================================================
// region Entrypoint Update Schema
export const EntrypointUpdateSchema = z.object({
    // 网站ID
    website_id: z.number().int(),
    // 入口点名称
    entrypoint_name: z.string()
      .trim()
      .min(2, '入口点名称长度不小于2')
      .max(32, '入口点名称长度不大于32'),
    // 入口点URL标识符（通常用于路由）
    entrypoint_slug: z.string()
      .trim()
      .min(2, '入口点标识长度不小于2')
      .max(64, '入口点标识长度不大于64')
      .regex(/^[a-zA-Z0-9\-_]{2,64}$/, '入口点标识应该是字母、数字、连字符或下划线，长度在2到64之间'),
    // 入口点URL
    entrypoint_url: z.url("请输入正确的网址").optional().nullable(),
    // 入口点配置对象，存储任意键值对配置信息
    entrypoint_config: z.record(z.string(), z.any()),
    // 入口点说明文档内容
    entrypoint_readme: z.string(),
})

export type EntrypointUpdateData = z.infer<typeof EntrypointUpdateSchema>
// endregion


// =====================================================================================================================
// 入口点配置Schema
// =====================================================================================================================
// region Entrypoint Config Schema
/**
 * 入口点配置信息的 Zod 验证模式
 * 用于验证入口点配置更新请求的数据结构
 * 包含入口点的配置信息和说明文档内容
 * 
 * 使用场景：
 * - 入口点配置页面的表单验证
 * - 更新入口点配置信息的API请求参数验证
 * - 入口点设置功能的数据验证
 */
export const EntrypointConfigSchema = z.object({
    // 入口点配置对象，存储任意键值对配置信息
    // 用于存储入口点的特定配置参数，如主题设置、功能开关等
    entrypoint_config: z.record(z.string(), z.any()).optional(),
    // 入口点说明文档内容
    // 用于存储入口点的说明文档或描述信息，通常用于展示入口点的用途和使用方法
    entrypoint_readme: z.string().optional(),
})

/**
 * EntrypointConfig 类型定义
 * 从 EntrypointConfigSchema 推断出的 TypeScript 类型
 * 用于入口点配置信息数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 入口点配置相关API响应数据类型
 * - 配置编辑组件的props类型
 * - 配置表单的初始值和验证结果类型
 */
export type EntrypointConfigData = z.infer<typeof EntrypointConfigSchema>
// endregion


// =====================================================================================================================
// 入口点集合Schema
// =====================================================================================================================
// region Entrypoint Collection Schema
/**
 * 入口点列表集合的 Zod 验证模式
 * 用于验证包含多个入口点信息及分页数据的复合数据结构
 * 适用于入口点列表查询API响应数据的验证，包含入口点数据数组和分页信息
 * 
 * 使用场景：
 * - 入口点列表页面的数据获取API响应
 * - 分页查询多个入口点的场景
 * - 入口点管理后台的列表展示功能
 * - 批量获取入口点信息的数据结构验证
 */
export const EntrypointsSchema = z.object({
    // 入口点数据列表
    // 包含多个入口点的详细信息，每个元素都是符合EntrypointSchema格式的完整入口点对象
    entrypoints: z.array(EntrypointItemSchema),
    // 分页信息对象
    // 包含当前页码、总条数、页大小等分页相关的元数据，用于前端分页组件展示
    pagination: PaginationInfoSchema,
})

/**
 * Entrypoints 类型定义
 * 从 EntrypointsSchema 推断出的 TypeScript 类型
 * 用于入口点列表集合数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 入口点列表API响应数据类型
 * - 入口点列表组件的props类型定义
 * - 列表数据状态管理的类型约束
 * - 分页数据处理函数的参数类型
 */
export type EntrypointsData = z.infer<typeof EntrypointsSchema>

/**
 * 生成一个空的用于充当原始数据的entrypointsData对象
 * 用于初始化入口点列表数据，提供默认的空数组和分页信息
 */
export const emptyEntrypointsData: EntrypointsData = {
    entrypoints: [],
    pagination: {
        total: 0,
        page: 1,
        pages: 0,
        size: 50,
        length: 0
    }
}
// endregion