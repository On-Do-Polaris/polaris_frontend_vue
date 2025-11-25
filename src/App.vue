<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { Toaster } from 'vue-sonner'
import Header from '@/components/common/Header.vue'
import OnboardingModal from '@/components/common/OnboardingModal.vue'
import { useAuthStore } from './store/auth'
import { useUiStore } from './store/ui'

const authStore = useAuthStore()
const uiStore = useUiStore()
const router = useRouter()

const shouldShowOnboarding = computed(() => authStore.isFirstLogin && uiStore.showOnboarding)

const handleOnboardingComplete = () => {
  uiStore.setShowOnboarding(false)
  authStore.completeFirstLogin()
}

const handleOnboardingClose = () => {
  uiStore.setShowOnboarding(false)
  authStore.handleLogout()
  router.push('/login')
}
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
    <Header />
    <div class="flex-1 overflow-y-auto">
      <RouterView />
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
</style>
