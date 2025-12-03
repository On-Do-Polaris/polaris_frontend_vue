<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Mail, User, Globe, Lock, Loader2 } from 'lucide-vue-next'
import { useAuthStore } from '@/store/auth'
import { userAPI } from '@/api'
import { toast } from 'vue-sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const authStore = useAuthStore()

const isDeleteModalOpen = ref(false)
const loading = ref(false)
const userInfo = ref<{ id: string; email: string; name: string } | null>(null)

// 사용자 정보 수정 모드
const isEditMode = ref(false)
const editName = ref('')

// 사용자 정보 로드
const loadUserInfo = async () => {
  loading.value = true
  try {
    const data = await userAPI.getMe()
    userInfo.value = data
    editName.value = data.name
  } catch (error) {
    console.error('사용자 정보 조회 실패:', error)
    toast.error('사용자 정보를 불러오는데 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 사용자 정보 수정
const handleSaveUserInfo = async () => {
  if (!editName.value.trim()) {
    toast.error('이름을 입력해주세요.')
    return
  }

  loading.value = true
  try {
    const updatedUser = await userAPI.updateMe({ name: editName.value })
    userInfo.value = updatedUser
    isEditMode.value = false
    toast.success('사용자 정보가 수정되었습니다.')
  } catch (error) {
    console.error('사용자 정보 수정 실패:', error)
    toast.error('사용자 정보 수정에 실패했습니다.')
  } finally {
    loading.value = false
  }
}

// 수정 취소
const handleCancelEdit = () => {
  isEditMode.value = false
  editName.value = userInfo.value?.name || ''
}

// 비밀번호 재설정 (이메일 발송)
const handlePasswordResetEmail = () => {
  // TODO: 비밀번호 재설정 이메일 발송 API 연동
  toast.success('비밀번호 재설정 링크가 이메일로 전송되었습니다.')
}

// 언어 설정 저장
const handleLanguageSave = () => {
  // TODO: 언어 설정 API 연동
  toast.success('언어 설정이 저장되었습니다.')
}

// 계정 삭제
const handleDeleteAccount = async () => {
  isDeleteModalOpen.value = false
  loading.value = true

  try {
    await authStore.handleDeleteAccount()
    // authStore.handleDeleteAccount()가 이미 로그아웃까지 처리함
  } catch (error) {
    console.error('계정 삭제 실패:', error)
  } finally {
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
        <p class="text-sm text-[#8A8D8F] mt-1">
          계정 정보를 확인하고 설정을 관리할 수 있습니다.
        </p>
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
              <button
                v-if="!isEditMode"
                @click="isEditMode = true"
                class="text-sm text-[#EA002C] hover:underline"
              >
                수정
              </button>
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
                <div v-if="!isEditMode" class="text-sm text-[#000000]">
                  {{ userInfo.name }}
                </div>
                <input
                  v-else
                  v-model="editName"
                  type="text"
                  class="w-full px-3 py-2 border border-[#D1D5DB] text-sm focus:outline-none focus:ring-1 focus:ring-[#EA002C]"
                  placeholder="이름을 입력하세요"
                />
              </div>
            </div>

            <!-- 수정 모드 버튼 -->
            <div v-if="isEditMode" class="flex justify-end gap-2 mt-4">
              <button
                @click="handleCancelEdit"
                :disabled="loading"
                class="px-4 py-2 border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                @click="handleSaveUserInfo"
                :disabled="loading"
                class="px-4 py-2 bg-[#EA002C] text-white text-sm hover:bg-[#C4002A] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Loader2 v-if="loading" class="animate-spin" :size="16" />
                저장
              </button>
            </div>
          </div>
        </div>

        <!-- 비밀번호 재설정 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <div class="flex items-center gap-2">
              <Lock :size="16" class="text-[#A7A9AB]" />
              <h3 class="text-sm text-[#000000]">비밀번호 재설정</h3>
            </div>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-[1fr_auto] items-center gap-6">
              <div>
                <p class="text-sm text-[#000000]">
                  등록된 이메일({{ userInfo.email }})로 재설정 링크가 전송됩니다.
                </p>
              </div>
              <button
                @click="handlePasswordResetEmail"
                class="px-5 py-2 bg-[#EA002C] text-[#FFFFFF] text-sm hover:bg-[#d00028] transition-colors whitespace-nowrap"
              >
                메일 발송
              </button>
            </div>
          </div>
        </div>

        <!-- 언어 및 지역 설정 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <div class="flex items-center gap-2">
              <Globe :size="16" class="text-[#A7A9AB]" />
              <h3 class="text-sm text-[#000000]">언어 및 지역</h3>
            </div>
          </div>
          <div class="p-6">
            <div>
              <label class="text-xs text-[#8A8D8F] block mb-2"> 언어 </label>
              <div class="flex items-center gap-4">
                <select
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
        <DialogContent class="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>계정 삭제 확인</DialogTitle>
            <DialogDescription>
              정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든 데이터가
              영구적으로 삭제됩니다.
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
