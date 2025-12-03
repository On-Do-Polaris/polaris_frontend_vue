import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, userAPI } from '@/api'
import type { LoginRequest, RegisterRequest } from '@/api/types'
import { toast } from 'vue-sonner'

export const useAuthStore = defineStore('auth', () => {
  // State
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'))
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'))
  const userId = ref<string | null>(localStorage.getItem('userId'))
  const userName = ref<string | null>(localStorage.getItem('userName'))
  const isFirstLogin = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!accessToken.value)
  const currentUser = computed(() => userName.value || '')

  /**
   * 로그인
   */
  async function handleLogin(email: string, password: string) {
    try {
      const credentials: LoginRequest = { email, password }
      const response = await authAPI.login(credentials)

      // 토큰 및 사용자 정보 저장
      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      userId.value = response.userId
      userName.value = response.name

      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)
      localStorage.setItem('userId', response.userId)
      localStorage.setItem('userName', response.name)

      toast.success('로그인 성공')
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '로그인에 실패했습니다'
      toast.error(errorMessage)
      throw error
    }
  }

  /**
   * 회원가입
   */
  async function handleSignup(email: string, name: string, password: string) {
    try {
      const data: RegisterRequest = { email, name, password }
      const response = await authAPI.register(data)

      toast.success('회원가입 성공! 로그인해주세요.')
      return response
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '회원가입에 실패했습니다'
      toast.error(errorMessage)
      throw error
    }
  }

  /**
   * 로그아웃
   */
  async function handleLogout() {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('로그아웃 요청 실패:', error)
    } finally {
      // 로컬 상태 초기화
      accessToken.value = null
      refreshToken.value = null
      userId.value = null
      userName.value = null
      isFirstLogin.value = false

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')

      toast.info('로그아웃되었습니다')
    }
  }

  /**
   * 계정 삭제
   */
  async function handleDeleteAccount() {
    try {
      await userAPI.deleteMe()
      toast.success('계정이 삭제되었습니다')

      // 로그아웃 처리
      await handleLogout()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '계정 삭제에 실패했습니다'
      toast.error(errorMessage)
      throw error
    }
  }

  /**
   * 토큰 갱신
   */
  async function refreshAccessToken() {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available')
      }

      const response = await authAPI.refresh({ refreshToken: refreshToken.value })

      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken

      localStorage.setItem('accessToken', response.accessToken)
      localStorage.setItem('refreshToken', response.refreshToken)

      return response
    } catch (error) {
      console.error('토큰 갱신 실패:', error)
      await handleLogout()
      throw error
    }
  }

  /**
   * 최초 로그인 완료
   */
  function completeFirstLogin() {
    isFirstLogin.value = false
  }

  return {
    // State
    accessToken,
    refreshToken,
    userId,
    userName,
    isFirstLogin,
    // Getters
    isLoggedIn,
    currentUser,
    // Actions
    handleLogin,
    handleSignup,
    handleLogout,
    handleDeleteAccount,
    refreshAccessToken,
    completeFirstLogin
  }
})
