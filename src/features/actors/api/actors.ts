import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/auth-token'
import type { ClusterActorData } from '../data/schemas'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'

export const fetchClusterActors = async (
  token: string | null
): Promise<ClusterActorData[]> => {
  const response = await fetch(`${API_BASE_URL}/cluster/actors`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const useClusterActorsQuery = () => {
  return useQuery({
    queryKey: ['cluster-actors'],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchClusterActors(token)
    },
  })
}
