import apiClient from './client'
import type {
  RelocationSimulationRequest,
  RelocationSimulationResponse,
  ClimateSimulationRequest,
  ClimateSimulationResponse,
  LocationRecommendationResponse,
} from './types'

export const simulationAPI = {
  compareRelocation: async (
    data: RelocationSimulationRequest,
  ): Promise<RelocationSimulationResponse> => {
    const response = await apiClient.post<RelocationSimulationResponse>(
      '/simulation/location/compare',
      data,
    )
    return response.data
  },

  runClimateSimulation: async (
    data: ClimateSimulationRequest,
  ): Promise<ClimateSimulationResponse> => {
    const response = await apiClient.post<ClimateSimulationResponse>(
      '/simulation/climate',
      data,
    )
    return response.data
  },

  getLocationRecommendations: async (siteId: string): Promise<LocationRecommendationResponse> => {
    const response = await apiClient.get('/simulation/location/recommendation', {
      params: { siteId },
    })

    // API 응답: { result, site: { siteId, candidate1, candidate2, candidate3 } }
    // 또는 { data: { site: { ... } } } 형태
    if (response.data.site) {
      return response.data
    } else if (response.data.data?.site) {
      return response.data.data
    }

    return response.data
  },
}
