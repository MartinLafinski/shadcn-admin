import { useQuery } from '@tanstack/react-query'
import { getAccessToken } from '@/lib/auth-token'
import type { ClusterServiceData } from '../data/schemas'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888'

export const fetchClusterServices = async (
  token: string | null
): Promise<ClusterServiceData[]> => {
  const response = await fetch(`${API_BASE_URL}/cluster/services`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const useClusterServicesQuery = () => {
  return useQuery({
    queryKey: ['cluster-services'],
    queryFn: async () => {
      const token = getAccessToken()
      return fetchClusterServices(token)
    },
  })
}
