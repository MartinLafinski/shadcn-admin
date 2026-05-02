import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Entrypoints } from '@/features/entrypoints'

export const Route = createFileRoute('/_authenticated/entrypoints/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        website_id: z.int().optional(),
        industry_id: z.int().optional(),
        entrypoint_keyword: z.string().optional(),
        entrypoint_enabled: z.boolean().optional(),
        entrypoint_locked: z.boolean().optional(),
        entrypoint_paused: z.boolean().optional(),
        entrypoint_limited: z.boolean().optional(),
        deeply_search: z.boolean().optional().nullable(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search)
  },
})

function RouteComponent() {
  return <Entrypoints />
}
