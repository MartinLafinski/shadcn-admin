import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'

// =====================================================================================================================
// 任务状态枚举
// =====================================================================================================================
// region Task Status Enum
/**
 * 任务状态枚举
 * 用于表示任务的不同执行状态
 */
export const TaskStatusEnum = z.enum(['running', 'completed', 'canceled'])

/**
 * TaskStatus 类型定义
 * 从 TaskStatusEnum 推断出的 TypeScript 类型
 */
export type TaskStatus = z.infer<typeof TaskStatusEnum>
// endregion


// =====================================================================================================================
// 网站基础Schema（用于任务关联）
// =====================================================================================================================
// region Website Schema
/**
 * 网站基础信息的 Zod 验证模式
 * 用于任务关联的网站信息
 */
export const WebsiteItemSchema = z.object({
    // 网站唯一标识符
    website_id: z.number().int(),
    // 创建者标识
    created_by: z.string().min(2).max(32).nullable(),
    // 更新者标识
    updated_by: z.string().min(2).max(32).nullable(),
    // 创建时间戳
    created_at: z.string().nullable(),
    // 更新时间戳
    updated_at: z.string().nullable(),
    // 网站是否启用状态
    website_enabled: z.boolean(),
    // 网站显示名称
    website_name: z.string().min(2).max(32),
    // 网站URL标识符（通常用于路由）
    website_slug: z.string()
      .min(2, '网站标识长度不小于2')
      .max(32, '网站标识长度不大于32')
      .regex(/^[a-zA-Z0-9\-_]{2,32}$/, '网站标识应该是字母、数字、连字符或下划线，长度在2到32之间'),
    // 网站访问URL（可选字段）
    website_url: z.string().url().nullable().optional(),
    // 网站配置对象，存储任意键值对配置信息
    website_config: z.record(z.string(), z.any()),
    // 网站说明文档内容
    website_readme: z.string().nullable(),
})

/**
 * WebsiteItem 类型定义
 * 从 WebsiteItemSchema 推断出的 TypeScript 类型
 */
export type WebsiteItemData = z.infer<typeof WebsiteItemSchema>
// endregion


// =====================================================================================================================
// 入口点基础Schema（用于任务关联）
// =====================================================================================================================
// region Entrypoint Schema
/**
 * 入口点基础信息的 Zod 验证模式
 * 用于任务关联的入口点信息
 */
export const EntrypointItemSchema = z.object({
    // 入口点唯一标识符
    entrypoint_id: z.number().int(),
    // 创建者标识
    created_by: z.string().min(2).max(32).nullable(),
    // 更新者标识
    updated_by: z.string().min(2).max(32).nullable(),
    // 创建时间戳
    created_at: z.string().nullable(),
    // 更新时间戳
    updated_at: z.string().nullable(),
    // 抓取开始时间
    begin_at: z.string().nullable(),
    // 抓取结束时间
    end_at: z.string().nullable(),
    // 入口点是否启用状态
    entrypoint_enabled: z.boolean(),
    // 网站ID
    website_id: z.number().int().nullable(),
    // 网站信息
    website: WebsiteItemSchema.nullable(),
    // 入口点名称
    entrypoint_name: z.string().min(2).max(32),
    // 入口点URL标识符（通常用于路由）
    entrypoint_slug: z.string()
      .min(2, '入口点标识长度不小于2')
      .max(64, '入口点标识长度不大于64')
      .regex(/^[a-zA-Z0-9\-_]{2,64}$/, '入口点标识应该是字母、数字、连字符或下划线，长度在2到64之间'),
    // 入口点URL
    entrypoint_url: z.string().url().nullable().optional(),
    // 入口点配置对象，存储任意键值对配置信息
    entrypoint_config: z.record(z.string(), z.any()),
    // 入口点说明文档内容
    entrypoint_readme: z.string().nullable(),
    // 爬虫类型（只读）
    spider_type: z.string(),
    // 最小可用间隔（只读）
    min_available_interval: z.number(),
    // 触发时间（只读）
    triggered_at: z.string().nullable(),
    // 优先级（只读）
    priority: z.number(),
})

/**
 * EntrypointItem 类型定义
 * 从 EntrypointItemSchema 推断出的 TypeScript 类型
 */
