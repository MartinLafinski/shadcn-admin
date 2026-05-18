import { useAuthStore } from '@/stores/auth-store'

export function getAccessToken(): string | null {
  return useAuthStore.getState().auth.accessToken || null
}

export function isAuthenticated(): boolean {
  return !!getAccessToken()
}
