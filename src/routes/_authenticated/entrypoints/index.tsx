import {createFileRoute} from '@tanstack/react-router'
import { Entrypoints } from '@/features/entrypoints'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/entrypoints/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z.object({
      website_id: z.int().optional(),
      entrypoint_keyword: z.string().optional(),
      entrypoint_enabled: z.boolean().optional(),
      page: z.number().optional(),
      size: z.number().optional(),
    }).parse(search)
  },
})

function RouteComponent() {
  return <Entrypoints />
}
