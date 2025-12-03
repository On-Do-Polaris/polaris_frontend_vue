import apiClient from './client'
import type { DashboardSummary } from './types'

export const dashboardAPI = {
  /**
   * 대시보드 요약 정보 조회
   */
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>('/api/dashboard/summary')
    return response.data
  }
}
