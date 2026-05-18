import { createFileRoute } from '@tanstack/react-router'
import { AccountsMe } from '@/features/accounts/me'

export const Route = createFileRoute('/_authenticated/accounts/me')({
  component: AccountsMe,
})
