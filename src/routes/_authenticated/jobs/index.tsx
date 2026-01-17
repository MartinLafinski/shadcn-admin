import {createFileRoute} from '@tanstack/react-router'
import { Jobs } from '@/features/jobs'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/jobs/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z.object({
      day: z.string().optional(),
      website_id: z.int().optional(),
      entrypoint_id: z.int().optional(),
      status: z.enum(['running', 'completed', 'canceled']).optional(),
      page: z.number().optional(),
      size: z.number().optional(),
    }).parse(search)
  },
})

function RouteComponent() {
  return <Jobs/>
}