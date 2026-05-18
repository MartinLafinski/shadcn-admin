import { z } from 'zod'

// =====================================================================================================================
// 工厂函数：生成带前缀的实体 toggle 状态字段
// =====================================================================================================================

type ToggleKeys = 'enabled' | 'locked' | 'paused' | 'limited'
type ToggleWithDisabledKeys = ToggleKeys | 'disabled'
type LockAuditKeys = 'locked_by' | 'locked_at' | 'unlocked_by' | 'unlocked_at'
type PauseAuditKeys = 'paused_by' | 'paused_at' | 'resumed_by' | 'resumed_at'
type DisabledAuditKeys =
  | 'disabled_by'
  | 'disabled_at'
  | 'enabled_by'
  | 'enabled_at'
type LimitedAuditKeys =
  | 'limited_by'
  | 'limited_at'
  | 'unlimited_by'
  | 'unlimited_at'

/**
 * 生成实体基础 toggle 字段 Schema（_enabled, _locked, _paused, _limited）
 */
export function createEntityToggleSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_enabled`]: z.boolean(),
    [`${prefix}_locked`]: z.boolean(),
    [`${prefix}_paused`]: z.boolean(),
    [`${prefix}_limited`]: z.boolean(),
  }) as unknown as z.ZodObject<{ [K in `${P}_${ToggleKeys}`]: z.ZodBoolean }>
}

/**
 * 生成实体扩展 toggle 字段 Schema（含 _disabled）
 * spider-sessions 和 jobgroups 使用
 */
export function createEntityToggleWithDisabledSchema<P extends string>(
  prefix: P
) {
  return z.object({
    [`${prefix}_enabled`]: z.boolean(),
    [`${prefix}_locked`]: z.boolean(),
    [`${prefix}_paused`]: z.boolean(),
    [`${prefix}_limited`]: z.boolean(),
    [`${prefix}_disabled`]: z.boolean(),
  }) as unknown as z.ZodObject<{
    [K in `${P}_${ToggleWithDisabledKeys}`]: z.ZodBoolean
  }>
}

/**
 * 生成 Lock 操作元数据
 */
export function createEntityLockAuditSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_locked_by`]: z.string().optional().nullable(),
    [`${prefix}_locked_at`]: z.string().optional().nullable(),
    [`${prefix}_unlocked_by`]: z.string().optional().nullable(),
    [`${prefix}_unlocked_at`]: z.string().optional().nullable(),
  }) as unknown as z.ZodObject<{
    [K in `${P}_${LockAuditKeys}`]: z.ZodOptional<z.ZodNullable<z.ZodString>>
  }>
}

/**
 * 生成 Pause 操作元数据
 */
export function createEntityPauseAuditSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_paused_by`]: z.string().optional().nullable(),
    [`${prefix}_paused_at`]: z.string().optional().nullable(),
    [`${prefix}_resumed_by`]: z.string().optional().nullable(),
    [`${prefix}_resumed_at`]: z.string().optional().nullable(),
  }) as unknown as z.ZodObject<{
    [K in `${P}_${PauseAuditKeys}`]: z.ZodOptional<z.ZodNullable<z.ZodString>>
  }>
}

/**
 * 生成 Disabled 操作元数据
 */
export function createEntityDisabledAuditSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_disabled_by`]: z.string().optional().nullable(),
    [`${prefix}_disabled_at`]: z.string().optional().nullable(),
    [`${prefix}_enabled_by`]: z.string().optional().nullable(),
    [`${prefix}_enabled_at`]: z.string().optional().nullable(),
  }) as unknown as z.ZodObject<{
    [K in `${P}_${DisabledAuditKeys}`]: z.ZodOptional<
      z.ZodNullable<z.ZodString>
    >
  }>
}

/**
 * 生成 Limited 操作元数据
 */
