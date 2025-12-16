<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Lock, User, Loader2 } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import skLogo from '@/assets/sk-logo.png'
import { useAuthStore } from '@/store/auth'
import { TokenManager } from '@/utils/tokenManager'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

// 로그아웃 메시지 표시 및 플래그 제거
onMounted(() => {
  // 로그아웃 플래그 제거 (로그인 페이지에서는 에러 토스트가 정상적으로 표시되어야 함)
  TokenManager.clearLoggingOutFlag()

  const logoutMessage = sessionStorage.getItem('logoutMessage')
  if (logoutMessage) {
    toast.info(logoutMessage)
    sessionStorage.removeItem('logoutMessage')
  }
})

const handleSubmit = async () => {
  if (loading.value) return

  if (!email.value || !password.value) {
    toast.error('이메일과 비밀번호를 입력해주세요.')
    return
  }

  loading.value = true

  try {
    await authStore.handleLogin(email.value, password.value)

    toast.success('로그인 성공')

    // 대시보드로 이동
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error: any) {
    console.error('로그인 실패:', error)
    // handleLogin 내부에서 이미 toast.error를 호출하므로 여기서는 생략
    password.value = ''
  } finally {
    loading.value = false
  }
}

const goToSignup = () => {
  router.push('/signup')
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-white border-t-4 border-t-[#EA002C] p-8 shadow-sm">
        <div class="mb-8 text-center">
          <div class="mb-4">
            <img :src="skLogo" alt="SK Logo" class="h-16 w-auto inline-block" />
          </div>
          <h3 class="text-gray-700">사업장 기후 물리적 리스크 AI 평가 시스템</h3>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm text-gray-700 mb-2"> 이메일 </label>
            <div class="relative">
              <User
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                :size="20"
              />
              <input
                type="email"
                v-model="email"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-[#EA002C]"
                placeholder="email@skax.co.kr"
                :disabled="loading"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-700 mb-2"> 비밀번호 </label>
            <div class="relative">
              <Lock
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                :size="20"
              />
              <input
                type="password"
                v-model="password"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-[#EA002C]"
                placeholder="비밀번호를 입력하세요"
                :disabled="loading"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-[#EA002C] text-white py-3 hover:bg-[#C4002A] transition-colors text-center flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" class="animate-spin mr-2" :size="20" />
            {{ loading ? '로그인 중...' : '로그인' }}
          </button>
        </form>

        <div class="mt-6 flex justify-between text-sm text-gray-600">
          <button @click="goToForgotPassword" class="hover:text-[#EA002C]">비밀번호 찾기</button>
          <button @click="goToSignup" class="hover:text-[#EA002C]">회원가입</button>
        </div>
      </div>

      <p class="mt-6 text-center text-sm text-gray-600">© 2025 SKALA. All rights reserved.</p>
    </div>
  </div>
</template>
