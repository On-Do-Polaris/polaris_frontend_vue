import { ref, type Ref } from 'vue'
import { metaAPI } from '@/api'
import type { HazardType, Industry } from '@/api/types'

export function useMeta() {
  const loading = ref(false)
  const error: Ref<Error | null> = ref(null)
  const hazardTypes: Ref<HazardType[]> = ref([])
  const industries: Ref<Industry[]> = ref([])
  const sspScenarios: Ref<string[]> = ref([])

  /**
   * 위험 유형 목록 조회
   */
  const fetchHazardTypes = async (): Promise<HazardType[]> => {
    loading.value = true
    error.value = null

    try {
      const result = await metaAPI.getHazardTypes()
      hazardTypes.value = result
      return result
    } catch (err) {
      error.value = err as Error
      console.error('위험 유형 목록 조회 실패:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 산업 분류 목록 조회
   */
  const fetchIndustries = async (): Promise<Industry[]> => {
    loading.value = true
    error.value = null

    try {
      const result = await metaAPI.getIndustries()
      industries.value = result
      return result
    } catch (err) {
      error.value = err as Error
      console.error('산업 분류 목록 조회 실패:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * SSP 시나리오 목록 조회
   */
  const fetchSspScenarios = async (): Promise<string[]> => {
    loading.value = true
    error.value = null

    try {
      const result = await metaAPI.getSspScenarios()
      sspScenarios.value = result
      return result
    } catch (err) {
      error.value = err as Error
      console.error('SSP 시나리오 목록 조회 실패:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 상태 초기화
   */
  const reset = () => {
    hazardTypes.value = []
    industries.value = []
    sspScenarios.value = []
    error.value = null
    loading.value = false
  }

  return {
    // State
    loading,
    error,
    hazardTypes,
    industries,
    sspScenarios,
    // Actions
    fetchHazardTypes,
    fetchIndustries,
    fetchSspScenarios,
    reset
  }
}
