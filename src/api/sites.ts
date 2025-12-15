import apiClient from './client'
import type {
  SiteResponse,
  SiteInfo,
  CreateSiteRequest,
  UpdateSiteRequest
} from './types'

export const sitesAPI = {
  getSites: async (): Promise<SiteResponse> => {
    const response = await apiClient.get<SiteResponse>('/api/sites')
    return response.data
  },

  createSite: async (data: CreateSiteRequest): Promise<SiteInfo> => {
    const response = await apiClient.post<SiteInfo>('/api/site', data)
    return response.data
  },

  updateSite: async (siteId: string, data: UpdateSiteRequest): Promise<SiteInfo> => {
    const response = await apiClient.patch<SiteInfo>('/api/site', data, {
      params: { siteId }
    })
    return response.data
  },

  deleteSite: async (siteId: string): Promise<void> => {
    await apiClient.delete('/api/site', {
      params: { siteId }
    })
  }
}