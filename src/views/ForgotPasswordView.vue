<script setup lang="ts">
import { ref } from 'vue';
import { Mail } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import skLogo from '@/assets/sk-logo.svg';

const router = useRouter();

const email = ref('');
const isSent = ref(false);

const handleSubmit = () => {
  // 이메일 전송 로직 (실제로는 백엔드 API 호출)
  isSent.value = true;
};

const goToLogin = () => {
  router.push('/login');
};
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

        <form v-if="!isSent" @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="block text-sm text-gray-700 mb-2">
              이메일
            </label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" :size="20" />
              <input
                type="email"
                v-model="email"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 focus:outline-none focus:border-[#EA002C]"
                placeholder="email@skax.co.kr"
                required
              />
            </div>
            <p class="text-xs text-gray-500 mt-2">
              가입하신 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
            </p>
          </div>

          <button
            type="submit"
            class="w-full bg-[#EA002C] text-white py-3 hover:bg-[#C4002A] transition-colors text-center mt-6"
          >
            재설정 메일 보내기
          </button>
        </form>

        <div v-else class="text-center py-8">
          <div class="mb-4">
            <Mail class="inline-block text-[#EA002C]" :size="48" />
          </div>
          <p class="text-gray-700 mb-2">이메일이 전송되었습니다!</p>
          <p class="text-sm text-gray-600 mb-6">
            {{ email }}로 비밀번호 재설정 링크를 보냈습니다.
            <br />
            이메일을 확인해주세요.
          </p>
          <button
            @click="goToLogin"
            class="text-[#EA002C] hover:underline text-sm"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>

        <div v-if="!isSent" class="mt-6 text-center text-sm text-gray-600">
          <button
            @click="goToLogin"
            class="text-[#EA002C] hover:underline"
          >
            로그인으로 돌아가기
          </button>
        </div>
      </div>

      <p class="mt-6 text-center text-sm text-gray-600">
        © 2025 SKALA. All rights reserved.
      </p>
    </div>
  </div>
</template>
