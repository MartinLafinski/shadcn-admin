import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'
import {
  createEntityToggleSchema,
  createEntitySwitchSchema,
  createEntityBatchSwitchSchema,
} from '@/lib/base-schemas'

export const ParamFormItemSchema = z
  .object({
    param_form_id: z.number().int(),
    created_at: z.string(),
    updated_at: z.string(),
    updated_by: z.string().nullable().optional(),
    created_by: z.string().nullable().optional(),
    param_form_name: z
      .string()
      .trim()
      .min(2, '表单名称长度不小于2')
      .max(64, '表单名称长度不大于64'),
    param_form_slug: z
      .string()
      .trim()
      .min(2, '表单标识长度不小于2')
      .max(64, '表单标识长度不大于64')
      .regex(
        /^[a-zA-Z0-9\-_]{2,64}$/,
        '表单标识应该是字母、数字、连字符或下划线，长度在2到64之间'
      ),
    param_json_schema: z.record(z.string(), z.any()),
    param_ui_schema: z.record(z.string(), z.any()).optional().nullable(),
    param_type: z.string().optional(),
    param_readme: z.string().nullable().optional(),
  })
  .merge(createEntityToggleSchema('param_form'))

export const ParamFormSchema = ParamFormItemSchema.extend({})

export type ParamFormItemData = z.infer<typeof ParamFormItemSchema>
export type ParamFormData = z.infer<typeof ParamFormSchema>

export const ParamFormCreateSchema = z.object({
  param_form_name: z
    .string()
    .trim()
    .min(2, '表单名称长度不小于2')
    .max(64, '表单名称长度不大于64'),
  param_form_slug: z
    .string()
    .trim()
    .min(2, '表单标识长度不小于2')
    .max(64, '表单标识长度不大于64')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '表单标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  param_json_schema: z.record(z.string(), z.any()),
  param_ui_schema: z.record(z.string(), z.any()).optional(),
  param_type: z.string().optional(),
  param_readme: z.string().optional(),
})

export const ParamFormUpdateSchema = ParamFormCreateSchema

export const ParamFormPatchSchema = z.object({
  param_json_schema: z.record(z.string(), z.any()).optional(),
  param_ui_schema: z.record(z.string(), z.any()).optional().nullable(),
  param_readme: z.string().optional().nullable(),
})

export const ParamFormSwitchSchema = createEntitySwitchSchema('param_form')

export const ParamFormBatchSwitchSchema =
  createEntityBatchSwitchSchema('param_form')

export const ParamFormBatchDeleteSchema = z.object({
  param_form_ids: z
    .array(z.number().int().positive())
    .min(1, '至少选择一个参数要素'),
})

export type ParamFormCreateData = z.infer<typeof ParamFormCreateSchema>
export type ParamFormUpdateData = z.infer<typeof ParamFormUpdateSchema>
export type ParamFormPatchData = z.infer<typeof ParamFormPatchSchema>
export type ParamFormSwitchData = z.infer<typeof ParamFormSwitchSchema>
export type ParamFormBatchSwitchData = z.infer<
  typeof ParamFormBatchSwitchSchema
>
export type ParamFormBatchDeleteData = z.infer<
  typeof ParamFormBatchDeleteSchema
>

export const SyncParamFormsSchema = z.object({
  only_clear: z.boolean().optional(),
})

export type SyncParamFormsData = z.infer<typeof SyncParamFormsSchema>

export const BatchExportParamFormsSchema = z.object({
  param_form_ids: z.array(z.number().int().positive()).min(1).max(100),
})

export type BatchExportParamFormsData = z.infer<
  typeof BatchExportParamFormsSchema
>

export const ParamFormsSchema = z.object({
  param_forms: z.array(ParamFormSchema),
  pagination: PaginationInfoSchema,
})

export type ParamFormsData = z.infer<typeof ParamFormsSchema>

export const emptyParamFormsData: ParamFormsData = {
  param_forms: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    size: 10,
    length: 0,
    linkFirst: undefined,
    linkLast: undefined,
    linkNext: undefined,
    linkPrev: undefined,
    linkSelf: undefined,
  },
}
