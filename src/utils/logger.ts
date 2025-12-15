/**
 * 개발 환경 전용 API 로거
 * 프로덕션 환경에서는 로그를 출력하지 않음
 */

const isDev = import.meta.env.DEV

/**
 * API 요청 로깅
 */
export function logRequest(config: any): void {
  if (!isDev) return

  console.group(`${config.method?.toUpperCase()} ${config.url}`)
  console.log('Headers:', config.headers)
  if (config.data) {
    console.log('Data:', config.data)
  }
  if (config.params) {
    console.log('Params:', config.params)
  }
  console.groupEnd()
}

/**
 * API 응답 로깅
 */
export function logResponse(response: any): void {
  if (!isDev) return

  const status = response.status
  const statusColor = status >= 200 && status < 300 ? 'color: green' : 'color: orange'

  console.group(`%c${status}%c ${response.config.url}`, statusColor, '')
  console.log('Data:', response.data)
  console.log('Headers:', response.headers)
  console.groupEnd()
}

/**
 * API 에러 로깅
 */
export function logError(error: any): void {
  if (!isDev) return

  const url = error.config?.url || 'Unknown URL'
  const method = error.config?.method?.toUpperCase() || 'Unknown Method'
  const status = error.response?.status || 'No Status'

  console.group(`%c${method} ${url}`, 'color: red')
  console.log('Status:', status)
  console.log('Error:', error)

  if (error.response?.data) {
    console.log('Response Data:', error.response.data)
  }

  if (error.config) {
    console.log('Request Config:', error.config)
  }

  console.groupEnd()
}

/**
 * 일반 로그 (개발 환경만)
 */
export const logger = {
  info: (...args: any[]) => {
    if (isDev) console.log(...args)
  },

  warn: (...args: any[]) => {
    if (isDev) console.warn(...args)
  },

  error: (...args: any[]) => {
    if (isDev) console.error(...args)
  },

  debug: (...args: any[]) => {
    if (isDev) console.debug(...args)
  },

  success: (...args: any[]) => {
    if (isDev) console.log(...args)
  },

  group: (label: string, fn: () => void) => {
    if (!isDev) return

    console.group(label)
    fn()
    console.groupEnd()
  },

  table: (data: any) => {
    if (isDev) console.table(data)
  },

  time: (label: string) => {
    if (isDev) console.time(label)
  },

  timeEnd: (label: string) => {
    if (isDev) console.timeEnd(label)
  },
}

/**
 * 성능 측정 데코레이터
 */
export function measurePerformance<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  label?: string,
): T {
  if (!isDev) return fn

  return (async (...args: any[]) => {
    const fnLabel = label || fn.name || 'Anonymous Function'
    logger.time(fnLabel)

    try {
      const result = await fn(...args)
      logger.timeEnd(fnLabel)
      return result
    } catch (error) {
      logger.timeEnd(fnLabel)
      throw error
    }
  }) as T
}
