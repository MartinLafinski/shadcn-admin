import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { JobGroups } from '@/features/jobgroups'

export const Route = createFileRoute('/_authenticated/jobgroups/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        keyword: z.string().optional(),
        enabled: z.boolean().optional(),
        locked: z.boolean().optional(),
        paused: z.boolean().optional(),
        limited: z.boolean().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search)
  },
})

function RouteComponent() {
  return <JobGroups />
}
