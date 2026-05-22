import { createFileRoute } from '@tanstack/react-router'
import { RegisterDataPage } from '@/features/param-model-register/register-data'

export const Route = createFileRoute(
  '/_authenticated/param-model-register/$registerId'
)({
  component: RegisterDataPage,
})
