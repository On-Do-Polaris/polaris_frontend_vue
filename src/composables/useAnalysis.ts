import { ref, type Ref } from 'vue'
import { analysisAPI } from '@/api'
import type {
  StartAnalysisRequest,
  AnalysisJobStatusResponse,
  PhysicalRiskScoreResponse,
  PastEventsResponse,
  FinancialImpactResponse,
  VulnerabilityResponse,
  AnalysisTotalResponse,
} from '@/api/types'
import { processError } from '@/utils/errorHandler'
import { toast } from 'vue-sonner'
import { usePolling } from './usePolling'

export function useAnalysis(siteId: string) {
  const loading = ref(false)
  const error: Ref<string | null> = ref(null)
  const analysisStatus: Ref<AnalysisJobStatusResponse | null> = ref(null)
  const riskScores: Ref<PhysicalRiskScoreResponse | null> = ref(null)
  const pastEvents: Ref<PastEventsResponse | null> = ref(null)
  const financialImpact: Ref<FinancialImpactResponse | null> = ref(null)
  const vulnerability: Ref<VulnerabilityResponse | null> = ref(null)
  const totalAnalysis: Ref<AnalysisTotalResponse | null> = ref(null)

  // 폴링을 위한 jobId 저장
  let currentJobId: string | null = null

  // 폴링 훅 초기화 (나중에 설정)
  let polling: ReturnType<typeof usePolling<AnalysisJobStatusResponse>> | null = null

  /**
   * 분석 시작
   */
  const startAnalysis = async (data: StartAnalysisRequest): Promise<AnalysisJobStatusResponse> => {
    loading.value = true
    error.value = null

    try {
      const result = await analysisAPI.startAnalysis(siteId, data)
      analysisStatus.value = result
      currentJobId = result.jobId

      // 분석 시작 후 자동으로 폴링 시작
      if (result.status === 'queued' || result.status === 'running') {
        startPolling(result.jobId)
      }

      return result
    } catch (err) {
      const errorMessage = processError('분석 시작', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 분석 상태 폴링 시작
   */
  const startPolling = (jobId: string) => {
    // 기존 폴링이 있으면 중지
    polling?.stop()

    // 새로운 폴링 훅 생성
    polling = usePolling(() => analysisAPI.getAnalysisStatus(siteId, jobId), {
      interval: 3000,
      shouldStop: (status) => status.status === 'completed' || status.status === 'failed',
      onSuccess: (status) => {
        analysisStatus.value = status
      },
      onError: (errorMessage) => {
        error.value = errorMessage
      },
      maxRetries: 5,
    })

    polling.start()
  }

  /**
   * 폴링 중지
   */
  const stopPolling = () => {
    polling?.stop()
  }

  /**
   * 분석 작업 상태 수동 조회 (Promise 기반)
   * @deprecated
   */
  const pollAnalysisStatus = async (jobId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const tempPolling = usePolling(() => analysisAPI.getAnalysisStatus(siteId, jobId), {
        interval: 3000,
        shouldStop: (status) => status.status === 'completed' || status.status === 'failed',
        onSuccess: (status) => {
          analysisStatus.value = status
          if (status.status === 'completed') {
            tempPolling.stop()
            resolve()
          } else if (status.status === 'failed') {
            tempPolling.stop()
            reject(new Error(status.error?.message || '분석 실패'))
          }
        },
        onError: (err) => {
          tempPolling.stop()
          reject(new Error(err))
        },
        maxRetries: 5,
      })
      tempPolling.start()
    })
  }

  /**
   * 물리적 리스크 점수 조회
   */
  const fetchPhysicalRiskScores = async (hazardType?: string) => {
    loading.value = true
    error.value = null

    try {
      const result = await analysisAPI.getPhysicalRiskScores(siteId, hazardType)
      riskScores.value = result
      return result
    } catch (err) {
      const errorMessage = processError('리스크 점수 조회', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 과거 재난 이력 조회
   */
  const fetchPastEvents = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await analysisAPI.getPastEvents(siteId)
      pastEvents.value = result
      return result
    } catch (err) {
      const errorMessage = processError('과거 재난 이력 조회', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 재무 영향 조회
   */
  const fetchFinancialImpact = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await analysisAPI.getFinancialImpact(siteId)
      financialImpact.value = result
      return result
    } catch (err) {
      const errorMessage = processError('재무 영향 조회', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 취약성 분석 결과 조회
   */
  const fetchVulnerability = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await analysisAPI.getVulnerability(siteId)
      vulnerability.value = result
      return result
    } catch (err) {
      const errorMessage = processError('취약성 분석 조회', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 통합 분석 결과 조회
   */
  const fetchTotalAnalysis = async (hazardType: string) => {
    loading.value = true
    error.value = null

    try {
      const result = await analysisAPI.getTotalAnalysis(siteId, hazardType)
      totalAnalysis.value = result
      return result
    } catch (err) {
      const errorMessage = processError('통합 분석 결과 조회', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    loading,
    error,
    analysisStatus,
    riskScores,
    pastEvents,
    financialImpact,
    vulnerability,
    totalAnalysis,
    // Actions
    startAnalysis,
    pollAnalysisStatus,
    fetchPhysicalRiskScores,
    fetchPastEvents,
    fetchFinancialImpact,
    fetchVulnerability,
    fetchTotalAnalysis,
    stopPolling,
  }
}
