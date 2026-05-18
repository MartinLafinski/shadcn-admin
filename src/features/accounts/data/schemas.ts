import { z } from 'zod'
import { PaginationInfoSchema } from '@/config/pagination'

export const AccountSchema = z.object({
  user_id: z.number().int(),
  email: z.string().email(),
  username: z.string(),
  is_active: z.boolean(),
  is_superuser: z.boolean(),
  is_verified: z.boolean(),
})

export type AccountData = z.infer<typeof AccountSchema>

export const AccountCreateSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少 8 位')
    .regex(/[a-z]/, '密码需包含小写字母')
    .regex(/\d/, '密码需包含数字'),
  username: z
    .string()
    .min(2, '用户名长度不小于 2')
    .max(64, '用户名长度不大于 64'),
  is_active: z.boolean().optional().default(true),
  is_superuser: z.boolean().optional().default(false),
  is_verified: z.boolean().optional().default(false),
})

export type AccountCreateData = z.infer<typeof AccountCreateSchema>

export const AccountUpdateSchema = z.object({
  password: z
    .string()
    .min(8, '密码至少 8 位')
    .regex(/[a-z]/, '密码需包含小写字母')
    .regex(/\d/, '密码需包含数字')
    .optional()
    .or(z.literal('')),
  email: z.string().email('请输入有效的邮箱地址').optional().or(z.literal('')),
  username: z
    .string()
    .min(2, '用户名长度不小于 2')
    .max(64, '用户名长度不大于 64')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean().optional(),
  is_superuser: z.boolean().optional(),
  is_verified: z.boolean().optional(),
})

export type AccountUpdateData = z.infer<typeof AccountUpdateSchema>

export const AccountsSchema = z.object({
  accounts: z.array(AccountSchema),
  pagination: PaginationInfoSchema,
})

export type AccountsData = z.infer<typeof AccountsSchema>

export const emptyAccountsData: AccountsData = {
  accounts: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 0,
    size: 50,
    length: 0,
  },
}