export function createEntityLimitedAuditSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_limited_by`]: z.string().optional().nullable(),
    [`${prefix}_limited_at`]: z.string().optional().nullable(),
    [`${prefix}_unlimited_by`]: z.string().optional().nullable(),
    [`${prefix}_unlimited_at`]: z.string().optional().nullable(),
  }) as unknown as z.ZodObject<{
    [K in `${P}_${LimitedAuditKeys}`]: z.ZodOptional<z.ZodNullable<z.ZodString>>
  }>
}

// =====================================================================================================================
// 工厂函数：生成 Boolean + Audit 组合 Schema（方便组件取类型）
// =====================================================================================================================

export function createEntityLockStatusSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_locked`]: z.boolean(),
    [`${prefix}_locked_by`]: z.string().optional().nullable(),
    [`${prefix}_locked_at`]: z.string().optional().nullable(),
    [`${prefix}_unlocked_by`]: z.string().optional().nullable(),
    [`${prefix}_unlocked_at`]: z.string().optional().nullable(),
  }) as unknown as z.ZodObject<
    { [K in `${P}_locked`]: z.ZodBoolean } & {
      [K in `${P}_${LockAuditKeys}`]: z.ZodOptional<z.ZodNullable<z.ZodString>>
    }
  >
}

export function createEntityPauseStatusSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_paused`]: z.boolean(),
    [`${prefix}_paused_by`]: z.string().optional().nullable(),
    [`${prefix}_paused_at`]: z.string().optional().nullable(),
    [`${prefix}_resumed_by`]: z.string().optional().nullable(),
    [`${prefix}_resumed_at`]: z.string().optional().nullable(),
  }) as unknown as z.ZodObject<
    { [K in `${P}_paused`]: z.ZodBoolean } & {
      [K in `${P}_${PauseAuditKeys}`]: z.ZodOptional<z.ZodNullable<z.ZodString>>
    }
  >
}

export function createEntityEnabledDisabledStatusSchema<P extends string>(
  prefix: P
) {
  return z.object({
    [`${prefix}_enabled`]: z.boolean(),
    [`${prefix}_disabled`]: z.boolean(),
    [`${prefix}_enabled_by`]: z.string().optional().nullable(),
    [`${prefix}_enabled_at`]: z.string().optional().nullable(),
    [`${prefix}_disabled_by`]: z.string().optional().nullable(),
    [`${prefix}_disabled_at`]: z.string().optional().nullable(),
  }) as unknown as z.ZodObject<
    { [K in `${P}_enabled`]: z.ZodBoolean } & {
      [K in `${P}_disabled`]: z.ZodBoolean
    } & {
      [K in `${P}_${DisabledAuditKeys}`]: z.ZodOptional<
        z.ZodNullable<z.ZodString>
      >
    }
  >
}

export function createEntityLimitedStatusSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_limited`]: z.boolean(),
    [`${prefix}_limited_by`]: z.string().optional().nullable(),
    [`${prefix}_limited_at`]: z.string().optional().nullable(),
    [`${prefix}_unlimited_by`]: z.string().optional().nullable(),
    [`${prefix}_unlimited_at`]: z.string().optional().nullable(),
  }) as unknown as z.ZodObject<
    { [K in `${P}_limited`]: z.ZodBoolean } & {
      [K in `${P}_${LimitedAuditKeys}`]: z.ZodOptional<
        z.ZodNullable<z.ZodString>
      >
    }
  >
}

export function createEntitySwitchSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_enabled`]: z.boolean(),
  }) as unknown as z.ZodObject<{ [K in `${P}_enabled`]: z.ZodBoolean }>
}

export function createEntityBatchSwitchSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_ids`]: z.array(z.number().int()),
    [`${prefix}_enabled`]: z.boolean(),
  }) as unknown as z.ZodObject<
    {
      [K in `${P}_ids`]: z.ZodArray<z.ZodNumber>
    } & {
      [K in `${P}_enabled`]: z.ZodBoolean
    }
  >
}

