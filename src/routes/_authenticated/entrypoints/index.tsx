import {createFileRoute} from '@tanstack/react-router'
import { Entrypoints } from '@/features/entrypoints'

export const Route = createFileRoute('/_authenticated/entrypoints/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Entrypoints />
}
