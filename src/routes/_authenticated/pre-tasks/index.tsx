import {createFileRoute} from '@tanstack/react-router'
import { PreTasks } from '@/features/pre-tasks'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/pre-tasks/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z.object({
      website_id: z.int().optional(),
      page: z.number().optional(),
      size: z.number().optional(),
    }).parse(search)
  },
})

function RouteComponent() {
  return <PreTasks/>
}
