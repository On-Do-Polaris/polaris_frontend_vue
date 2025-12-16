import apiClient from './client'
import type {
  CreateReportRequest,
  ReportWebViewResponse,
  ReportPdfResponse
} from './types'

export const reportsAPI = {
  createReport: async (data: CreateReportRequest): Promise<void> => {
    await apiClient.post('/reports', data)
  },

  getWebView: async (): Promise<ReportWebViewResponse> => {
    const response = await apiClient.get<ReportWebViewResponse>('/reports/web')
    return response.data
  },

  getPdf: async (): Promise<ReportPdfResponse> => {
    const response = await apiClient.get<ReportPdfResponse>('/reports/pdf')
    return response.data
  },

  deleteReport: async (): Promise<void> => {
    await apiClient.delete('/reports')
  },

  uploadAdditionalData: async (siteId: string, file: File): Promise<void> => {
    const formData = new FormData()

    // siteId를 JSON 객체로 만들고 Blob으로 감싸서 'data' 키에 추가
    const metadata = { siteId }
    const metadataBlob = new Blob([JSON.stringify(metadata)], {
      type: 'application/json'
    })
    formData.append('data', metadataBlob)

    // 파일을 'file' 키에 추가
    formData.append('file', file)

    await apiClient.post('/report/data', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}