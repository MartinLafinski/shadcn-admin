import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SpiderSessions } from '@/features/spider-sessions'

export const Route = createFileRoute('/_authenticated/spider-sessions/')({
  component: RouteComponent,
  validateSearch: (s) =>
    z
      .object({
        keyword: z.string().optional(),
        enabled: z.boolean().optional(),
        website_id: z.number().optional(),
        locked: z.boolean().optional(),
        paused: z.boolean().optional(),
        limited: z.boolean().optional(),
        expired: z.boolean().optional(),
        session_pool_id: z.number().int().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(s),
})

function RouteComponent() {
  return <SpiderSessions />
}
