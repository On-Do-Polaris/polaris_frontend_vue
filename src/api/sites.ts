import apiClient from './client'
import type {
  SiteListResponse,
  Site,
  CreateSiteRequest,
  UpdateSiteRequest
} from './types'

export const siteAPI = {
  /**
   * 사업장 목록 조회
   */
  getSites: async (): Promise<SiteListResponse> => {
    const response = await apiClient.get<SiteListResponse>('/api/sites')
    return response.data
  },

  /**
   * 사업장 생성
   */
  createSite: async (data: CreateSiteRequest): Promise<Site> => {
    const response = await apiClient.post<Site>('/api/sites', data)
    return response.data
  },

  /**
   * 사업장 수정
   */
  updateSite: async (siteId: string, data: UpdateSiteRequest): Promise<Site> => {
    const response = await apiClient.patch<Site>(`/api/sites/${siteId}`, data)
    return response.data
  },

  /**
   * 사업장 삭제
   */
  deleteSite: async (siteId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/sites/${siteId}`)
    return response.data
  }
}
