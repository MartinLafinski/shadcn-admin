import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Prejobs } from '@/features/prejobs'

export const Route = createFileRoute('/_authenticated/prejobs/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        industry_id: z.int().optional(),
        website_id: z.int().optional(),
        entrypoint_id: z.int().optional(),
        jobgroup_id: z.int().optional(),
        prejob_keyword: z.string().optional(),
        prejob_level: z.enum(['low', 'medium', 'high']).optional(),
        prejob_enabled: z.boolean().optional(),
        prejob_locked: z.boolean().optional(),
        prejob_paused: z.boolean().optional(),
        prejob_limited: z.boolean().optional(),
        deeply_search: z.boolean().optional().nullable(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search)
  },
})

function RouteComponent() {
  return <Prejobs />
}
