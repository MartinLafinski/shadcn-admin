import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Terms } from '@/features/terms'

export const Route = createFileRoute('/_authenticated/terms/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        term_keyword: z.string().optional(),
        term_enabled: z.boolean().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search)
  },
})

function RouteComponent() {
  return <Terms />
}
