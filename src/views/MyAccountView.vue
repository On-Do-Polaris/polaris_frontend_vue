<script setup lang="ts">
import { ref } from 'vue';
import { Mail, User, Globe, Lock } from 'lucide-vue-next';
import { useAuthStore } from '@/store/auth';
import { toast } from 'vue-sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const authStore = useAuthStore();

const isDeleteModalOpen = ref(false);

const userInfo = {
  email: authStore.currentUser,
  name: authStore.currentUser === 'user@sk.ax' ? '김철수' : '사용자',
};

const handleLanguageSave = () => {
  toast.success('언어 설정이 저장되었습니다.');
};

const handlePasswordResetEmail = () => {
  toast.success('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
};

const handleDeleteAccount = () => {
  isDeleteModalOpen.value = false;
  authStore.handleDeleteAccount();
  toast.success('계정이 삭제되었습니다.');
};
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

      <div class="max-w-4xl mx-auto space-y-6">
        <!-- 기본 정보 -->
        <div class="bg-[#FFFFFF] border border-[#E5E7EB] shadow-sm">
          <div class="border-b border-[#E5E7EB] px-6 py-3 bg-[#F9FAFB]">
            <h3 class="text-sm text-[#000000]">기본 정보</h3>
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
                  등록된 이메일({{ userInfo.email }})로 재설정 링크가
                  전송됩니다.
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
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수
                  없습니다.
                </p>
              </div>
              <button
                @click="isDeleteModalOpen = true"
                class="px-5 py-2 border-2 border-[#EA002C] text-[#EA002C] text-sm hover:bg-[#EA002C] hover:text-[#FFFFFF] transition-colors whitespace-nowrap"
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
              정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없으며, 모든
              데이터가 영구적으로 삭제됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              @click="isDeleteModalOpen = false"
              class="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              @click="handleDeleteAccount"
              class="px-4 py-2 bg-[#EA002C] text-white hover:bg-[#C4002A] transition-colors"
            >
              삭제
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
</template>