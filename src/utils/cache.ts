/**
 * 메모리 캐시 유틸리티
 * 메타데이터와 같이 자주 변경되지 않는 데이터를 캐싱
 */

interface CacheItem<T> {
  data: T
  expiry: number
}

export class ApiCache {
  private cache = new Map<string, CacheItem<any>>()

  /**
   * 캐시에 데이터 저장
   * @param key 캐시 키
   * @param data 저장할 데이터
   * @param ttl TTL 기본값 5분
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    const expiry = Date.now() + ttl
    this.cache.set(key, { data, expiry })
  }

  /**
   * 캐시에서 데이터 가져오기
   * @param key 캐시 키
   * @returns 캐시된 데이터 또는 null (만료 or 없음)
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // 만료 확인
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  /**
   * 특정 키 삭제
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * 모든 캐시 삭제
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 특정 패턴의 키 삭제
   * @param pattern 정규식 또는 문자열
   */
  clearPattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 만료된 항목 정리
   */
  cleanup(): void {
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * 캐시 크기 (항목 수)
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 특정 키가 캐시에 존재하는지 확인
   */
  has(key: string): boolean {
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    // 만료 확인
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

// 전역 캐시 인스턴스
export const apiCache = new ApiCache()

// 10분마다 주기적으로 만료된 항목 정리
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      apiCache.cleanup()
    },
    10 * 60 * 1000,
  )
}

/**
 * 캐시 키 생성 헬퍼
 */
export function createCacheKey(prefix: string, ...args: any[]): string {
  const suffix = args.length > 0 ? ':' + args.join(':') : ''
  return `${prefix}${suffix}`
}
