import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'
import { EntrypointItemSchema } from '@/features/entrypoints/data/schemas'

// // =====================================================================================================================
// // 网站基础Schema（用于准任务关联）
// // =====================================================================================================================
// // region Website Schema
// /**
//  * 网站基础信息的 Zod 验证模式
//  * 用于准任务关联的网站信息
//  */
// export const WebsiteItemSchema = z.object({
//     // 网站唯一标识符
//     website_id: z.number().int(),
//     // 创建者标识
//     created_by: z.string().min(2).max(32).nullable(),
//     // 更新者标识
//     updated_by: z.string().min(2).max(32).nullable(),
//     // 创建时间戳
//     created_at: z.string().nullable(),
//     // 更新时间戳
//     updated_at: z.string().nullable(),
//     // 网站是否启用状态
//     website_enabled: z.boolean(),
//     // 网站显示名称
//     website_name: z.string().min(2).max(32),
//     // 网站URL标识符（通常用于路由）
//     website_slug: z.string()
//       .min(2, '网站标识长度不小于2')
//       .max(32, '网站标识长度不大于32')
//       .regex(/^[a-zA-Z0-9\-_]{2,32}$/, '网站标识应该是字母、数字、连字符或下划线，长度在2到32之间'),
//     // 网站访问URL（可选字段）
//     website_url: z.string().url().nullable().optional(),
//     // 网站配置对象，存储任意键值对配置信息
//     website_config: z.record(z.string(), z.any()),
//     // 网站说明文档内容
//     website_readme: z.string().nullable(),
// })
//
// /**
//  * WebsiteItem 类型定义
//  * 从 WebsiteItemSchema 推断出的 TypeScript 类型
//  */
// export type WebsiteItemData = z.infer<typeof WebsiteItemSchema>
// // endregion
//
//
// // =====================================================================================================================
// // 入口点基础Schema（用于准任务关联）
// // =====================================================================================================================
// // region Entrypoint Schema
// /**
//  * 入口点基础信息的 Zod 验证模式
//  * 用于准任务关联的入口点信息
//  */
// export const EntrypointItemSchema = z.object({
//     // 入口点唯一标识符
//     entrypoint_id: z.number().int(),
//     // 创建者标识
//     created_by: z.string().min(2).max(32).nullable(),
//     // 更新者标识
//     updated_by: z.string().min(2).max(32).nullable(),
//     // 创建时间戳
//     created_at: z.string().nullable(),
//     // 更新时间戳
//     updated_at: z.string().nullable(),
//     // 抓取开始时间
//     begin_at: z.string().nullable(),
//     // 抓取结束时间
//     end_at: z.string().nullable(),
//     // 入口点是否启用状态
//     entrypoint_enabled: z.boolean(),
//     // 网站ID
//     website_id: z.number().int().nullable(),
//     // 网站信息
//     website: WebsiteItemSchema.nullable(),
//     // 入口点名称
//     entrypoint_name: z.string().min(2).max(32),
//     // 入口点URL标识符（通常用于路由）
//     entrypoint_slug: z.string()
//       .min(2, '入口点标识长度不小于2')
//       .max(64, '入口点标识长度不大于64')
//       .regex(/^[a-zA-Z0-9\-_]{2,64}$/, '入口点标识应该是字母、数字、连字符或下划线，长度在2到64之间'),
//     // 入口点URL
//     entrypoint_url: z.string().url().nullable().optional(),
//     // 入口点配置对象，存储任意键值对配置信息
//     entrypoint_config: z.record(z.string(), z.any()),
//     // 入口点说明文档内容
//     entrypoint_readme: z.string().nullable(),
//     // 爬虫类型（只读）
//     spider_type: z.string(),
//     // 最小可用间隔（只读）
//     min_available_interval: z.number(),
//     // 触发时间（只读）
//     triggered_at: z.string().nullable(),
//     // 优先级（只读）
//     priority: z.number(),
// })
//
// /**
//  * EntrypointItem 类型定义
//  * 从 EntrypointItemSchema 推断出的 TypeScript 类型
//  */
// export type EntrypointItemData = z.infer<typeof EntrypointItemSchema>
// // endregion


