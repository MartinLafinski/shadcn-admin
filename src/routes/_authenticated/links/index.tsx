import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Links } from '@/features/links'

export const Route = createFileRoute('/_authenticated/links/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        links_keyword: z.string().optional(),
        links_enabled: z.boolean().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search)
  },
})

function RouteComponent() {
  return <Links />
}
