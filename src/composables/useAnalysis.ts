import { ref, type Ref } from 'vue'
import { analysisAPI } from '@/api'
import type {
  StartAnalysisRequest,
  AnalysisJobStatusResponse,
  PhysicalRiskScoreResponse,
  PastEventsResponse,
  FinancialImpactResponse,
  VulnerabilityResponse,
  AnalysisTotalResponse
} from '@/api/types'

export function useAnalysis(siteId: string) {
  const loading = ref(false)
  const error: Ref<Error | null> = ref(null)
  const analysisStatus: Ref<AnalysisJobStatusResponse | null> = ref(null)
  const riskScores: Ref<PhysicalRiskScoreResponse | null> = ref(null)
  const pastEvents: Ref<PastEventsResponse | null> = ref(null)
  const financialImpact: Ref<FinancialImpactResponse | null> = ref(null)
  const vulnerability: Ref<VulnerabilityResponse | null> = ref(null)
  const totalAnalysis: Ref<AnalysisTotalResponse | null> = ref(null)

  let pollingInterval: ReturnType<typeof setTimeout> | null = null

  /**
   * 분석 시작
   */
  const startAnalysis = async (data: StartAnalysisRequest): Promise<AnalysisJobStatusResponse> => {
    loading.value = true
    error.value = null

    try {
      const result = await analysisAPI.startAnalysis(siteId, data)
      analysisStatus.value = result

      // 분석 시작 후 자동으로 폴링 시작
      if (result.status === 'PENDING' || result.status === 'PROCESSING') {
        startPolling(result.jobId)
      }

      return result
    } catch (err) {
      error.value = err as Error
      console.error('분석 시작 실패:', err)
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
    stopPolling()

    pollingInterval = setInterval(async () => {
      try {
        const status = await analysisAPI.getAnalysisStatus(siteId, jobId)
        analysisStatus.value = status

        // 완료 또는 실패 시 폴링 중지
        if (status.status === 'COMPLETED' || status.status === 'FAILED') {
          stopPolling()
        }
      } catch (err) {
        console.error('상태 폴링 실패:', err)
        error.value = err as Error
        stopPolling()
      }
    }, 3000) // 3초마다 폴링
  }

  /**
   * 폴링 중지
   */
  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  /**
   * 분석 작업 상태 수동 조회
   */
  const pollAnalysisStatus = async (jobId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const status = await analysisAPI.getAnalysisStatus(siteId, jobId)
          analysisStatus.value = status

          if (status.status === 'COMPLETED') {
            clearInterval(interval)
            resolve()
          } else if (status.status === 'FAILED') {
            clearInterval(interval)
            reject(new Error(status.message || '분석 실패'))
          }
        } catch (err) {
          clearInterval(interval)
          reject(err)
        }
      }, 3000) // 3초마다 확인
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
      error.value = err as Error
      console.error('리스크 점수 조회 실패:', err)
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
      error.value = err as Error
      console.error('과거 재난 이력 조회 실패:', err)
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
      error.value = err as Error
      console.error('재무 영향 조회 실패:', err)
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
      error.value = err as Error
      console.error('취약성 분석 조회 실패:', err)
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
      error.value = err as Error
      console.error('통합 분석 결과 조회 실패:', err)
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
    stopPolling
  }
}
