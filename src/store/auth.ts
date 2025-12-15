import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI, userAPI } from '@/api'
import type { LoginRequest, RegisterRequest } from '@/api/types'
import { toast } from 'vue-sonner'
import { handleApiError } from '@/utils/errorHandler'
import { TokenManager } from '@/utils/tokenManager'

export const useAuthStore = defineStore('auth', () => {
  // State (TokenManager에서 초기화) - 안전한 초기화
  let userInfo: { userId: string | null; userName: string | null } = {
    userId: null,
    userName: null,
  }
  let initialAccessToken: string | null = null
  let initialRefreshToken: string | null = null

  try {
    userInfo = TokenManager.getUserInfo()
    initialAccessToken = TokenManager.getAccessToken()
    initialRefreshToken = TokenManager.getRefreshToken()
  } catch (error) {
    console.error('[AuthStore] Initialization error:', error)
  }

  const accessToken = ref<string | null>(initialAccessToken)
  const refreshToken = ref<string | null>(initialRefreshToken)
  const userId = ref<string | null>(userInfo.userId)
  const userName = ref<string | null>(userInfo.userName)
  const isFirstLogin = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!accessToken.value)
  const currentUser = computed(() => userName.value || '')

  /**
   * 로그인
   */
  async function handleLogin(email: string, password: string) {
    // 입력값 검증
    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요.')
      throw new Error('이메일과 비밀번호를 입력해주세요.')
    }

    try {
      const credentials: LoginRequest = { email, password }
      const response = await authAPI.login(credentials)

      // 1. 토큰 저장
      TokenManager.setTokens(response.accessToken, response.refreshToken)

      // 2. 사용자 정보 조회 (로그인 응답에 이름이 없으므로 별도 조회)
      // 임시로 userId만 저장해두고 getMe 호출 시 업데이트
      TokenManager.setUserInfo(response.userId, '')

      const user = await userAPI.getMe()

      // 3. 사용자 정보 업데이트
      TokenManager.setUserInfo(response.userId, user.name)

      accessToken.value = response.accessToken
      refreshToken.value = response.refreshToken
      userId.value = response.userId
      userName.value = user.name

      return response
    } catch (error) {
      const errorMessage = handleApiError(error)
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

      return response
    } catch (error) {
      const errorMessage = handleApiError(error)
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
      TokenManager.clearAll()

      accessToken.value = null
      refreshToken.value = null
      userId.value = null
      userName.value = null
      isFirstLogin.value = false

      toast.info('로그아웃되었습니다')
    }
  }

  /**
   * 계정 삭제
   */
  async function handleDeleteAccount() {
    try {
      // 1. 백엔드에 계정 삭제 요청
      await userAPI.deleteMe()

      // 2. 삭제 성공 - 로컬 토큰 및 상태 정리 (백엔드 API 호출 없이)
      TokenManager.clearAll()

      accessToken.value = null
      refreshToken.value = null
      userId.value = null
      userName.value = null
      isFirstLogin.value = false

      toast.success('계정이 삭제되었습니다')

      // 3. View에서 router.push('/login')으로 로그인 페이지로 이동
    } catch (error) {
      const errorMessage = handleApiError(error)
      toast.error(errorMessage)
      throw error
    }
  }

  /**
   * 토큰 갱신 (TokenManager 사용)
   */
  async function refreshAccessToken() {
    try {
      const newToken = await TokenManager.refreshAccessToken()

      if (newToken) {
        accessToken.value = newToken
        refreshToken.value = TokenManager.getRefreshToken()
      }

      return { accessToken: newToken, refreshToken: refreshToken.value }
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
    completeFirstLogin,
  }
})
