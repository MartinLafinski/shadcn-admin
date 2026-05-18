import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'
import {
  MiniParamFormSchema,
  EntityStatusSchema,
  EntitySpiderTasksCounterSchema,
  EntityMaterialCounterSchema,
  createEntityToggleWithDisabledSchema,
  createEntityLockAuditSchema,
  createEntityPauseAuditSchema,
  createEntityDisabledAuditSchema,
  createEntitySwitchSchema,
  createEntityBatchSwitchSchema,
  createEntityBatchLockSchema,
  createEntityBatchPauseSchema,
} from '@/lib/base-schemas'

// =====================================================================================================================
// 网站的基础Schema
// =====================================================================================================================
// region Website Schema
/**
 * 网站项目基础信息的 Zod 验证模式
 * 包含网站的基本元数据和状态信息
 */
export const WebsiteItemSchema = z
  .object({
    website_id: z.number().int(),
    created_at: z.string(),
    created_by: z.string().nullable(),
    updated_at: z.string(),
    updated_by: z.string(),
    entrypoint_count: z.number().int().optional(),
    prejob_count: z.number().int().optional(),
    website_free_spider_task_capacity: z.number().int(),
    website_max_spider_task_count: z.number().int().optional(),
    website_name: z.string(),
    website_slug: z
      .string()
      .trim()
      .min(2, '网站标识长度不小于2')
      .max(32, '网站标识长度不大于32')
      .regex(
        /^[a-zA-Z0-9\-_]{2,32}$/,
        '网站标识应该是字母、数字、连字符或下划线，长度在2到32之间'
      ),
    website_avatar: z.url().optional().nullable(),
    website_url: z.url().optional().nullable(),
    website_config: z.record(z.string(), z.any()),
    website_readme: z.string(),
    // 网站自用参数要素包标识
    website_self_param_slug: z.string().nullable().optional(),
    // 网站入口点参数要素包标识
    website_entrypoint_param_slug: z.string().nullable().optional(),
    // 网站预备作业参数要素包标识
    website_prejob_param_slug: z.string().nullable().optional(),
    // 网站自用参数要素包
    param_form_self: MiniParamFormSchema.nullable().optional(),
    // 网站指定入口点参数要素包
    param_form_entrypoint: MiniParamFormSchema.nullable().optional(),
    // 网站指定预备作业参数要素包
    param_form_prejob: MiniParamFormSchema.nullable().optional(),
  })
  .extend(createEntityToggleWithDisabledSchema('website').shape)
  .extend(createEntityLockAuditSchema('website').shape)
  .extend(createEntityPauseAuditSchema('website').shape)
  .extend(createEntityDisabledAuditSchema('website').shape)
  .extend(EntityStatusSchema.shape)
  .extend(EntitySpiderTasksCounterSchema.shape)
  .extend(EntityMaterialCounterSchema.shape)

/**
 * 完整网站信息的 Zod 验证模式
 * 继承基础网站信息，并扩展配置和说明文档字段
 * 适用于网站详细信息的完整数据结构验证
 */
export const WebsiteSchema = WebsiteItemSchema.extend({})

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

export const WebsiteSwitchSchema = createEntitySwitchSchema('website')

export type WebsiteSwitchData = z.infer<typeof WebsiteSwitchSchema>
// endregion

// =====================================================================================================================
// 网站批量开关Schema
// =====================================================================================================================
// region Website Batch Switch Schema

export const WebsiteBatchSwitchSchema = createEntityBatchSwitchSchema('website')

export type WebsiteBatchSwitchData = z.infer<typeof WebsiteBatchSwitchSchema>
// endregion

// =====================================================================================================================
// 网站批量锁定/解锁Schema
// =====================================================================================================================
// region Website Batch Lock Schema

export const WebsiteBatchLockSchema = createEntityBatchLockSchema('website')

export type WebsiteBatchLockData = z.infer<typeof WebsiteBatchLockSchema>
// endregion

// =====================================================================================================================
// 网站批量暂停/恢复Schema
// =====================================================================================================================
// region Website Batch Pause Schema

export const WebsiteBatchPauseSchema = createEntityBatchPauseSchema('website')

export type WebsiteBatchPauseData = z.infer<typeof WebsiteBatchPauseSchema>
// endregion

// =====================================================================================================================
// 网站批量导出Schema
// =====================================================================================================================
// region Website Batch Export Schema

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
  website_ids: z
    .array(z.number().int().positive('网站ID必须是正整数'))
    .min(1, '至少需要选择一个网站进行导出')
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
  website_name: z
    .string()
    .trim()
    .min(2, '网站名称长度不小于2')
    .max(32, '网站名称长度不大于32'),
  // 网站URL标识符（通常用于路由）
  website_slug: z
    .string()
    .trim()
    .min(2, '网站标识长度不小于2')
    .max(32, '网站标识长度不大于32')
    .regex(
      /^[a-zA-Z0-9\-_]{2,32}$/,
      '网站标识应该是字母、数字、连字符或下划线，长度在2到32之间'
    ),
  // 网站头像URL
  website_avatar: z.url('请输入正确的图片网址').optional().nullable(),
  // 网站在线任务上限
  website_max_spider_task_count: z.number().int().optional(),
  // 网站访问URL（可选字段）
  website_url: z.url('请输入正确的网址').optional().nullable(),
  // 网站配置对象，存储任意键值对配置信息
  website_config: z.record(z.string(), z.any()).optional(),
  // 网站说明文档内容
  website_readme: z.string().optional(),
  // 网站自用参数要素包标识
  website_self_param_slug: z.string().nullable().optional(),
  // 网站入口点参数要素包标识
  website_entrypoint_param_slug: z.string().nullable().optional(),
  // 网站预备作业参数要素包标识
  website_prejob_param_slug: z.string().nullable().optional(),
})

