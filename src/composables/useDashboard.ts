import { ref, Ref } from 'vue'
import { dashboardAPI } from '@/api'
import type { DashboardSummary } from '@/api/types'

export function useDashboard() {
  const summary = ref<DashboardSummary | null>(null)
  const loading = ref(false)
  const error: Ref<Error | null> = ref(null)

  /**
   * 대시보드 요약 정보 조회
   */
  const fetchSummary = async () => {
    loading.value = true
    error.value = null

    try {
      summary.value = await dashboardAPI.getSummary()
    } catch (err) {
      error.value = err as Error
      console.error('대시보드 요약 정보 조회 실패:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    loading,
    error,
    fetchSummary
  }
}
