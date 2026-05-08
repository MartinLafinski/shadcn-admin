import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'
import {
  EntityStatusSchema,
  EntitySpiderTasksCounterSchema,
  EntityMaterialCounterSchema,
  createEntityToggleSchema,
  createEntityLockAuditSchema,
  createEntityPauseAuditSchema,
  createEntitySwitchSchema,
  createEntityBatchSwitchSchema,
  createEntityBatchLockSchema,
  createEntityBatchPauseSchema,
} from '@/lib/base-schemas'
import { IndustryItemSchema } from '@/features/industries/data/schemas'
import { WebsiteItemSchema } from '@/features/websites/data/schemas'

// =====================================================================================================================
// 入口点的基础Schema
// =====================================================================================================================
// region Entrypoint Schema
/**
 * 入口点项目基础信息的 Zod 验证模式
 * 包含入口点的基本元数据和状态信息
 */
export const EntrypointItemSchema = z
  .object({
    entrypoint_id: z.number().int(),
    created_at: z.string(),
    updated_at: z.string(),
    updated_by: z.string(),
    begin_at: z.string().nullable(),
    end_at: z.string().nullable(),
    prejob_count: z.number().int().optional().nullable(),
    entrypoint_max_spider_task_count: z.number().int().optional(),
    website_id: z.number().int().nullable(),
    industry_id: z.number().int().nullable(),
    material_type: z.string().optional().nullable(),
    website: WebsiteItemSchema.nullable(),
    industry: IndustryItemSchema.nullable(),
    entrypoint_avatar: z.string().optional().nullable(),
    entrypoint_name: z.string(),
    entrypoint_slug: z
      .string()
      .trim()
      .min(2, '入口点标识长度不小于2')
      .max(64, '入口点标识长度不大于64')
      .regex(
        /^[a-zA-Z0-9\-_]{2,64}$/,
        '入口点标识应该是字母、数字、连字符或下划线，长度在2到64之间'
      ),
    entrypoint_url: z.url().optional().nullable(),
    entrypoint_config: z.record(z.string(), z.any()),
    entrypoint_readme: z.string(),
    config: z.record(z.string(), z.any()),
  })
  .extend({
    ...createEntityToggleSchema('entrypoint').shape,
    ...createEntityLockAuditSchema('entrypoint').shape,
    ...createEntityPauseAuditSchema('entrypoint').shape,
    ...EntityStatusSchema.shape,
    ...EntitySpiderTasksCounterSchema.shape,
    ...EntityMaterialCounterSchema.shape,
  })

/**
 * 完整入口点信息的 Zod 验证模式
 * 继承基础入口点信息，并扩展配置和说明文档字段
 * 适用于入口点详细信息的完整数据结构验证
 */
export const EntrypointSchema = EntrypointItemSchema.extend({})

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

export const EntrypointSwitchSchema = createEntitySwitchSchema('entrypoint')

export type EntrypointSwitchData = z.infer<typeof EntrypointSwitchSchema>
// endregion

// =====================================================================================================================
// 入口点批量开关Schema
// =====================================================================================================================
// region Entrypoint Batch Switch Schema

export const EntrypointBatchSwitchSchema =
  createEntityBatchSwitchSchema('entrypoint')

export type EntrypointBatchSwitchData = z.infer<
  typeof EntrypointBatchSwitchSchema
>
// endregion

// =====================================================================================================================
// 入口点批量锁定/解锁Schema
// =====================================================================================================================
// region Entrypoint Batch Lock Schema

export const EntrypointBatchLockSchema =
  createEntityBatchLockSchema('entrypoint')

export type EntrypointBatchLockData = z.infer<typeof EntrypointBatchLockSchema>
// endregion

// =====================================================================================================================
// 入口点批量暂停/恢复Schema
// =====================================================================================================================
// region Entrypoint Batch Pause Schema

export const EntrypointBatchPauseSchema =
  createEntityBatchPauseSchema('entrypoint')

export type EntrypointBatchPauseData = z.infer<
  typeof EntrypointBatchPauseSchema
>
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
  entrypoint_ids: z
    .array(z.number().int().positive('入口点ID必须是正整数'))
    .min(1, '至少需要选择一个入口点进行导出')
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
export type EntrypointBatchExportData = z.infer<
  typeof EntrypointBatchExportSchema
>
// endregion

