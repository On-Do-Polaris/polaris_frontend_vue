import { ref, type Ref } from 'vue'
import { metaAPI } from '@/api'
import type { HazardType, Industry } from '@/api/types'
import { processError } from '@/utils/errorHandler'
import { toast } from 'vue-sonner'
import { apiCache, createCacheKey } from '@/utils/cache'

export function useMeta() {
  const loading = ref(false)
  const error: Ref<string | null> = ref(null)
  const hazardTypes: Ref<HazardType[]> = ref([])
  const industries: Ref<Industry[]> = ref([])
  const sspScenarios: Ref<string[]> = ref([])

  // 캐시 키 정의
  const CACHE_KEYS = {
    HAZARD_TYPES: createCacheKey('meta', 'hazardTypes'),
    INDUSTRIES: createCacheKey('meta', 'industries'),
    SSP_SCENARIOS: createCacheKey('meta', 'sspScenarios')
  }

  /**
   * 위험 유형 목록 조회 (캐싱 적용)
   */
  const fetchHazardTypes = async (): Promise<HazardType[]> => {
    // 캐시 확인
    const cached = apiCache.get<HazardType[]>(CACHE_KEYS.HAZARD_TYPES)
    if (cached) {
      hazardTypes.value = cached
      return cached
    }

    loading.value = true
    error.value = null

    try {
      const result = await metaAPI.getHazards()
      hazardTypes.value = result

      // 30분 캐싱 (메타데이터는 자주 변경되지 않음)
      apiCache.set(CACHE_KEYS.HAZARD_TYPES, result, 30 * 60 * 1000)

      return result
    } catch (err) {
      const errorMessage = processError('위험 유형 목록 조회', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 산업 분류 목록 조회 (캐싱 적용)
   */
  const fetchIndustries = async (): Promise<Industry[]> => {
    // 캐시 확인
    const cached = apiCache.get<Industry[]>(CACHE_KEYS.INDUSTRIES)
    if (cached) {
      industries.value = cached
      return cached
    }

    loading.value = true
    error.value = null

    try {
      const result = await metaAPI.getIndustries()
      industries.value = result

      // 30분 캐싱
      apiCache.set(CACHE_KEYS.INDUSTRIES, result, 30 * 60 * 1000)

      return result
    } catch (err) {
      const errorMessage = processError('산업 분류 목록 조회', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * SSP 시나리오 목록 조회 (캐싱 적용)
   */
  const fetchSspScenarios = async (): Promise<string[]> => {
    // 캐시 확인
    const cached = apiCache.get<string[]>(CACHE_KEYS.SSP_SCENARIOS)
    if (cached) {
      sspScenarios.value = cached
      return cached
    }

    loading.value = true
    error.value = null

    try {
      const result = await metaAPI.getSspScenarios()
      sspScenarios.value = result

      // 30분 캐싱
      apiCache.set(CACHE_KEYS.SSP_SCENARIOS, result, 30 * 60 * 1000)

      return result
    } catch (err) {
      const errorMessage = processError('SSP 시나리오 목록 조회', err)
      error.value = errorMessage
      toast.error(errorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 상태 초기화 (캐시도 삭제)
   */
  const reset = () => {
    hazardTypes.value = []
    industries.value = []
    sspScenarios.value = []
    error.value = null
    loading.value = false

    // 캐시 삭제
    apiCache.clearPattern(/^meta:/)
  }

  /**
   * 캐시 강제 갱신
   */
  const refreshCache = async () => {
    apiCache.clearPattern(/^meta:/)
    await Promise.all([
      fetchHazardTypes(),
      fetchIndustries(),
      fetchSspScenarios()
    ])
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
    reset,
    refreshCache
  }
}