export function createEntityBatchLockSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_ids`]: z.array(z.number().int()),
    [`${prefix}_locked`]: z.boolean(),
  }) as unknown as z.ZodObject<
    {
      [K in `${P}_ids`]: z.ZodArray<z.ZodNumber>
    } & {
      [K in `${P}_locked`]: z.ZodBoolean
    }
  >
}

export function createEntityBatchPauseSchema<P extends string>(prefix: P) {
  return z.object({
    [`${prefix}_ids`]: z.array(z.number().int()),
    [`${prefix}_paused`]: z.boolean(),
  }) as unknown as z.ZodObject<
    {
      [K in `${P}_ids`]: z.ZodArray<z.ZodNumber>
    } & {
      [K in `${P}_paused`]: z.ZodBoolean
    }
  >
}

// =====================================================================================================================
// 实体状态 Schema（has_* 聚合字段）
// =====================================================================================================================

/**
 * 实体状态 Schema
 * 用于描述实体的通用状态字段
 */
export const EntityStatusSchema = z.object({
  has_locked: z.boolean(),
  has_paused: z.boolean(),
  has_enabled: z.boolean(),
  has_limited: z.boolean(),
  can_apply: z.boolean().optional().nullable(),
})

export type EntityStatusData = z.infer<typeof EntityStatusSchema>

/**
 * 实体爬虫任务计数 Schema
 */
export const EntitySpiderTasksCounterSchema = z.object({
  applying_spider_task_count: z.number().int().optional().nullable(),
  preparing_spider_task_count: z.number().int().optional().nullable(),
  running_spider_task_count: z.number().int().optional().nullable(),
  paused_spider_task_count: z.number().int().optional().nullable(),
  allocated_spider_task_count: z.number().int().optional().nullable(),
  cycled_spider_task_count: z.number().int().optional().nullable(),
  working_spider_task_count: z.number().int().optional().nullable(),
  completed_spider_task_count: z.number().int().optional().nullable(),
  failed_spider_task_count: z.number().int().optional().nullable(),
  interrupted_spider_task_count: z.number().int().optional().nullable(),
  canceled_spider_task_count: z.number().int().optional().nullable(),
  total_spider_task_count: z.number().int().optional().nullable(),
})

export type EntitySpiderTasksCounterData = z.infer<
  typeof EntitySpiderTasksCounterSchema
>

/**
 * 实体采料类型计数 Schema
 */
export const EntityMaterialCounterSchema = z.object({
  total_material_count: z.number().int().optional().nullable(),
  material_unknown_count: z.number().int().optional().nullable(),
  material_customize_count: z.number().int().optional().nullable(),
  material_subs_count: z.number().int().optional().nullable(),
  material_speech_count: z.number().int().optional().nullable(),
  material_news_count: z.number().int().optional().nullable(),
  material_note_count: z.number().int().optional().nullable(),
  material_article_count: z.number().int().optional().nullable(),
  material_book_count: z.number().int().optional().nullable(),
  material_bid_count: z.number().int().optional().nullable(),
  material_trade_count: z.number().int().optional().nullable(),
  material_product_count: z.number().int().optional().nullable(),
  material_company_count: z.number().int().optional().nullable(),
  material_shop_count: z.number().int().optional().nullable(),
  material_recruit_count: z.number().int().optional().nullable(),
  material_account_count: z.number().int().optional().nullable(),
  material_image_count: z.number().int().optional().nullable(),
  material_audio_count: z.number().int().optional().nullable(),
  material_video_count: z.number().int().optional().nullable(),
  material_file_count: z.number().int().optional().nullable(),
})

export type EntityMaterialCounterData = z.infer<
  typeof EntityMaterialCounterSchema
>

/**
 * 迷你参数要素包 Schema
 * 用于表示参数要素包的字段
 */
export const MiniParamFormSchema = z.object({
  param_form_id: z.number().int(),
  param_form_enabled: z.boolean(),
  param_form_name: z
    .string()
    .trim()
    .min(2, '表单名称长度不小于2')
    .max(32, '表单名称长度不大于64'),
  param_form_slug: z
    .string()
    .trim()
    .min(2, '表单标识长度不小于2')
    .max(32, '表单标识长度不大于64')
    .regex(
      /^[a-zA-Z0-9\-_]{2,32}$/,
      '表单标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  param_type: z.string().optional(),
})

export type MiniParamFormData = z.infer<typeof MiniParamFormSchema>
