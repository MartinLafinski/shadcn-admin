import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ParamModelRegister } from '@/features/param-model-register'

export const Route = createFileRoute('/_authenticated/param-model-register/')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        spider_slug: z.string().optional(),
        category_type: z.string().optional(),
        category_slug: z.string().optional(),
        param_form_slug: z.string().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search)
  },
})

function RouteComponent() {
  return <ParamModelRegister />
}
