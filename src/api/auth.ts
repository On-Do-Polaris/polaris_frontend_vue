import apiClient from './client'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterEmailRequest,
  VerifyCodeRequest,
  RefreshTokenRequest,
  PasswordResetEmailRequest,
  PasswordResetVerifyCodeRequest,
  PasswordResetCompleteRequest
} from './types'

export const authAPI = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<{ result: string; message: string; data: LoginResponse }>('/auth/login', data)
    return response.data.data
  },

  register: async (data: RegisterRequest): Promise<{ result: string; message: string }> => {
    const response = await apiClient.post<{ result: string; message: string }>('/auth/register', data)
    return response.data
  },

  registerEmail: async (data: RegisterEmailRequest): Promise<{ result: string; message: string }> => {
    const response = await apiClient.post<{ result: string; message: string }>('/auth/register-email', data)
    return response.data
  },

  verifyCode: async (data: VerifyCodeRequest): Promise<{ result: string; message: string }> => {
    const response = await apiClient.post<{ result: string; message: string }>('/auth/register-verificationCode', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  refresh: async (data: RefreshTokenRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', data)
    return response.data
  },

  sendPasswordResetEmail: async (data: PasswordResetEmailRequest): Promise<{ result: string; message: string }> => {
    const response = await apiClient.post<{ result: string; message: string }>('/auth/password/reset-email', data)
    return response.data
  },

  verifyPasswordResetCode: async (data: PasswordResetVerifyCodeRequest): Promise<{ result: string; message: string }> => {
    const response = await apiClient.post<{ result: string; message: string }>('/auth/password/reset-verify', data)
    return response.data
  },

  completePasswordReset: async (data: PasswordResetCompleteRequest): Promise<{ result: string; message: string }> => {
    const response = await apiClient.post<{ result: string; message: string }>('/auth/password/reset-complete', data)
    return response.data
  }
}