export type WebsiteCreateData = z.infer<typeof WebsiteCreateSchema>
// endregion

// =====================================================================================================================
// 网站更新Schema
// =====================================================================================================================
// region Website Update Schema
export const WebsiteUpdateSchema = z.object({
  // 网站显示名称
  website_name: z
    .string()
    .trim()
    .min(2, '网站名称长度不小于2')
    .max(32, '网站名称长度不大于32'),
  // 网站URL标识符（通常用于路由）
  website_slug: z
    .string()
    .trim()
    .min(2, '网站标识长度不小于2')
    .max(32, '网站标识长度不大于32')
    .regex(
      /^[a-zA-Z0-9\-_]{2,32}$/,
      '网站标识应该是字母、数字、连字符或下划线，长度在2到32之间'
    ),
  // 网站头像URL
  website_avatar: z.url('请输入正确的图片网址').optional().nullable(),
  // 网站在线任务上限
  website_max_spider_task_count: z.number().int().optional(),
  // 网站访问URL（可选字段）
  website_url: z.url('请输入正确的网址').optional().nullable(),
  // 网站自用参数要素包标识
  website_self_param_slug: z.string().nullable().optional(),
  // 网站入口点参数要素包标识
  website_entrypoint_param_slug: z.string().nullable().optional(),
  // 网站预备作业参数要素包标识
  website_prejob_param_slug: z.string().nullable().optional(),
})

export type WebsiteUpdateData = z.infer<typeof WebsiteUpdateSchema>
// endregion

// =====================================================================================================================
// 网站配置Schema
// =====================================================================================================================
// region Website Config Schema
/**
 * 网站配置信息的 Zod 验证模式
 * 用于验证网站配置更新请求的数据结构
 * 包含网站的配置信息和说明文档内容
 *
 * 使用场景：
 * - 网站配置页面的表单验证
 * - 更新网站配置信息的API请求参数验证
 * - 网站设置功能的数据验证
 */
export const WebsiteConfigSchema = z.object({
  // 网站配置对象，存储任意键值对配置信息
  // 用于存储网站的特定配置参数，如主题设置、功能开关等
  website_config: z.record(z.string(), z.any()).optional(),
  // 网站说明文档内容
  // 用于存储网站的说明文档或描述信息，通常用于展示网站的用途和使用方法
  website_readme: z.string().optional(),
})

/**
 * WebsiteConfig 类型定义
 * 从 WebsiteConfigSchema 推断出的 TypeScript 类型
 * 用于网站配置信息数据的类型标注，确保类型安全
 *
 * 该类型通常用于：
 * - 网站配置相关API响应数据类型
 * - 配置编辑组件的props类型
 * - 配置表单的初始值和验证结果类型
 */
export type WebsiteConfigData = z.infer<typeof WebsiteConfigSchema>
// endregion

// =====================================================================================================================
// 网站集合Schema
// =====================================================================================================================
// region Website Collection Schema
/**
 * 网站列表集合的 Zod 验证模式
 * 用于验证包含多个网站信息及分页数据的复合数据结构
 * 适用于网站列表查询API响应数据的验证，包含网站数据数组和分页信息
 *
 * 使用场景：
 * - 网站列表页面的数据获取API响应
 * - 分页查询多个网站的场景
 * - 网站管理后台的列表展示功能
 * - 批量获取网站信息的数据结构验证
 */
export const WebsitesSchema = z.object({
  // 网站数据列表
  // 包含多个网站的详细信息，每个元素都是符合WebsiteSchema格式的完整网站对象
  websites: z.array(WebsiteSchema),
  // 分页信息对象
  // 包含当前页码、总条数、页大小等分页相关的元数据，用于前端分页组件展示
  pagination: PaginationInfoSchema,
})

/**
 * Websites 类型定义
 * 从 WebsitesSchema 推断出的 TypeScript 类型
 * 用于网站列表集合数据的类型标注，确保类型安全
 *
 * 该类型通常用于：
 * - 网站列表API响应数据类型
 * - 网站列表组件的props类型定义
 * - 列表数据状态管理的类型约束
 * - 分页数据处理函数的参数类型
 */
export type WebsitesData = z.infer<typeof WebsitesSchema>

/**
 * 生成一个空的用于充当原始数据的websitesData对象
 * 用于初始化网站列表数据，提供默认的空数组和分页信息
 */
