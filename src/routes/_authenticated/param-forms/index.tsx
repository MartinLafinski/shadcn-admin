import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ParamForms } from '@/features/param-forms'

export const Route = createFileRoute('/_authenticated/param-forms/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        keyword: z.string().optional(),
        enabled: z.boolean().optional(),
        param_type: z.string().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search)
  },
})

function RouteComponent() {
  return <ParamForms />
}
