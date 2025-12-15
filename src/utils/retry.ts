import axios from 'axios'

export interface RetryOptions {
  maxRetries?: number
  delay?: number
  shouldRetry?: (error: any) => boolean
  onRetry?: (attempt: number, error: any) => void
}

/**
 * 재시도 로직을 포함한 함수 래퍼
 *
 * @example
 * const data = await withRetry(
 *   () => analysisAPI.getPhysicalRiskScores(siteId),
 *   { maxRetries: 3, delay: 1000 }
 * )
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    shouldRetry = defaultShouldRetry,
    onRetry
  } = options

  let lastError: any

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // 재시도 여부 확인
      if (!shouldRetry(error) || attempt === maxRetries - 1) {
        throw error
      }

      // 재시도 콜백
      onRetry?.(attempt + 1, error)

      // 지수 백오프 (exponential backoff)
      const backoffDelay = delay * Math.pow(2, attempt)
      await sleep(backoffDelay)
    }
  }

  throw lastError
}

/**
 * 기본 재시도 조건
 * - 네트워크 에러
 * - 타임아웃
 * - 5xx 서버 에러
 */
function defaultShouldRetry(error: any): boolean {
  if (axios.isAxiosError(error)) {
    // 네트워크 에러
    if (error.code === 'ERR_NETWORK') {
      return true
    }

    // 타임아웃
    if (error.code === 'ECONNABORTED') {
      return true
    }

    // 5xx 서버 에러
    const status = error.response?.status
    if (status && status >= 500 && status < 600) {
      return true
    }
  }

  return false
}

/**
 * 지정된 시간만큼 대기
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 특정 HTTP 상태 코드에서만 재시도
 */
export function retryOnStatus(statusCodes: number[]): (error: any) => boolean {
  return (error: any) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      return status !== undefined && statusCodes.includes(status)
    }
    return false
  }
}

/**
 * 네트워크 에러에서만 재시도
 */
export function retryOnNetworkError(error: any): boolean {
  if (axios.isAxiosError(error)) {
    return error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED'
  }
  return false
}
