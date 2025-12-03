import apiClient from './client'
import type { UserResponse, UpdateUserRequest, ChangePasswordRequest } from './types'

export const userAPI = {
  /**
   * 내 정보 조회
   */
  getMe: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/api/users/me')
    return response.data
  },

  /**
   * 내 정보 수정
   */
  updateMe: async (data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>('/api/users/me', data)
    return response.data
  },

  /**
   * 사용자 삭제 (비활성화)
   */
  deleteMe: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete('/api/users/me')
    return response.data
  },

  /**
   * 비밀번호 변경
   */
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.patch('/api/users/me/password', data)
    return response.data
  }
}
