import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'

export const DictionaryItemSchema = z.object({
  dictionary_id: z.number().int(),
  dictionary_name: z.string().min(2).max(32),
  dictionary_slug: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-zA-Z0-9\-_]{2,64}$/),
  dict_collection: z.record(z.string(), z.unknown()).optional(),
  dictionary_readme: z.string().nullable().optional(),
  dictionary_enabled: z.boolean(),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
})

export const DictionarySchema = DictionaryItemSchema.extend({})

export type DictionaryItemData = z.infer<typeof DictionaryItemSchema>
export type DictionaryData = z.infer<typeof DictionarySchema>

export const DictionaryCreateSchema = z.object({
  dictionary_name: z
    .string()
    .trim()
    .min(2, '名称长度不小于2')
    .max(32, '名称长度不大于32'),
  dictionary_slug: z
    .string()
    .trim()
    .min(2, '标识长度不小于2')
    .max(32, '标识长度不大于32')
    .regex(/^[a-zA-Z0-9\-_]{2,64}$/, '标识应为字母、数字、连字符或下划线'),
  dict_collection: z.record(z.string(), z.unknown()).optional(),
  dictionary_readme: z.string().optional().nullable(),
})

export type DictionaryCreateData = z.infer<typeof DictionaryCreateSchema>

export const DictionaryUpdateSchema = z.object({
  dictionary_name: z.string().trim().min(2).max(32),
  dictionary_slug: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[a-zA-Z0-9\-_]{2,64}$/),
  dict_collection: z.record(z.string(), z.unknown()).optional(),
  dictionary_readme: z.string().optional().nullable(),
})

export type DictionaryUpdateData = z.infer<typeof DictionaryUpdateSchema>

export const DictionaryConfigSchema = z.object({
  dict_collection: z.record(z.string(), z.unknown()).optional(),
  dictionary_readme: z.string().optional().nullable(),
})

export type DictionaryConfigData = z.infer<typeof DictionaryConfigSchema>

export const SwitchDictionarySchema = z.object({
  dictionary_enabled: z.boolean(),
})

export type SwitchDictionaryData = z.infer<typeof SwitchDictionarySchema>

export const BatchSwitchDictionariesSchema = z.object({
  dictionary_ids: z
    .array(z.number().int().positive())
    .min(1, '至少需要选择一个属性字典'),
  dictionary_enabled: z.boolean(),
})

export type BatchSwitchDictionariesData = z.infer<
  typeof BatchSwitchDictionariesSchema
>

export const BatchExportDictionariesSchema = z.object({
  dictionary_ids: z
    .array(z.number().int().positive())
    .min(1, '至少需要选择一个属性字典')
    .max(100),
})

export type BatchExportDictionariesData = z.infer<
  typeof BatchExportDictionariesSchema
>

export const SyncDictionariesSchema = z.object({
  only_clear: z.boolean().optional(),
})

export type SyncDictionariesData = z.infer<typeof SyncDictionariesSchema>

export const DictionariesSchema = z.object({
  dictionaries: z.array(DictionarySchema),
  pagination: PaginationInfoSchema,
})

export type DictionariesData = z.infer<typeof DictionariesSchema>

export const emptyDictionariesData: DictionariesData = {
  dictionaries: [],
  pagination: { total: 0, page: 1, pages: 0, size: 50, length: 0 },
}
