<script setup lang="ts">
import { ref } from 'vue'
import { Lock, Building, Mail, Loader2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import skLogo from '@/assets/sk-logo.png'
import { authAPI } from '@/api/auth'

const router = useRouter()

const email = ref('')
const name = ref('')
const password = ref('')
const passwordConfirm = ref('')
const verificationCode = ref('')
const isCodeSent = ref(false)
const isVerified = ref(false)
const loading = ref(false)

const handleSubmit = async () => {
  // 이메일 인증 체크
  if (!isVerified.value) {
    toast.error('이메일 인증을 완료해주세요.')
    return
  }

  // 이름 체크
  if (!name.value.trim()) {
    toast.error('담당자 이름을 입력해주세요.')
    return
  }

  // 비밀번호 확인
  if (password.value !== passwordConfirm.value) {
    toast.error('비밀번호가 일치하지 않습니다.')
    return
  }

  // 비밀번호 길이 체크
  if (password.value.length < 8) {
    toast.error('비밀번호는 최소 8자 이상이어야 합니다.')
    return
  }

  if (loading.value) return

  loading.value = true

  try {
    await authAPI.register({
      email: email.value,
      name: name.value,
      password: password.value
    })

    // 회원가입 성공 시 로그인 페이지로 이동
    toast.success('회원가입이 완료되었습니다. 로그인해주세요.')
    router.push('/login')
  } catch (error: any) {
    console.error('회원가입 실패:', error)
    const errorMessage = error?.response?.data?.message || '회원가입에 실패했습니다.'
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const handleSendCode = async () => {
  if (!email.value) {
    toast.error('이메일을 입력해주세요.')
    return
  }

  if (loading.value) return

  loading.value = true

  try {
    await authAPI.registerEmail({ email: email.value })
    isCodeSent.value = true
    toast.success('인증번호가 이메일로 전송되었습니다.')
  } catch (error: any) {
    console.error('인증번호 발송 실패:', error)
    const errorMessage = error?.response?.data?.message || '인증번호 발송에 실패했습니다.'
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const handleVerifyCode = async () => {
  if (!verificationCode.value) {
    toast.error('인증번호를 입력해주세요.')
    return
  }

  if (verificationCode.value.length !== 6) {
    toast.error('인증번호는 6자리입니다.')
    return
  }

  if (loading.value) return

  loading.value = true

  try {
    await authAPI.verifyCode({
      email: email.value,
      verificationCode: verificationCode.value
    })
    isVerified.value = true
    toast.success('이메일 인증이 완료되었습니다.')
  } catch (error: any) {
    console.error('인증번호 확인 실패:', error)
    const errorMessage = error?.response?.data?.message || '인증번호가 올바르지 않습니다.'
    toast.error(errorMessage)
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

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm text-gray-700 mb-2"> 이메일 </label>
            <div class="relative flex gap-2">
              <div class="flex-1 relative">
                <Mail
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  :size="20"
                />
                <input
                  type="email"
                  v-model="email"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-[#EA002C]"
                  placeholder="email@skax.co.kr"
                  required
                  :disabled="isVerified || loading"
                />
              </div>
              <button
                type="button"
                @click="handleSendCode"
                :disabled="isVerified || loading"
                class="w-[120px] py-3 bg-gray-600 text-white hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed whitespace-nowrap text-sm text-center"
              >
                {{ isVerified ? '인증완료' : '인증번호 받기' }}
              </button>
            </div>
          </div>

          <div v-if="isCodeSent && !isVerified">
            <label class="block text-sm text-gray-700 mb-2"> 인증번호 </label>
            <div class="relative flex gap-2">
              <div class="flex-1 relative">
                <Lock
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  :size="20"
                />
                <input
                  type="text"
                  v-model="verificationCode"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-[#EA002C]"
                  placeholder="인증번호 6자리"
                  maxlength="6"
                  :disabled="loading"
                />
              </div>
              <button
                type="button"
                @click="handleVerifyCode"
                :disabled="loading"
                class="w-[120px] py-3 bg-[#F47725] text-white hover:bg-[#E06515] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm text-center"
              >
                확인
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-700 mb-2"> 담당자 이름 </label>
            <div class="relative">
              <Building
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                :size="20"
              />
              <input
                type="text"
                v-model="name"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-[#EA002C]"
                placeholder="담당자 이름을 입력하세요"
                required
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
                placeholder="비밀번호를 입력하세요 (최소 8자)"
                required
                :disabled="loading"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm text-gray-700 mb-2"> 비밀번호 확인 </label>
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
                required
                :disabled="loading"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-[#EA002C] text-white py-3 hover:bg-[#C4002A] transition-colors text-center mt-6 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="loading" class="animate-spin mr-2" :size="20" />
            {{ loading ? '회원가입 중...' : '회원가입' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm text-gray-600">
          <span>이미 계정이 있으신가요? </span>
          <button @click="goToLogin" class="text-[#EA002C] hover:underline">로그인</button>
        </div>
      </div>

      <p class="mt-6 text-center text-sm text-gray-600">© 2025 SKALA. All rights reserved.</p>
    </div>
  </div>
</template>
