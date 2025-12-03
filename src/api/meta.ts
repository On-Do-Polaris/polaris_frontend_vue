import apiClient from './client'
import type { HazardType, Industry } from './types'

export const metaAPI = {
  /**
   * 위험 유형 목록 조회
   */
  getHazardTypes: async (): Promise<HazardType[]> => {
    const response = await apiClient.get<HazardType[]>('/api/meta/hazards')
    return response.data
  },

  /**
   * 산업 분류 목록 조회
   */
  getIndustries: async (): Promise<Industry[]> => {
    const response = await apiClient.get<Industry[]>('/api/meta/industries')
    return response.data
  },

  /**
   * SSP 시나리오 목록 조회
   */
  getSspScenarios: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/api/meta/ssp-scenarios')
    return response.data
  }
}