// =====================================================================================================================
// 准任务的基础Schema
// =====================================================================================================================
// region PreTask Schema
/**
 * 准任务基础信息的 Zod 验证模式
 * 包含准任务的基本元数据和状态信息
 */
export const PreTaskItemSchema = z.object({
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
    entrypoint: EntrypointItemSchema.nullable(),
    // 优先级（只读）
    priority: z.number(),
})

/**
 * 完整准任务信息的 Zod 验证模式
 * 继承基础准任务信息
 * 适用于准任务详细信息的完整数据结构验证
 */
export const PreTaskSchema = PreTaskItemSchema.extend({})

/**
 * PreTaskItem 类型定义
 * 从 PreTaskItemSchema 推断出的 TypeScript 类型
 * 用于准任务基础信息的数据类型标注
 */
export type PreTaskItemData = z.infer<typeof PreTaskItemSchema>

/**
 * PreTask 类型定义
 * 从 PreTaskSchema 推断出的 TypeScript 类型
 * 用于完整准任务信息的数据类型标注
 */
export type PreTaskData = z.infer<typeof PreTaskSchema>
// endregion


// =====================================================================================================================
// 准任务集合Schema
// =====================================================================================================================
// region PreTask Collection Schema
/**
 * 准任务列表集合的 Zod 验证模式
 * 用于验证包含多个准任务信息及分页数据的复合数据结构
 * 适用于准任务列表查询API响应数据的验证，包含准任务数据数组和分页信息
 * 
 * 使用场景：
 * - 准任务列表页面的数据获取API响应
 * - 分页查询多个准任务的场景
 * - 准任务管理后台的列表展示功能
 * - 批量获取准任务信息的数据结构验证
 */
export const PreTasksSchema = z.object({
    // 准任务数据列表
    // 包含多个准任务的详细信息，每个元素都是符合PreTaskSchema格式的完整准任务对象
    preTasks: z.array(PreTaskSchema),
    // 分页信息对象
    // 包含当前页码、总条数、页大小等分页相关的元数据，用于前端分页组件展示
    pagination: PaginationInfoSchema,
})

/**
 * PreTasks 类型定义
 * 从 PreTasksSchema 推断出的 TypeScript 类型
 * 用于准任务列表集合数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 准任务列表API响应数据类型
 * - 准任务列表组件的props类型定义
 * - 列表数据状态管理的类型约束
 * - 分页数据处理函数的参数类型
 */
export type PreTasksData = z.infer<typeof PreTasksSchema>
// endregion


// =====================================================================================================================
// 批量导出Schema
// =====================================================================================================================
// region Batch Export Schema
/**
 * 准任务批量导出的 Zod 验证模式
 * 用于验证批量导出准任务时的请求数据结构
 * 
 * 使用场景：
 * - 批量导出多个准任务的数据
 * - 指定需要导出的准任务ID列表
 * - 前端表单数据验证
 * - API 请求体参数验证
 */
export const PreTaskBatchExportSchema = z.object({
    // 需要批量导出的准任务ID数组
    // 该字段包含一个或多个准任务的唯一标识符，用于指定需要导出数据的准任务
    // 数组中每个ID都应该是正整数，代表一个有效的准任务记录
    pre_task_ids: z.array(
        z.number()
          .int()
          .positive('准任务ID必须是正整数')
    ).min(1, '至少需要选择一个准任务进行导出')
     .max(100, '单次批量导出的准任务数量不能超过100个'),
})

/**
 * PreTaskBatchExport 类型定义
 * 从 PreTaskBatchExportSchema 推断出的 TypeScript 类型
 * 用于准任务批量导出数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 批量导出API请求体参数类型
 * - 批量导出组件的状态管理
 * - 批量导出表单数据验证结果
 */
export type PreTaskBatchExportData = z.infer<typeof PreTaskBatchExportSchema>
// endregion