import { createFileRoute } from '@tanstack/react-router'
import { Links } from '@/features/links'

export const Route = createFileRoute('/_authenticated/links/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Links />
}
