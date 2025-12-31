import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { WebsiteItem, Website } from '../data/schemas.ts'

// 定义网站相关的类型
// export interface Website {
//   website_id: string;
//   created_at: string;
//   updated_at: string;
//   updated_by: string;
//   website_enabled: boolean;
//   website_name: string;
//   website_slug: string;
//   website_url?: string;
//   website_config: Record<string, any>;
//   website_readme: string;
// }

export interface CreateWebsiteData {
  website_name: string;
  website_slug: string;
  website_url?: string;
  website_config?: Record<string, any>;
  website_readme?: string;
}

export interface UpdateWebsiteData {
  website_name: string;
  website_slug: string;
  website_url?: string;
  website_config?: Record<string, any>;
  website_readme?: string;
}

export interface PatchWebsiteData {
  website_config?: Record<string, any>;
  website_readme?: string;
}

export interface SwitchWebsiteData {
  enabled: boolean;
}

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8888';

// 通用错误处理
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `HTTP error! status: ${response.status}`);
  }
  return response;
};

// 获取网站列表
export const fetchWebsites = async (page: number = 1, size: number = 50): Promise<Website[]> => {
  const response = await fetch(`${API_BASE_URL}/websites/?page=${page}&size=${size}`);
  await handleResponse(response);
  return response.json();
};

// 根据ID获取网站
export const fetchWebsiteById = async (websiteId: string): Promise<Website> => {
  const response = await fetch(`${API_BASE_URL}/websites/${websiteId}/`);
  await handleResponse(response);
  return response.json();
};

// 创建网站
export const createWebsite = async (data: CreateWebsiteData): Promise<Website> => {
  const response = await fetch(`${API_BASE_URL}/websites/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  await handleResponse(response);
  return response.json();
};

// 更新网站
export const updateWebsite = async (websiteId: string, data: UpdateWebsiteData): Promise<Website> => {
  const response = await fetch(`${API_BASE_URL}/websites/${websiteId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  await handleResponse(response);
  return response.json();
};

// 部分更新网站配置
export const patchWebsite = async (websiteId: string, data: PatchWebsiteData): Promise<Website> => {
  const response = await fetch(`${API_BASE_URL}/websites/${websiteId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  await handleResponse(response);
  return response.json();
};

// 切换网站启用状态
export const switchWebsite = async (websiteId: string, data: SwitchWebsiteData): Promise<Website> => {
  const response = await fetch(`${API_BASE_URL}/websites/${websiteId}/switch/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  await handleResponse(response);
  return response.json();
};

// 同步网站
export const syncWebsites = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/websites/sync/`, {
    method: 'POST',
  });
  await handleResponse(response);
};

// 自定义Hooks
export const useWebsitesQuery = (page: number = 1, size: number = 50) => {
  return useQuery({
    queryKey: ['websites', page, size],
    queryFn: () => fetchWebsites(page, size),
  });
};

export const useWebsiteQuery = (websiteId: string) => {
  return useQuery({
    queryKey: ['website', websiteId],
    queryFn: () => fetchWebsiteById(websiteId),
    enabled: !!websiteId,
  });
};

export const useCreateWebsiteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createWebsite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    },
  });
};

export const useUpdateWebsiteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variables: { websiteId: string; data: UpdateWebsiteData }) => 
      updateWebsite(variables.websiteId, variables.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['website', variables.websiteId] });
    },
  });
};

export const usePatchWebsiteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variables: { websiteId: string; data: PatchWebsiteData }) => 
      patchWebsite(variables.websiteId, variables.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['website', variables.websiteId] });
    },
  });
};

export const useSwitchWebsiteMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variables: { websiteId: string; data: SwitchWebsiteData }) => 
      switchWebsite(variables.websiteId, variables.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
      queryClient.invalidateQueries({ queryKey: ['website', variables.websiteId] });
    },
  });
};

export const useSyncWebsitesMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: syncWebsites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] });
    },
  });
};