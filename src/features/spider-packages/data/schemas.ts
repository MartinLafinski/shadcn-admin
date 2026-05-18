import { z } from 'zod'

// =====================================================================================================================
// 参数模板 Schema（保留，其他模块可能引用）
// =====================================================================================================================
export const ParameterTemplateSchema = z.object({
  name: z.string().min(1).max(64).describe('参数键名'),
  label: z.string().min(1).max(64).describe('标签文字'),
  param_type: z
    .enum(['string', 'number', 'boolean', 'select', 'json', 'secret'])
    .default('string')
    .describe('值类型'),
  required: z.boolean().default(false).describe('是否必填'),
  default_value: z.any().optional().nullable().describe('默认值'),
  description: z.string().optional().nullable().describe('用途/提示说明'),
  min_value: z.number().optional().nullable().describe('最小值'),
  max_value: z.number().optional().nullable().describe('最大值'),
  min_length: z.number().int().optional().nullable().describe('最小长度'),
  max_length: z.number().int().optional().nullable().describe('最大长度'),
  regex_pattern: z.string().optional().nullable().describe('正则校验'),
  enum_options: z.array(z.string()).optional().nullable().describe('枚举选项'),
  group: z.string().optional().nullable().describe('参数分组名'),
  order: z.number().int().default(0).describe('同组内排序'),
})

export type ParameterTemplateData = z.infer<typeof ParameterTemplateSchema>

// =====================================================================================================================
// 爬虫包 Release Schema
// =====================================================================================================================
export const SpiderPackageReleaseSchema = z.object({
  release_id: z.number().int(),
  spider_package_id: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().optional().nullable(),
  updated_by: z.string().optional().nullable(),
  release_version: z.string(),
  release_url: z.string(),
  release_readme: z.string().optional().nullable(),
  is_prerelease: z.boolean().default(false),
  is_draft: z.boolean().default(false),
  released_at: z.string().optional().nullable(),
})

export type SpiderPackageReleaseData = z.infer<
  typeof SpiderPackageReleaseSchema
>

export const CreateSpiderPackageReleaseSchema = z.object({
  release_version: z.string().min(1, '请输入发布版本号'),
  release_url: z.string().min(1, '请输入发布下载地址'),
  release_readme: z.string().optional(),
  is_prerelease: z.boolean().default(false),
  is_draft: z.boolean().default(false),
  released_at: z.string().optional().nullable(),
})

export type CreateSpiderPackageReleaseData = z.infer<
  typeof CreateSpiderPackageReleaseSchema
>

export const UpdateSpiderPackageReleaseSchema =
  CreateSpiderPackageReleaseSchema.extend({})

export type UpdateSpiderPackageReleaseData = z.infer<
  typeof UpdateSpiderPackageReleaseSchema
>

// =====================================================================================================================
// 爬虫包 ViewFull Schema（列表/详情返回）
// =====================================================================================================================
export const SpiderPackageItemSchema = z.object({
  spider_package_id: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
  created_by: z.string().optional().nullable(),
  updated_by: z.string().optional().nullable(),
  spider_package_enabled: z.boolean(),
  spider_package_name: z
    .string()
    .trim()
    .min(2, '爬虫包名称长度不小于2')
    .max(32, '爬虫包名称长度不大于32'),
  spider_package_slug: z
    .string()
    .trim()
    .min(2, '爬虫包标识长度不小于2')
    .max(64, '爬虫包标识长度不大于64')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '爬虫包标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  spider_package_version: z.string().default('latest'),
  spider_package_url: z.string(),
  spider_package_config: z.record(z.string(), z.any()),
  spider_package_readme: z.string().optional().nullable(),
  releases: z.array(SpiderPackageReleaseSchema),
  latest_release: SpiderPackageReleaseSchema.nullable(),
})

export type SpiderPackageItemData = z.infer<typeof SpiderPackageItemSchema>

// =====================================================================================================================
// 创建 Schema
// =====================================================================================================================
export const SpiderPackageCreateSchema = z.object({
  spider_package_name: z
    .string()
    .trim()
    .min(2, '爬虫包名称长度不小于2')
    .max(32, '爬虫包名称长度不大于32'),
  spider_package_slug: z
    .string()
    .trim()
    .min(2, '爬虫包标识长度不小于2')
    .max(64, '爬虫包标识长度不大于64')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '爬虫包标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  spider_package_version: z.string().default('latest'),
  spider_package_url: z.string().min(1, '请输入爬虫包下载地址'),
  spider_package_config: z.record(z.string(), z.any()).optional().default({}),
  spider_package_readme: z.string().optional(),
})

export type SpiderPackageCreateData = z.infer<typeof SpiderPackageCreateSchema>

// =====================================================================================================================
// 更新 Schema
// =====================================================================================================================
export const SpiderPackageUpdateSchema = z.object({
  spider_package_name: z
    .string()
    .trim()
    .min(2, '爬虫包名称长度不小于2')
    .max(32, '爬虫包名称长度不大于32'),
  spider_package_slug: z
    .string()
    .trim()
    .min(2, '爬虫包标识长度不小于2')
    .max(64, '爬虫包标识长度不大于64')
    .regex(
      /^[a-zA-Z0-9\-_]{2,64}$/,
      '爬虫包标识应该是字母、数字、连字符或下划线，长度在2到64之间'
    ),
  spider_package_version: z.string(),
  spider_package_url: z.string().min(1, '请输入爬虫包下载地址'),
})

export type SpiderPackageUpdateData = z.infer<typeof SpiderPackageUpdateSchema>

// =====================================================================================================================
// 配置局部更新 Schema
// =====================================================================================================================
export const PatchSpiderPackageSchema = z.object({
  spider_package_config: z.record(z.string(), z.any()).optional(),
  spider_package_readme: z.string().optional(),
})

export type PatchSpiderPackageData = z.infer<typeof PatchSpiderPackageSchema>

// =====================================================================================================================
// 开关 Schema
// =====================================================================================================================
export const SpiderPackageSwitchSchema = z.object({
  spider_package_enabled: z.boolean(),
})

export type SpiderPackageSwitchData = z.infer<typeof SpiderPackageSwitchSchema>

// =====================================================================================================================
// 批量操作 Schema
// =====================================================================================================================
export const BatchSwitchSpiderPackagesSchema = z.object({
  spider_package_ids: z
    .array(z.number().int())
    .min(1, '至少需要选择一个爬虫包'),
  spider_package_enabled: z.boolean(),
})

export type BatchSwitchSpiderPackagesData = z.infer<
  typeof BatchSwitchSpiderPackagesSchema
>

export const BatchExportSpiderPackagesSchema = z.object({
  spider_package_ids: z
    .array(z.number().int().positive('爬虫包ID必须是正整数'))
    .min(1, '至少需要选择一个爬虫包进行导出')
    .max(100, '单次批量导出的爬虫包数量不能超过100个'),
})

export type BatchExportSpiderPackagesData = z.infer<
  typeof BatchExportSpiderPackagesSchema
>
