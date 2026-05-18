import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'

export const TermItemSchema = z.object({
  term_id: z.number().int(),
  term_name: z.string().min(2).max(32),
  term_slug: z
    .string()
    .trim()
    .min(2, '术语标识长度不小于2')
    .max(32, '术语标识长度不大于32')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '术语标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  term_collection: z.array(z.string()),
  term_readme: z.string().nullable().optional(),
  term_enabled: z.boolean(),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
})

export const TermSchema = TermItemSchema.extend({})

export type TermItemData = z.infer<typeof TermItemSchema>
export type TermData = z.infer<typeof TermSchema>

export const TermCreateSchema = z.object({
  term_name: z
    .string()
    .trim()
    .min(2, '术语库名称长度不小于2')
    .max(32, '术语库名称长度不大于32'),
  term_slug: z
    .string()
    .trim()
    .min(2, '术语标识长度不小于2')
    .max(32, '术语标识长度不大于32')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '术语标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  term_collection: z.array(z.string()).optional(),
  term_readme: z.string().optional(),
})

export type TermCreateData = z.infer<typeof TermCreateSchema>

export const TermUpdateSchema = z.object({
  term_name: z
    .string()
    .trim()
    .min(2, '术语库名称长度不小于2')
    .max(32, '术语库名称长度不大于32'),
  term_slug: z
    .string()
    .trim()
    .min(2, '术语标识长度不小于2')
    .max(32, '术语标识长度不大于32')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '术语标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  term_collection: z.array(z.string()).optional(),
  term_readme: z.string().optional(),
})

export type TermUpdateData = z.infer<typeof TermUpdateSchema>

export const TermConfigSchema = z.object({
  term_collection: z.array(z.string()).optional(),
  term_readme: z.string().optional(),
})

export type TermConfigData = z.infer<typeof TermConfigSchema>

export const TermSwitchSchema = z.object({
  term_enabled: z.boolean(),
})

export type TermSwitchData = z.infer<typeof TermSwitchSchema>

export const TermBatchSwitchSchema = z.object({
  term_ids: z
    .array(z.number().int().positive('术语ID必须是正整数'))
    .min(1, '至少需要选择一个术语库进行操作'),
  term_enabled: z.boolean(),
})

export type TermBatchSwitchData = z.infer<typeof TermBatchSwitchSchema>

export const TermBatchExportSchema = z.object({
  term_ids: z
    .array(z.number().int().positive('术语ID必须是正整数'))
    .min(1, '至少需要选择一个术语库进行导出')
    .max(100, '单次批量导出的术语库数量不能超过100个'),
})

export type TermBatchExportData = z.infer<typeof TermBatchExportSchema>

export const SyncTermsSchema = z.object({
  only_clear: z.boolean().optional(),
})

export type SyncTermsData = z.infer<typeof SyncTermsSchema>

export const TermsSchema = z.object({
  terms: z.array(TermSchema),
  pagination: PaginationInfoSchema,
})

export type TermsData = z.infer<typeof TermsSchema>

export const emptyTermsData: TermsData = {
  terms: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    size: 50,
    length: 0,
  },
}