export type EntrypointItemData = z.infer<typeof EntrypointItemSchema>
// endregion


// =====================================================================================================================
// 任务的基础Schema
// =====================================================================================================================
// region Job Schema
/**
 * 任务基础信息的 Zod 验证模式
 * 包含任务的基本元数据和状态信息
 */
export const JobItemSchema = z.object({
    // 准任务ID（必填）
    pre_task_id: z.number().int(),
    // 爬虫类型（必填）
    spider_type: z.string(),
    // 网站ID（必填）
    website_id: z.number().int(),
    // 网站Slug（必填）
    website_slug: z.string(),
    // 入口点ID（必填）
    entrypoint_id: z.number().int(),
    // 入口点Slug（必填）
    entrypoint_slug: z.string(),
    // 最小可用时间（默认360秒）
    min_available_interval: z.number().default(360),
    // 触发时间
    triggered_at: z.string().nullable(),
    // 采集结束时间
    end_at: z.string().nullable(),
    // 入口点信息
    entrypoint: EntrypointItemSchema,
    // 任务ID
    task_id: z.number().int(),
    // 网站任务ID
    website_task_id: z.number().int().nullable(),
    // 入口点任务ID
    entrypoint_task_id: z.number().int().nullable(),
    // 任务Slug
    task_slug: z.string().nullable(),
    // 任务名称
    task_name: z.string().nullable(),
    // 任务状态
    task_status: z.string().nullable(),
    // 任务结果状态
    task_result_status: TaskStatusEnum.nullable(),
    // 节点ID
    node_id: z.string().nullable(),
    // 节点地址
    node_address: z.string().nullable(),
    // 创建时间
    create_at: z.string().nullable(),
    // 关闭时间
    closed_at: z.string().nullable(),
    // 采集开始时间
    begin_at: z.string().nullable(),
    // Actor ID
    uid: z.string().nullable(),
    // Actor地址
    address: z.string().nullable(),
    // 优先级（只读）
    priority: z.number(),
})

/**
 * 完整任务信息的 Zod 验证模式
 * 继承基础任务信息
 * 适用于任务详细信息的完整数据结构验证
 */
export const JobSchema = JobItemSchema.extend({})

/**
 * JobItem 类型定义
 * 从 JobItemSchema 推断出的 TypeScript 类型
 * 用于任务基础信息的数据类型标注
 */
export type JobItemData = z.infer<typeof JobItemSchema>

/**
 * Job 类型定义
 * 从 JobSchema 推断出的 TypeScript 类型
 * 用于完整任务信息的数据类型标注
 */
export type JobData = z.infer<typeof JobSchema>
// endregion


// =====================================================================================================================
// 申请任务Schema
// =====================================================================================================================
// region Job Apply Schema
/**
 * 申请任务的 Zod 验证模式
 * 用于验证申请并创建新任务请求的数据结构
 * 
 * 使用场景：
 * - 节点申请执行爬虫任务
 * - 创建新的爬虫任务记录
 * - 任务申请API请求参数验证
 */
export const JobApplySchema = z.object({
    // 节点ID（必填）
    // 用于标识申请任务的节点设备
    node_id: z.string().min(1, '节点ID不能为空'),
    // 节点地址（必填）
    // 用于标识节点的网络地址
    node_address: z.string().min(1, '节点地址不能为空'),
    // 网站Slug数组（可选）
    // 用于指定需要爬取的网站列表，数组中的元素必须唯一
    website_slugs: z.array(z.string()).optional(),
})

/**
 * JobApply 类型定义
 * 从 JobApplySchema 推断出的 TypeScript 类型
 * 用于申请任务数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 申请任务API请求体参数类型
 * - 任务申请组件的状态管理
 * - 任务申请表单数据验证结果
 */
export type JobApplyData = z.infer<typeof JobApplySchema>
// endregion


// =====================================================================================================================
// 确认任务Schema
// =====================================================================================================================
// region Job Ensure Schema
/**
 * 确认任务的 Zod 验证模式
 * 用于验证确认任务请求的数据结构
 * 
 * 使用场景：
 * - 节点确认接收任务
 * - 更新任务的执行节点信息
 * - 任务确认API请求参数验证
 */
