import { z } from 'zod'
import {
  createEntityToggleWithDisabledSchema,
  createEntityLockAuditSchema,
  createEntityPauseAuditSchema,
  createEntityDisabledAuditSchema,
  createEntitySwitchSchema,
} from '@/lib/base-schemas'

// =====================================================================================================================
// 作业分组 ViewFull Schema
// =====================================================================================================================
export const JobGroupItemSchema = z
  .object({
    jobgroup_id: z.number().int(),
    created_at: z.string(),
    updated_at: z.string(),
    created_by: z.string().optional().nullable(),
    updated_by: z.string().optional().nullable(),
    jobgroup_name: z
      .string()
      .trim()
      .min(2, '作业分组名称长度不小于2')
      .max(32, '作业分组名称长度不大于32'),
    jobgroup_slug: z
      .string()
      .trim()
      .min(2, '作业分组标识长度不小于2')
      .max(64, '作业分组标识长度不大于64')
      .regex(
        /^[a-zA-Z0-9\-_]{2,64}$/,
        '作业分组标识应该是字母、数字、连字符或下划线，长度在2到64之间'
      ),
    jobgroup_max_spider_task_count: z.number().int().default(128),
    jobgroup_config: z.record(z.string(), z.any()),
    jobgroup_readme: z.string().optional().nullable(),
    total_spider_task_count: z.number().int().default(0),
    working_spider_task_count: z.number().int().default(0),
    completed_spider_task_count: z.number().int().default(0),
    failed_spider_task_count: z.number().int().default(0),
    interrupted_spider_task_count: z.number().int().default(0),
    canceled_spider_task_count: z.number().int().default(0),
    jobgroup_free_spider_task_capacity: z.number().int().default(0),
    prejob_count: z.number().int().optional().nullable().default(0),
    has_limited: z.boolean().default(false),
    has_paused: z.boolean().default(false),
    has_locked: z.boolean().default(false),
    has_enabled: z.boolean().default(false),
    can_apply: z.boolean().default(false),
    total_material_count: z.number().int().optional().nullable().default(0),
    material_type: z.string().optional().nullable().default('unknown'),
    material_unknown_count: z.number().int().optional().nullable().default(0),
    material_speech_count: z.number().int().optional().nullable().default(0),
    material_news_count: z.number().int().optional().nullable().default(0),
    material_note_count: z.number().int().optional().nullable().default(0),
    material_article_count: z.number().int().optional().nullable().default(0),
    material_bid_count: z.number().int().optional().nullable().default(0),
    material_trade_count: z.number().int().optional().nullable().default(0),
    material_product_count: z.number().int().optional().nullable().default(0),
    material_company_count: z.number().int().optional().nullable().default(0),
    material_shop_count: z.number().int().optional().nullable().default(0),
    material_recruit_count: z.number().int().optional().nullable().default(0),
    material_image_count: z.number().int().optional().nullable().default(0),
    material_video_count: z.number().int().optional().nullable().default(0),
    material_file_count: z.number().int().optional().nullable().default(0),
    material_subs_count: z.number().int().optional().nullable().default(0),
  })
  .extend({
    ...createEntityToggleWithDisabledSchema('jobgroup').shape,
    ...createEntityLockAuditSchema('jobgroup').shape,
    ...createEntityPauseAuditSchema('jobgroup').shape,
    ...createEntityDisabledAuditSchema('jobgroup').shape,
  })

export type JobGroupItemData = z.infer<typeof JobGroupItemSchema>

// =====================================================================================================================
// 创建 Schema
// =====================================================================================================================
export const JobGroupCreateSchema = z.object({
  jobgroup_name: z
    .string()
    .trim()
    .min(2, '作业分组名称长度不小于2')
    .max(32, '作业分组名称长度不大于32'),
  jobgroup_slug: z
    .string()
    .trim()
    .min(2, '作业分组标识长度不小于2')
    .max(64, '作业分组标识长度不大于64')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '作业分组标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  jobgroup_max_spider_task_count: z.number().int().default(128),
  jobgroup_config: z.record(z.string(), z.any()).optional().default({}),
  jobgroup_readme: z.string().optional(),
})

export type JobGroupCreateData = z.infer<typeof JobGroupCreateSchema>

// =====================================================================================================================
// 更新 Schema
// =====================================================================================================================
export const JobGroupUpdateSchema = z.object({
  jobgroup_name: z
    .string()
    .trim()
    .min(2, '作业分组名称长度不小于2')
    .max(32, '作业分组名称长度不大于32'),
  jobgroup_slug: z
    .string()
    .trim()
    .min(2, '作业分组标识长度不小于2')
    .max(64, '作业分组标识长度不大于64')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '作业分组标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  jobgroup_max_spider_task_count: z.number().int(),
})

export type JobGroupUpdateData = z.infer<typeof JobGroupUpdateSchema>

// =====================================================================================================================
// 配置局部更新 Schema
// =====================================================================================================================
export const PatchJobGroupSchema = z.object({
  jobgroup_config: z.record(z.string(), z.any()).optional(),
  jobgroup_readme: z.string().optional(),
})

export type PatchJobGroupData = z.infer<typeof PatchJobGroupSchema>

// =====================================================================================================================
// 开关 Schema
// =====================================================================================================================
export const JobGroupSwitchSchema = createEntitySwitchSchema('jobgroup')

export type JobGroupSwitchData = z.infer<typeof JobGroupSwitchSchema>

// =====================================================================================================================
// 批量操作 Schema
// =====================================================================================================================
export const BatchSwitchJobGroupsSchema = z.object({
  jobgroup_ids: z.array(z.number().int()).min(1, '至少需要选择一个作业分组'),
  jobgroup_enabled: z.boolean(),
})

export type BatchSwitchJobGroupsData = z.infer<
  typeof BatchSwitchJobGroupsSchema
>

export const BatchLockJobGroupsSchema = z.object({
  jobgroup_ids: z.array(z.number().int()).min(1, '至少需要选择一个作业分组'),
  jobgroup_locked: z.boolean(),
})

export type BatchLockJobGroupsData = z.infer<typeof BatchLockJobGroupsSchema>

export const BatchPauseJobGroupsSchema = z.object({
  jobgroup_ids: z.array(z.number().int()).min(1, '至少需要选择一个作业分组'),
  jobgroup_paused: z.boolean(),
})

export type BatchPauseJobGroupsData = z.infer<typeof BatchPauseJobGroupsSchema>

export const BatchExportJobGroupsSchema = z.object({
  jobgroup_ids: z
    .array(z.number().int().positive('作业分组ID必须是正整数'))
    .min(1, '至少需要选择一个作业分组进行导出')
    .max(100, '单次批量导出的作业分组数量不能超过100个'),
})

export type BatchExportJobGroupsData = z.infer<
  typeof BatchExportJobGroupsSchema
>

export const SyncJobGroupsSchema = z.object({
  clear_locked: z.boolean().default(false).describe('重置锁定信息'),
  clear_paused: z.boolean().default(false).describe('重置暂停信息'),
  clear_spider_tasks: z.boolean().default(false).describe('重置爬虫任务关联'),
})

export type SyncJobGroupsData = z.infer<typeof SyncJobGroupsSchema>
