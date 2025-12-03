import apiClient from './client'
import type {
  RelocationSimulationRequest,
  RelocationSimulationResponse,
  ClimateSimulationRequest,
  ClimateSimulationResponse
} from './types'

export const simulationAPI = {
  /**
   * 사업장 이전 시뮬레이션 (비교)
   */
  compareRelocation: async (
    data: RelocationSimulationRequest
  ): Promise<RelocationSimulationResponse> => {
    const response = await apiClient.post<RelocationSimulationResponse>(
      '/api/simulation/relocation/compare',
      data
    )
    return response.data
  },

  /**
   * 기후 시뮬레이션
   */
  runClimateSimulation: async (
    data: ClimateSimulationRequest
  ): Promise<ClimateSimulationResponse> => {
    const response = await apiClient.post<ClimateSimulationResponse>(
      '/api/simulation/climate',
      data
    )
    return response.data
  }
}
