import axios, { type AxiosError } from 'axios'
import type { ApiError } from '@/api/types'

/**
 * Axios 에러인지 확인
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return axios.isAxiosError(error)
}

/**
 * HTTP 상태 코드에 따른 기본 에러 메시지
 */
function getDefaultErrorMessage(status?: number): string {
  switch (status) {
    case 400:
      return '잘못된 요청입니다.'
    case 401:
      return '인증이 필요합니다. 다시 로그인해주세요.'
    case 403:
      return '접근 권한이 없습니다.'
    case 404:
      return '요청한 리소스를 찾을 수 없습니다.'
    case 409:
      return '요청이 충돌했습니다.'
    case 422:
      return '입력값이 올바르지 않습니다.'
    case 500:
      return '서버 오류가 발생했습니다.'
    case 502:
      return '게이트웨이 오류가 발생했습니다.'
    case 503:
      return '서비스를 일시적으로 사용할 수 없습니다.'
    default:
      return '알 수 없는 오류가 발생했습니다.'
  }
}

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 */
export function handleApiError(error: unknown): string {
  if (isAxiosError(error)) {
    // API 응답에서 에러 메시지 추출
    const apiError = error.response?.data as ApiError | undefined

    if (apiError?.message) {
      return apiError.message
    }

    // HTTP 상태 코드 기반 메시지
    if (error.response?.status) {
      return getDefaultErrorMessage(error.response.status)
    }

    // 네트워크 에러
    if (error.code === 'ERR_NETWORK') {
      return '네트워크 연결을 확인해주세요.'
    }

    // 타임아웃 에러
    if (error.code === 'ECONNABORTED') {
      return '요청 시간이 초과되었습니다.'
    }
  }

  // 기본 에러 메시지
  if (error instanceof Error) {
    return error.message
  }

  return '네트워크 오류가 발생했습니다.'
}

/**
 * 에러 로깅
 */
export function logError(context: string, error: unknown): void {
  console.error(`[${context}]`, error)

  if (isAxiosError(error)) {
    console.error('Request:', error.config?.url, error.config?.method)
    console.error('Response:', error.response?.status, error.response?.data)
  }
}

/**
 * 에러 처리 헬퍼 (로깅 + 메시지 반환)
 */
export function processError(context: string, error: unknown): string {
  logError(context, error)
  return handleApiError(error)
}
