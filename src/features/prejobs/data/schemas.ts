import { z } from 'zod'
import {
  createEntityToggleWithDisabledSchema,
  createEntityLockAuditSchema,
  createEntityPauseAuditSchema,
  createEntityDisabledAuditSchema,
  createEntitySwitchSchema,
} from '@/lib/base-schemas'
import { EntrypointItemSchema } from '@/features/entrypoints/data/schemas'

// =====================================================================================================================
// ViewFullPrejobSchema
// =====================================================================================================================
export const PrejobItemSchema = z
  .object({
    prejob_id: z.number().int(),
    created_at: z.string(),
    updated_at: z.string(),
    updated_by: z.string().optional().nullable(),
    created_by: z.string().optional().nullable(),
    prejob_name: z.string(),
    prejob_slug: z
      .string()
      .trim()
      .min(2, '预备作业标识长度不小于2')
      .max(64, '预备作业标识长度不大于64')
      .regex(
        /^[a-zA-Z0-9\-_]{2,64}$/,
        '预备作业标识应该是字母、数字、连字符或下划线，长度在2到64之间'
      ),
    prejob_config: z.record(z.string(), z.any()),
    prejob_readme: z.string().optional().nullable(),
    prejob_level: z.string(),
    entrypoint_id: z.number().int().nullable(),
    entrypoint: EntrypointItemSchema.nullable(),
    prejob_max_spider_task_count: z.number().int().optional(),
    working_spider_task_count: z.number().int().optional().nullable(),
    completed_spider_task_count: z.number().int().optional().nullable(),
    failed_spider_task_count: z.number().int().optional().nullable(),
    interrupted_spider_task_count: z.number().int().optional().nullable(),
    canceled_spider_task_count: z.number().int().optional().nullable(),
    total_spider_task_count: z.number().int().optional().nullable(),
    total_material_count: z.number().int().optional().nullable(),
    material_type: z.string().optional().nullable().default('unknown'),
    material_unknown_count: z.number().int().optional().nullable(),
    material_speech_count: z.number().int().optional().nullable(),
    material_news_count: z.number().int().optional().nullable(),
    material_note_count: z.number().int().optional().nullable(),
    material_article_count: z.number().int().optional().nullable(),
    material_bid_count: z.number().int().optional().nullable(),
    material_trade_count: z.number().int().optional().nullable(),
    material_product_count: z.number().int().optional().nullable(),
    material_company_count: z.number().int().optional().nullable(),
    material_shop_count: z.number().int().optional().nullable(),
    material_recruit_count: z.number().int().optional().nullable(),
    material_image_count: z.number().int().optional().nullable(),
    material_video_count: z.number().int().optional().nullable(),
    material_file_count: z.number().int().optional().nullable(),
    material_subs_count: z.number().int().optional().nullable(),
    applying_spider_task_count: z.number().int().optional().nullable(),
    preparing_spider_task_count: z.number().int().optional().nullable(),
    running_spider_task_count: z.number().int().optional().nullable(),
    paused_spider_task_count: z.number().int().optional().nullable(),
    allocated_spider_task_count: z.number().int().optional().nullable(),
    cycled_spider_task_count: z.number().int().optional().nullable(),
    max_tasks_in_website: z.number().int(),
    max_tasks_in_entrypoint: z.number().int(),
    max_tasks_in_prejob: z.number().int(),
    min_tasks_in_prejob: z.number().int(),
    lock_prejob_on_working: z.boolean(),
    lock_entrypoint_on_working: z.boolean(),
    lock_website_on_working: z.boolean(),
    last_trigger_at: z.string().optional().nullable(),
    next_trigger_at: z.string().optional().nullable(),
    interval: z.number().int(),
    config: z.record(z.string(), z.any()),
    on_success: z.string(),
    on_failure: z.string(),
    has_locked: z.boolean().default(false),
    has_paused: z.boolean().default(false),
    has_enabled: z.boolean().default(false),
    has_limited: z.boolean().default(false),
    can_apply: z.boolean().optional().nullable(),
    prejob_free_task_capacity: z.number().int().optional(),
  })
  .extend({
    ...createEntityToggleWithDisabledSchema('prejob').shape,
    ...createEntityLockAuditSchema('prejob').shape,
    ...createEntityPauseAuditSchema('prejob').shape,
    ...createEntityDisabledAuditSchema('prejob').shape,
  })

export type PrejobItemData = z.infer<typeof PrejobItemSchema>

