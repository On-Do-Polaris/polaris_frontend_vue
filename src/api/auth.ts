import apiClient from './client'
import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest
} from './types'

export const authAPI = {
  /**
   * 회원가입
   */
  register: async (data: RegisterRequest): Promise<{ userId: string }> => {
    const response = await apiClient.post('/api/auth/register', data)
    return response.data
  },

  /**
   * 로그인
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', data)
    return response.data
  },

  /**
   * 로그아웃
   */
  logout: async (): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/logout')
    return response.data
  },

  /**
   * 토큰 갱신
   */
  refresh: async (data: RefreshTokenRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/refresh', data)
    return response.data
  }
}
