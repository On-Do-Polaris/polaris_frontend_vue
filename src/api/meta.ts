import apiClient from './client'
import type { Industry, HazardType } from './types'

export const metaAPI = {
  getIndustries: async (): Promise<Industry[]> => {
    const response = await apiClient.get<Industry[]>('/meta/industries')
    return response.data
  },

  getHazards: async (): Promise<HazardType[]> => {
    const response = await apiClient.get<HazardType[]>('/meta/hazards')
    return response.data
  },

  getSspScenarios: async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>('/meta/ssp-scenarios')
    return response.data
  }
}