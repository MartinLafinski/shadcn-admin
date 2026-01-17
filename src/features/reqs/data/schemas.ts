import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'

// =====================================================================================================================
// 请求结果类型枚举
// =====================================================================================================================
// region Req Result Type Enum
/**
 * 请求结果类型枚举
 * 用于表示请求的不同执行结果状态
 */
export const ReqResultTypeEnum = z.enum(['succeed', 'failed', 'discarded'])

/**
 * ReqResultType 类型定义
 * 从 ReqResultTypeEnum 推断出的 TypeScript 类型
 */
export type ReqResultType = z.infer<typeof ReqResultTypeEnum>
// endregion


// =====================================================================================================================
// 请求的基础Schema
// =====================================================================================================================
// region Req Schema
/**
 * 请求基础信息的 Zod 验证模式
 * 包含请求的基本元数据和状态信息
 * 基于 OpenAPI 中的 WorkerPageItemSchema 定义
 */
export const ReqItemSchema = z.object({
    // 任务ID（必填）
    task_id: z.number().int(),
    // 标题
    title: z.string().nullable(),
    // URL
    url: z.string().nullable(),
    // HTTP方法（默认为GET）
    method: z.string().default('GET'),
    // 请求参数字典
    params: z.record(z.string(), z.any()).nullable(),
    // 发布日期
    published_at: z.string().nullable(),
    // 发生时间
    occurred_at: z.string().nullable(),
    // 请求ID
    req_id: z.number().int().nullable(),
    // 异常类型
    exp_type: z.string().nullable(),
    // 异常消息
    exp_msg: z.string().nullable(),
    // 弃用类型
    discard_type: z.string().nullable(),
    // 弃用消息
    discard_msg: z.string().nullable(),
    // 其他内容字典
    extra_info: z.record(z.string(), z.any()).nullable(),
    // 是否成功（默认为false）
    succeed: z.boolean().default(false),
})

/**
 * 完整请求信息的 Zod 验证模式
 * 继承基础请求信息
 * 适用于请求详细信息的完整数据结构验证
 */
export const ReqSchema = ReqItemSchema.extend({})

/**
 * ReqItem 类型定义
 * 从 ReqItemSchema 推断出的 TypeScript 类型
 * 用于请求基础信息的数据类型标注
 */
export type ReqItemData = z.infer<typeof ReqItemSchema>

/**
 * Req 类型定义
 * 从 ReqSchema 推断出的 TypeScript 类型
 * 用于完整请求信息的数据类型标注
 */
export type ReqData = z.infer<typeof ReqSchema>
// endregion


// =====================================================================================================================
// 请求集合Schema
// =====================================================================================================================
// region Req Collection Schema
/**
 * 请求列表集合的 Zod 验证模式
 * 用于验证包含多个请求信息及分页数据的复合数据结构
 * 适用于请求列表查询API响应数据的验证，包含请求数据数组和分页信息
 * 
 * 使用场景：
 * - 请求列表页面的数据获取API响应
 * - 分页查询多个请求的场景
 * - 请求管理后台的列表展示功能
 * - 批量获取请求信息的数据结构验证
 */
export const ReqsSchema = z.object({
    // 请求数据列表
    // 包含多个请求的详细信息，每个元素都是符合ReqSchema格式的完整请求对象
    reqs: z.array(ReqSchema),
    // 分页信息对象
    // 包含当前页码、总条数、页大小等分页相关的元数据，用于前端分页组件展示
    pagination: PaginationInfoSchema,
})

/**
 * Reqs 类型定义
 * 从 ReqsSchema 推断出的 TypeScript 类型
 * 用于请求列表集合数据的类型标注，确保类型安全
 * 
 * 该类型通常用于：
 * - 请求列表API响应数据类型
 * - 请求列表组件的props类型定义
 * - 列表数据状态管理的类型约束
 * - 分页数据处理函数的参数类型
 */
export type ReqsData = z.infer<typeof ReqsSchema>
// endregion