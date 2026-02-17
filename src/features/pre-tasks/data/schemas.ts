import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'
import { EntrypointItemSchema } from '@/features/entrypoints/data/schemas'


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