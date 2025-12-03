import apiClient from './client'
import type {
  CreateReportRequest,
  ReportWebViewResponse,
  ReportPdfResponse
} from './types'

export const reportAPI = {
  /**
   * 리포트 생성
   */
  createReport: async (data: CreateReportRequest): Promise<{ reportId: string }> => {
    const response = await apiClient.post('/api/reports', data)
    return response.data
  },

  /**
   * 리포트 웹 뷰 조회
   */
  getReportWebView: async (): Promise<ReportWebViewResponse> => {
    const response = await apiClient.get<ReportWebViewResponse>('/api/reports/web')
    return response.data
  },

  /**
   * 리포트 PDF 다운로드 정보
   */
  getReportPdf: async (): Promise<ReportPdfResponse> => {
    const response = await apiClient.get<ReportPdfResponse>('/api/reports/pdf')
    return response.data
  },

  /**
   * 리포트 삭제
   */
  deleteReport: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete('/api/reports')
    return response.data
  }
}