export const emptyWebsitesData: WebsitesData = {
  websites: [],
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
// 网站Spider配置Schema
// =====================================================================================================================
// region Spider Config Schema
/**
 * 网站爬虫配置信息的 Zod 验证模式
 * 用于验证网站爬虫配置更新请求的数据结构
 * 包含爬虫抓取、内容提取、并发控制等配置项
 *
 * 使用场景：
 * - 单独修改网站配置时的表单验证
 * - 更新网站爬虫配置信息的API请求参数验证
 */
export const SpiderConfigSchema = z.object({
  // 抓取时未指定结束时间时的默认抓取时间(小时)
  default_crawl_hours: z.number().int().nullable().optional(),
  // 两次抓取之间的最小间隔时间(毫秒)
  min_available_interval: z.number().int().nullable().optional(),
  // 是否启用历史追溯模式
  history_mode: z.boolean().nullable().optional(),
  // 是否暂停任务追加
  task_paused: z.boolean().nullable().optional(),
  // 文章内容提取算法, 可以是trafilatura或paragraph或自定义
  body_extraction_method: z.string().nullable().optional(),
  // 单次抓取时可允许的最多过期批次数量
  max_bunch_expired: z.number().int().nullable().optional(),
  // 单次抓取时可允许的最大错误数量
  max_spider_errors: z.number().int().nullable().optional(),
  // 单次抓取时可允许的最大列表页数
  max_list_pages: z.number().int().nullable().optional(),
  // 单次抓取时可允许抓取的最大文章页数
  max_article_pages: z.number().int().nullable().optional(),
  // 抓取时每分钟的最大任务数量
  max_tasks_per_minute: z.number().int().nullable().optional(),
  // 抓取时期望的并发数
  desired_concurrency: z.number().int().nullable().optional(),
  // 抓取时的最小并发数
  min_concurrency: z.number().int().nullable().optional(),
  // 抓取时最大的并发数
  max_concurrency: z.number().int().nullable().optional(),
  // 是否保存图片
  remain_img: z.boolean().optional(),
  // 是否仅检查图像下文放弃词
  only_check_alt_discard_words: z.boolean().nullable().optional(),
  // 图片URL清理的正则表达式模式
  img_clean_regex: z.string().nullable().optional(),
  // 图像下文放弃词的标识
  alt_discard_words_slug: z.string().nullable().optional(),
  // 图像下文尾部加分词的标识
  alt_end_words_slug: z.string().nullable().optional(),
  // 图像下文加分词的标识
  alt_words_slug: z.string().nullable().optional(),
  // 头部过滤词的标识
  head_blackwords_slug: z.string().nullable().optional(),
  // 尾部过滤词的标识
  tail_blackwords_slug: z.string().nullable().optional(),
  // Trafilatura算法下文章内容元素起始位置
  head_start: z.number().int().nullable().optional(),
  // Trafilatura算法下文章内容元素结束位置
  tail_end: z.number().int().nullable().optional(),
  // Trafilatura算法下极端边界情况下文章内容元素头部位置
  bound_head_position: z.number().int().nullable().optional(),
  // Trafilatura算法下极端边界情况下文章内容元素尾部位置
  bound_tail_position: z.number().int().nullable().optional(),
  // Paragraph算法下文章内容选择器，用于指定文章内容所在的HTML元素
  article_selector: z.string().nullable().optional(),
  // Paragraph算法下类似于段落的HTML标签列表
  tags_like_p: z.array(z.string()).nullable().optional(),
  // Paragraph算法下文章内容起始位置
  paragraph_start: z.number().int().nullable().optional(),
  // Paragraph算法下文章内容结束位置
  paragraph_end: z.number().int().nullable().optional(),
  // 默认请求队列标识
  default_request_queue: z.string().nullable().optional(),
  // 错误请求队列标识
  error_request_queue: z.string().nullable().optional(),
  // 是否备分到SeaweedFS
  backup_in_seaweed: z.boolean().nullable().optional(),
})

/**
 * SpiderConfig 类型定义
 * 从 SpiderConfigSchema 推断出的 TypeScript 类型
 * 用于网站爬虫配置信息数据的类型标注，确保类型安全
 *
 * 该类型通常用于：
 * - 网站配置相关API请求体参数类型
 * - 配置编辑组件的props类型
 * - 配置表单的初始值和验证结果类型
 */
export type SpiderConfigData = z.infer<typeof SpiderConfigSchema>
// endregion

// =====================================================================================================================
// 网站同步Schema
// =====================================================================================================================
// region Website Sync Schema
/**
 * 网站同步操作的 Zod 验证模式
 * 用于验证网站同步请求的数据结构
 */
export const WebsiteSyncSchema = z.object({
  clear_entrypoints: z.boolean(),
  clear_prejobs: z.boolean(),
  clear_locked: z.boolean(),
  clear_paused: z.boolean(),
  clear_spider_tasks: z.boolean(),
  only_clear: z.boolean(),
})

/**
 * WebsiteSync 类型定义
 * 从 WebsiteSyncSchema 推断出的 TypeScript 类型
 */
export type WebsiteSyncData = z.infer<typeof WebsiteSyncSchema>
// endregion
