import apiClient from './client'
import type {
  SiteRecommendationBatchRequest,
  SiteRecommendationBatchResponse,
  BatchJobProgressResponse,
  SiteRecommendationBatchResultResponse,
} from './types'

export const recommendationAPI = {
  /**
   * 후보지 추천 배치 작업 시작
   */
  startBatch: async (
    data: SiteRecommendationBatchRequest,
  ): Promise<SiteRecommendationBatchResponse> => {
    const response = await apiClient.post<SiteRecommendationBatchResponse>(
      '/api/recommendation',
      data,
    )
    return response.data
  },

  /**
   * 배치 작업 진행 상황 조회
   */
  getProgress: async (batchJobId: string): Promise<BatchJobProgressResponse> => {
    const response = await apiClient.get<BatchJobProgressResponse>(
      `/api/recommendation/${batchJobId}/progress`,
    )
    return response.data
  },

  /**
   * 배치 작업 결과 조회
   */
  getResult: async (batchJobId: string): Promise<SiteRecommendationBatchResultResponse> => {
    const response = await apiClient.get<SiteRecommendationBatchResultResponse>(
      `/api/recommendation/${batchJobId}/result`,
    )
    return response.data
  },
}
