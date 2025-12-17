<script setup lang="ts">
import { ref, computed } from 'vue'
import { Mail, Lock } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { authAPI } from '@/api/auth'
import skLogo from '@/assets/sk-logo.png'

const router = useRouter()

// 단계: 1(이메일), 2(인증번호), 3(비밀번호 변경)
const step = ref(1)

const email = ref('')
const verificationCode = ref('')
const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)

// 이메일 입력 완료 여부
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.value)
})

// 인증번호 받기
const handleSendVerificationCode = async () => {
  if (!isEmailValid.value) {
    toast.error('올바른 이메일 주소를 입력해주세요.')
    return
  }

  loading.value = true
  try {
    const response = await authAPI.sendPasswordResetEmail({ email: email.value })
    step.value = 2
    toast.success(response.message || '인증번호가 이메일로 전송되었습니다.')
  } catch (error: any) {
    toast.error(error.response?.data?.message || '인증번호 발송에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 인증번호 확인
const handleVerifyCode = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    toast.error('6자리 인증번호를 입력해주세요.')
    return
  }

  loading.value = true
  try {
    const response = await authAPI.verifyPasswordResetCode({
      email: email.value,
      code: verificationCode.value,
    })
    step.value = 3
    toast.success(response.message || '이메일 인증이 완료되었습니다.')
  } catch (error: any) {
    toast.error(error.response?.data?.message || '인증번호가 일치하지 않습니다.')
  } finally {
    loading.value = false
  }
}

// 비밀번호 변경
const handleChangePassword = async () => {
  if (!password.value || password.value.length < 8) {
    toast.error('비밀번호는 8자 이상이어야 합니다.')
    return
  }

  if (password.value !== passwordConfirm.value) {
    toast.error('비밀번호가 일치하지 않습니다.')
    return
  }

  loading.value = true
  try {
    const response = await authAPI.completePasswordReset({
      email: email.value,
      newPassword: password.value,
    })
    toast.success(response.message || '비밀번호가 변경되었습니다.')

    // 로그인 페이지로 이동
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  } catch (error: any) {
    toast.error(error.response?.data?.message || '비밀번호 변경에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <div class="bg-white border-t-4 border-t-[#EA002C] p-8 shadow-sm">
        <div class="mb-8 text-center">
          <div class="mb-4">
            <img :src="skLogo" alt="SK Logo" class="h-16 w-auto inline-block" />
          </div>
          <h3 class="text-gray-700">사업장 기후 물리적 리스크 AI 평가 시스템</h3>
        </div>

        <form @submit.prevent class="space-y-5">
          <!-- 이메일 입력 -->
          <div>
            <label class="block text-sm text-gray-700 mb-2">이메일</label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <Mail
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  :size="20"
                />
                <input
                  type="email"
                  v-model="email"
                  :disabled="step > 1"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-[#EA002C] disabled:bg-gray-50 disabled:text-gray-600"
                  placeholder="user@sk.ax"
                  required
                />
              </div>
              <button
                v-if="step === 1"
                type="button"
                @click="handleSendVerificationCode"
                :disabled="!isEmailValid || loading"
                class="w-[140px] py-3 bg-gray-600 text-white hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {{ loading ? '전송중...' : '인증번호 받기' }}
              </button>
              <button
                v-else
                type="button"
                disabled
                class="w-[140px] py-3 bg-gray-400 text-white cursor-not-allowed whitespace-nowrap"
              >
                인증번호 받기
              </button>
            </div>
          </div>

          <!-- 인증번호 입력 (Step 2에서만 표시) -->
          <div v-if="step === 2">
            <label class="block text-sm text-gray-700 mb-2">인증번호</label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <Lock
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  :size="20"
                />
                <input
                  type="text"
                  v-model="verificationCode"
                  maxlength="6"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-[#EA002C]"
                  placeholder="인증번호 6자리"
                  required
                />
              </div>
              <button
                type="button"
                @click="handleVerifyCode"
                :disabled="!verificationCode || verificationCode.length !== 6 || loading"
                class="w-[140px] py-3 bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:bg-orange-300 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {{ loading ? '확인중...' : '확인' }}
              </button>
            </div>
          </div>

          <!-- 비밀번호 입력 (Step 3에서만 표시) -->
          <div v-if="step === 3">
            <label class="block text-sm text-gray-700 mb-2">비밀번호</label>
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
              />
            </div>
          </div>

          <!-- 비밀번호 확인 (Step 3에서만 표시) -->
          <div v-if="step === 3">
            <label class="block text-sm text-gray-700 mb-2">비밀번호 확인</label>
            <div class="relative">
              <Lock
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                :size="20"
              />
              <input
                type="password"
                v-model="passwordConfirm"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-[#EA002C]"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>
          </div>

          <!-- 제출 버튼 -->
          <button
            v-if="step < 3"
            type="button"
            disabled
            class="w-full bg-gray-300 text-gray-500 py-3 cursor-not-allowed text-center mt-6"
          >
            비밀번호 변경
          </button>
          <button
            v-else
            type="button"
            @click="handleChangePassword"
            :disabled="!password || !passwordConfirm || password !== passwordConfirm || loading"
            class="w-full bg-[#EA002C] text-white py-3 hover:bg-[#C4002A] transition-colors text-center mt-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {{ loading ? '변경중...' : '비밀번호 변경' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          <button @click="goToLogin" class="text-[#EA002C] hover:underline">
            로그인으로 돌아가기
          </button>
        </div>
      </div>

      <p class="mt-6 text-center text-sm text-gray-600">© 2025 SKALA. All rights reserved.</p>
    </div>
  </div>
</template>
