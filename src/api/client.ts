import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from './types'
import { TokenManager } from '@/utils/tokenManager'
import { logRequest, logResponse, logError } from '@/utils/logger'

// 환경 변수에서 API Base URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.PROD) {
  console.warn('VITE_API_BASE_URL is not defined in production environment')
}

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenManager.getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 개발 환경에서 요청 로깅
    logRequest(config)

    return config
  },
  (error: AxiosError) => {
    logError(error)
    return Promise.reject(error)
  },
)

// 응답 인터셉터: 401 에러 시 토큰 자동 갱신
apiClient.interceptors.response.use(
  (response) => {
    // 개발 환경에서 응답 로깅
    logResponse(response)
    return response
  },
  async (error: AxiosError<ApiError>) => {
    // 개발 환경에서 에러 로깅
    logError(error)

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 로그인, 회원가입, 토큰 갱신 요청은 토큰 갱신을 시도하지 않음
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                           originalRequest.url?.includes('/auth/register') ||
                           originalRequest.url?.includes('/auth/refresh')

    // 401 Unauthorized 에러이고, 재시도하지 않은 경우, 그리고 인증 엔드포인트가 아닌 경우
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      try {
        // TokenManager를 사용한 토큰 갱신 (race condition 방지)
        const newAccessToken = await TokenManager.refreshAccessToken()

        if (!newAccessToken) {
          throw new Error('Failed to refresh token')
        }

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        // 토큰 갱신 실패 → 로그아웃 처리
        TokenManager.clearAll()

        // 수동 로그아웃 중이 아닐 때만 auth:logout 이벤트 발생 (토큰 만료)
        // 수동 로그아웃 중이면 이미 handleLogout()에서 처리하므로 이벤트 불필요
        if (!TokenManager.isLoggingOut()) {
          window.dispatchEvent(new CustomEvent('auth:logout'))
        }

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export default apiClient
