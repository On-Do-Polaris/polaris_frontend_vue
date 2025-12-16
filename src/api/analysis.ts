import apiClient from './client'
import type {
  StartAnalysisRequest,
  AnalysisJobStatusResponse,
  AnalysisSummaryResponse,
  PhysicalRiskScoreResponse,
  PhysicalRiskResponse,
  AnalysisTotalResponse,
  FinancialImpactResponse,
  VulnerabilityResponse,
  VulnerabilityAnalysisResponse,
  PastEventsResponse
} from './types'

export const analysisAPI = {
  // 온보딩 완료 후 전체 사업장 분석 시작
  startAllSitesAnalysis: async (siteIds: string[]): Promise<{ result: string; message: string }> => {
    const response = await apiClient.post<{ result: string; message: string }>(
      '/analysis/start',
      { sites: siteIds.map(siteId => ({ siteId })) }
    )
    return response.data
  },

  // 분석 상태 확인 (jobId 없이)
  getOverallAnalysisStatus: async (): Promise<{ result: string; data: { status: string } }> => {
    const response = await apiClient.get<{ result: string; data: { status: string } }>(
      '/analysis/status'
    )
    return response.data
  },

  // 분석 개요 조회 (SSP2-2024 기준)
  getAnalysisSummary: async (siteId: string): Promise<AnalysisSummaryResponse> => {
    const response = await apiClient.get<{ result: string; data: AnalysisSummaryResponse }>(
      '/analysis/summary',
      { params: { siteId } }
    )
    return response.data.data
  },

  startAnalysis: async (siteId: string, data: StartAnalysisRequest): Promise<AnalysisJobStatusResponse> => {
    const response = await apiClient.post<AnalysisJobStatusResponse>(
      `/sites/${siteId}/analysis/start`,
      data
    )
    return response.data
  },

  getAnalysisStatus: async (siteId: string, jobId: string): Promise<AnalysisJobStatusResponse> => {
    const response = await apiClient.get<AnalysisJobStatusResponse>(
      `/sites/${siteId}/analysis/status/${jobId}`
    )
    return response.data
  },

  getPhysicalRiskScores: async (siteId: string, hazardType?: string): Promise<PhysicalRiskScoreResponse> => {
    const params = hazardType ? { hazardType } : {}
    const response = await apiClient.get<PhysicalRiskScoreResponse>(
      `/sites/${siteId}/analysis/physical-risk-scores`,
      { params }
    )
    return response.data
  },

  getTotalAnalysis: async (siteId: string, hazardType: string): Promise<AnalysisTotalResponse> => {
    const response = await apiClient.get<AnalysisTotalResponse>(
      `/sites/${siteId}/analysis/total`,
      { params: { hazardType } }
    )
    return response.data
  },

  getFinancialImpact: async (siteId: string): Promise<FinancialImpactResponse> => {
    const response = await apiClient.get<FinancialImpactResponse>(
      `/sites/${siteId}/analysis/financial-impacts`
    )
    return response.data
  },

  getVulnerability: async (siteId: string): Promise<VulnerabilityResponse> => {
    const response = await apiClient.get<VulnerabilityResponse>(
      `/sites/${siteId}/analysis/vulnerability`
    )
    return response.data
  },

  getPastEvents: async (siteId: string): Promise<PastEventsResponse> => {
    const response = await apiClient.get<PastEventsResponse>(
      `/sites/${siteId}/analysis/past-events`
    )
    return response.data
  },

  // SSP 시나리오별 물리적 리스크 전망 조회
  getPhysicalRisk: async (
    siteId: string,
    hazardType: string,
    term: 'short' | 'mid' | 'long'
  ): Promise<PhysicalRiskResponse> => {
    const response = await apiClient.get<{ result: string; data: PhysicalRiskResponse }>(
      '/analysis/physical-risk',
      { params: { siteId, hazardType, term } }
    )
    return response.data.data
  },

  // AAL (연간 평균 손실) 데이터 조회
  getAAL: async (
    siteId: string,
    hazardType: string,
    term: 'short' | 'mid' | 'long'
  ): Promise<PhysicalRiskResponse> => {
    const response = await apiClient.get<{ result: string; data: PhysicalRiskResponse }>(
      '/analysis/aal',
      { params: { siteId, hazardType, term } }
    )
    return response.data.data
  },

  // 취약성 분석 조회 (새 엔드포인트)
  getVulnerabilityAnalysis: async (siteId: string): Promise<VulnerabilityAnalysisResponse> => {
    const response = await apiClient.get<{ result: string; data: VulnerabilityAnalysisResponse }>(
      '/analysis/vulnerability',
      { params: { siteId } }
    )
    return response.data.data
  }
}