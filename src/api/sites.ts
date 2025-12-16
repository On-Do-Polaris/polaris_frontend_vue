import apiClient from './client'
import type {
  SiteResponse,
  SiteInfo,
  CreateSiteRequest,
  UpdateSiteRequest
} from './types'

export const sitesAPI = {
  getSites: async (): Promise<SiteResponse> => {
    const response = await apiClient.get<SiteResponse>('/sites')
    return response.data
  },

  createSite: async (data: CreateSiteRequest): Promise<SiteInfo> => {
    const response = await apiClient.post<SiteInfo>('/site', data)
    return response.data
  },

  updateSite: async (siteId: string, data: UpdateSiteRequest): Promise<SiteInfo> => {
    const response = await apiClient.patch<SiteInfo>('/site', data, {
      params: { siteId }
    })
    return response.data
  },

  deleteSite: async (siteId: string): Promise<void> => {
    await apiClient.delete('/site', {
      params: { siteId }
    })
  }
}