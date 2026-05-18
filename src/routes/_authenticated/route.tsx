import { useEffect } from 'react'
import {
  createFileRoute,
  Outlet,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'
import { isAuthenticated } from '@/lib/auth-token'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { fetchCurrentUser } from '@/features/auth/api/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const { accessToken, user, setUser, reset } = useAuthStore.getState().auth
    if (accessToken && !user) {
      try {
        setUser(await fetchCurrentUser())
      } catch {
        reset()
      }
    }
  },
  component: AuthGuard,
})

function AuthGuard() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      const currentPath = location.pathname
      if (currentPath.startsWith('/sign-in')) return
      navigate({
        to: '/sign-in',
        search: location.href !== '/' ? { redirect: location.href } : undefined,
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
