<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Mail, User, Globe, Loader2 } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { userAPI } from '@/api/users'
import type { UserResponse } from '@/api/types'
import { TokenManager } from '@/utils/tokenManager'

const toast = useToast()

const isDeleteModalOpen = ref(false)
const loading = ref(false)
const userInfo = ref<UserResponse | null>(null)
const selectedLanguage = ref<'ko' | 'en'>('ko')

// 사용자 정보 로드
const loadUserInfo = async () => {
  loading.value = true
  try {
    const data = await userAPI.getMe()
    userInfo.value = data
    selectedLanguage.value = data.language
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error)
    toast.error('사용자 정보를 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 언어 설정 저장
const handleLanguageSave = async () => {
  try {
    const updatedUser = await userAPI.updateMe({ language: selectedLanguage.value })
    userInfo.value = updatedUser
    toast.success('언어 설정이 저장되었습니다.')
  } catch (error) {
    console.error('언어 설정 저장 실패:', error)
    toast.error('언어 설정 저장에 실패했습니다.')
  }
}

// 계정 삭제
const handleDeleteAccount = async () => {
  isDeleteModalOpen.value = false
  loading.value = true

  try {
    // DELETE /api/users/me 요청
    await userAPI.deleteMe()

    // localStorage 정리 (TokenManager 사용)
    TokenManager.clearAll()

    // 삭제 메시지를 sessionStorage에 저장
    TokenManager.safeSessionStorageSet('logoutMessage', '계정이 삭제되었습니다')

    // 즉시 로그인 페이지로 완전히 새로고침하며 이동
    window.location.href = '/login'
  } catch (error) {
    console.error('계정 삭제 실패:', error)
    toast.error('계정 삭제에 실패했습니다.')
    loading.value = false
  }
}

// 컴포넌트 마운트 시 사용자 정보 로드
onMounted(() => {
  loadUserInfo()
})
</script>

<template>
  <div class="bg-[#F9FAFB]">
    <div class="px-8 py-6">
      <!-- 페이지 헤더 -->
      <div class="mb-6 max-w-4xl mx-auto">
        <h2 class="text-[#000000]">내 정보</h2>
        <p class="text-sm text-[#8A8D8F] mt-1">계정 정보를 확인하고 설정을 관리할 수 있습니다.</p>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading && !userInfo" class="max-w-4xl mx-auto flex justify-center py-12">
        <Loader2 class="animate-spin text-[#EA002C]" :size="32" />
      </div>

      <div v-else-if="userInfo" class="max-w-4xl mx-auto space-y-6">
        <!-- 기본 정보 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <div class="flex items-center justify-between">
              <h3 class="text-sm text-[#000000]">기본 정보</h3>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-2 gap-6">
              <!-- 이메일 -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <Mail :size="16" class="text-[#A7A9AB]" />
                  <label class="text-xs text-[#8A8D8F]"> 이메일 </label>
                </div>
                <div class="text-sm text-[#000000]">
                  {{ userInfo.email }}
                </div>
              </div>

              <!-- 이름 -->
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <User :size="16" class="text-[#A7A9AB]" />
                  <label class="text-xs text-[#8A8D8F]"> 담당자 이름 </label>
                </div>
                <div class="text-sm text-[#000000]">
                  {{ userInfo.name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 언어 설정 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <div class="flex items-center gap-2">
              <Globe :size="16" class="text-[#A7A9AB]" />
              <h3 class="text-sm text-[#000000]">보고서 언어 설정</h3>
            </div>
          </div>
          <div class="p-6">
            <div>
              <label class="text-xs text-[#8A8D8F] block mb-2"> 언어 </label>
              <div class="flex items-center gap-4">
                <select
                  v-model="selectedLanguage"
                  class="flex-1 px-3 py-2 border border-[#D1D5DB] text-sm focus:outline-none focus:ring-1 focus:ring-[#EA002C]"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
                <button
                  @click="handleLanguageSave"
                  class="px-6 py-2 bg-[#EA002C] text-[#FFFFFF] text-sm hover:bg-[#d00028] transition-colors whitespace-nowrap"
                >
                  설정 저장
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 계정 삭제 -->
        <div class="bg-[#FFFFFF] border border-[#D1D5DB] shadow-sm">
          <div class="border-b border-[#D1D5DB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">계정 삭제</h3>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-[1fr_auto] items-center gap-6">
              <div>
                <p class="text-sm text-[#000000]">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                </p>
              </div>
              <button
                @click="isDeleteModalOpen = true"
                :disabled="loading"
                class="px-5 py-2 border-2 border-[#EA002C] text-[#EA002C] text-sm hover:bg-[#EA002C] hover:text-[#FFFFFF] transition-colors whitespace-nowrap disabled:opacity-50"
              >
                계정 삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog :open="isDeleteModalOpen" @update:open="isDeleteModalOpen = $event">
        <DialogContent class="sm:max-w-[425px]" :dark="true">
          <DialogHeader>
            <DialogTitle>계정 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 계정을 삭제하시겠습니까?<br></br> 이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로
              삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              @click="isDeleteModalOpen = false"
              :disabled="loading"
              class="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              @click="handleDeleteAccount"
              :disabled="loading"
              class="px-4 py-2 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Loader2 v-if="loading" class="animate-spin" :size="16" />
              삭제
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>
