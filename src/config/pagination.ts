import { z } from 'zod'

export const PaginationInfoSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pages: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  length: z.number().int().nonnegative(),
  linkFirst: z.string().optional(),
  linkLast: z.string().optional(),
  linkNext: z.string().optional(),
  linkPrev: z.string().optional(),
  linkSelf: z.string().optional(),
})

// 分页信息
export type PaginationInfoData = z.infer<typeof PaginationInfoSchema>

export function extracted_pagination(response: Response) {
  const pagination: PaginationInfoData = {
    total: parseInt(response.headers.get('x-total') || '0', 10),
    page: parseInt(response.headers.get('x-page') || '1', 10),
    pages: parseInt(response.headers.get('x-pages') || '1', 10),
    size: parseInt(response.headers.get('x-size') || '10', 10),
    length: parseInt(response.headers.get('x-length') || '0', 10),
    linkFirst: response.headers.get('x-link-first') || undefined,
    linkLast: response.headers.get('x-link-last') || undefined,
    linkNext: response.headers.get('x-link-next') || undefined,
    linkPrev: response.headers.get('x-link-prev') || undefined,
    linkSelf: response.headers.get('x-link-self') || undefined,
  }
  return pagination
}
