import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/clusters'

export const Route = createFileRoute('/_authenticated/clusters/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Dashboard />
}