// =====================================================================================================================
// 入口点创建Schema
// =====================================================================================================================
// region Entrypoint Creation Schema
export const EntrypointCreateSchema = z.object({
  // 网站ID
  website_id: z.int('请选择正确的网站'),
  // 行业ID
  industry_id: z.int('请选择正确的行业'),
  // 材料类型
  material_type: z.string().optional().nullable(),
  // 入口点头像URL
  entrypoint_avatar: z.string().optional().nullable(),
  // 入口点名称
  entrypoint_name: z
    .string()
    .trim()
    .min(2, '入口点名称长度不小于2')
    .max(32, '入口点名称长度不大于32'),
  // 入口点URL标识符（通常用于路由）
  entrypoint_slug: z
    .string()
    .trim()
    .min(2, '入口点标识长度不小于2')
    .max(64, '入口点标识长度不大于64')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '入口点标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  // 入口点在线任务上限
  entrypoint_max_task_count: z.number().int().optional(),
  // 入口点URL
  entrypoint_url: z.url('请输入正确的网址'),
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
  // 行业ID
  industry_id: z.number().int(),
  // 材料类型
  material_type: z.string().optional().nullable(),
  // 入口点头像URL
  entrypoint_avatar: z.string().optional().nullable(),
  // 入口点名称
  entrypoint_name: z
    .string()
    .trim()
    .min(2, '入口点名称长度不小于2')
    .max(32, '入口点名称长度不大于32'),
  // 入口点URL标识符（通常用于路由）
  entrypoint_slug: z
    .string()
    .trim()
    .min(2, '入口点标识长度不小于2')
    .max(64, '入口点标识长度不大于64')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '入口点标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  // 入口点在线任务上限
  entrypoint_max_task_count: z.number().int().optional(),
  // 入口点URL
  entrypoint_url: z.url('请输入正确的网址').optional().nullable(),
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
    length: 0,
  },
}
// endregion

// =====================================================================================================================
// 入口点Spider配置Schema
// =====================================================================================================================
// region Entrypoint Spider Config Schema
/**
 * 入口点爬虫配置信息的 Zod 验证模式
 * 用于验证入口点爬虫配置更新请求的数据结构
 * 包含爬虫抓取、内容提取、并发控制等配置项
 * 每个配置项都有对应的 inherit_website_* 字段，用于控制是否从网站配置继承该设置
 *
 * 使用场景：
 * - 单独修改入口点配置时的表单验证
 * - 更新入口点爬虫配置信息的API请求参数验证
 */
