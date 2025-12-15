import axios from 'axios'

/**
 * JWT 토큰 관리 클래스
 * - 토큰 만료 검증
 * - 토큰 갱신 중복 방지
 * - localStorage 중앙 관리
 */
export class TokenManager {
  private static refreshPromise: Promise<string> | null = null
  private static readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_ID: 'userId',
    USER_NAME: 'userName',
  } as const

  /**
   * localStorage 접근 가능 여부 확인
   */
  private static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  /**
   * 안전한 localStorage.getItem
   */
  private static safeGetItem(key: string): string | null {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('[TokenManager] localStorage is not available')
        return null
      }
      return localStorage.getItem(key)
    } catch (error) {
      console.error('[TokenManager] Error reading from localStorage:', error)
      return null
    }
  }

  /**
   * 안전한 localStorage.setItem
   */
  private static safeSetItem(key: string, value: string): void {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('[TokenManager] localStorage is not available')
        return
      }
      localStorage.setItem(key, value)
    } catch (error) {
      console.error('[TokenManager] Error writing to localStorage:', error)
    }
  }

  /**
   * 안전한 localStorage.removeItem
   */
  private static safeRemoveItem(key: string): void {
    try {
      if (!this.isStorageAvailable()) {
        console.warn('[TokenManager] localStorage is not available')
        return
      }
      localStorage.removeItem(key)
    } catch (error) {
      console.error('[TokenManager] Error removing from localStorage:', error)
    }
  }

  /**
   * Access Token 가져오기 (만료 확인)
   */
  static getAccessToken(): string | null {
    const token = this.safeGetItem(this.STORAGE_KEYS.ACCESS_TOKEN)

    if (!token) return null

    // 토큰 만료 확인
    if (this.isTokenExpired(token)) {
      return null
    }

    return token
  }

  /**
   * Refresh Token 가져오기
   */
  static getRefreshToken(): string | null {
    return this.safeGetItem(this.STORAGE_KEYS.REFRESH_TOKEN)
  }

  /**
   * 토큰 저장
   */
  static setTokens(accessToken: string, refreshToken: string): void {
    this.safeSetItem(this.STORAGE_KEYS.ACCESS_TOKEN, accessToken)
    this.safeSetItem(this.STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
  }

  /**
   * 사용자 정보 저장
   */
  static setUserInfo(userId: string, userName: string): void {
    this.safeSetItem(this.STORAGE_KEYS.USER_ID, userId)
    this.safeSetItem(this.STORAGE_KEYS.USER_NAME, userName)
  }

  /**
   * 사용자 정보 가져오기
   */
  static getUserInfo(): { userId: string | null; userName: string | null } {
    return {
      userId: this.safeGetItem(this.STORAGE_KEYS.USER_ID),
      userName: this.safeGetItem(this.STORAGE_KEYS.USER_NAME),
    }
  }

  /**
   * 모든 토큰 및 사용자 정보 삭제
   */
  static clearAll(): void {
    this.safeRemoveItem(this.STORAGE_KEYS.ACCESS_TOKEN)
    this.safeRemoveItem(this.STORAGE_KEYS.REFRESH_TOKEN)
    this.safeRemoveItem(this.STORAGE_KEYS.USER_ID)
    this.safeRemoveItem(this.STORAGE_KEYS.USER_NAME)
  }

  /**
   * 토큰 갱신 (동시 요청 시 하나의 갱신만 수행)
   */
  static async refreshAccessToken(): Promise<string | null> {
    // 이미 진행 중인 갱신이 있으면 해당 Promise 반환
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    // 새로운 갱신 요청 시작
    this.refreshPromise = this.performRefresh()

    try {
      const token = await this.refreshPromise
      return token
    } finally {
      // 갱신 완료 후 Promise 초기화
      this.refreshPromise = null
    }
  }

  /**
   * 실제 토큰 갱신 수행
   */
  private static async performRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken,
      })

      const { accessToken, refreshToken: newRefreshToken } = response.data

      // 새 토큰 저장
      this.setTokens(accessToken, newRefreshToken)

      return accessToken
    } catch (error) {
      // 갱신 실패 시 모든 정보 삭제
      this.clearAll()
      throw error
    }
  }

  /**
   * JWT 토큰 만료 확인
   */
  private static isTokenExpired(token: string): boolean {
    try {
      // JWT는 header.payload.signature 형태
      const parts = token.split('.')
      if (parts.length !== 3 || !parts[1]) return true

      const payload = JSON.parse(atob(parts[1]))

      // exp는 초 단위, Date.now()는 밀리초 단위
      const expirationTime = payload.exp * 1000
      const currentTime = Date.now()

      // 만료 5분 전을 만료로 간주
      const bufferTime = 5 * 60 * 1000 // 5분

      return currentTime >= expirationTime - bufferTime
    } catch {
      // 파싱 실패 시 만료된 것으로 간주
      return true
    }
  }

  /**
   * 토큰 디코딩 (페이로드 추출)
   */
  static decodeToken(token: string): any {
    try {
      const parts = token.split('.')
      if (parts.length !== 3 || !parts[1]) return null

      return JSON.parse(atob(parts[1]))
    } catch {
      return null
    }
  }

  /**
   * 토큰 유효성 검증
   */
  static isValidToken(token: string): boolean {
    if (!token) return false

    try {
      // 토큰 형식 검증 (JWT는 3개 부분으로 구성)
      const parts = token.split('.')
      if (parts.length !== 3 || !parts[1]) return false

      // 페이로드 파싱 시도
      JSON.parse(atob(parts[1]))

      return true
    } catch {
      return false
    }
  }
}
