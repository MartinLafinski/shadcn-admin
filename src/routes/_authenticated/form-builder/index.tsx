import { createFileRoute } from '@tanstack/react-router'
import { FormBuilder } from '@/features/form-builder'

export const Route = createFileRoute('/_authenticated/form-builder/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <FormBuilder />
}
