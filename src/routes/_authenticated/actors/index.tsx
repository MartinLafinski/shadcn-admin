import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/coming-soon'

export const Route = createFileRoute('/_authenticated/actors/')({
  component: ComingSoon,
})

// function RouteComponent() {
//   return <div>Hello "/_authenticated/actors/"!</div>
// }
