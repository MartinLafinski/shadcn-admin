import { useEffect } from 'react'
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { isAuthenticated } from '@/lib/auth-token'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

// eslint-disable-next-line react-refresh/only-export-components
export const Route = createFileRoute('/_authenticated')({
  component: AuthGuard,
})

function AuthGuard() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      const currentPath = location.href
      navigate({
        to: '/sign-in',
        search: currentPath !== '/' ? { redirect: currentPath } : undefined,
        replace: true,
      })
    }
  }, [navigate, location.href])

  if (!isAuthenticated()) {
    return null
  }

  return (
    <AuthenticatedLayout>
      <Outlet />
    </AuthenticatedLayout>
  )
}
