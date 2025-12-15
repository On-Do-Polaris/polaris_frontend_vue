import apiClient from './client'
import type {
  PastDisasterQueryParams,
  PastDisasterResponse,
} from './types'

export const disasterHistoryAPI = {
  /**
   * 과거 재해 이력 조회
   */
  getPastDisasters: async (params: PastDisasterQueryParams): Promise<PastDisasterResponse> => {
    const response = await apiClient.get<PastDisasterResponse>('/api/past', {
      params,
    })
    return response.data
  },
}
