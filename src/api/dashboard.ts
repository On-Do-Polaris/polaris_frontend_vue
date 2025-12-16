import apiClient from './client'
import type { DashboardSummaryResponse } from './types'

export const dashboardAPI = {
  getDashboard: async (): Promise<DashboardSummaryResponse> => {
    const response = await apiClient.get<DashboardSummaryResponse>('/dashboard')
    return response.data
  }
}