// =====================================================================================================================
// 创建 Schema
// =====================================================================================================================
export const PrejobCreateSchema = z.object({
  prejob_name: z
    .string()
    .trim()
    .min(2, '预备作业名称长度不小于2')
    .max(32, '预备作业名称长度不大于32'),
  prejob_slug: z
    .string()
    .trim()
    .min(2, '预备作业标识长度不小于2')
    .max(64, '预备作业标识长度不大于64')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '预备作业标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  entrypoint_id: z.number().int().nullable(),
  prejob_level: z.string().optional(),
  max_tasks_in_website: z.number().int().optional(),
  max_tasks_in_entrypoint: z.number().int().optional(),
  max_tasks_in_prejob: z.number().int().optional(),
  min_tasks_in_prejob: z.number().int().optional(),
  prejob_max_spider_task_count: z.number().int().optional(),
  lock_prejob_on_working: z.boolean().optional(),
  lock_entrypoint_on_working: z.boolean().optional(),
  lock_website_on_working: z.boolean().optional(),
  last_trigger_at: z.string().nullable().optional(),
  next_trigger_at: z.string().nullable().optional(),
  interval: z.number().int().optional(),
  on_success: z.string().optional(),
  on_failure: z.string().optional(),
  prejob_config: z.record(z.string(), z.any()).optional().default({}),
  prejob_readme: z.string().optional(),
})

export type PrejobCreateData = z.infer<typeof PrejobCreateSchema>

// =====================================================================================================================
// 更新 Schema
// =====================================================================================================================
export const PrejobUpdateSchema = z.object({
  prejob_name: z
    .string()
    .trim()
    .min(2, '预备作业名称长度不小于2')
    .max(32, '预备作业名称长度不大于32'),
  prejob_slug: z
    .string()
    .trim()
    .min(2, '预备作业标识长度不小于2')
    .max(64, '预备作业标识长度不大于64')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '预备作业标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  entrypoint_id: z.number().int().nullable(),
  prejob_level: z.string(),
  max_tasks_in_website: z.number().int(),
  max_tasks_in_entrypoint: z.number().int(),
  max_tasks_in_prejob: z.number().int(),
  min_tasks_in_prejob: z.number().int(),
  prejob_max_spider_task_count: z.number().int(),
  lock_prejob_on_working: z.boolean(),
  lock_entrypoint_on_working: z.boolean(),
  lock_website_on_working: z.boolean(),
  last_trigger_at: z.string().nullable(),
  next_trigger_at: z.string().nullable(),
  interval: z.number().int(),
  on_success: z.string(),
  on_failure: z.string(),
})

export type PrejobUpdateData = z.infer<typeof PrejobUpdateSchema>

// =====================================================================================================================
// 配置局部更新 Schema
// =====================================================================================================================
export const PatchPrejobSchema = z.object({
  prejob_config: z.record(z.string(), z.any()).optional(),
  prejob_readme: z.string().optional(),
})

export type PatchPrejobData = z.infer<typeof PatchPrejobSchema>

// =====================================================================================================================
// 开关 Schema
// =====================================================================================================================
export const PrejobSwitchSchema = createEntitySwitchSchema('prejob')
export type PrejobSwitchData = z.infer<typeof PrejobSwitchSchema>

// =====================================================================================================================
// 批量操作 Schema
// =====================================================================================================================
export const BatchSwitchPrejobsSchema = z.object({
  prejob_ids: z.array(z.number().int()).min(1, '至少需要选择一个预备作业'),
  prejob_enabled: z.boolean(),
})
export type BatchSwitchPrejobsData = z.infer<typeof BatchSwitchPrejobsSchema>

export const BatchLockPrejobsSchema = z.object({
  prejob_ids: z.array(z.number().int()).min(1, '至少需要选择一个预备作业'),
  prejob_locked: z.boolean(),
})
export type BatchLockPrejobsData = z.infer<typeof BatchLockPrejobsSchema>

export const BatchPausePrejobsSchema = z.object({
  prejob_ids: z.array(z.number().int()).min(1, '至少需要选择一个预备作业'),
  prejob_paused: z.boolean(),
})
export type BatchPausePrejobsData = z.infer<typeof BatchPausePrejobsSchema>

export const BatchExportPrejobsSchema = z.object({
  prejob_ids: z
    .array(z.number().int().positive('预备作业ID必须是正整数'))
    .min(1, '至少需要选择一个预备作业进行导出')
    .max(100, '单次批量导出的预备作业数量不能超过100个'),
})
export type BatchExportPrejobsData = z.infer<typeof BatchExportPrejobsSchema>

export const SyncPrejobsSchema = z.object({
  website_ids: z.array(z.number()).optional(),
  entrypoint_ids: z.array(z.number()).optional(),
  clear_locked: z.boolean().default(false),
  clear_paused: z.boolean().default(false),
  clear_spider_tasks: z.boolean().default(false),
})
export type SyncPrejobsData = z.infer<typeof SyncPrejobsSchema>
