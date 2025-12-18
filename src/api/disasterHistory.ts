import apiClient from './client'
import type { PastDisasterQueryParams, PastDisasterResponse } from './types'

export const disasterHistoryAPI = {
  /**
   * 과거 재해 이력 조회
   * GET /past
   */
  getPastDisasters: async (params: PastDisasterQueryParams): Promise<PastDisasterResponse> => {
    // 백엔드가 snake_case를 기대하므로 변환
    const apiParams: Record<string, string> = {}

    if (params.year) {
      apiParams.year = params.year
    }
    if (params.disasterType) {
      apiParams.disaster_type = params.disasterType
    }
    if (params.severity) {
      apiParams.severity = params.severity
    }

    console.log('[disasterHistoryAPI] Original params:', params)
    console.log('[disasterHistoryAPI] Converted API params:', apiParams)

    const response = await apiClient.get<PastDisasterResponse>('/past', {
      params: apiParams,
    })
    return response.data
  },
}
