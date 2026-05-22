import { createFileRoute } from '@tanstack/react-router'
import { Actors } from '@/features/actors'

export const Route = createFileRoute('/_authenticated/actors/')({
  component: Actors,
})
