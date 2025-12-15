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
function getDefaultErrorMessage(status?: number, url?: string): string {
  // 로그인 요청인 경우
  if (url?.includes('/api/auth/login')) {
    switch (status) {
      case 401:
        return '이메일 또는 비밀번호가 올바르지 않습니다.'
      case 404:
        return '등록되지 않은 계정입니다.'
      default:
        return '로그인에 실패했습니다.'
    }
  }

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
 * API 에러 출력용 변환
 */
export function handleApiError(error: unknown): string {
  if (isAxiosError(error)) {
    // API 응답에서 에러 메시지 추출
    const apiError = error.response?.data as ApiError | undefined
    const requestUrl = error.config?.url || ''

    // 로그인 에러 처리
    if (requestUrl.includes('/api/auth/login')) {
      const status = error.response?.status

      if (status === 401) {
        // 백엔드는 응답 body의 code로 구분
        const errorCode = (apiError as any)?.code

        // 계정 존재하지 않음
        if (errorCode === 'ACCOUNT_NOT_FOUND') {
          return '존재하지 않는 계정입니다.'
        }

        // 비밀번호 오류 또는 기타 인증 실패
        if (apiError?.message) {
          return apiError.message
        }

        return '이메일 또는 비밀번호가 올바르지 않습니다.'
      }

      return '로그인에 실패했습니다.'
    }

    if (apiError?.message && apiError.message.includes('DataIntegrityViolationException')) {
      return '계정 삭제에 실패했습니다. 서버 설정 문제가 있습니다. 관리자에게 문의해주세요.'
    }

    if (apiError?.message && apiError.message.includes('Referential integrity constraint')) {
      return '계정 삭제에 실패했습니다. 서버 설정 문제가 있습니다. 관리자에게 문의해주세요.'
    }

    if (apiError?.message) {
      return apiError.message
    }

    // HTTP 상태 코드 기반 메시지
    if (error.response?.status) {
      return getDefaultErrorMessage(error.response.status, requestUrl)
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
