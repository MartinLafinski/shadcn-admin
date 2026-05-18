import { useMutation } from '@tanstack/react-query'
import { useAuthStore, type AuthUser } from '@/stores/auth-store'
import { getAccessToken } from '@/lib/auth-token'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(errorData || `HTTP error! status: ${response.status}`)
  }
  return response
}

type BearerResponse = {
  access_token: string
  token_type: string
}

export const fetchLogin = async (
  username: string,
  password: string
): Promise<BearerResponse> => {
  const formData = new URLSearchParams()
  formData.set('username', username)
  formData.set('password', password)

  const response = await fetch(`${API_BASE_URL}/auth/jwt/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })
  await handleResponse(response)
  return response.json()
}

export const fetchCurrentUser = async (): Promise<AuthUser> => {
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
  return response.json()
}

export const fetchLogout = async (): Promise<void> => {
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}/auth/jwt/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  await handleResponse(response)
}

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async (variables: { username: string; password: string }) => {
      const bearer = await fetchLogin(variables.username, variables.password)
      useAuthStore.getState().auth.setAccessToken(bearer.access_token)
      const user = await fetchCurrentUser()
      useAuthStore.getState().auth.setUser(user)
      return user
    },
  })
}

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: async () => {
      await fetchLogout()
      useAuthStore.getState().auth.reset()
    },
    onError: () => {
      useAuthStore.getState().auth.reset()
    },
  })
}
