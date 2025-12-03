import apiClient from './client'
import type {
  StartAnalysisRequest,
  AnalysisJobStatusResponse,
  PhysicalRiskScoreResponse,
  PastEventsResponse,
  FinancialImpactResponse,
  VulnerabilityResponse,
  AnalysisTotalResponse
} from './types'

export const analysisAPI = {
  /**
   * 분석 시작
   */
  startAnalysis: async (
    siteId: string,
    data: StartAnalysisRequest
  ): Promise<AnalysisJobStatusResponse> => {
    const response = await apiClient.post<AnalysisJobStatusResponse>(
      `/api/sites/${siteId}/analysis/start`,
      data
    )
    return response.data
  },

  /**
   * 분석 작업 상태 조회
   */
  getAnalysisStatus: async (
    siteId: string,
    jobId: string
  ): Promise<AnalysisJobStatusResponse> => {
    const response = await apiClient.get<AnalysisJobStatusResponse>(
      `/api/sites/${siteId}/analysis/status/${jobId}`
    )
    return response.data
  },

  /**
   * 물리적 리스크 점수 조회
   */
  getPhysicalRiskScores: async (
    siteId: string,
    hazardType?: string
  ): Promise<PhysicalRiskScoreResponse> => {
    const params = hazardType ? { hazardType } : {}
    const response = await apiClient.get<PhysicalRiskScoreResponse>(
      `/api/sites/${siteId}/analysis/physical-risk-scores`,
      { params }
    )
    return response.data
  },

  /**
   * 과거 재난 이력 조회
   */
  getPastEvents: async (siteId: string): Promise<PastEventsResponse> => {
    const response = await apiClient.get<PastEventsResponse>(
      `/api/sites/${siteId}/analysis/past-events`
    )
    return response.data
  },

  /**
   * 재무 영향 분석
   */
  getFinancialImpact: async (siteId: string): Promise<FinancialImpactResponse> => {
    const response = await apiClient.get<FinancialImpactResponse>(
      `/api/sites/${siteId}/analysis/financial-impacts`
    )
    return response.data
  },

  /**
   * 취약성 분석
   */
  getVulnerability: async (siteId: string): Promise<VulnerabilityResponse> => {
    const response = await apiClient.get<VulnerabilityResponse>(
      `/api/sites/${siteId}/analysis/vulnerability`
    )
    return response.data
  },

  /**
   * 통합 분석 결과
   */
  getTotalAnalysis: async (
    siteId: string,
    hazardType: string
  ): Promise<AnalysisTotalResponse> => {
    const response = await apiClient.get<AnalysisTotalResponse>(
      `/api/sites/${siteId}/analysis/total`,
      { params: { hazardType } }
    )
    return response.data
  }
}
