import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/auth-token'
import type { ClusterServerData } from '../data/schemas'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'

export const fetchClusterServers = async (
  token: string | null
): Promise<ClusterServerData[]> => {
  const response = await fetch(`${API_BASE_URL}/cluster/servers`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const useClusterServersQuery = () => {
  return useQuery({
    queryKey: ['cluster-servers'],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchClusterServers(token)
    },
  })
}
