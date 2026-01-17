import {createFileRoute} from '@tanstack/react-router'
import { Reqs } from '@/features/reqs'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/reqs/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z.object({
      day: z.string().optional(),
      website_id: z.int().optional(),
      entrypoint_id: z.int().optional(),
      task_id: z.int().optional(),
      result_type: z.enum(['succeed', 'failed', 'discarded']).optional(),
      result_category: z.string().optional(),
      page: z.number().optional(),
      size: z.number().optional(),
    }).parse(search)
  },
})

function RouteComponent() {
  return <Reqs />
}
