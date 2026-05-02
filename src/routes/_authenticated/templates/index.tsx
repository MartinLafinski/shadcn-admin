import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Templates } from '@/features/templates'

export const Route = createFileRoute('/_authenticated/templates/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        template_keyword: z.string().optional(),
        template_enabled: z.boolean().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search)
  },
})

function RouteComponent() {
  return <Templates />
}
