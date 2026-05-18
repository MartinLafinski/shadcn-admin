import { z } from 'zod'
import {
  createEntityToggleWithDisabledSchema,
  createEntityLockAuditSchema,
  createEntityPauseAuditSchema,
  createEntityDisabledAuditSchema,
  createEntitySwitchSchema,
} from '@/lib/base-schemas'
import { WebsiteItemSchema } from '@/features/websites/data/schemas'

// =====================================================================================================================
// SessionRateLimit Schema
// =====================================================================================================================
export const SessionRateLimitSchema = z.object({
  max_uses: z.number().int().min(1, '最小为1'),
  within_minutes: z.number().int().min(1, '最小为1'),
  consider_ip: z.boolean().default(false),
})

export type SessionRateLimitData = z.infer<typeof SessionRateLimitSchema>

// =====================================================================================================================
// 爬虫会话 ViewFull Schema
// =====================================================================================================================
export const SpiderSessionItemSchema = z
  .object({
    session_id: z.number().int(),
    created_at: z.string(),
    updated_at: z.string(),
    created_by: z.string().optional().nullable(),
    updated_by: z.string().optional().nullable(),
    website_id: z.number().int(),
    website: WebsiteItemSchema.nullable(),
    session_name: z.string().trim().min(2).max(32),
    session_slug: z
      .string()
      .trim()
      .min(2)
      .max(64)
      .regex(/^[a-zA-Z0-9\-_]{2,64}$/),
    session_user_agent: z.string().optional().nullable(),
    session_headers: z.record(z.string(), z.string()).default({}),
    session_cookies: z.array(z.any()).default([]),
    session_proxy: z.string().optional().nullable(),
    session_weight: z.number().int().default(0),
    session_max_spider_task_count: z.number().int().default(128),
    session_pool_id: z.number().int().optional().nullable(),
    session_expired: z.boolean().default(false),
    expired_at: z.string().optional().nullable(),
    rate_limits: z.array(SessionRateLimitSchema),
    session_config: z.record(z.string(), z.any()),
    session_readme: z.string().optional().nullable(),
    total_spider_task_count: z.number().int().default(0),
    working_spider_task_count: z.number().int().default(0),
    completed_spider_task_count: z.number().int().default(0),
    failed_spider_task_count: z.number().int().default(0),
    interrupted_spider_task_count: z.number().int().default(0),
    canceled_spider_task_count: z.number().int().default(0),
    session_free_spider_task_capacity: z.number().int().default(0),
    has_limited: z.boolean().default(false),
    has_paused: z.boolean().default(false),
    has_locked: z.boolean().default(false),
    has_expired: z.boolean().default(false),
    has_enabled: z.boolean().default(false),
    can_apply: z.boolean().default(false),
  })
  .extend({
    ...createEntityToggleWithDisabledSchema('session').shape,
    ...createEntityLockAuditSchema('session').shape,
    ...createEntityPauseAuditSchema('session').shape,
    ...createEntityDisabledAuditSchema('session').shape,
  })

export type SpiderSessionItemData = z.infer<typeof SpiderSessionItemSchema>

// =====================================================================================================================
// 创建 Schema
// =====================================================================================================================
export const SpiderSessionCreateSchema = z.object({
  website_id: z.number().int(),
  session_name: z.string().trim().min(2).max(32),
  session_slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-zA-Z0-9\-_]{2,64}$/),
  session_pool_id: z.number().int().optional().nullable(),
  session_user_agent: z.string().optional().nullable(),
  session_headers: z.record(z.string(), z.string()).optional().default({}),
  session_cookies: z.array(z.any()).optional().default([]),
  session_proxy: z.string().optional().nullable(),
  session_weight: z.number().int().default(0),
  session_max_spider_task_count: z.number().int().default(128),
  expired_at: z.string().optional().nullable(),
  rate_limits: z.array(SessionRateLimitSchema).optional().default([]),
  session_config: z.record(z.string(), z.any()).optional().default({}),
  session_readme: z.string().optional(),
})

export type SpiderSessionCreateData = z.infer<typeof SpiderSessionCreateSchema>

// =====================================================================================================================
// 更新 Schema
// =====================================================================================================================
export const SpiderSessionUpdateSchema = z.object({
  website_id: z.number().int(),
  session_name: z.string().trim().min(2).max(32),
  session_slug: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-zA-Z0-9\-_]{2,64}$/),
  session_pool_id: z.number().int().optional().nullable(),
  session_user_agent: z.string().optional().nullable(),
  session_headers: z.record(z.string(), z.string()),
  session_cookies: z.array(z.any()),
  session_proxy: z.string().optional().nullable(),
  session_weight: z.number().int(),
  session_max_spider_task_count: z.number().int(),
  expired_at: z.string().optional().nullable(),
  rate_limits: z.array(SessionRateLimitSchema),
})

export type SpiderSessionUpdateData = z.infer<typeof SpiderSessionUpdateSchema>

// =====================================================================================================================
// 配置局部更新
// =====================================================================================================================
export const PatchSpiderSessionSchema = z.object({
  session_config: z.record(z.string(), z.any()).optional(),
  session_readme: z.string().optional(),
})

export type PatchSpiderSessionData = z.infer<typeof PatchSpiderSessionSchema>

// =====================================================================================================================
// 开关 + 批量
// =====================================================================================================================
export const SpiderSessionSwitchSchema = createEntitySwitchSchema('session')
export type SpiderSessionSwitchData = z.infer<typeof SpiderSessionSwitchSchema>

export const BatchSwitchSpiderSessionsSchema = z.object({
  session_ids: z.array(z.number().int()).min(1),
  session_enabled: z.boolean(),
})
export type BatchSwitchSpiderSessionsData = z.infer<
  typeof BatchSwitchSpiderSessionsSchema
>

export const BatchLockSpiderSessionsSchema = z.object({
  session_ids: z.array(z.number().int()).min(1),
  session_locked: z.boolean(),
})
export type BatchLockSpiderSessionsData = z.infer<
  typeof BatchLockSpiderSessionsSchema
>

export const BatchPauseSpiderSessionsSchema = z.object({
  session_ids: z.array(z.number().int()).min(1),
  session_paused: z.boolean(),
})
export type BatchPauseSpiderSessionsData = z.infer<
  typeof BatchPauseSpiderSessionsSchema
>

export const BatchExportSpiderSessionsSchema = z.object({
  session_ids: z.array(z.number().int().positive()).min(1).max(100),
})
export type BatchExportSpiderSessionsData = z.infer<
  typeof BatchExportSpiderSessionsSchema
>

export const SyncSpiderSessionsSchema = z.object({
  clear_locked: z.boolean().default(false),
  clear_paused: z.boolean().default(false),
  clear_spider_tasks: z.boolean().default(false),
})
export type SyncSpiderSessionsData = z.infer<typeof SyncSpiderSessionsSchema>
