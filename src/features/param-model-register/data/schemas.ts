import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'

export const CATEGORY_TYPES = [
  'industry',
  'website',
  'entrypoint',
  'prejob',
] as const
export type CategoryType = (typeof CATEGORY_TYPES)[number]
export const SHARD_STRATEGIES = ['date', 'id_range'] as const
export type ShardStrategy = (typeof SHARD_STRATEGIES)[number]

export const ParamModelRegisterItemSchema = z.object({
  register_id: z.number().int(),
  register_name: z.string().nullable().optional(),
  register_slug: z.string(),
  spider_slug: z.string().min(2).max(64),
  category_type: z.enum(['industry', 'website', 'entrypoint', 'prejob']),
  category_slug: z.string().min(2).max(64),
  category: z.any().nullable().optional(),
  param_form_slug: z.string().min(2).max(64),
  spider_package: z
    .object({
      spider_package_id: z.number().int(),
      spider_package_name: z.string(),
      spider_package_slug: z.string(),
      spider_package_version: z.string().optional(),
      spider_package_url: z.string(),
      spider_package_enabled: z.boolean().optional(),
    })
    .nullable()
    .optional(),
  param_form: z
    .object({
      param_form_name: z.string(),
      param_form_slug: z.string(),
      param_form_id: z.number().int(),
      param_type: z.string().optional(),
      param_form_enabled: z.boolean(),
    })
    .nullable()
    .optional(),
  shard_strategy: z.string().nullable().optional(),
  active_shards: z.array(z.string()).optional(),
  enabled: z.boolean(),
  description: z.string().nullable().optional(),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
})

export const ParamModelRegisterSchema = ParamModelRegisterItemSchema.extend({})

export type ParamModelRegisterItemData = z.infer<
  typeof ParamModelRegisterItemSchema
>
export type ParamModelRegisterData = z.infer<typeof ParamModelRegisterSchema>

export const ParamModelRegisterCreateSchema = z.object({
  register_name: z.string().optional().nullable(),
  spider_slug: z
    .string()
    .trim()
    .min(2, '爬虫标识长度不小于2')
    .max(64, '爬虫标识长度不大于64'),
  category_type: z.enum(['industry', 'website', 'entrypoint', 'prejob']),
  category_slug: z
    .string()
    .trim()
    .min(2, '类别标识长度不小于2')
    .max(64, '类别标识长度不大于64'),
  param_form_slug: z
    .string()
    .trim()
    .min(2, '参数要素包标识长度不小于2')
    .max(64, '参数要素包标识长度不大于64'),
  shard_strategy: z.string().optional().nullable(),

  enabled: z.boolean().optional(),
  description: z.string().optional().nullable(),
})

export type ParamModelRegisterCreateData = z.infer<
  typeof ParamModelRegisterCreateSchema
>

export const ParamModelRegisterUpdateSchema = z.object({
  register_name: z.string().optional().nullable(),
  shard_strategy: z.string().optional().nullable(),

  enabled: z.boolean().optional(),
  description: z.string().optional().nullable(),
})

export type ParamModelRegisterUpdateData = z.infer<
  typeof ParamModelRegisterUpdateSchema
>

export const RegisterShardSchema = z.object({
  other_slug: z
    .string()
    .trim()
    .min(1, '分片标识长度不小于1')
    .max(64, '分片标识长度不大于64'),
})

export type RegisterShardData = z.infer<typeof RegisterShardSchema>

export const ParamModelRegistersSchema = z.object({
  registers: z.array(ParamModelRegisterSchema),
  pagination: PaginationInfoSchema,
})

export type ParamModelRegistersData = z.infer<typeof ParamModelRegistersSchema>

export const emptyParamModelRegistersData: ParamModelRegistersData = {
  registers: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    size: 50,
    length: 0,
  },
}
