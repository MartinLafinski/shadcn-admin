import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'

// =====================================================================================================================
// 网站的基础Schema
// =====================================================================================================================
// region Website Schema
/**
 * 网站项目基础信息的 Zod 验证模式
 * 包含网站的基本元数据和状态信息
 */
export const WebsiteItemSchema = z.object({
    // 网站唯一标识符
    website_id: z.number().int(),
    // 创建时间戳
    created_at: z.string(),
    // 更新时间戳
    updated_at: z.string(),
    // 更新者标识
    updated_by: z.string(),
    // 网站是否启用状态
    website_enabled: z.boolean(),
    // 网站显示名称
    website_name: z.string(),
    // 网站URL标识符（通常用于路由）
    website_slug: z.string(),
    // 网站访问URL（可选字段）
    website_url: z.url().optional().nullable(),
    // 网站配置对象，存储任意键值对配置信息
    website_config: z.record(z.string(), z.any()),
    // 网站说明文档内容
    website_readme: z.string(),
})

/**
 * 完整网站信息的 Zod 验证模式
 * 继承基础网站信息，并扩展配置和说明文档字段
 * 适用于网站详细信息的完整数据结构验证
 */
export const WebsiteSchema = WebsiteItemSchema.extend({

})

/**
 * WebsiteItem 类型定义
 * 从 WebsiteItemSchema 推断出的 TypeScript 类型
 * 用于网站基础信息的数据类型标注
 */
export type WebsiteItemData = z.infer<typeof WebsiteItemSchema>

/**
 * Website 类型定义
 * 从 WebsiteSchema 推断出的 TypeScript 类型
 * 用于完整网站信息的数据类型标注
 */
export type WebsiteData = z.infer<typeof WebsiteSchema>
// endregion


// =====================================================================================================================
// 网站的开关Schema
// =====================================================================================================================
// region Website Switch Schema

/**
 * 网站开关状态的 Zod 验证模式
 * 用于验证网站启用/禁用状态更新请求的数据结构
 * 仅包含网站启用状态字段，用于单独更新网站的启用状态
 * 
 * 使用场景：
 * - 网站列表页面的快速启用/禁用切换
 * - 单独更新网站状态而无需提供其他信息
 * - 状态切换API请求参数验证
 */
export const WebsiteSwitchSchema = z.object({
    // 网站启用状态：true表示启用，false表示禁用
    // 该字段用于控制网站是否对用户可见和可访问
    website_enabled: z.boolean(),
})

/**
 * WebsiteSwitch 类型定义
 * 从 WebsiteSwitchSchema 推断出的 TypeScript 类型
 * 用于网站开关状态数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - API 请求体参数类型
 * - 组件状态管理
 * - 表单数据验证结果
 */
export type WebsiteSwitchData = z.infer<typeof WebsiteSwitchSchema>
// endregion


// =====================================================================================================================
// 网站批量开关Schema
// =====================================================================================================================
// region Website Batch Switch Schema

/**
 * 网站批量开关状态的 Zod 验证模式
 * 用于验证批量更新网站启用/禁用状态请求的数据结构
 * 包含多个网站ID和统一的状态值，用于批量操作多个网站的启用状态
 * 
 * 使用场景：
 * - 网站管理页面的批量启用/禁用功能
 * - 批量更新多个网站的可见性和可访问性状态
 * - 批量状态更新API请求参数验证
 */
export const WebsiteBatchSwitchSchema = z.object({
    // 需要批量操作的网站ID数组
    // 该字段包含一个或多个网站的唯一标识符，用于指定需要更改状态的网站
    website_ids: z.array(z.number().int()),
    // 网站启用状态：true表示启用，false表示禁用
    // 该字段用于统一设置所有指定网站的启用状态
    website_enabled: z.boolean(),
})

/**
 * WebsiteBatchSwitch 类型定义
 * 从 WebsiteBatchSwitchSchema 推断出的 TypeScript 类型
 * 用于网站批量开关状态数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 批量操作API请求体参数类型
 * - 批量状态更新组件的状态管理
 * - 批量操作表单数据验证结果
 */
export type WebsiteBatchSwitchData = z.infer<typeof WebsiteBatchSwitchSchema>
// endregion


