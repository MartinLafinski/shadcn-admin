import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/_authenticated/servers/')({
  component: ComingSoon,
})

// function RouteComponent() {
//   return <div>Hello "/_authenticated/servers/"!</div>
// }
