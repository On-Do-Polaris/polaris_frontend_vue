import { toast as sonnerToast } from 'vue-sonner'
import { TokenManager } from '@/utils/tokenManager'

/**
 * 로그아웃 중에는 에러 토스트를 표시하지 않는 래퍼
 */
export function useToast() {
  return {
    success: (message: string) => {
      sonnerToast.success(message)
    },
    error: (message: string) => {
      // 로그아웃 중이 아닐 때만 에러 토스트 표시
      if (!TokenManager.isLoggingOut()) {
        sonnerToast.error(message)
      }
    },
    info: (message: string) => {
      sonnerToast.info(message)
    },
    warning: (message: string) => {
      sonnerToast.warning(message)
    },
  }
}
