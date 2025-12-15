import { ref, type Ref } from 'vue'
import { dashboardAPI } from '@/api'
import type { DashboardSummaryResponse } from '@/api/types'
import { processError } from '@/utils/errorHandler'
import { toast } from 'vue-sonner'

export function useDashboard() {
  const summary = ref<DashboardSummaryResponse | null>(null)
  const loading = ref(false)
  const error: Ref<string | null> = ref(null)

  /**
   * 대시보드 요약 정보 조회
   */
  const fetchSummary = async () => {
    loading.value = true
    error.value = null

    try {
      summary.value = await dashboardAPI.getDashboard()
    } catch (err) {
      const errorMessage = processError('대시보드 요약 정보 조회', err)
      error.value = errorMessage
      toast.error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    loading,
    error,
    fetchSummary,
  }
}