export const EntrypointSpiderConfigSchema = z.object({
  // 抓取时未指定结束时间时的默认抓取时间(小时)
  default_crawl_hours: z.number().int().nullable().optional(),
  // 是否继承网站默认抓取时间
  inherit_website_default_crawl_hours: z.boolean().optional(),
  // 两次抓取之间的最小间隔时间(毫秒)
  min_available_interval: z.number().int().nullable().optional(),
  // 是否继承网站最小可用间隔时间
  inherit_website_min_available_interval: z.boolean().optional(),
  // 是否启用历史追溯模式
  history_mode: z.boolean().nullable().optional(),
  // 是否继承网站历史追溯模式
  inherit_website_history_mode: z.boolean().optional(),
  // 是否暂停任务追加
  task_paused: z.boolean().nullable().optional(),
  // 是否继承网站暂停任务追加
  inherit_website_task_paused: z.boolean().optional(),
  // 文章内容提取算法, 可以是trafilatura或paragraph或自定义
  body_extraction_method: z.string().nullable().optional(),
  // 是否继承网站文章内容提取算法
  inherit_website_body_extraction_method: z.boolean().optional(),
  // 单次抓取时可允许的最多过期批次数量
  max_bunch_expired: z.number().int().nullable().optional(),
  // 是否继承网站最多过期批次数量
  inherit_website_max_bunch_expired: z.boolean().optional(),
  // 单次抓取时可允许的最大错误数量
  max_spider_errors: z.number().int().nullable().optional(),
  // 是否继承网站单次抓取时可允许的最大错误数量
  inherit_website_max_spider_errors: z.boolean().optional(),
  // 单次抓取时可允许的最大列表页数
  max_list_pages: z.number().int().nullable().optional(),
  // 最否继承网站单次抓取时可允许的最大列表页数
  inherit_website_max_list_pages: z.boolean().optional(),
  // 单次抓取时可允许抓取的最大文章页数
  max_article_pages: z.number().int().nullable().optional(),
  // 是否继承网站单次抓取时可允许抓取的最大文章页数
  inherit_website_max_article_pages: z.boolean().optional(),
  // 抓取时每分钟的最大任务数量
  max_tasks_per_minute: z.number().int().nullable().optional(),
  // 是否继承抓取时每分钟的最大任务数量
  inherit_website_max_tasks_per_minute: z.boolean().optional(),
  // 抓取时期望的并发数
  desired_concurrency: z.number().int().nullable().optional(),
  // 是否继承网站抓取时期望的并发数
  inherit_website_desired_concurrency: z.boolean().optional(),
  // 抓取时的最小并发数
  min_concurrency: z.number().int().nullable().optional(),
  // 是否继承网站抓取时的最小并发数
  inherit_website_min_concurrency: z.boolean().optional(),
  // 抓取时最大的并发数
  max_concurrency: z.number().int().nullable().optional(),
  // 是否继承网站抓取时最大的并发数
  inherit_website_max_concurrency: z.boolean().optional(),
  // 是否保存图片
  remain_img: z.boolean().optional(),
  // 是否继承网站保存图片设置
  inherit_website_remain_img: z.boolean().optional(),
  // 是否仅检查图像下文放弃词
  only_check_alt_discard_words: z.boolean().nullable().optional(),
  // 是否继承网站仅检查图像下文放弃词设置
  inherit_website_only_check_alt_discard_words: z.boolean().optional(),
  // 图片URL清理的正则表达式模式
  img_clean_regex: z.string().nullable().optional(),
  // 是否继承网站图片URL清理的正则表达式模式
  inherit_website_img_clean_regex: z.boolean().optional(),
  // 图像下文放弃词的标识
  alt_discard_words_slug: z.string().nullable().optional(),
  // 是否继承网站图像下文放弃词的标识
  inherit_website_alt_discard_words_slug: z.boolean().optional(),
  // 图像下文尾部加分词的标识
  alt_end_words_slug: z.string().nullable().optional(),
  // 是否继承网站图像下文尾部加分词的标识
  inherit_website_alt_end_words_slug: z.boolean().optional(),
  // 图像下文加分词的标识
  alt_words_slug: z.string().nullable().optional(),
  // 是否继承网站图像下文加分词的标识
  inherit_website_alt_words_slug: z.boolean().optional(),
  // 头部过滤词的标识
  head_blackwords_slug: z.string().nullable().optional(),
  // 是否继承网站头部过滤词的标识
  inherit_website_head_blackwords_slug: z.boolean().optional(),
  // 尾部过滤词的标识
  tail_blackwords_slug: z.string().nullable().optional(),
  // 是否继承网站尾部过滤词的标识
  inherit_website_tail_blackwords_slug: z.boolean().optional(),
  // Trafilatura算法下文章内容元素起始位置
  head_start: z.number().int().nullable().optional(),
  // 是否继承网站Trafilatura算法下文章内容元素起始位置
  inherit_website_head_start: z.boolean().optional(),
  // Trafilatura算法下文章内容元素结束位置
  tail_end: z.number().int().nullable().optional(),
  // 是否继承网站Trafilatura算法下文章内容元素结束位置
  inherit_website_tail_end: z.boolean().optional(),
  // Trafilatura算法下极端边界情况下文章内容元素头部位置
  bound_head_position: z.number().int().nullable().optional(),
  // 是否继承网站Trafilatura算法下极端边界情况下文章内容元素头部位置
  inherit_website_bound_head_position: z.boolean().optional(),
  // Trafilatura算法下极端边界情况下文章内容元素尾部位置
  bound_tail_position: z.number().int().nullable().optional(),
  // 是否继承网站Trafilatura算法下极端边界情况下文章内容元素尾部位置
  inherit_website_bound_tail_position: z.boolean().optional(),
  // Paragraph算法下文章内容选择器，用于指定文章内容所在的HTML元素
  article_selector: z.string().nullable().optional(),
  // 是否继承网站Paragraph算法下文章内容选择器，用于指定文章内容所在的HTML元素
  inherit_website_article_selector: z.boolean().optional(),
  // Paragraph算法下类似于段落的HTML标签列表
  tags_like_p: z.array(z.string()).nullable().optional(),
  // 是否继承网站Paragraph算法下类似于段落的HTML标签列表
  inherit_website_tags_like_p: z.boolean().optional(),
  // Paragraph算法下文章内容起始位置
  paragraph_start: z.number().int().nullable().optional(),
  // 是否继承网站Paragraph算法下文章内容起始位置
  inherit_website_paragraph_start: z.boolean().optional(),
  // Paragraph算法下文章内容结束位置
  paragraph_end: z.number().int().nullable().optional(),
  // 是否继承网站Paragraph算法下文章内容结束位置
  inherit_website_paragraph_end: z.boolean().optional(),
  // 默认请求队列标识
  default_request_queue: z.string().nullable().optional(),
  // 是否继承网站默认请求队列标识
  inherit_website_default_request_queue: z.boolean().optional(),
  // 错误请求队列标识
  error_request_queue: z.string().nullable().optional(),
  // 是否继承网站错误请求队列标识
  inherit_website_error_request_queue: z.boolean().optional(),
  // 是否备分到SeaweedFS
  backup_in_seaweed: z.boolean().nullable().optional(),
  // 是否继承网站是否备分到SeaweedFS
  inherit_website_backup_in_seaweed: z.boolean().optional(),
})

