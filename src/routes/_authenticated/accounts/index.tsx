import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Accounts } from '@/features/accounts'

export const Route = createFileRoute('/_authenticated/accounts/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        keyword: z.string().optional(),
        is_active: z.boolean().optional(),
        is_superuser: z.boolean().optional(),
        is_verified: z.boolean().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search)
  },
})

function RouteComponent() {
  return <Accounts />
}