export const JobEnsureSchema = z.object({
    // Actor ID（必填，可为空）
    // 用于标识执行任务的Actor
    uid: z.string().nullable(),
    // Actor地址（必填，可为空）
    // 用于标识Actor的网络地址
    address: z.string().nullable(),
})

/**
 * JobEnsure 类型定义
 * 从 JobEnsureSchema 推断出的 TypeScript 类型
 * 用于确认任务数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 确认任务API请求体参数类型
 * - 任务确认组件的状态管理
 * - 任务确认表单数据验证结果
 */
export type JobEnsureData = z.infer<typeof JobEnsureSchema>
// endregion


// =====================================================================================================================
// 完成任务Schema
// =====================================================================================================================
// region Job Complete Schema
/**
 * 完成任务的 Zod 验证模式
 * 用于验证完成任务请求的数据结构
 * 
 * 使用场景：
 * - 节点报告任务完成
 * - 更新任务的完成时间和结果
 * - 任务完成API请求参数验证
 */
export const JobCompleteSchema = z.object({
    // 任务结束的最早文章发布时间（必填，可为空）
    // 用于记录任务执行期间采集到的最早文章的发布时间
    end_at: z.string().datetime('请输入有效的日期时间格式').nullable(),
})

/**
 * JobComplete 类型定义
 * 从 JobCompleteSchema 推断出的 TypeScript 类型
 * 用于完成任务数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 完成任务API请求体参数类型
 * - 任务完成组件的状态管理
 * - 任务完成表单数据验证结果
 */
export type JobCompleteData = z.infer<typeof JobCompleteSchema>
// endregion


// =====================================================================================================================
// 任务集合Schema
// =====================================================================================================================
// region Job Collection Schema
/**
 * 任务列表集合的 Zod 验证模式
 * 用于验证包含多个任务信息及分页数据的复合数据结构
 * 适用于任务列表查询API响应数据的验证，包含任务数据数组和分页信息
 * 
 * 使用场景：
 * - 任务列表页面的数据获取API响应
 * - 分页查询多个任务的场景
 * - 任务管理后台的列表展示功能
 * - 批量获取任务信息的数据结构验证
 */
export const JobsSchema = z.object({
    // 任务数据列表
    // 包含多个任务的详细信息，每个元素都是符合JobSchema格式的完整任务对象
    jobs: z.array(JobSchema),
    // 分页信息对象
    // 包含当前页码、总条数、页大小等分页相关的元数据，用于前端分页组件展示
    pagination: PaginationInfoSchema,
})

/**
 * Jobs 类型定义
 * 从 JobsSchema 推断出的 TypeScript 类型
 * 用于任务列表集合数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 任务列表API响应数据类型
 * - 任务列表组件的props类型定义
 * - 列表数据状态管理的类型约束
 * - 分页数据处理函数的参数类型
 */
export type JobsData = z.infer<typeof JobsSchema>
// endregion


// =====================================================================================================================
// 批量导出Schema
// =====================================================================================================================
// region Batch Export Schema
/**
 * 作业任务批量导出的 Zod 验证模式
 * 用于验证批量导出作业任务时的请求数据结构
 *
 * 使用场景：
 * - 批量导出多个作业任务的数据
 * - 指定需要导出的作业任务ID列表
 * - 前端表单数据验证
 * - API 请求体参数验证
 */
export const TaskBatchExportSchema = z.object({
    // 需要批量导出的作业任务ID数组
    // 该字段包含一个或多个作业任务的唯一标识符，用于指定需要导出数据的作业任务
    // 数组中每个ID都应该是正整数，代表一个有效的作业任务记录
    task_ids: z.array(
      z.number()
        .int()
        .positive('作业任务ID必须是正整数')
    ).min(1, '至少需要选择一个作业任务进行导出')
      .max(100, '单次批量导出的作业任务数量不能超过100个'),
})

/**
 * TaskBatchExport 类型定义
 * 从 TaskBatchExportSchema 推断出的 TypeScript 类型
 * 用于作业任务批量导出数据的类型标注，确保类型安全
 *
 * 该类型通常用于：
 * - 批量导出API请求体参数类型
 * - 批量导出组件的状态管理
 * - 批量导出表单数据验证结果
 */
export type TaskBatchExportData = z.infer<typeof TaskBatchExportSchema>
// endregion