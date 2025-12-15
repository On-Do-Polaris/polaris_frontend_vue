import { ref, onUnmounted } from 'vue'
import { processError } from '@/utils/errorHandler'

/**
 * 재사용 가능한 폴링 훅
 *
 * @example
 * const { data, isPolling, start, stop } = usePolling(
 *   () => analysisAPI.getAnalysisStatus(siteId, jobId),
 *   {
 *     interval: 3000,
 *     shouldStop: (status) => status.status === 'COMPLETED',
 *     onError: (err) => console.error(err),
 *     maxRetries: 5
 *   }
 * )
 */
export function usePolling<T>(
  pollFn: () => Promise<T>,
  options: {
    interval?: number
    shouldStop?: (data: T) => boolean
    onError?: (error: string) => void
    onSuccess?: (data: T) => void
    maxRetries?: number
  } = {},
) {
  const { interval = 3000, shouldStop, onError, onSuccess, maxRetries = 3 } = options

  const data = ref<T | null>(null)
  const isPolling = ref(false)
  const error = ref<string | null>(null)

  let intervalId: ReturnType<typeof setInterval> | null = null
  let retryCount = 0

  /**
   * 폴링 시작
   */
  const start = () => {
    if (isPolling.value) return

    isPolling.value = true
    retryCount = 0
    error.value = null

    intervalId = setInterval(async () => {
      try {
        const result = await pollFn()
        data.value = result
        retryCount = 0 // 성공 시 재시도 카운터 리셋
        error.value = null

        // 성공 콜백
        onSuccess?.(result)

        // 중지 조건 확인
        if (shouldStop?.(result)) {
          stop()
        }
      } catch (err) {
        retryCount++
        const errorMessage = processError('폴링', err)
        error.value = errorMessage

        // 에러 콜백
        onError?.(errorMessage)

        // 최대 재시도 횟수 초과 시 중지
        if (retryCount >= maxRetries) {
          stop()
        }
      }
    }, interval)
  }

  /**
   * 폴링 중지
   */
  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    isPolling.value = false
    retryCount = 0
  }

  /**
   * 폴링 재시작
   */
  const restart = () => {
    stop()
    start()
  }

  /**
   * 컴포넌트 언마운트 시 자동 정리
   */
  onUnmounted(() => {
    stop()
  })

  return {
    data,
    isPolling,
    error,
    start,
    stop,
    restart,
  }
}