/**
 * EntrypointSpiderConfig 类型定义
 * 从 EntrypointSpiderConfigSchema 推断出的 TypeScript 类型
 * 用于入口点爬虫配置信息数据的类型标注，确保类型安全
 *
 * 该类型通常用于：
 * - 入口点配置相关API请求体参数类型
 * - 配置编辑组件的props类型
 * - 配置表单的初始值和验证结果类型
 */
export type EntrypointSpiderConfigData = z.infer<
  typeof EntrypointSpiderConfigSchema
>
// endregion

// =====================================================================================================================
// 入口点日期区间Schema
// =====================================================================================================================
// region Entrypoint Period Schema
/**
 * 入口点日期区间的 Zod 验证模式
 * 用于验证入口点抓取日期区间更新请求的数据结构
 * 包含抓取开始时间和结束时间
 *
 * 使用场景：
 * - 更新入口点抓取日期区间时的表单验证
 * - 更新入口点日期区间信息的API请求参数验证
 */
export const EntrypointPeriodSchema = z.object({
  // 抓取开始时间，可为空
  // 支持多种格式：date-time 格式字符串、普通字符串、数字、整数、null
  begin_at: z
    .union([z.string(), z.number(), z.int(), z.null()])
    .nullable()
    .optional(),
  // 抓取结束时间，可为空
  // 支持多种格式：date-time 格式字符串、普通字符串、数字、整数、null
  end_at: z
    .union([z.string(), z.number(), z.int(), z.null()])
    .nullable()
    .optional(),
})

/**
 * 日期区间表单的初始值和验证结果类型
 */
export type EntrypointPeriodData = z.infer<typeof EntrypointPeriodSchema>
// endregion

// =====================================================================================================================
// 通过入口点创建预备作业Schema
// =====================================================================================================================
// region Create Prejob By Entrypoint Schema
/**
 * 通过入口点创建预备作业的 Zod 验证模式
 * 包含创建预备作业所需的字段
 */
export const CreatePrejobByEntrypointSchema = z.object({
  // 入口点ID（必需）
  entrypoint_id: z.number().int(),
  // 预备作业标识后缀（可选，默认为空字符串）
  prelog_slug_suffix: z.string().default(''),
  // 预备作业名称后缀（可选，默认为空字符串）
  prelog_name_suffix: z.string().default(''),
})

/**
 * 通过入口点创建预备作业表单的初始值和验证结果类型
 */
export type CreatePrejobByEntrypointData = z.infer<
  typeof CreatePrejobByEntrypointSchema
>
// endregion

// region 同步入口点Schema
/**
 * 同步入口点请求Schema
 */
export const SyncEntrypointsSchema = z.object({
  website_ids: z.array(z.number()).optional().describe('网站ID列表'),
  industry_ids: z.array(z.number()).optional().describe('行业ID列表'),
  clear_prejobs: z.boolean().default(false).describe('重置预备作业关联'),
  clear_locked: z.boolean().default(false).describe('重置锁定信息'),
  clear_paused: z.boolean().default(false).describe('重置暂停信息'),
  clear_spider_tasks: z.boolean().default(false).describe('重置爬虫任务信息'),
})

/**
 * 同步入口点表单的初始值和验证结果类型
 */
export type SyncEntrypointsData = z.infer<typeof SyncEntrypointsSchema>
// endregion
