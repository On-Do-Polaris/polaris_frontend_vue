import { ref, type Ref } from 'vue'
import { reportAPI } from '@/api'
import type {
  CreateReportRequest,
  ReportWebViewResponse,
  ReportPdfResponse
} from '@/api/types'

export function useReports() {
  const loading = ref(false)
  const error: Ref<Error | null> = ref(null)
  const reportWebView: Ref<ReportWebViewResponse | null> = ref(null)
  const reportPdf: Ref<ReportPdfResponse | null> = ref(null)
  const reportId: Ref<string | null> = ref(null)

  /**
   * 리포트 생성
   */
  const createReport = async (data: CreateReportRequest): Promise<{ reportId: string }> => {
    loading.value = true
    error.value = null

    try {
      const result = await reportAPI.createReport(data)
      reportId.value = result.reportId
      return result
    } catch (err) {
      error.value = err as Error
      console.error('리포트 생성 실패:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 리포트 웹 뷰 조회
   */
  const getReportWebView = async (): Promise<ReportWebViewResponse> => {
    loading.value = true
    error.value = null

    try {
      const result = await reportAPI.getReportWebView()
      reportWebView.value = result
      return result
    } catch (err) {
      error.value = err as Error
      console.error('리포트 웹 뷰 조회 실패:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 리포트 PDF 다운로드 정보 조회
   */
  const getReportPdf = async (): Promise<ReportPdfResponse> => {
    loading.value = true
    error.value = null

    try {
      const result = await reportAPI.getReportPdf()
      reportPdf.value = result
      return result
    } catch (err) {
      error.value = err as Error
      console.error('리포트 PDF 조회 실패:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 리포트 삭제
   */
  const deleteReport = async (): Promise<{ message: string }> => {
    loading.value = true
    error.value = null

    try {
      const result = await reportAPI.deleteReport()
      // 삭제 후 상태 초기화
      reportWebView.value = null
      reportPdf.value = null
      reportId.value = null
      return result
    } catch (err) {
      error.value = err as Error
      console.error('리포트 삭제 실패:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * PDF 다운로드
   */
  const downloadPdf = async () => {
    try {
      const pdfInfo = await getReportPdf()
      // 브라우저에서 다운로드 URL 열기
      window.open(pdfInfo.downloadUrl, '_blank')
    } catch (err) {
      console.error('PDF 다운로드 실패:', err)
      throw err
    }
  }

  /**
   * 상태 초기화
   */
  const reset = () => {
    reportWebView.value = null
    reportPdf.value = null
    reportId.value = null
    error.value = null
    loading.value = false
  }

  return {
    // State
    loading,
    error,
    reportWebView,
    reportPdf,
    reportId,
    // Actions
    createReport,
    getReportWebView,
    getReportPdf,
    deleteReport,
    downloadPdf,
    reset
  }
}
