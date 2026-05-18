import { createFileRoute } from '@tanstack/react-router'
import { ParamFormsCreatePage } from '@/features/param-forms/param-forms-create-page'

export const Route = createFileRoute('/_authenticated/param-forms/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ParamFormsCreatePage />
}
