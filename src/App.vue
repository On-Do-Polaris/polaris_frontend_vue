<script setup lang="ts">
import { computed, onErrorCaptured, onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter, useRoute } from 'vue-router'
import { Toaster, toast } from 'vue-sonner'
import Header from '@/components/common/Header.vue'
import OnboardingModal from '@/components/common/OnboardingModal.vue'
import { useAuthStore } from './store/auth'
import { useUiStore } from './store/ui'

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()
const route = useRoute()

const shouldShowOnboarding = computed(() => {
  try {
    return authStore.isFirstLogin && uiStore.showOnboarding
  } catch (error) {
    console.error('[App] Error in shouldShowOnboarding:', error)
    return false
  }
})

const shouldShowHeader = computed(() => {
  return authStore.isLoggedIn && !route.meta.hideHeader
})

// 전역 에러 확인
onErrorCaptured((error) => {
  console.error('[App] Component error captured:', error)
  return false
})

const handleOnboardingComplete = () => {
  uiStore.setShowOnboarding(false)
  authStore.completeFirstLogin()
}

const handleOnboardingClose = () => {
  uiStore.setShowOnboarding(false)
  authStore.handleLogout()
  router.push('/login')
}

// 자동 로그아웃 이벤트 리스너 (토큰 갱신 실패 시)
const handleAuthLogout = () => {
  console.log('[App] Auto logout triggered - Invalid or expired token')

  // 토스트 메시지 표시
  toast.error('로그인 시간 만료로 다시 로그인해주세요')

  // 히스토리를 완전히 초기화하고 로그인 페이지로 리다이렉트
  // window.location.replace()를 사용하면 현재 페이지를 교체하여 뒤로 가기가 불가능
  setTimeout(() => {
    window.location.replace('/login')
  }, 1500) // 토스트 메시지를 볼 시간을 주기 위해 지연
}

onMounted(() => {
  window.addEventListener('auth:logout', handleAuthLogout)
})

onUnmounted(() => {
  window.removeEventListener('auth:logout', handleAuthLogout)
})
</script>

<template>
  <Toaster
    position="top-right"
    :offset="16"
    :toastOptions="{
      duration: 3000,
      style: {
        minWidth: '300px',
        maxWidth: '400px',
      },
    }"
  />
  <div v-if="authStore.isLoggedIn" class="h-screen flex flex-col bg-gray-50">
    <Header v-if="shouldShowHeader" />
    <div class="flex-1 overflow-y-auto">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </div>
  </div>
  <div v-else>
    <RouterView />
  </div>
  <OnboardingModal
    :is-open="shouldShowOnboarding"
    @complete="handleOnboardingComplete"
    @close="handleOnboardingClose"
  />
</template>

<style>
/* Toast 메시지 스타일 수정 */
[data-sonner-toaster] {
  position: fixed !important;
  z-index: 99999 !important;
  pointer-events: none;
}

[data-sonner-toaster][data-x-position='right'] {
  right: max(var(--offset, 0px), env(safe-area-inset-right)) !important;
}

[data-sonner-toaster][data-y-position='top'] {
  top: max(var(--offset, 0px), env(safe-area-inset-top)) !important;
}

[data-sonner-toast] {
  pointer-events: auto;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  border-radius: 8px !important;
  padding: 16px !important;
  margin: 8px !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}

[data-sonner-toast] [data-icon] {
  flex-shrink: 0 !important;
}

[data-sonner-toast] [data-content] {
  flex: 1 !important;
  display: flex !important;
  align-items: center !important;
}

[data-sonner-toast] [data-title] {
  margin: 0 !important;
}

[data-sonner-toast][data-type='success'] {
  border-left: 4px solid #ea002c !important;
}

[data-sonner-toast][data-type='error'] {
  border-left: 4px solid #ea002c !important;
}

[data-sonner-toast][data-type='info'] {
  border-left: 4px solid #f47725 !important;
}

/* Page transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
