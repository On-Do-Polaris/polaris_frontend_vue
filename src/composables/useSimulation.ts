import { ref, type Ref } from 'vue'
import { simulationAPI } from '@/api'
import type {
  RelocationSimulationRequest,
  RelocationSimulationResponse,
  ClimateSimulationRequest,
  ClimateSimulationResponse
} from '@/api/types'
import { processError } from '@/utils/errorHandler'
import { toast } from 'vue-sonner'

export function useSimulation() {
  const loading = ref(false)
  const error: Ref<string | null> = ref(null)
  const relocationResult: Ref<RelocationSimulationResponse | null> = ref(null)
  const climateResult: Ref<ClimateSimulationResponse | null> = ref(null)

  /**
   * 사업장 이전 시뮬레이션 (후보지 비교)
   */
  const compareRelocation = async (
    data: RelocationSimulationRequest
  ): Promise<RelocationSimulationResponse> => {
    loading.value = true
    error.value = null

    try {
      const result = await simulationAPI.compareRelocation(data)
      relocationResult.value = result
      return result
    } catch (err) {
      const errorMessage = processError('사업장 이전 시뮬레이션', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 기후 시뮬레이션
   */
  const runClimateSimulation = async (
    data: ClimateSimulationRequest
  ): Promise<ClimateSimulationResponse> => {
    loading.value = true
    error.value = null

    try {
      const result = await simulationAPI.runClimateSimulation(data)
      climateResult.value = result
      return result
    } catch (err) {
      const errorMessage = processError('기후 시뮬레이션', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 결과 초기화
   */
  const reset = () => {
    relocationResult.value = null
    climateResult.value = null
    error.value = null
    loading.value = false
  }

  return {
    // State
    loading,
    error,
    relocationResult,
    climateResult,
    // Actions
    compareRelocation,
    runClimateSimulation,
    reset
  }
}
