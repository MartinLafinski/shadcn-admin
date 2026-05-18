import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { ParamFormsEditPage } from '@/features/param-forms/param-forms-edit-page'

export const Route = createFileRoute('/_authenticated/param-forms/edit')({
  component: RouteComponent,
  validateSearch: (search) => {
    return z
      .object({
        paramFormId: z.number(),
      })
      .parse(search)
  },
})

function RouteComponent() {
  const { paramFormId } = Route.useSearch()
  return <ParamFormsEditPage paramFormId={paramFormId} />
}
