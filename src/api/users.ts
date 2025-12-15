import apiClient from './client'
import type { UserResponse, UpdateUserRequest } from './types'

export const userAPI = {
  getMe: async (): Promise<UserResponse> => {
    const response = await apiClient.get<UserResponse>('/api/users/me')
    return response.data
  },

  updateMe: async (data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await apiClient.patch<UserResponse>('/api/users/me', data)
    return response.data
  },

  deleteMe: async (): Promise<void> => {
    await apiClient.delete('/api/users/me')
  }
}