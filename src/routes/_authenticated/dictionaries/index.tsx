import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Dictionaries } from '@/features/dictionaries'

export const Route = createFileRoute('/_authenticated/dictionaries/')({
  component: RouteComponent,
  validateSearch: (search) =>
    z
      .object({
        dictionary_keyword: z.string().optional(),
        dictionary_enabled: z.boolean().optional(),
        page: z.number().optional(),
        size: z.number().optional(),
      })
      .parse(search),
})

function RouteComponent() {
  return <Dictionaries />
}
