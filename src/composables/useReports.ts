import { ref, type Ref } from 'vue'
import { reportsAPI } from '@/api'
import type {
  CreateReportRequest,
  ReportWebViewResponse,
  ReportPdfResponse
} from '@/api/types'
import { processError } from '@/utils/errorHandler'
import { toast } from 'vue-sonner'

export function useReports() {
  const loading = ref(false)
  const error: Ref<string | null> = ref(null)
  const reportWebView: Ref<ReportWebViewResponse | null> = ref(null)
  const reportPdf: Ref<ReportPdfResponse | null> = ref(null)
  const reportId: Ref<string | null> = ref(null)

  /**
   * 리포트 생성
   */
  const createReport = async (data: CreateReportRequest): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await reportsAPI.createReport(data)
      // 리포트 생성 완료 (ID를 반환하지 않음)
      toast.success('리포트 생성 요청이 완료되었습니다.')
    } catch (err) {
      const errorMessage = processError('리포트 생성', err)
      error.value = errorMessage
      toast.error(errorMessage)
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
      const result = await reportsAPI.getWebView()
      reportWebView.value = result
      return result
    } catch (err) {
      const errorMessage = processError('리포트 웹 뷰 조회', err)
      error.value = errorMessage
      toast.error(errorMessage)
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
      const result = await reportsAPI.getPdf()
      reportPdf.value = result
      return result
    } catch (err) {
      const errorMessage = processError('리포트 PDF 조회', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 리포트 삭제
   */
  const deleteReport = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await reportsAPI.deleteReport()
      // 삭제 후 상태 초기화
      reportWebView.value = null
      reportPdf.value = null
      reportId.value = null
      toast.success('리포트가 삭제되었습니다.')
    } catch (err) {
      const errorMessage = processError('리포트 삭제', err)
      error.value = errorMessage
      toast.error(errorMessage)
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
      const errorMessage = processError('PDF 다운로드', err)
      toast.error(errorMessage)
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