// =====================================================================================================================
// 网站批量导出Schema
// =====================================================================================================================
// region Website Batch Switch Schema



/**
 * 网站批量导出的 Zod 验证模式
 * 用于验证批量导出网站数据请求的数据结构
 * 包含需要导出的网站ID列表，用于批量操作多个网站的数据导出
 * 
 * 使用场景：
 * - 网站管理页面的批量导出功能
 * - 批量获取多个网站的数据用于备份或迁移
 * - 批量导出网站配置和内容的API请求参数验证
 */
export const WebsiteBatchExportSchema = z.object({
    // 需要批量导出的网站ID数组
    // 该字段包含一个或多个网站的唯一标识符，用于指定需要导出数据的网站
    // 数组中每个ID都应该是正整数，代表一个有效的网站记录
    website_ids: z.array(
        z.number()
          .int()
          .positive('网站ID必须是正整数')
    ).min(1, '至少需要选择一个网站进行导出')
     .max(100, '单次批量导出的网站数量不能超过100个'),
})

/**
 * WebsiteBatchExport 类型定义
 * 从 WebsiteBatchExportSchema 推断出的 TypeScript 类型
 * 用于网站批量导出数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 批量导出API请求体参数类型
 * - 批量导出组件的状态管理
 * - 批量导出表单数据验证结果
 */
export type WebsiteBatchExportData = z.infer<typeof WebsiteBatchExportSchema>
// endregion



// =====================================================================================================================
// 网站创建Schema
// =====================================================================================================================
// region Website Creation Schema
export const WebsiteCreateSchema = z.object({

    // 网站显示名称
    website_name: z.string()
      .trim()
      .min(2, '网站名称长度不小于2')
      .max(32, '网站名称长度不大于32'),
    // 网站URL标识符（通常用于路由）
    website_slug: z.string()
      .trim()
      .min(2, '网站标识长度不小于2')
      .max(32, '网站标识长度不大于32')
      .regex(/^[a-zA-Z0-9\-_]{2,32}$/, '网站标识应该是字母、数字、连字符或下划线，长度在2到32之间'),
    // 网站访问URL（可选字段）
    website_url: z.url("请输入正确的网址").optional().nullable(),
    // 网站配置对象，存储任意键值对配置信息
    website_config: z.record(z.string(), z.any()),
    // 网站说明文档内容
    website_readme: z.string(),
})

export type WebsiteCreateData = z.infer<typeof WebsiteCreateSchema>
// endregion


// =====================================================================================================================
// 网站更新Schema
// =====================================================================================================================
// region Website Update Schema
export const WebsiteUpdateSchema = z.object({

    // 网站显示名称
    website_name: z.string()
      .trim()
      .min(2, '网站名称长度不小于2')
      .max(32, '网站名称长度不大于32'),
    // 网站URL标识符（通常用于路由）
    website_slug: z.string()
      .trim()
      .min(2, '网站标识长度不小于2')
      .max(32, '网站标识长度不大于32')
      .regex(/^[a-zA-Z0-9\-_]{2,32}$/, '网站标识应该是字母、数字、连字符或下划线，长度在2到32之间'),
    // 网站访问URL（可选字段）
    website_url: z.url("请输入正确的网址").optional().nullable(),
    // 网站配置对象，存储任意键值对配置信息
    website_config: z.record(z.string(), z.any()),
    // 网站说明文档内容
    website_readme: z.string(),
})

export type WebsiteUpdateData = z.infer<typeof WebsiteUpdateSchema>
// endregion


// =====================================================================================================================
// 网站配置Schema
// =====================================================================================================================
// region Website Config Schema
export const WebsiteConfigSchema = z.object({

    // 网站配置对象，存储任意键值对配置信息
    website_config: z.record(z.string(), z.any()),
    // 网站说明文档内容
    website_readme: z.string(),
})

export type WebsiteConfigData = z.infer<typeof WebsiteConfigSchema>
// endregion


// =====================================================================================================================
// 网站集合Schema
// =====================================================================================================================
// region Website Collection Schema
export const WebsitesSchema = z.object({

    // 网站列表
    websites: z.array(WebsiteSchema),
    // 分页信息
    pagination: PaginationInfoSchema,
})

export type WebsitesData = z.infer<typeof WebsitesSchema>
// endregion

